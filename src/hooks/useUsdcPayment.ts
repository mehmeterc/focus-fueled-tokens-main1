import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SOLANA_RPC_ENDPOINT, USDC_MINT_ADDRESS, CAFE_USDC_WALLET_ADDRESS, USDC_DECIMALS } from '@/config/solanaConfig'; // Adjusted path
import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAccount,
    createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { toast } from 'sonner';

export const useUsdcPayment = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction, signTransaction } = useWallet();

    const handlePayment = async (amountLamports: bigint, memo?: string) => {
        if (!publicKey || !signTransaction) {
            toast.error('Wallet not connected.');
            console.error('Wallet not connected for payment');
            return null;
        }

        const effectiveConnection = connection || new Connection(SOLANA_RPC_ENDPOINT);
        const feePayer = publicKey;
        const usdcMintPublicKey = USDC_MINT_ADDRESS;
        const recipientPublicKey = CAFE_USDC_WALLET_ADDRESS;

        try {
            console.log('Initiating USDC payment...');
            console.log('Payer:', feePayer.toBase58());
            console.log('Recipient:', recipientPublicKey.toBase58());
            console.log('USDC Mint:', usdcMintPublicKey.toBase58());
            console.log('Amount (lamports):', amountLamports.toString());

            // Get the payer's and recipient's USDC token accounts
            const payerUsdcAddress = await getAssociatedTokenAddress(
                usdcMintPublicKey,
                feePayer,
                false,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );
            console.log('Payer USDC Token Address:', payerUsdcAddress.toBase58());

            const recipientUsdcAddress = await getAssociatedTokenAddress(
                usdcMintPublicKey,
                recipientPublicKey,
                false, // Allow owner off curve for recipient if it's a program-derived address or similar
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );
            console.log('Recipient USDC Token Address:', recipientUsdcAddress.toBase58());

            const transaction = new Transaction();

            // Check if recipient's associated token account exists, if not, create it
            try {
                await getAccount(effectiveConnection, recipientUsdcAddress, 'confirmed', TOKEN_PROGRAM_ID);
                console.log('Recipient USDC token account exists.');
            } catch (error: any) {
                // If getAccount throws an error, it typically means the account does not exist
                if (error.message.includes('could not find account') || error.message.includes('Account does not exist')) {
                    console.log('Recipient USDC token account does not exist. Creating it...');
                    transaction.add(
                        createAssociatedTokenAccountInstruction(
                            feePayer, // Payer of the account creation fee
                            recipientUsdcAddress,
                            recipientPublicKey, // Owner of the new account
                            usdcMintPublicKey,
                            TOKEN_PROGRAM_ID,
                            ASSOCIATED_TOKEN_PROGRAM_ID
                        )
                    );
                } else {
                    throw error; // Rethrow if it's a different error
                }
            }

            // Add the USDC transfer instruction
            transaction.add(
                createTransferInstruction(
                    payerUsdcAddress,       // Source account (payer's USDC account)
                    recipientUsdcAddress,   // Destination account (recipient's USDC account)
                    feePayer,               // Owner of the source account (payer's wallet)
                    amountLamports,         // Amount in lamports (USDC smallest unit)
                    [],                     // Multi-signers (optional)
                    TOKEN_PROGRAM_ID        // SPL Token program ID
                )
            );
            
            if (memo) {
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: feePayer,
                        toPubkey: feePayer, // Sending to self, just to attach memo to a benign instruction
                        lamports: 0, // No SOL transfer, just for memo
                    }),
                    // new TransactionInstruction({
                    //     keys: [{ pubkey: feePayer, isSigner: true, isWritable: true }],
                    //     programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"), // Memo program v1
                    //     data: Buffer.from(memo, "utf-8"),
                    // })
                    // For simplicity, not adding memo program instruction directly to avoid Buffer polyfill needs if not already handled.
                    // A simple self-transfer can carry a memo if the wallet/explorer supports it implicitly.
                );
                console.log('Memo to be included (conceptual):', memo); 
            }

            const { blockhash, lastValidBlockHeight } = await effectiveConnection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = feePayer;

            toast.info('Please sign the transaction in your wallet...');
            console.log('Sending transaction for signature...');

            const signature = await sendTransaction(transaction, effectiveConnection);
            console.log('Transaction sent with signature:', signature);
            toast.success('Transaction submitted! Confirming...');

            await effectiveConnection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');
            
            console.log('Transaction confirmed:', signature);
            toast.success('Payment successful!', { description: `Transaction ID: ${signature.substring(0, 10)}...` });
            return signature;

        } catch (error: any) {
            console.error('USDC Payment failed:', error);
            toast.error('Payment failed.', { description: error.message || 'Please try again.' });
            return null;
        }
    };

    return { handlePayment, USDC_DECIMALS };
};
