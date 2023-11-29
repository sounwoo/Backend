import { findCrawling } from '../interfaces/returnType/findeCrawling.interface';

export type myKeywordCrawlingReturnType = {
    keyword?: string[];
    data: findCrawling[];
};

export type myKeywordCrawlingObjType = Record<string, string[]>;
