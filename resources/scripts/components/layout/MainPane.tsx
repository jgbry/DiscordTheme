import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useDiscordLayout } from '@/components/layout/DiscordLayoutContext';

export default ({ children }: { children: React.ReactNode }) => {
    const { channelsOpen, toggleChannels } = useDiscordLayout();

    return (
        <div className={'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#313338]'}>
            <header
                className={
                    'sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-[#1e1f22] bg-[#2b2d31] px-3 md:hidden'
                }
            >
                <button
                    type={'button'}
                    onClick={toggleChannels}
                    className={
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[#dbdee1] transition-colors hover:bg-[#35373c] hover:text-white'
                    }
                    aria-label={channelsOpen ? 'Close navigation' : 'Open navigation'}
                    aria-expanded={channelsOpen}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <span className={'truncate text-sm font-semibold text-[#f2f3f5]'}>Channels</span>
            </header>
            <div className={'min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'}>
                {children}
            </div>
        </div>
    );
};
