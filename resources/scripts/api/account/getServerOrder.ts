import http from '@/api/http';

const normalizeOrder = (value: unknown): string[] => {
    let current: unknown = value;

    for (let i = 0; i < 3; i++) {
        if (Array.isArray(current)) {
            return current.filter((item): item is string => typeof item === 'string' && item.length > 0);
        }

        if (typeof current !== 'string' || current.length === 0) {
            return [];
        }

        try {
            current = JSON.parse(current);
        } catch {
            return [];
        }
    }

    return [];
};

export default (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/server-order')
            .then(({ data }) => {
                resolve(normalizeOrder(data?.attributes?.order));
            })
            .catch(reject);
    });
};
