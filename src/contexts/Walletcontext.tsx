// Walletcontext.tsx
import React, { createContext, useContext, useState } from 'react';

interface WalletContextType {
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    remainingZixos: number | null;
    setRemainingZixos: React.Dispatch<React.SetStateAction<number | null>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [balance, setBalance] = useState<number>(0);
    const [remainingZixos, setRemainingZixos] = useState<number | null>(null);

    return (
        <WalletContext.Provider value={{ balance, setBalance, remainingZixos, setRemainingZixos }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
