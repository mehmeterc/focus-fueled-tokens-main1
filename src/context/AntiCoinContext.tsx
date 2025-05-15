import React, { createContext, useContext, ReactNode, FC } from 'react';
import { useAntiCoinMining } from '@/hooks/useAntiCoinMining'; // Adjusted path

// Define the shape of the context data
interface AntiCoinContextType extends ReturnType<typeof useAntiCoinMining> {}

const AntiCoinContext = createContext<AntiCoinContextType | undefined>(undefined);

export const useAntiCoinContext = () => {
    const context = useContext(AntiCoinContext);
    if (context === undefined) {
        throw new Error('useAntiCoinContext must be used within an AntiCoinProvider');
    }
    return context;
};

interface AntiCoinProviderProps {
    children: ReactNode;
}

export const AntiCoinProvider: FC<AntiCoinProviderProps> = ({ children }) => {
    const antiCoinMining = useAntiCoinMining();

    return (
        <AntiCoinContext.Provider value={antiCoinMining}>
            {children}
        </AntiCoinContext.Provider>
    );
};
