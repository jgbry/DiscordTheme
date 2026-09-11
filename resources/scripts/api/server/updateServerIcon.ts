import http from '@/api/http';

export const uploadServerIcon = (uuid: string, file: File): Promise<string> => {
    const form = new FormData();
    form.append('icon', file);

    return new Promise((resolve, reject) => {
        http
            .post(`/api/client/servers/${uuid}/settings/icon`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then(({ data }) => resolve(data.attributes.icon as string))
            .catch(reject);
    });
};

export const deleteServerIcon = (uuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/settings/icon`).then(() => resolve()).catch(reject);
    });
};
