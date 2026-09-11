import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import useSWR from 'swr';
import styled from 'styled-components/macro';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState } from '@/api/server/getServerResourceUsage';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import SearchContainer from '@/components/dashboard/search/SearchContainer';

/** Desktop rail width (px). Mobile uses Tailwind `w-16` (64px). */
export const DISCORD_RAIL_WIDTH_PX = 72;

const sortServersByOrder = (servers: Server[], order: string[]): Server[] => {
    if (!order.length) {
        return servers;
    }

    const orderMap = new Map(order.map((uuid, index) => [uuid, index]));

    return [...servers].sort((a, b) => {
        const aIndex = orderMap.has(a.uuid) ? orderMap.get(a.uuid)! : Number.MAX_SAFE_INTEGER;
        const bIndex = orderMap.has(b.uuid) ? orderMap.get(b.uuid)! : Number.MAX_SAFE_INTEGER;

        return aIndex - bIndex;
    });
};

const statusColor = (status: ServerPowerState | undefined, suspended: boolean): string => {
    if (suspended) {
        return 'bg-red-500';
    }
    if (!status || status === 'offline') {
        return 'bg-red-500';
    }
    if (status === 'running') {
        return 'bg-green-500';
    }
    return 'bg-yellow-500';
};

const RailScroll = styled.div`
    flex: 1 1 0%;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 0.35rem;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
    }

    @media (min-width: 768px) {
        gap: 0.75rem;
        padding: 0 0.5rem;
    }
`;

const iconCircle =
    'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#313338] text-lg font-semibold leading-none text-neutral-100 no-underline transition-colors duration-150 hover:bg-[#5865F2] md:h-14 md:w-14 md:text-2xl';

const utilityCircle =
    'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-neutral-300 no-underline transition-colors duration-150 hover:bg-[#5865F2] hover:text-white md:h-11 md:w-11';

const ServerRailIcon = ({ server }: { server: Server }) => {
    const interval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const [status, setStatus] = useState<ServerPowerState | undefined>(undefined);
    const suspended = server.status === 'suspended';
    const initial = (server.name.trim().charAt(0) || '?').toUpperCase();

    useEffect(() => {
        if (suspended) {
            return;
        }

        const load = () =>
            getServerResourceUsage(server.uuid)
                .then((data) => setStatus(data.status))
                .catch(() => undefined);

        load();
        interval.current = setInterval(load, 30000);

        return () => {
            if (interval.current) {
                clearInterval(interval.current);
            }
        };
    }, [server.uuid, suspended]);

    return (
        <Tooltip placement={'right'} content={`${server.name}${status ? ` · ${status}` : ''}`}>
            <NavLink to={`/server/${server.id}`} className={iconCircle} activeClassName={'!bg-[#5865F2]'}>
                {server.icon ? (
                    <img src={server.icon} alt={server.name} className={'h-full w-full object-cover'} />
                ) : (
                    initial
                )}
                <span
                    className={classNames(
                        'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1e1f22] md:bottom-0.5 md:right-0.5 md:h-3.5 md:w-3.5 md:border-[3px]',
                        statusColor(status, suspended)
                    )}
                />
            </NavLink>
        </Tooltip>
    );
};

export default () => {
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const serverOrder = useStoreState((state) => state.user.data?.serverOrder) || [];
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const { data } = useSWR(['discord-rail-servers'], () => getServers({ page: 1, per_page: 100 }), {
        revalidateOnFocus: false,
    });

    const servers = useMemo(() => sortServersByOrder(data?.items || [], serverOrder), [data?.items, serverOrder]);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <aside
            className={
                'relative z-50 flex h-full w-16 shrink-0 flex-col items-center bg-[#1e1f22] py-2 md:w-[72px] md:py-3'
            }
        >
            <SpinnerOverlay visible={isLoggingOut} fixed />
            <Tooltip placement={'right'} content={'Home'}>
                <NavLink
                    to={'/'}
                    exact
                    className={classNames(iconCircle, 'mb-1.5 text-neutral-200 md:mb-2')}
                    activeClassName={'!bg-[#5865F2] !text-white'}
                >
                    <FontAwesomeIcon icon={faHome} className={'text-base md:text-xl'} />
                </NavLink>
            </Tooltip>
            <div className={'mb-2 h-0.5 w-8 rounded-full bg-[#35363c] md:mb-3 md:w-10'} />
            <RailScroll>
                {servers.map((server) => (
                    <ServerRailIcon key={server.uuid} server={server} />
                ))}
            </RailScroll>
            <div className={'mt-2 flex flex-col items-center gap-2 border-t border-[#35363c] pt-2 md:gap-2.5 md:pt-3'}>
                <div
                    className={
                        '[&_.navigation-link]:flex [&_.navigation-link]:h-10 [&_.navigation-link]:w-10 [&_.navigation-link]:cursor-pointer [&_.navigation-link]:items-center [&_.navigation-link]:justify-center [&_.navigation-link]:overflow-hidden [&_.navigation-link]:rounded-full [&_.navigation-link]:text-neutral-300 [&_.navigation-link]:hover:bg-[#5865F2] [&_.navigation-link]:hover:text-white md:[&_.navigation-link]:h-11 md:[&_.navigation-link]:w-11'
                    }
                >
                    <SearchContainer />
                </div>
                {rootAdmin && (
                    <Tooltip placement={'right'} content={'Admin'}>
                        <a href={'/admin'} rel={'noreferrer'} className={utilityCircle}>
                            <FontAwesomeIcon icon={faCogs} />
                        </a>
                    </Tooltip>
                )}
                <Tooltip placement={'right'} content={'Account'}>
                    <NavLink to={'/account'} className={utilityCircle} activeClassName={'!bg-[#5865F2] !text-white'}>
                        <span className={'flex h-6 w-6 items-center justify-center overflow-hidden rounded-full'}>
                            <Avatar.User />
                        </span>
                    </NavLink>
                </Tooltip>
                <Tooltip placement={'right'} content={'Sign Out'}>
                    <button
                        type={'button'}
                        onClick={onTriggerLogout}
                        className={classNames(utilityCircle, 'hover:bg-red-500')}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </button>
                </Tooltip>
            </div>
        </aside>
    );
};
