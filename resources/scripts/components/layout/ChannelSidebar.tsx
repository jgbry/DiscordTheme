import { DISCORD_RAIL_WIDTH_PX } from '@/components/layout/ServerIconRail';
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
    'flex items-center gap-1.5 rounded px-2 py-1.5 text-sm text-[#949ba4] no-underline transition-colors duration-150 hover:bg-[#35373c] hover:text-[#dbdee1]';

const channelActiveClass = 'bg-[#404249] text-white hover:bg-[#404249] hover:text-white';

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
            <div className={'border-b border-[#1e1f22] px-4 py-3'}>
                <p className={'truncate text-base font-semibold text-white'}>{name || id || 'Server'}</p>
                <p className={'truncate text-xs text-[#949ba4]'}>Server channels</p>
            </div>
            <nav className={'flex flex-col gap-0.5 p-2'}>
                {routes.server
                    .filter((route) => !!route.name)
                    .map((route) =>
                        route.permission ? (
                            <Can key={route.path} action={route.permission} matchAny>
                                <ChannelLink to={to(route.path)} exact={route.exact}>
                                    {route.name}
                                </ChannelLink>
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
                        <span>Admin</span>
                    </a>
                )}
            </nav>
        </>
    );
};

const AccountChannels = () => (
    <>
        <div className={'border-b border-[#1e1f22] px-4 py-3'}>
            <p className={'truncate text-base font-semibold text-white'}>Account</p>
            <p className={'truncate text-xs text-[#949ba4]'}>Settings</p>
        </div>
        <nav className={'flex flex-col gap-0.5 p-2'}>
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
            <div className={'border-b border-[#1e1f22] px-4 py-3'}>
                <p className={'truncate text-base font-semibold text-white'}>{panelName}</p>
                <p className={'truncate text-xs text-[#949ba4]'}>Home</p>
            </div>
            <nav className={'flex flex-col gap-0.5 p-2'}>
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

    return (
        <>
            <div
                className={classNames(
                    'fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden',
                    channelsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
                onClick={() => setChannelsOpen(false)}
            />
            <aside
                className={classNames(
                    'relative z-10 flex h-full w-60 shrink-0 flex-col overflow-y-auto bg-[#2b2d31] transition-transform duration-200',
                    'fixed inset-y-0 z-40 md:static md:z-10 md:translate-x-0',
                    channelsOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
                style={{ left: DISCORD_RAIL_WIDTH_PX }}
            >
                {serverMatch ? (
                    <ServerChannels />
                ) : isAccount ? (
                    <AccountChannels />
                ) : (
                    <DashboardChannels />
                )}
            </aside>
        </>
    );
};
