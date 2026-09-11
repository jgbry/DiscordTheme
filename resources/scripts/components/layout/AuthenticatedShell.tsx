import React from 'react';
import { DiscordLayoutProvider } from '@/components/layout/DiscordLayoutContext';
import ServerIconRail from '@/components/layout/ServerIconRail';

export default ({ children }: { children: React.ReactNode }) => {
    return (
        <DiscordLayoutProvider>
            <div className={'flex h-screen w-full overflow-hidden bg-[#313338]'}>
                <ServerIconRail />
                <div className={'flex min-h-0 min-w-0 flex-1'}>{children}</div>
            </div>
        </DiscordLayoutProvider>
    );
};
