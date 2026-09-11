import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import updateServerOrder from '@/api/account/updateServerOrder';
import getServerOrder from '@/api/account/getServerOrder';

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

const buildReorderedList = (
    currentOrder: string[],
    sourceUuid: string,
    targetUuid: string,
    visibleUuids: string[]
): string[] | null => {
    if (sourceUuid === targetUuid) {
        return null;
    }

    const base = (currentOrder.length ? [...currentOrder] : [...visibleUuids]).filter(
        (id, index, arr) => arr.indexOf(id) === index
    );

    visibleUuids.forEach((id) => {
        if (!base.includes(id)) {
            base.push(id);
        }
    });

    const fromIndex = base.indexOf(sourceUuid);
    const toIndex = base.indexOf(targetUuid);

    if (fromIndex === -1 || toIndex === -1) {
        return null;
    }

    const next = [...base];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, sourceUuid);

    return next;
};

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const bootstrapOrder = useStoreState((state) => state.user.data?.serverOrder);
    const updateUserData = useStoreActions((actions) => actions.user.updateUserData);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);
    const [editMode, setEditMode] = useState(false);
    const [serverOrder, setServerOrder] = useState<string[]>(() =>
        Array.isArray(bootstrapOrder) ? bootstrapOrder : []
    );
    const [orderReady, setOrderReady] = useState(false);
    const [draggingUuid, setDraggingUuid] = useState<string | null>(null);
    const draggingUuidRef = useRef<string | null>(null);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        let cancelled = false;

        getServerOrder()
            .then((order) => {
                if (cancelled) {
                    return;
                }

                setServerOrder(order);
                updateUserData({ serverOrder: order });
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled && Array.isArray(bootstrapOrder)) {
                    setServerOrder(bootstrapOrder);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setOrderReady(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [uuid]);

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const persistOrder = useCallback(
        (next: string[]) => {
            setServerOrder(next);
            updateUserData({ serverOrder: next });

            updateServerOrder(next)
                .then((saved) => {
                    setServerOrder(saved);
                    updateUserData({ serverOrder: saved });
                })
                .catch((err) => {
                    console.error(err);
                    clearAndAddHttpError({ key: 'dashboard', error: err });
                });
        },
        [clearAndAddHttpError, updateUserData]
    );

    const reorderServers = useCallback(
        (sourceUuid: string, targetUuid: string, visibleUuids: string[]) => {
            const next = buildReorderedList(serverOrder, sourceUuid, targetUuid, visibleUuids);
            if (!next) {
                return;
            }

            persistOrder(next);
        },
        [persistOrder, serverOrder]
    );

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            <div css={tw`mb-2 flex justify-end items-center flex-wrap`}>
                <div css={tw`flex justify-end items-center`}>
                    <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>Edit mode</p>
                    <Switch
                        name={'edit_mode'}
                        defaultChecked={editMode}
                        onChange={() => setEditMode((s) => !s)}
                    />
                </div>
                {rootAdmin && (
                    <div css={tw`flex justify-end items-center ml-4`}>
                        <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                            {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                        </p>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                )}
            </div>
            {!servers || !orderReady ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => {
                        const orderedItems = sortServersByOrder(items, serverOrder);
                        const visibleUuids = orderedItems.map((server) => server.uuid);

                        return orderedItems.length > 0 ? (
                            orderedItems.map((server, index) => (
                                <ServerRow
                                    key={server.uuid}
                                    server={server}
                                    css={index > 0 ? tw`mt-2` : undefined}
                                    editMode={editMode}
                                    isDragging={draggingUuid === server.uuid}
                                    onDragStart={() => {
                                        draggingUuidRef.current = server.uuid;
                                        setDraggingUuid(server.uuid);
                                    }}
                                    onDragEnd={() => {
                                        draggingUuidRef.current = null;
                                        setDraggingUuid(null);
                                    }}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        event.dataTransfer.dropEffect = 'move';
                                    }}
                                    onDrop={(event) => {
                                        const sourceUuid =
                                            event.dataTransfer.getData('text/plain') || draggingUuidRef.current;

                                        if (!sourceUuid) {
                                            return;
                                        }

                                        reorderServers(sourceUuid, server.uuid, visibleUuids);
                                        draggingUuidRef.current = null;
                                        setDraggingUuid(null);
                                    }}
                                />
                            ))
                        ) : (
                            <p css={tw`text-center text-sm text-neutral-400`}>
                                {showOnlyAdmin
                                    ? 'There are no other servers to display.'
                                    : 'There are no servers associated with your account.'}
                            </p>
                        );
                    }}
                </Pagination>
            )}
        </PageContentBlock>
    );
};
