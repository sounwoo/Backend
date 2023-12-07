import {
    calanderDataType,
    calanderDateType,
    getYearMonthDateType,
    isYearMonthSameType,
    splitMapType,
} from '../types';

export const calandarDate = async ({
    path,
    year,
    month,
    data,
}: calanderDateType): Promise<object[]> => {
    const yearMonthDate = await getYearMonthDate({ path, data, year, month });
    return await isYearMonthSame({ yearMonthDate });
};

export const getYearMonthDate = ({
    path,
    data,
    year,
    month,
}: getYearMonthDateType) => {
    const {
        openDate,
        closeDate,
        examDate,
        examSchedules,
        period,
        participationPeriod,
    } = data as calanderDataType;

    const result: any = [];
    if (path === 'language') {
        [openDate, closeDate, examDate].forEach((el) => {
            const getDate = el.split(' ')[0];

            const key =
                el === openDate
                    ? 'startDate'
                    : el === closeDate
                    ? 'closeDate'
                    : 'examDate';
            result.push({
                [key]: splitMap({ date: getDate, path, year, month }),
            });
        });
    } else if (path === 'qnet') {
        examSchedules.forEach((el: any) => {
            if (el.resultDay !== '') {
                const { wtPeriod, ptPeriod, wtDday, ptDday } = el;
                [wtPeriod, ptPeriod, wtDday, ptDday].forEach((el2: any) => {
                    const [start, end] =
                        el2 === wtPeriod
                            ? el2.split('[')[0].split('~')
                            : el2 === ptPeriod
                            ? el2.split('빈')[0].split('~')
                            : el2.split('~');

                    el2 === wtPeriod || el2 === ptPeriod
                        ? result.push({
                              startDate: splitMap({
                                  date: start,
                                  path,
                                  year,
                                  month,
                              }),
                              closeDate: splitMap({
                                  date: end,
                                  path,
                                  year,
                                  month,
                              }),
                          })
                        : result.push({
                              examDate: splitMap({
                                  date: start,
                                  path,
                                  year,
                                  month,
                              }),
                          });
                });
            }
        });
    } else if (path === 'outside') {
        [period, participationPeriod].forEach((el) => {
            const [start, end] = el.split(' ~ ');
            const isParticipationPeriod = el === participationPeriod;

            result.push(
                isParticipationPeriod
                    ? { examDate: splitMap({ date: start, path, year, month }) }
                    : {
                          startDate: splitMap({
                              date: start,
                              path,
                              year,
                              month,
                          }),
                          closeDate: splitMap({ date: end, path, year, month }),
                      },
            );
        });
    } else {
        const [start, close] = period.split(' ~ ');
        return [
            {
                startDate: splitMap({ date: start, path, year, month }),
                closeDate: splitMap({ date: close, path, year, month }),
            },
        ];
    }
    return result;
};

export const splitMap = ({ date, path, year, month }: splitMapType) => {
    const whichPath = path === 'language' ? '-' : '.';

    const [dateYear, dateMonth, dateDay] = date
        .split(whichPath)
        .map((el: string, index: number) => {
            return index === 0
                ? el.slice(-2)
                : el.startsWith('0')
                ? el.slice(-1)
                : el;
        });

    if (year === dateYear && month === dateMonth)
        return { dateYear, dateMonth, dateDay };
};

export const isYearMonthSame = ({ yearMonthDate }: isYearMonthSameType) => {
    const result: any = [];
    yearMonthDate.forEach((el: any) => {
        const pushStatus = (status: string, dateKey: string) => {
            const dateInfo = el[dateKey];
            dateInfo?.dateDay &&
                result.push({ status, targetDate: dateInfo.dateDay });
        };

        pushStatus('open', 'startDate');
        pushStatus('close', 'closeDate');
        pushStatus('exam', 'examDate');
    });

    return result;
};
