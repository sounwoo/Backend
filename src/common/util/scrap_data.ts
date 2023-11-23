import { Path } from '../crawiling/interface';

const scrapType = (path: string) => {
    const temp = (path === 'qnet' ? path.slice(0, 2) : path[0]).toUpperCase();

    const column = `scrap${
        temp + path.slice(path === 'qnet' ? 2 : 1, path.length)
    }`;

    return { column, id: `${path === 'qnet' ? 'qNet' : path}Id` };
};

export const scrapData = (path: Path['path'] | 'language') => {
    const common = [
        'Dday',
        'mainImage',
        'title',
        'enterprise',
        'scrap',
        'view',
        'period',
    ];
    const viewScrap = ['view', 'scrap'];
    const { id, column } = scrapType(path);
    const data = {
        competition: {
            id,
            column,
            info: [...common],
        },
        outside: {
            id,
            column,
            info: [...common],
        },
        language: {
            id,
            column,
            info: [
                'Dday',
                'mainImage',
                'test',
                'examDate',
                'closeDate',
                ...viewScrap,
            ],
        },
        qnet: {
            id,
            column,
            info: ['title', 'institution', 'examSchedules', ...viewScrap],
        },
        intern: {
            id,
            column,
            info: [...common, 'location'],
        },
    };
    return data[path];
};
