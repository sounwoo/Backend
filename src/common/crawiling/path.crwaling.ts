import axios from 'axios';
import cheerio from 'cheerio';
import { languageType, linkareerType } from './crawiling.data';
import { createLinkareerPaths, itmeType, testType } from './interface';
import { CrawlingService } from '../../apis/crawling/crawling.service';
import { Service } from 'typedi';
import { QNetObj } from './seed.q-net';
import iconv from 'iconv-lite';
import { ExamSchedules } from '../../apis/crawling/types/qnet.type';
import { languageData } from '../util/languageData';
const decode = require('decode-html');

@Service()
export class PathCrawling {
    constructor(
        private readonly crawlingServcie: CrawlingService, //
    ) {}

    async linkareerData(path: createLinkareerPaths) {
        // 이중 배열 만들때 -> 깊은 복사 때문이다.
        // Array.from({ length: 3 }, () => {
        //     return Array.from({ length: 3 }, () => 0);
        // });

        return Array(3)
            .fill(0)
            .map(async (_, i) => {
                let month: number = 0;
                const {
                    url,
                    dataType,
                    detailClass,
                    mainImageType,
                    interestsType,
                } = linkareerType(path, i);
                const dataList = await axios.get(url);

                return dataList.data.data.activities.nodes.map(
                    async (el: any) => {
                        const result = await axios.get(
                            `https://linkareer.com/activity/${el.id}`,
                        );
                        const $ = cheerio.load(result.data);

                        $(
                            'div.ActivityInformationFieldBase__StyledWrapper-sc-735b9a83-0.bcYeyS',
                        ).each((index, el) => {
                            const key = Object.keys(dataType)[index];

                            if (key) {
                                dataType[key as keyof typeof dataType] = $(el)
                                    .find('h3')
                                    .text();
                            }
                        });

                        if (path === 'outside' || path === 'competition') {
                            const interests = $(`span.${interestsType}`)
                                .map((_, el) => $(el).html())
                                .get()
                                .join(', ');
                            dataType.interests = interests;
                            if (path === 'outside') {
                                // 개월수 계산
                                const participationPeriod: any[] =
                                    dataType.participationPeriod!.split(' ~ ');
                                if (participationPeriod.length > 1) {
                                    const [start, end] =
                                        participationPeriod.map((el) => {
                                            const [year, month, day] =
                                                el.split('.');
                                            return new Date(
                                                `20${year}-${month}-${day}`,
                                            ).getTime();
                                        });
                                    month = Math.ceil(
                                        (end - start) /
                                            (1000 * 60 * 60 * 24) /
                                            30,
                                    );
                                }
                                const field = $('span.jss12')
                                    .map((_, el) => $(el).html())
                                    .get()
                                    .join(', ');
                                dataType.field = field;
                            } else {
                                dataType.scale = dataType.scale!.replace(
                                    '만 원',
                                    '',
                                );
                                dataType.scale = dataType.scale!.replace(
                                    '억 원',
                                    '0000',
                                );
                                dataType.scale = dataType.scale!.replace(
                                    '억 ',
                                    '',
                                );
                            }
                        }

                        const data = {
                            title: $('h1.title').text(),
                            view: +String($('span.count').html()),
                            mainImage: $(`img.${mainImageType}`).attr('src'),
                            enterprise: $('h2.organization-name').text(),
                            ...dataType,
                            ...(dataType.scale && { scale: +dataType.scale }),
                            detail: $(
                                'div.ActivityDetailTabContent__StyledWrapper-sc-e04a1d2-0.fnlchx',
                            ).html(),
                        };

                        return this.crawlingServcie.createLinkareerData({
                            data,
                            path,
                            month,
                        });
                    },
                );
            });
    }

    async languageData({ test }: { test: testType }) {
        const { testType, dataObj, homePage, classify, mainImage } =
            languageType(test);
        const result = await axios.get(homePage);
        const $ = cheerio.load(result.data);
        $(testType).each((_, el) => {
            $(el)
                .find('td')
                .each((indexs, els) => {
                    const key = Object.keys(dataObj)[indexs];
                    if (key) {
                        dataObj[key as keyof typeof dataObj] = $(els)
                            .text()
                            .replace(/\s+/g, '');
                    }
                });
            const { Dday, date } = dataObj;

            this.crawlingServcie.createLanguageData({
                test,
                classify,
                mainImage,
                homePage,
                scrap: 0,
                ...languageData(Dday, date),
            });
        });
        return ['true'];
    }

    async QNetData() {
        const category = await axios.get(process.env.QNET_CATEGORY_URI!);
        const categoryObj: any = {};

        await Promise.all(
            category.data.response.body.items.item.map(async (el: itmeType) => {
                const {
                    mdobligfldnm: subKeyword,
                    obligfldnm: mainKeyword,
                    jmcd,
                } = el;
                if (QNetObj[jmcd]) {
                    categoryObj[jmcd] = {
                        mainCategory: mainKeyword,
                        subCategory: subKeyword,
                    };
                }
            }),
        );

        const listUrl = process.env.QNET_LIST_URL!;

        // 국가기술자격
        const dataList = await Promise.all(
            ['01', '02', '03', '04'].map(async (el) => {
                return await axios
                    .get(`${listUrl}${el}`)
                    .then((result) => result.data.response.body.items.item)
                    .catch((err) => console.log(err));
            }),
        );

        dataList.forEach((arr) => {
            arr.forEach(async (el: itmeType) => {
                const { jmCd, implNm, engJmNm, instiNm, jmNm } = el;
                if (QNetObj[jmCd]) {
                    const dataList = await axios.get(
                        `https://www.q-net.or.kr/crf005.do?id=crf00503s02&gSite=Q&gId=&jmCd=${jmCd}&jmInfoDivCcd=B0&jmNm=${implNm}`,
                        { responseType: 'arraybuffer' },
                    );
                    const decodedHTML = iconv.decode(dataList.data, 'EUC-KR');
                    const $ = cheerio.load(decodedHTML);
                    const examSchedules: ExamSchedules[] = [];

                    $('tbody > tr').each((_, el) => {
                        const examScheduleObj = {
                            turn: '',
                            wtPeriod: '',
                            wtDday: '',
                            wtResultDay: '',
                            ptPeriod: '',
                            ptDday: '',
                            resultDay: '',
                        };
                        $(el)
                            .find('td')
                            .each((indexs, els) => {
                                const key =
                                    Object.keys(examScheduleObj)[indexs];
                                if (key) {
                                    examScheduleObj[
                                        key as keyof typeof examScheduleObj
                                    ] = $(els).text().replace(/\s+/g, '');
                                }
                            });
                        examSchedules.push(examScheduleObj);
                    });

                    let detail =
                        $('div.dlInfo.mb40').text() &&
                        decode($('div.dlInfo.mb40').html());

                    detail = detail.replaceAll(
                        /<textarea[^>]*>([\s\S]*?)<body[^>]*>/gi,
                        '',
                    );
                    detail = detail.replaceAll(
                        /<\/body[^>]*>([\s\S]*?)<\/textarea[^>]*>/gi,
                        '',
                    );

                    await this.crawlingServcie.createQNetData({
                        detail,
                        scheduleInfo: $('div.infoBox.mt10.mb40').html() ?? '',
                        examSchedules,
                        title: jmNm,
                        enTitle: engJmNm,
                        relatedDepartment: instiNm,
                        institution: implNm,
                        scrap: 0,
                        view: 0,
                        categoryObj: categoryObj[jmCd],
                    });
                }
            });
        });
        return ['true'];
    }
}
