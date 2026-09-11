import http from '@/api/http';

export default (order: string[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        http.put('/api/client/account/server-order', { order })
            .then(() => resolve(order))
            .catch(reject);
    });
};
