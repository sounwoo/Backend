import {
    Path,
    createLinkareerPaths,
    createQNet,
    findeDetailType,
    languagePath,
    paths,
    testType,
} from '../../common/crawiling/interface';
import { Service } from 'typedi';
import { ElasitcClient } from '../../database/elasticConfig';
import { CommunityService } from '../community/community.service';
import { cludes } from '../../common/util/return_data_cludes';
import { bestDataType } from './interfaces/returnType/bestData.interface';
import { findeDetailCrawling } from './interfaces/returnType/findDetailCrawling.interface';
import { findCrawling } from './interfaces/returnType/findeCrawling.interface';
import RedisClient from '../../database/redisConfig';
import { examSchedulesSort } from '../../common/util/examSchedules.sort';
import {
    languageClassify,
    languageTitle,
} from '../../common/util/languageData';
import { splitDate } from '../../common/util/splitDate';
import { randomSolution } from '../../common/util/return_data_randomSolution';
import { UserService } from '../users/users.service';
import { myKeywordCrawlingObj } from '../../common/util/myKeywordCrawlingObj';
import { getDday } from '../../common/util/getDday';
import {
    myKeywordCrawlingObjType,
    myKeywordCrawlingReturnType,
} from './types/myKeywordCrawling.type';
import { range } from '../../common/util/range';

@Service()
export class CrawlingService {
    constructor(
        private readonly elastic: ElasitcClient,
        private readonly redis: RedisClient,
        private readonly userService: UserService,
        private readonly communityService: CommunityService,
    ) {}

    async findeCrawling({ ...data }: paths): Promise<findCrawling[]> {
        const { path, page, count, id, ..._data } = data;

        let scrapIds: string[] = [];
        id && (scrapIds = await this.userService.getScrapId({ id, path }));

        const datas: { [key: string]: string } = { ..._data };
        const must: object[] = [];
        let should: object[] = [];
        for (const key in _data) {
            const value = datas[key];
            if (key === 'scale' || key === 'month') {
                should = range({ key, arr: value.split(',') });
            } else if (path === 'qnet') {
                must.push({
                    match: {
                        [key]: {
                            query: value.replace(',', ' '),
                            operator: 'and',
                        },
                    },
                });
            } else {
                should.push({
                    match: {
                        [key]: {
                            query: value.replace(',', ' '),
                            operator: 'and',
                        },
                    },
                });
            }
        }

        return this.elastic
            .search({
                index: `${path}*`,
                _source_includes: cludes(path),
                body: {
                    sort:
                        path === 'language'
                            ? [
                                  {
                                      sortDate: {
                                          order: 'asc',
                                      },
                                  },
                              ]
                            : [{ view: { order: 'desc' } }],
                    query: {
                        ...(must.length || should.length
                            ? {
                                  bool: {
                                      must,
                                      should,
                                  },
                              }
                            : { match_all: {} }),
                    },
                    size: 12,
                    from: (+page - 1 || 0) * 12,
                },
            })
            .then((data) => {
                return count
                    ? data.body.hits.total.value
                    : data.body.hits.hits.length
                      ? data.body.hits.hits.map((el: any) => {
                            const { closeDate, test, period, ...rest } =
                                el._source;

                            if (path === 'intern' || path === 'qnet') {
                                delete el._source.scrap,
                                    path === 'intern'
                                        ? delete el._source.Dday
                                        : delete el._source.view;
                            }

                            return {
                                id: el._id,
                                ...rest,
                                ...(path === 'intern' && {
                                    closeDate: splitDate(period),
                                }),
                                ...(path === 'language' && {
                                    title: languageTitle(test),
                                    closeDate,
                                }),
                                ...(path === 'qnet' && {
                                    ...examSchedulesSort(el),
                                }),
                                ...(path === 'competition' || path === 'outside'
                                    ? { Dday: getDday({ period }) }
                                    : undefined),
                                ...(id && {
                                    isScrap: scrapIds.includes(el._id),
                                }),
                            };
                        })
                      : [];
            });
    }

    async myKeywordCrawling({
        ...data
    }: paths & { id: string }): Promise<myKeywordCrawlingReturnType | []> {
        const userKeyword = await this.userService.findUserKeyword({
            ...data,
        });
        if (!userKeyword) return [];

        const keyword = userKeyword.split(' ');

        const result = [] as any;
        keyword.forEach((el) => {
            data.path === 'language'
                ? result.push(languageTitle(el as testType))
                : data.path === 'qnet'
                  ? result.push(el.replaceAll('.', '/'))
                  : result.push(el);
        });
        return result;
    }

    async findeDetailCrawling({
        path,
        dataId,
        id,
    }: findeDetailType): Promise<findeDetailCrawling | null> {
        let scrapIds: string[] = [];
        id && (scrapIds = await this.userService.getScrapId({ id, path }));

        return this.elastic
            .update(
                {
                    index: path,
                    id: dataId,
                    body: {
                        script: {
                            source: 'ctx._source.view++',
                        },
                        _source: true,
                    },
                },
                { ignore: [404] },
            )
            .then((el) => {
                const { period } = el.body.get._source;

                return {
                    ...(path === 'qnet' && {
                        mainImage: process.env.QNET_IMAGE,
                    }),
                    ...(path !== 'qnet' && {
                        Dday: getDday({ period }),
                    }),
                    ...(el.body.error ? el.meta.context : el.body.get._source),
                    ...(id && { isScrap: scrapIds.includes(el.body._id) }),
                };
            });
    }

    async createLanguageData({ ...data }: languagePath): Promise<boolean> {
        await this.elastic.index({
            index: 'language',
            body: { ...data },
        });
        return true;
    }

    async createLinkareerData<T extends object>({
        data,
        path,
        month,
        scale,
    }: {
        data: T;
        path: createLinkareerPaths;
        month: number;
        scale?: number | undefined;
    }): Promise<boolean> {
        await this.elastic.index({
            index: path,
            body: {
                ...data,
                scrap: 0,
                ...(scale && { scale }),
                ...(month && { month }),
            },
        });

        return true;
    }

    async createQNetData({
        categoryObj,
        ...data
    }: createQNet): Promise<boolean> {
        await this.elastic.index({
            index: 'qnet',
            body: { ...categoryObj, ...data },
        });

        return true;
    }

    async bsetData({
        path,
        id,
    }: {
        path: Path['path'] | 'community';
        id: string;
    }): Promise<bestDataType[]> {
        let scrapIds: string[] = [];
        if (id && path !== 'community')
            scrapIds = await this.userService.getScrapId({ id, path });

        if (path === 'community')
            return this.communityService.findeMany({ page: '1', main: true });

        return this.elastic
            .search({
                index: path,
                _source_includes: cludes(path),
                body: {
                    sort: { view: { order: 'desc' } },
                    query: {
                        match_all: {},
                    },
                },
                size: 12,
            })
            .then((el) =>
                el.body.hits.hits.map((el: any) => {
                    const {
                        period,
                        preferentialTreatment,
                        examSchedules,
                        ...rest
                    } = el._source;

                    return {
                        id: el._id,
                        ...rest,
                        ...(path === 'qnet' && {
                            mainImage: process.env.QNET_IMAGE,
                        }),
                        ...(path !== 'qnet' && {
                            Dday: getDday({ period }),
                        }),
                        ...(id && { isScrap: scrapIds.includes(el._id) }),
                    };
                }),
            );
    }

    async randomCrawling(): Promise<any> {
        return await Promise.all(
            ['outside', 'competition', 'intern', 'qnet'].map(async (el) => {
                const data = await this.redis.get(el);
                return data
                    ? { [el]: JSON.parse(data) }
                    : {
                          [el]: await this.elastic
                              .search({
                                  index: el,
                                  _source_includes: randomSolution(
                                      el as Path['path'],
                                  ),
                                  body: {
                                      query: {
                                          function_score: {
                                              query: { match_all: {} },
                                              random_score: {},
                                          },
                                      },
                                  },
                                  size: 1,
                              })
                              .then((data) => {
                                  const hits = data.body.hits.hits[0];
                                  const { period, examSchedules, ...rest } =
                                      hits._source;
                                  const info = {
                                      id: hits._id,
                                      ...(el === 'intern' && {
                                          closeDate: splitDate(period),
                                      }),
                                      ...(el === 'qnet' && {
                                          mainImage: process.env.QNET_IMAGE,
                                          wtPeriod: examSchedules[0].wtPeriod,
                                          ptPeriod: examSchedules[0].ptPeriod,
                                      }),
                                      ...(el !== 'intern' &&
                                          el !== 'qnet' && {
                                              Dday: getDday({ period }),
                                          }),
                                      ...rest,
                                  };
                                  this.redis.set(
                                      el,
                                      JSON.stringify({ ...info }),
                                      'EX',
                                      60 * 60 * 12,
                                  );
                                  return {
                                      ...info,
                                  };
                              }),
                      };
            }),
        );
    }
}
