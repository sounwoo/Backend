import { testType } from '../crawiling/interface';
import { formDate } from './formDate';

export const languageTitle = (test: testType): string => {
    const obj = {
        toeic: 'TOEIC',
        toeicBR: 'TOEIC (Bridge)',
        toeicSW: 'TOEIC (Speaking, Writing)',
        toeicWT: 'TOEIC (Writing)',
        toeicST: 'TOEIC (Speaking)',
        ch: 'TSC 중국어 말하기 시험',
        jp: 'JPT',
        jpSP: 'SJPT 일본어 말하기 시험',
    };
    return obj[test];
};

export const languageData = (Dday: string, date: string) => {
    const examDate = formDate(Dday);
    const sortDate = new Date(examDate);

    const openDate = formDate(
        date.split('특별추가')[0].split('~')[0].replace('정기접수:', ''),
    );
    const closeDate = formDate(date.split('특별추가')[0].split('~')[1]);

    return { examDate, openDate, closeDate, sortDate };
};

export const languageClassify = (test: testType): string => {
    const obj = {
        영어: ['toeic', 'toeicBR', 'toeicSW', 'toeicST', 'toeicWT'],
        중국어: ['ch'],
        일본어: ['jp', 'jpSP'],
    };

    return obj.영어.includes(test)
        ? '영어'
        : obj.중국어.includes(test)
        ? '중국어'
        : '일본어';
};
