import React, { createContext, useContext, useMemo, useState } from 'react';

interface DiscordLayoutContextValue {
    channelsOpen: boolean;
    setChannelsOpen: (open: boolean) => void;
    toggleChannels: () => void;
}

const DiscordLayoutContext = createContext<DiscordLayoutContextValue | null>(null);

export const DiscordLayoutProvider = ({ children }: { children: React.ReactNode }) => {
    const [channelsOpen, setChannelsOpen] = useState(false);

    const value = useMemo(
        () => ({
            channelsOpen,
            setChannelsOpen,
            toggleChannels: () => setChannelsOpen((open) => !open),
        }),
        [channelsOpen]
    );

    return <DiscordLayoutContext.Provider value={value}>{children}</DiscordLayoutContext.Provider>;
};

export const useDiscordLayout = (): DiscordLayoutContextValue => {
    const ctx = useContext(DiscordLayoutContext);
    if (!ctx) {
        throw new Error('useDiscordLayout must be used within DiscordLayoutProvider');
    }
    return ctx;
};
