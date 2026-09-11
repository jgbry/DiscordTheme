import React from 'react';
import { DiscordLayoutProvider } from '@/components/layout/DiscordLayoutContext';
import ServerIconRail from '@/components/layout/ServerIconRail';

export default ({ children }: { children: React.ReactNode }) => {
    return (
        <DiscordLayoutProvider>
            <div
                className={
                    'flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#313338] supports-[height:100dvh]:h-[100dvh]'
                }
            >
                <ServerIconRail />
                <div className={'flex min-h-0 min-w-0 flex-1 overflow-hidden'}>{children}</div>
            </div>
        </DiscordLayoutProvider>
    );
};
