import { User } from '@prisma/client';
import { CustomPrismaClient } from '../../database/prismaConfig';
import {
    IThermometerFindPath,
    IThermometerUpdate,
    IFindUserKeyword,
    IThermometerUser,
    ITopPercentage,
    IUpdateProfile,
    IUserCreateDTO,
    IUserFindOneUserByID,
    ISaveInterestKeyword,
    IScrapping,
    IGetUserScrap,
    IGetCalender,
    IThermometerPatch,
} from './interfaces/user.interface';
import CustomError from '../../common/error/customError';
import { Service } from 'typedi';
import { ElasitcClient } from '../../database/elasticConfig';
import { scrapData } from '../../common/util/scrap_data';
import { ScrapType } from './types/scrap.type';
import { PercentageType } from './types/thermometer.type';
import { languageTitle } from '../../common/util/languageData';
import { percentage, ThermometerPaths } from '../../common/util/thermometer';
import {
    emailProviderType,
    getScrapIdType,
    interestKeywordType,
    userProfileType,
} from '../../common/types';
import { paths } from '../../common/crawiling/interface';
import { calenderData } from '../../common/util/calender_data';
import { calanderDate } from '../../common/util/getCalenderData';
import { getDday } from '../../common/util/getDday';

@Service()
export class UserService {
    constructor(
        private readonly prisma: CustomPrismaClient, //
        private readonly elastic: ElasitcClient,
    ) {}

    async findUserKeyword({
        id,
        path,
        classify,
    }: IFindUserKeyword): Promise<string> {
        const result = await this.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                interestKeyword: {
                    include: {
                        interest: true,
                        keyword: true,
                    },
                },
            },
        });

        let keywords: string[] = [];

        result!.interestKeyword.forEach(
            (el) =>
                el.interest.interest === path &&
                keywords.push(el.keyword.keyword),
        );

        if (classify) {
            keywords = await Promise.all(
                keywords.map(async (test) => {
                    return this.elastic
                        .search({
                            index: path,
                            _source: 'test',
                            size: 1,
                            body: {
                                query: {
                                    bool: {
                                        must: [
                                            { match: { classify } },
                                            { match: { test } },
                                        ],
                                    },
                                },
                            },
                        })
                        .then((data) => {
                            const hits = data.body.hits.hits[0];
                            return hits && hits._source.test;
                        });
                }),
            );
        }

        return keywords.filter((el) => el).join(' ');
    }

    saveInterestKeyword({
        prisma,
        interestKeyword,
        id,
    }: ISaveInterestKeyword): Promise<void[][]> {
        return Promise.all(
            interestKeyword.map(async ({ interest, keyword }) => {
                const createdInterest = await prisma.interest.upsert({
                    where: { interest },
                    update: {},
                    create: { interest },
                });

                return Promise.all(
                    keyword.map(async (keyword: string) => {
                        const createdKeyword = await prisma.keyword.upsert({
                            where: { keyword },
                            update: {},
                            create: { keyword },
                        });
                        await prisma.userInterest.create({
                            data: {
                                userId: id,
                                interestId: createdInterest.id,
                                keywordId: createdKeyword.id,
                            },
                        });
                    }),
                );
            }),
        );
    }

    findOneUserByEmail(email: User['email']): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                email,
            },
            include: {
                interestKeyword: {
                    include: {
                        interest: true,
                        keyword: true,
                    },
                },
                communities: true,
            },
        });
    }

    async isUserByID(id: User['id']): Promise<User> {
        const isUser = await this.prisma.user.findUnique({
            where: {
                id,
            },
            include: {
                communities: true,
                interestKeyword: true,
            },
        });
        if (!isUser) {
            throw new CustomError('id가 일치하는 유저가 없습니다', 400);
        }
        return isUser;
    }

    async findUserProfile(id: User['id']): Promise<userProfileType> {
        const profile = await this.prisma.user.findUnique({
            where: { id },
            select: {
                email: true,
                profileImage: true,
                nickname: true,
                interestKeyword: {
                    select: {
                        interest: { select: { interest: true } },
                        keyword: { select: { keyword: true } },
                    },
                },
            },
        });

        const interestKeyword: interestKeywordType[] = [];
        profile?.interestKeyword.map((el) => {
            const { interest, keyword } = el;
            const isInterest = interestKeyword.find(
                (item: interestKeywordType) =>
                    item.interest === interest.interest,
            );

            if (isInterest) isInterest.keyword.push(keyword.keyword);
            else
                interestKeyword.push({
                    interest: interest.interest,
                    keyword: [keyword.keyword],
                });
        });

        return {
            email: profile!.email,
            profileImage: profile!.profileImage,
            nickname: profile!.nickname,
            interestKeyword,
        };
    }

    async isNickname(nickname: User['nickname']): Promise<boolean> {
        const isNickname = await this.prisma.user.findUnique({
            where: {
                nickname,
            },
        });
        if (isNickname)
            throw new CustomError('이미 사용중인 닉네임입니다', 400);
        return true;
    }

    findOneUserByID({
        name,
        phone,
    }: IUserFindOneUserByID): Promise<emailProviderType[]> {
        return this.prisma.user.findMany({
            where: {
                name,
                phone,
            },
            select: {
                email: true,
                provider: true,
            },
        });
    }

    async getLoginUserInfo(id: User['id']) {
        const user = await this.isUserByID(id).then((el) => {
            const { id, nickname, profileImage, thermometer, top, subMajorId } =
                el;
            return { id, nickname, profileImage, thermometer, top, subMajorId };
        });

        const { subMajorId, ...rest } = user;

        const major = await this.prisma.subMajor.findUnique({
            where: { id: user.subMajorId },
            select: {
                mainMajor: {
                    select: { mainMajor: true },
                },
            },
        });

        return {
            ...rest,
            mainMajor: major!.mainMajor.mainMajor,
        };
    }

    async createUser({ createDTO }: IUserCreateDTO): Promise<User['id']> {
        const { interestKeyword, major, ...userData } = createDTO;

        const { mainMajor, subMajor } = major;

        await this.isNickname(userData.nickname);

        return await this.prisma.$transaction(async (prisma) => {
            const isSubMajor = await prisma.subMajor.findFirst({
                where: { AND: [{ subMajor, mainMajor: { mainMajor } }] },
                select: { id: true },
            });
            const subMajorId = isSubMajor
                ? isSubMajor
                : await prisma.subMajor.create({
                      data: {
                          subMajor,
                          mainMajor: {
                              connectOrCreate: {
                                  where: { mainMajor },
                                  create: { mainMajor },
                              },
                          },
                      },
                      select: { id: true },
                  });

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    subMajorId: subMajorId.id,
                },
            });
            await this.saveInterestKeyword({
                prisma,
                interestKeyword,
                id: user.id,
            });
            return user.id;
        });
    }

    async updateProfile({ id, updateDTO }: IUpdateProfile): Promise<User> {
        const { interestKeyword, ...data } = updateDTO;

        const chkUser = await this.isUserByID(id);

        if (data.nickname !== chkUser.nickname)
            await this.isNickname(data.nickname as string);

        if (interestKeyword) {
            await this.prisma.userInterest.deleteMany({
                where: { userId: id },
            });

            await this.prisma
                .$transaction(async (prisma) => {
                    await this.saveInterestKeyword({
                        prisma,
                        interestKeyword,
                        id: chkUser.id,
                    });
                })
                .then(async () => await this.isUserByID(id));
        }

        return await this.prisma.user.update({
            where: { id },
            data,
            include: {
                interestKeyword: {
                    include: {
                        interest: true,
                        keyword: true,
                    },
                },
            },
        });
    }

    async scrapping({ id, scrappingDTO }: IScrapping): Promise<boolean> {
        await this.isUserByID(id);
        const { path, scrapId } = scrappingDTO;
        const { column, id: _scrapId } = scrapData(path);

        const chkScrap = await this.prisma.user.findFirst({
            include: {
                [column]: {
                    where: {
                        AND: [{ userId: id, [_scrapId]: scrapId }],
                    },
                },
            },
        });

        const chkPlusMinus = chkScrap?.[column].length;
        const plusMinus = `ctx._source.scrap${chkPlusMinus ? '--' : '++'}`;

        await Promise.all([
            this.elastic
                .update(
                    {
                        index: path,
                        id: scrapId,
                        body: {
                            script: {
                                source: plusMinus,
                            },
                        },
                    },
                    { ignore: [404] },
                )
                .then((el) => el.body.error && el.meta.context),

            this.prisma.user.update({
                where: { id },
                data: {
                    [column]: chkPlusMinus
                        ? {
                              deleteMany: { [_scrapId]: scrapId },
                          }
                        : { create: { [_scrapId]: scrapId } },
                },
            }),
        ]);

        return chkPlusMinus ? false : true;
    }

    async getUserScrap({
        id,
        getUserScrapDTO,
    }: IGetUserScrap): Promise<ScrapType[]> {
        const { path, count, page } = getUserScrapDTO;
        await this.isUserByID(id);

        const _id = await this.getScrapId({ id, path });

        return await this.elastic
            .search({
                index: path,
                _source_includes: scrapData(path).info,
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
                        terms: {
                            _id,
                        },
                    },
                    ...(page && { size: 4, from: (+page - 1 || 0) * 4 }),
                },
            })
            .then((data) => {
                return count
                    ? data.body.hits.total.value
                    : data.body.hits.hits.length
                    ? data.body.hits.hits.map((el: any) => {
                          const { period, ...rest } = el._source;
                          if (path === 'language') {
                              const { test, ...data } = el._source;
                              return {
                                  id: el._id,
                                  enterprise: 'YBM',
                                  ...data,
                                  title: languageTitle(test),
                                  isScrap: true,
                              };
                          }
                          if (path === 'qnet') {
                              const schedule = el._source.examSchedules[0];
                              delete el._source.examSchedules;
                              return {
                                  mainImage: process.env.QNET_IMAGE,
                                  id: el._id,
                                  period: schedule.wtPeriod.split('[')[0],
                                  examDate: schedule.wtDday,
                                  ...el._source,
                                  isScrap: true,
                              };
                          }
                          return {
                              id: el._id,
                              ...rest,
                              Dday: getDday({ period }),
                              isScrap: true,
                          };
                      })
                    : null;
            });
    }

    async getScrapId({ id, path }: getScrapIdType): Promise<string[]> {
        return await this.prisma.user
            .findUnique({
                where: { id },
                include: {
                    [scrapData(path).column]: true,
                },
            })
            .then((data) =>
                data![scrapData(path).column].map(
                    (el: any) => el[scrapData(path).id],
                ),
            );
    }

    async delete(email: User['email']): Promise<boolean> {
        const user = await this.findOneUserByEmail(email);
        const qqq = await this.prisma.user.delete({ where: { id: user?.id } });
        console.log(qqq);
        return true;
    }

    async updateThermometer({
        id,
        path,
        createThermometer,
        mainMajorId,
        thermometerId,
    }: IThermometerUpdate): Promise<boolean> {
        await this.isUserByID(id);
        //todo transaction,,,
        await this.prisma.user.update({
            where: { id },
            data: {
                [ThermometerPaths[path]]: createThermometer
                    ? { create: { ...createThermometer } }
                    : { delete: { id: thermometerId } },
            },
        });

        const { sum: thermometer } = await this.getCount(id);

        await this.prisma.user.update({
            where: { id },
            data: {
                thermometer,
            },
        });

        await this.topPercent({ id, mainMajorId });

        return true;
    }

    async getCount(id: string): Promise<PercentageType> {
        await this.isUserByID(id);

        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                userCompetition: {
                    select: {
                        id: true,
                    },
                },
                userOutside: {
                    select: {
                        id: true,
                    },
                },
                userQnet: {
                    select: {
                        id: true,
                    },
                },
                userIntern: {
                    select: {
                        id: true,
                    },
                },
                userLanguage: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        return percentage(user as IThermometerUser);
    }

    async topPercent({ mainMajorId }: ITopPercentage): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                subMajor: {
                    mainMajorId,
                },
            },
            select: {
                id: true,
            },
            orderBy: {
                thermometer: 'desc',
            },
        });

        return Promise.all(
            users.map(async (el, index) => {
                const { id } = el;
                const grade = index + 1;
                const top = (grade / users.length) * 100;

                return this.prisma.user.update({
                    where: { id },
                    data: { top },
                });
            }),
        );
    }

    async findManyThermometer(id: string): Promise<any> {
        return await this.prisma.user.findMany({
            where: { id },
            select: {
                userCompetition: {
                    select: {
                        activeTitle: true,
                    },
                },
                userOutside: {
                    select: {
                        activeTitle: true,
                    },
                },
                userQnet: {
                    select: {
                        activeTitle: true,
                    },
                },
                userLanguage: {
                    select: {
                        activeTitle: true,
                    },
                },
                userIntern: {
                    select: {
                        activeTitle: true,
                    },
                },
            },
        });
    }

    async findPathThermometer({
        id,
        path,
    }: IThermometerFindPath): Promise<any> {
        await this.isUserByID(id);
        const addField = await this.addField(ThermometerPaths[path]);
        const users = await this.prisma.user.findMany({
            where: { id },
            select: {
                [ThermometerPaths[path]]: {
                    select: {
                        id: true,
                        field: true,
                        category: true,
                        activeTitle: true,
                        activeContent: true,
                        ...addField,
                    },
                },
            },
        });

        console.log(users[0]);

        return users[0][ThermometerPaths[path]].map((user) => ({
            ...user,
        }));
    }

    async addField(field: string): Promise<Record<string, boolean>> {
        switch (field) {
            case 'userLanguage':
                return {
                    score: true,
                };
            case 'userIntern':
                return {
                    period: true,
                };

            default:
                return {};
        }
    }

    async getCalender({ id, year, month }: IGetCalender) {
        await this.isUserByID(id);

        const calender: {
            [key: string]: [
                {
                    id: string;
                    title: string;
                    status: string;
                },
            ];
        } = {};
        await Promise.all(
            ['competition', 'outside', 'intern', 'language', 'qnet'].map(
                async (el) => {
                    const scrapIds = await this.getScrapId({
                        id,
                        path: el as paths['path'],
                    });
                    await this.elastic
                        .search({
                            index: el,
                            _source_includes: calenderData(el as paths['path'])
                                .info,
                            body: {
                                query: {
                                    terms: {
                                        _id: scrapIds,
                                    },
                                },
                            },
                        })
                        .then((data) =>
                            data.body.hits.hits.map(async (info: any) => {
                                const {
                                    openDate,
                                    closeDate,
                                    examDate,
                                    examSchedules,
                                    period,
                                    participationPeriod,
                                } = info._source;

                                const result = await calanderDate({
                                    path: el as paths['path'],
                                    year,
                                    month,
                                    data: {
                                        openDate,
                                        closeDate,
                                        examDate,
                                        examSchedules,
                                        period,
                                        participationPeriod,
                                    },
                                });

                                return result.map((final: any) => {
                                    calender[final.targetDate] =
                                        calender[final.targetDate] || [];
                                    return calender[final.targetDate].push({
                                        id: info._id,
                                        title:
                                            el !== 'language'
                                                ? info._source.title
                                                : info._source.test,
                                        status: final.status,
                                    });
                                });
                            }),
                        );
                },
            ),
        );
        return calender;
    }

    async patchThermometer({
        id,
        path,
        thermometerId,
        patchThermometer,
    }: IThermometerPatch): Promise<boolean> {
        await this.isUserByID(id);

        await this.prisma.user.update({
            where: { id },
            data: {
                [ThermometerPaths[path]]: {
                    update: {
                        where: { id: thermometerId },
                        data: {
                            activeContent: patchThermometer.activeContent,
                            period: patchThermometer.period,
                            score: patchThermometer.score,
                        },
                    },
                },
            },
        });

        return true;
    }
}
