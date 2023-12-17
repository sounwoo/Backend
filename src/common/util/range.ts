interface IRange {
    key: string;
    arr: string[];
}
interface keyword {
    key: string;
    gte?: number | null;
    lte?: number | null;
}

const scaleOrMonthKeyword = ({ key, gte, lte }: keyword) => {
    return { range: { [key]: { ...(gte && { gte }), ...(lte && { lte }) } } };
};

export const range = ({ key, arr }: IRange) => {
    return arr.map((el) => {
        if (key === 'scale') {
            if (el.includes('미만')) {
                return scaleOrMonthKeyword({ key, lte: 1000 });
            } else if (el.includes('이상')) {
                return scaleOrMonthKeyword({ key, gte: 5000 });
            } else {
                const [start, end] = el.split('~');
                return scaleOrMonthKeyword({
                    key,
                    gte: +(start[0] + '000'),
                    lte: +(end[0] + '000'),
                });
            }
        } else {
            if (el.includes('이하')) {
                return scaleOrMonthKeyword({ key, lte: 3 });
            } else if (el.includes('이상')) {
                return scaleOrMonthKeyword({ key, gte: 12 });
            } else {
                const [start, end] = el.split('~');
                return scaleOrMonthKeyword({
                    key,
                    gte: +start[0],
                    lte: +end[0],
                });
            }
        }
    });
};
