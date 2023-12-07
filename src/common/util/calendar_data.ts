import { paths } from '../crawiling/interface';

export const calendarData = (path: paths['path']) => {
    const common = ['title', 'period'];

    const data = {
        competition: {
            info: [...common],
        },
        outside: {
            info: [...common, 'participationPeriod'],
        },
        language: {
            info: ['test', 'openDate', 'closeDate', 'examDate'],
        },
        qnet: {
            info: ['title', 'examSchedules'],
        },
        intern: {
            info: [...common],
        },
    };
    return data[path];
};
