import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useDiscordLayout } from '@/components/layout/DiscordLayoutContext';

export default ({ children }: { children: React.ReactNode }) => {
    const { toggleChannels } = useDiscordLayout();

    return (
        <div className={'relative flex min-w-0 flex-1 flex-col bg-[#313338]'}>
            <button
                type={'button'}
                onClick={toggleChannels}
                className={
                    'absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-md bg-[#2b2d31] text-neutral-200 shadow md:hidden'
                }
                aria-label={'Toggle navigation'}
            >
                <FontAwesomeIcon icon={faBars} />
            </button>
            <div className={'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pt-12 md:pt-0'}>{children}</div>
        </div>
    );
};
