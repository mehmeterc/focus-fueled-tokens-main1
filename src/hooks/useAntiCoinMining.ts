import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    getAntiCoinMintAddress,
    ANTI_COIN_DECIMALS,
    ANTICOIN_USDC_EQUIVALENCE,
    DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC,
    ANTI_COIN_MINT_ADDRESS,
    ANTI_COIN_MINT_AUTHORITY_BYTES,
    SOLANA_RPC_ENDPOINT
} from '@/config/solanaConfig';
import { toast } from 'sonner';
import {
    PublicKey,
    Connection,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction
} from '@solana/spl-token';

interface CafeInfo {
    id: string | number;
    name: string;
    usdcRatePerHour: number;
}

interface MiningSession {
    cafeInfo: CafeInfo;
    startTime: number; // Unix timestamp (milliseconds)
    checkInTxSignature?: string;
}

export const useAntiCoinMining = () => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [isMining, setIsMining] = useState<boolean>(false);
    const [currentSession, setCurrentSession] = useState<MiningSession | null>(null);
    const [lastCalculatedReward, setLastCalculatedReward] = useState<number>(0); // Reward from the most recently ended session
    const [currentLiveReward, setCurrentLiveReward] = useState<number>(0); // Live reward for the active session

    // Define calculateReward once
    const calculateReward = useCallback((session: MiningSession | null, endTime: number): number => {
        if (!session) return 0;
        const durationMillis = endTime - session.startTime;
        if (durationMillis <= 0) return 0;

        const durationHours = durationMillis / (1000 * 60 * 60);
        const effectiveUsdcRateForAntiCoin = session.cafeInfo.usdcRatePerHour > 0
            ? session.cafeInfo.usdcRatePerHour
            : DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC;

        const usdcEquivalentValue = durationHours * effectiveUsdcRateForAntiCoin;
        const calculatedAntiCoin = usdcEquivalentValue / ANTICOIN_USDC_EQUIVALENCE;
        
        return parseFloat(calculatedAntiCoin.toFixed(ANTI_COIN_DECIMALS));
    }, [ANTICOIN_USDC_EQUIVALENCE, DEMO_CAFE_VIRTUAL_HOURLY_RATE_USDC]); // Dependencies for calculateReward

    // Effect to load/resume session from localStorage
    useEffect(() => {
        if (!publicKey) {
            setIsMining(false);
            setCurrentSession(null);
            setCurrentLiveReward(0);
            localStorage.removeItem(`antiCoinMiningSession_${publicKey?.toBase58()}`); // Clear any session if wallet disconnects
            return;
        }
        const savedSession = localStorage.getItem(`antiCoinMiningSession_${publicKey.toBase58()}`);
        if (savedSession) {
            try {
                const session: MiningSession = JSON.parse(savedSession);
                setCurrentSession(session);
                setIsMining(true);
                // Recalculate live reward for resumed session
                const liveReward = calculateReward(session, Date.now());
                setCurrentLiveReward(liveReward);
                toast.info(`Resumed AntiCoin mining session at ${session.cafeInfo.name}.`);
            } catch (error) {
                console.error("Failed to parse saved mining session:", error);
                localStorage.removeItem(`antiCoinMiningSession_${publicKey.toBase58()}`);
            }
        }
    }, [publicKey, calculateReward]); // Added calculateReward as dependency

    // Effect to calculate live reward during an active session
    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        if (isMining && currentSession) {
            intervalId = setInterval(() => {
                const liveReward = calculateReward(currentSession, Date.now());
                setCurrentLiveReward(liveReward);
            }, 5000); // Update every 5 seconds
        } else {
            // setCurrentLiveReward(0); // Not strictly needed here as it's handled elsewhere
        }
        return () => clearInterval(intervalId);
    }, [isMining, currentSession, calculateReward]);

    const startMiningSession = useCallback((cafeInfo: CafeInfo, checkInTxSignature?: string) => {
        if (!publicKey) {
            toast.error('Please connect your wallet to start mining AntiCoin.');
            return false;
        }
        if (isMining) {
            toast.warning('A mining session is already active.');
            return false;
        }

        const session: MiningSession = {
            cafeInfo,
            startTime: Date.now(),
            checkInTxSignature
        };
        setCurrentSession(session);
        setIsMining(true);
        setCurrentLiveReward(0); // Reset live reward for new session
        setLastCalculatedReward(0); // Reset last session's reward
        localStorage.setItem(`antiCoinMiningSession_${publicKey.toBase58()}`, JSON.stringify(session));
        toast.success(`AntiCoin mining started at ${cafeInfo.name}! Focus up!`);
        return true;
    }, [publicKey, isMining]); // Removed calculateReward from deps as it's not used directly in this callback's body

    const endMiningSession = useCallback(async () => {
        if (!publicKey) {
            toast.error('Wallet not connected.');
            return null;
        }
        if (!isMining || !currentSession) {
            toast.warning('No active mining session to end.');
            return null;
        }

        const endTime = Date.now();
        const reward = calculateReward(currentSession, endTime);
        setLastCalculatedReward(reward); // Set the final reward for the session that just ended
        setCurrentLiveReward(0); // Reset live reward as session is ending

        // Log session details
        console.log('--- AntiCoin Mining Session Ended ---');
        console.log('User Public Key:', publicKey.toBase58());
        console.log('Cafe:', currentSession.cafeInfo.name, `(ID: ${currentSession.cafeInfo.id})`);
        console.log('Session Duration (ms):', endTime - currentSession.startTime);
        console.log('Calculated AntiCoin Reward:', reward);
        if(currentSession.checkInTxSignature) {
            console.log('Associated Check-in Tx:', currentSession.checkInTxSignature);
        }

        // Prepare for on-chain minting
        toast.loading('Minting your earned AntiCoins...');

        // Use the connection from the hook or create a new one
        const effectiveConnection = connection || new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

        try {
            // Create mint authority keypair from the provided bytes
            const mintAuthority = Keypair.fromSecretKey(ANTI_COIN_MINT_AUTHORITY_BYTES);
            
            // Calculate the token amount with decimals (must be a BigInt for the SPL token program)
            const tokenAmount = BigInt(Math.floor(reward * Math.pow(10, ANTI_COIN_DECIMALS)));
            
            // Get or create the associated token account for the user
            const userTokenAccount = await getAssociatedTokenAddress(
                ANTI_COIN_MINT_ADDRESS,
                publicKey,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            // Check if the associated token account exists
            const userTokenAccountInfo = await effectiveConnection.getAccountInfo(userTokenAccount);
            
            // Create the transaction
            const transaction = new Transaction();
            
            // If user doesn't have an associated token account, create one
            if (!userTokenAccountInfo) {
                console.log('Creating associated token account for user...');
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        mintAuthority.publicKey,
                        userTokenAccount,
                        publicKey,
                        ANTI_COIN_MINT_ADDRESS,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    )
                );
            }
            
            // Add instruction to mint tokens to the user's account
            transaction.add(
                createMintToInstruction(
                    ANTI_COIN_MINT_ADDRESS,         // mint address
                    userTokenAccount,               // destination
                    mintAuthority.publicKey,        // mint authority
                    tokenAmount                     // amount (already BigInt)
                )
            );
            
            // Send and confirm the transaction
            const signature = await sendAndConfirmTransaction(
                effectiveConnection,
                transaction,
                [mintAuthority],
                { commitment: 'confirmed' }
            );
            
            console.log('Mint transaction signature:', signature);
            console.log('------------------------------------');
            
            // Show success message
            toast.success(
                `Mining session ended at ${currentSession.cafeInfo.name}! 🎉`,
                {
                    description: `You've earned ${reward.toFixed(ANTI_COIN_DECIMALS)} AntiCoin! Tokens sent to your wallet!`,
                    duration: 8000,
                }
            );
            
        } catch (error) {
            console.error('Error minting AntiCoin:', error);
            toast.error('Failed to mint AntiCoin', {
                description: `Session ended, but there was an error minting tokens: ${error?.message || 'Unknown error'}`,
                duration: 8000,
            });
        }

        const endedSessionDetails = { ...currentSession }; // Capture details before resetting state

        setCurrentSession(null);
        setIsMining(false);
        localStorage.removeItem(`antiCoinMiningSession_${publicKey.toBase58()}`);

        return { 
            sessionEnded: endedSessionDetails, 
            reward, 
            endTime 
        };
    }, [isMining, currentSession, publicKey, calculateReward, connection]);

    // claimRewards placeholder is fully removed for now to ensure clean compilation

    return {
        isMining,
        currentSession, // This is the active session.
        startMiningSession,
        endMiningSession,
        calculateReward,
        currentReward: currentLiveReward, // Live, accumulating reward for the *active* session
        lastSessionReward: lastCalculatedReward, // Final reward from the *last ended* session
    };
};    // claimRewards, // Not returning placeholder for now
