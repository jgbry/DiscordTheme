import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faEllipsisV, faHome, faSearch, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import useSWR from 'swr';
import styled, { keyframes, css } from 'styled-components/macro';
import getServers from '@/api/getServers';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState } from '@/api/server/getServerResourceUsage';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';
import SearchModal from '@/components/dashboard/search/SearchModal';
import useEventListener from '@/plugins/useEventListener';

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

const popIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-50%) translateX(-12px) scale(0.92);
    }
    to {
        opacity: 1;
        transform: translateY(-50%) translateX(0) scale(1);
    }
`;

const MenuFlyout = styled.div<{ $open: boolean; $top: number; $left: number }>`
    position: fixed;
    top: ${(props) => props.$top}px;
    left: ${(props) => props.$left}px;
    z-index: 80;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem;
    border-radius: 9999px;
    background: #2b2d31;
    border: 1px solid #1e1f22;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
    transform-origin: left center;
    pointer-events: ${(props) => (props.$open ? 'auto' : 'none')};
    opacity: ${(props) => (props.$open ? 1 : 0)};
    transform: ${(props) =>
        props.$open ? 'translateY(-50%) scale(1)' : 'translateY(-50%) translateX(-12px) scale(0.92)'};
    transition: opacity 180ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1), visibility 180ms;
    visibility: ${(props) => (props.$open ? 'visible' : 'hidden')};

    ${(props) =>
        props.$open &&
        css`
            animation: ${popIn} 220ms cubic-bezier(0.22, 1, 0.36, 1);
        `}

    & > * {
        opacity: ${(props) => (props.$open ? 1 : 0)};
        transform: ${(props) => (props.$open ? 'translateX(0)' : 'translateX(-6px)')};
        transition: opacity 160ms ease, transform 160ms ease;
    }

    ${(props) =>
        props.$open &&
        css`
            & > *:nth-child(1) {
                transition-delay: 40ms;
            }
            & > *:nth-child(2) {
                transition-delay: 70ms;
            }
            & > *:nth-child(3) {
                transition-delay: 100ms;
            }
            & > *:nth-child(4) {
                transition-delay: 130ms;
            }
        `}
`;


const menuItem =
    'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-[#dbdee1] no-underline transition-colors duration-150 hover:bg-[#5865F2] hover:text-white';

const iconCircle =
    'relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#313338] text-lg font-semibold leading-none text-neutral-100 no-underline transition-colors duration-150 hover:bg-[#5865F2] md:h-14 md:w-14 md:text-2xl';

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

const RailActionsMenu = ({
    rootAdmin,
    onLogout,
}: {
    rootAdmin: boolean;
    onLogout: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const updateCoords = () => {
        const button = buttonRef.current;
        if (!button) {
            return;
        }
        const rect = button.getBoundingClientRect();
        setCoords({
            top: rect.top + rect.height / 2,
            left: rect.right + 10,
        });
    };

    const toggleOpen = () => {
        setOpen((value) => {
            const next = !value;
            if (next) {
                updateCoords();
            }
            return next;
        });
    };

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (['input', 'textarea'].indexOf(((e.target as HTMLElement).tagName || 'input').toLowerCase()) < 0) {
            if (!searchOpen && e.metaKey && e.key.toLowerCase() === '/') {
                setSearchOpen(true);
                setOpen(false);
            }
        }
        if (e.key === 'Escape') {
            setOpen(false);
        }
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        updateCoords();

        const onPointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (wrapRef.current && !wrapRef.current.contains(target)) {
                setOpen(false);
            }
        };

        const onReposition = () => updateCoords();

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('touchstart', onPointerDown);
        window.addEventListener('resize', onReposition);
        window.addEventListener('scroll', onReposition, true);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('touchstart', onPointerDown);
            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);
        };
    }, [open]);

    return (
        <div ref={wrapRef} className={'relative flex items-center justify-center'}>
            {searchOpen && <SearchModal appear visible={searchOpen} onDismissed={() => setSearchOpen(false)} />}
            <Tooltip placement={'right'} content={open ? 'Close menu' : 'Menu'}>
                <button
                    ref={buttonRef}
                    type={'button'}
                    aria-expanded={open}
                    aria-label={'Open user menu'}
                    onClick={toggleOpen}
                    className={classNames(
                        'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#313338] text-neutral-200 transition-all duration-200 md:h-12 md:w-12',
                        open ? '!bg-[#5865F2] text-white rotate-90' : 'hover:bg-[#5865F2] hover:text-white'
                    )}
                >
                    <FontAwesomeIcon icon={open ? faTimes : faEllipsisV} />
                </button>
            </Tooltip>
            <MenuFlyout $open={open} $top={coords.top} $left={coords.left} role={'menu'} aria-hidden={!open}>
                <Tooltip placement={'top'} content={'Search'}>
                    <button
                        type={'button'}
                        role={'menuitem'}
                        className={menuItem}
                        onClick={() => {
                            setSearchOpen(true);
                            setOpen(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </Tooltip>
                {rootAdmin && (
                    <Tooltip placement={'top'} content={'Admin'}>
                        <a href={'/admin'} rel={'noreferrer'} role={'menuitem'} className={menuItem}>
                            <FontAwesomeIcon icon={faCogs} />
                        </a>
                    </Tooltip>
                )}
                <Tooltip placement={'top'} content={'Account'}>
                    <NavLink
                        to={'/account'}
                        role={'menuitem'}
                        className={menuItem}
                        activeClassName={'!bg-[#5865F2] !text-white'}
                        onClick={() => setOpen(false)}
                    >
                        <span className={'flex h-6 w-6 items-center justify-center overflow-hidden rounded-full'}>
                            <Avatar.User />
                        </span>
                    </NavLink>
                </Tooltip>
                <Tooltip placement={'top'} content={'Sign Out'}>
                    <button
                        type={'button'}
                        role={'menuitem'}
                        className={classNames(menuItem, 'hover:!bg-red-500')}
                        onClick={() => {
                            setOpen(false);
                            onLogout();
                        }}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </button>
                </Tooltip>
            </MenuFlyout>
        </div>
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
                'relative z-50 flex h-full w-16 shrink-0 flex-col items-center overflow-visible bg-[#1e1f22] py-2 md:w-[72px] md:py-3'
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
            <div className={'relative z-50 mt-2 flex items-center justify-center border-t border-[#35363c] pt-2 md:pt-3'}>
                <RailActionsMenu rootAdmin={rootAdmin} onLogout={onTriggerLogout} />
            </div>
        </aside>
    );
};
