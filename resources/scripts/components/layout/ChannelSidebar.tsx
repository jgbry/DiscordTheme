import classNames from 'classnames';
import React, { useEffect } from 'react';
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import Can from '@/components/elements/Can';
import routes from '@/routers/routes';
import { ServerContext } from '@/state/server';
import { useDiscordLayout } from '@/components/layout/DiscordLayoutContext';

const channelLinkClass =
    'flex w-full min-h-[44px] items-center gap-1.5 rounded px-2 py-2 text-sm text-[#949ba4] no-underline transition-colors duration-150 hover:bg-[#35373c] hover:text-[#dbdee1]';

const channelActiveClass = 'bg-[#404249] text-white hover:bg-[#404249] hover:text-white';

const navClass = 'flex w-full flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2 py-2';

const ChannelLink = ({
    to,
    exact,
    children,
}: {
    to: string;
    exact?: boolean;
    children: React.ReactNode;
}) => {
    const { setChannelsOpen } = useDiscordLayout();

    return (
        <NavLink
            to={to}
            exact={exact}
            className={channelLinkClass}
            activeClassName={channelActiveClass}
            onClick={() => setChannelsOpen(false)}
        >
            <FontAwesomeIcon icon={faHashtag} className={'text-xs opacity-70'} />
            <span className={'truncate'}>{children}</span>
        </NavLink>
    );
};

const ServerChannels = () => {
    const match = useRouteMatch<{ id: string }>('/server/:id');
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const name = ServerContext.useStoreState((state) => state.server.data?.name);
    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);

    const base = match?.url || `/server/${id || ''}`;

    const to = (value: string) => {
        if (value === '/') {
            return base;
        }
        return `${base.replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    return (
        <>
            <div className={'shrink-0 border-b border-[#1e1f22] px-4 py-3'}>
                <p className={'truncate text-base font-semibold text-white'}>{name || id || 'Server'}</p>
                <p className={'truncate text-xs text-[#949ba4]'}>Server channels</p>
            </div>
            <nav className={navClass}>
                {routes.server
                    .filter((route) => !!route.name)
                    .map((route) =>
                        route.permission ? (
                            <Can key={route.path} action={route.permission} matchAny>
                                <div className={'w-full'}>
                                    <ChannelLink to={to(route.path)} exact={route.exact}>
                                        {route.name}
                                    </ChannelLink>
                                </div>
                            </Can>
                        ) : (
                            <ChannelLink key={route.path} to={to(route.path)} exact={route.exact}>
                                {route.name}
                            </ChannelLink>
                        )
                    )}
                {rootAdmin && serverId && (
                    <a
                        href={`/admin/servers/view/${serverId}`}
                        target={'_blank'}
                        rel={'noreferrer'}
                        className={channelLinkClass}
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className={'text-xs opacity-70'} />
                        <span className={'truncate'}>Admin</span>
                    </a>
                )}
            </nav>
        </>
    );
};

const AccountChannels = () => (
    <>
        <div className={'shrink-0 border-b border-[#1e1f22] px-4 py-3'}>
            <p className={'truncate text-base font-semibold text-white'}>Account</p>
            <p className={'truncate text-xs text-[#949ba4]'}>Settings</p>
        </div>
        <nav className={navClass}>
            {routes.account
                .filter((route) => !!route.name)
                .map(({ path, name, exact = false }) => (
                    <ChannelLink key={path} to={`/account/${path}`.replace('//', '/')} exact={exact}>
                        {name}
                    </ChannelLink>
                ))}
        </nav>
    </>
);

const DashboardChannels = () => {
    const panelName = useStoreState((state) => state.settings.data!.name);

    return (
        <>
            <div className={'shrink-0 border-b border-[#1e1f22] px-4 py-3'}>
                <p className={'truncate text-base font-semibold text-white'}>{panelName}</p>
                <p className={'truncate text-xs text-[#949ba4]'}>Home</p>
            </div>
            <nav className={navClass}>
                <ChannelLink to={'/'} exact>
                    Dashboard
                </ChannelLink>
                <ChannelLink to={'/account'}>Account</ChannelLink>
            </nav>
        </>
    );
};

export default () => {
    const location = useLocation();
    const serverMatch = useRouteMatch('/server/:id');
    const { channelsOpen, setChannelsOpen } = useDiscordLayout();
    const isAccount = location.pathname.startsWith('/account');

    useEffect(() => {
        setChannelsOpen(false);
    }, [location.pathname, setChannelsOpen]);

    useEffect(() => {
        if (!channelsOpen) {
            return;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [channelsOpen]);

    return (
        <>
            <div
                className={classNames(
                    'fixed inset-y-0 right-0 z-30 bg-black/50 transition-opacity md:hidden',
                    'left-16',
                    channelsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={() => setChannelsOpen(false)}
                aria-hidden={!channelsOpen}
            />
            <aside
                className={classNames(
                    'flex h-full w-60 max-w-[calc(100vw-4rem)] shrink-0 flex-col bg-[#2b2d31] transition-transform duration-200 ease-out',
                    // Mobile: overlay drawer beside the rail
                    'fixed inset-y-0 left-16 z-40',
                    // Desktop: in-flow column
                    'md:static md:z-10 md:w-60 md:max-w-none md:translate-x-0',
                    channelsOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:shadow-none'
                )}
            >
                <div className={'flex min-h-0 w-full flex-1 flex-col'}>
                    {serverMatch ? (
                        <ServerChannels />
                    ) : isAccount ? (
                        <AccountChannels />
                    ) : (
                        <DashboardChannels />
                    )}
                </div>
            </aside>
        </>
    );
};
