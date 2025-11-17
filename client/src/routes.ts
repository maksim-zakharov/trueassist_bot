type RouteParams = Record<string, string | number>;

const buildPath = (path: string, params?: RouteParams) => {
    if (!params) return path;

    return Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
        path
    );
};

export const RoutePaths = {
    Root: '/',
    Bonuses: '/bonuses',
    Profile: '/profile',
    Application: '/application',
    Order: {
        List: '/orders',
        Create: '/orders/create',
        Checkout: '/orders/checkout',
        Details: (id: string | number) => buildPath('/orders/:id', {id}),
    },
    Executor: {
        Orders: '/executor/orders',
        Details: (id: string | number) => buildPath('/executor/orders/:id', {id}),
        Payments: '/executor/payments',
        Schedule: '/executor/schedule',
        Profile: '/executor/profile',
    },
    Admin: {
        Chat: {
            List: '/admin/chat',
            Details: (id: string | number) => buildPath('/admin/chat/:id', {id}),
        },

        // Тут и пользователи и заявки на исполнителя
        Users: {
            List: '/admin/users',
            Details: (id: string | number) => buildPath('/admin/users/:id', {id}),
        },

        // Тут управление ассортиментом услуг
        Services: {
            List: '/admin/services',
            Create: '/admin/services/create',
            Edit: (id: string | number) => buildPath('/admin/services/:id/edit', {id}),
            Details: (id: string | number) => buildPath('/admin/services/:id', {id}),
        },

        Order: {
            // Заявки на услуги и все вокруг этого
            List: '/admin/orders',
            Create: '/admin/orders/create',
            Checkout: '/admin/orders/checkout',
            Details: (id: string | number) => buildPath('/admin/orders/:id', {id}),
        },

        Bonuses: '/admin/bonuses',

        Profile: '/admin/profile',
    }
} as const;