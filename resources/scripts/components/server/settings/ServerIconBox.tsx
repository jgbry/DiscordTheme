import React, { useRef, useState } from 'react';
import tw from 'twin.macro';
import { mutate } from 'swr';
import { Actions, useStoreActions } from 'easy-peasy';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerContext } from '@/state/server';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Button } from '@/components/elements/button/index';
import { deleteServerIcon, uploadServerIcon } from '@/api/server/updateServerIcon';

export default () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const refreshRail = () => mutate(['discord-rail-servers']);

    const onPick = () => inputRef.current?.click();

    const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }

        clearFlashes('settings');
        setLoading(true);
        uploadServerIcon(server.uuid, file)
            .then((icon) => {
                setServer({ ...server, icon });
                refreshRail();
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setLoading(false));
    };

    const onRemove = () => {
        clearFlashes('settings');
        setLoading(true);
        deleteServerIcon(server.uuid)
            .then(() => {
                setServer({ ...server, icon: null });
                refreshRail();
            })
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setLoading(false));
    };

    const initial = (server.name.trim().charAt(0) || '?').toUpperCase();

    return (
        <TitledGreyBox title={'Server Icon'} css={tw`relative`}>
            <SpinnerOverlay visible={loading} />
            <p css={tw`text-sm text-neutral-300`}>
                Shown as a circle on the left server rail. PNG, JPG, GIF or WebP — max 2&nbsp;MB.
            </p>
            <div css={tw`mt-4 flex items-center`}>
                <div
                    css={tw`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-700 text-2xl font-semibold text-neutral-100`}
                >
                    {server.icon ? (
                        <img src={server.icon} alt={server.name} css={tw`h-full w-full object-cover`} />
                    ) : (
                        initial
                    )}
                </div>
                <div css={tw`ml-4 flex flex-wrap gap-2`}>
                    <input ref={inputRef} type={'file'} accept={'image/png,image/jpeg,image/gif,image/webp'} css={tw`hidden`} onChange={onFile} />
                    <Button type={'button'} onClick={onPick}>
                        Upload icon
                    </Button>
                    {server.icon && (
                        <Button.Text type={'button'} variant={Button.Variants.Secondary} onClick={onRemove}>
                            Remove
                        </Button.Text>
                    )}
                </div>
            </div>
        </TitledGreyBox>
    );
};
