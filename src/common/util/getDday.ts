import { getDdayType } from '../types';

export const getDday = ({ period }: getDdayType): string => {
    const end = period.split(' ~ ')[1];
    const [year, month, day] = end.split('.').map(Number);
    const Dday = new Date(year + 2000, month - 1, day);

    const today = new Date();
    const timeDifference = Dday.getTime() - today.getTime();
    const result = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return isNaN(result) ? end : `D-${result}`;
};
