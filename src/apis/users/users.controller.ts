import { UserService } from './users.service';
import { Request, Response, Router } from 'express';
import { SmsService } from '../../common/util/sms/sms.service';
import {
    createDTOType,
    email,
    findOneUserByIDType,
    idType,
    nicknameType,
    pathIdtype,
    pathPageCountType,
    updateThermometerType,
    phoneType,
    updateDTOType,
    validateTokenType,
    yearMonthType,
    patchThermometerType,
} from '../../common/types';
import { asyncHandler } from '../../middleware/async.handler';
import { Container } from 'typedi';
import AccessGuard from '../../middleware/auth.guard/access.guard';
import Validate from '../../common/validator/validateDTO';
import { ThermometerPath } from './types/thermometer.type';
import { CrawlingService } from '../crawling/crawling.service';

class UserController {
    router = Router();
    path = '/user';

    constructor(
        private readonly userService: UserService,
        private readonly smsService: SmsService,
        private readonly crawlingService: CrawlingService,
    ) {
        this.init();
    }

    init() {
        this.router.get(
            '/findOneUserByEmail',
            Validate.findOneUserByEmail,
            asyncHandler(this.findOneUserByEmail.bind(this)),
        );

        this.router.get(
            '/findOneUserByID',
            Validate.findOneUserByID,
            asyncHandler(this.findOneUserByID.bind(this)),
        );

        this.router.get(
            '/findUserProfile',
            AccessGuard.handle,
            asyncHandler(this.findUserProfile.bind(this)),
        );

        this.router.get(
            '/getLoginUserInfo',
            AccessGuard.handle,
            asyncHandler(this.getLoginUserInfo.bind(this)),
        );

        this.router.get(
            '/isNickname',
            Validate.isNickname,
            asyncHandler(this.isNickName.bind(this)),
        );

        this.router.post(
            '/createUser',
            Validate.createUser,
            asyncHandler(this.createUser.bind(this)),
        );

        this.router.post(
            '/sendTokenSMS',
            Validate.sendTokenSMS,
            asyncHandler(this.sendTokenSMS.bind(this)),
        );

        this.router.post(
            '/validateToken',
            Validate.validateToken,
            asyncHandler(this.validateToken.bind(this)),
        );

        this.router.patch(
            '/updateProfile',
            Validate.updateProfile,
            AccessGuard.handle,
            asyncHandler(this.updateProfile.bind(this)),
        );

        this.router.post(
            '/scrapping',
            Validate.scrapping,
            AccessGuard.handle,
            asyncHandler(this.scrapping.bind(this)),
        );

        this.router.get(
            '/getUserScrap',
            Validate.getUserScrap,
            AccessGuard.handle,
            asyncHandler(this.getUserScrap.bind(this)),
        );

        this.router.post(
            '/updateThermometer',
            Validate.updateThermometer,
            AccessGuard.handle,
            asyncHandler(this.updateThermometer.bind(this)),
        );

        this.router.get(
            '/getCount',
            AccessGuard.handle,
            asyncHandler(this.getCount.bind(this)),
        );

        this.router.delete('/delete', asyncHandler(this.delete.bind(this)));

        this.router.get(
            '/findManyThermometer',
            AccessGuard.handle,
            asyncHandler(this.findManyThermometer.bind(this)),
        );

        this.router.get(
            '/findPathThermometer',
            AccessGuard.handle,
            asyncHandler(this.findPathThermometer.bind(this)),
        );

        this.router.get(
            '/getCalender',
            Validate.getCalender,
            AccessGuard.handle,
            asyncHandler(this.getCalender.bind(this)),
        );

        this.router.patch(
            '/patchThermometer',
            Validate.patchThermometer,
            AccessGuard.handle,
            asyncHandler(this.patchThermometer.bind(this)),
        );
    }

    async findOneUserByEmail(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { email } = req.query as email;
        res.status(200).json({
            data: await this.userService.findOneUserByEmail(email),
        });
    }

    async findOneUserByID(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { name, phone } = req.query as findOneUserByIDType;
        res.status(200).json({
            data: await this.userService.findOneUserByID({
                name,
                phone,
            }),
        });
    }

    async findUserProfile(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { id } = req.user as idType;

        res.status(200).json({
            data: await this.userService.findUserProfile(id),
        });
    }

    async getLoginUserInfo(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { id } = req.user as idType;

        const solution = await this.crawlingService.randomCrawling();

        res.status(200).json({
            data: {
                ...(await this.userService.getLoginUserInfo(id)),
                solution,
            },
        });
    }

    async isNickName(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { nickname } = req.query as nicknameType;
        res.status(200).json({
            data: await this.userService.isNickname(nickname),
        });
    }

    async createUser(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        res.status(200).json({
            data: await this.userService.createUser({
                createDTO: req.body as createDTOType,
            }),
        });
    }

    async sendTokenSMS(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        const { phone } = req.body as phoneType;
        res.status(200).json({
            data: await this.smsService.sendTokenSMS(phone),
        });
    }

    async validateToken(req: Request, res: Response) {
        // #swagger.tags = ['Users']
        res.status(200).json({
            data: await this.smsService.validateToken(
                req.body as validateTokenType,
            ),
        });
    }

    async updateProfile(req: Request, res: Response) {
        // #swagger.tags = ['User']
        const { id } = req.user as idType;

        res.status(200).json({
            data: await this.userService.updateProfile({
                id,
                updateDTO: req.body as updateDTOType,
            }),
        });
    }

    async scrapping(req: Request, res: Response) {
        // #swagger.tags = ['User']
        const { id } = req.user as idType;

        res.status(200).json({
            data: await this.userService.scrapping({
                id,
                scrappingDTO: req.body as pathIdtype,
            }),
        });
    }

    async getUserScrap(req: Request, res: Response) {
        // #swagger.tags = ['User']
        const { id } = req.user as idType;
        res.status(200).json({
            data: await this.userService.getUserScrap({
                id,
                getUserScrapDTO: req.query as pathPageCountType,
            }),
        });
    }

    async delete(req: Request, res: Response) {
        const { email } = req.body;
        res.status(200).json({
            data: await this.userService.delete(email),
        });
    }

    async updateThermometer(req: Request, res: Response) {
        const { id } = req.user as idType;

        res.status(200).json({
            data: await this.userService.updateThermometer({
                id,
                ...(req.body as updateThermometerType),
            }),
        });
    }

    async getCount(req: Request, res: Response) {
        const { id } = req.user as idType;
        const data = await this.userService.getCount(id);
        res.status(200).json({
            ...data,
        });
    }

    async findManyThermometer(req: Request, res: Response) {
        const { id } = req.user as idType;
        const data = await this.userService.findManyThermometer(id);

        res.status(200).json({
            ...data,
        });
    }

    async findPathThermometer(req: Request, res: Response) {
        const { id } = req.user as idType;
        const { path } = req.query as ThermometerPath;
        const datas = await this.userService.findPathThermometer({
            id,
            path,
        });

        res.status(200).json({
            data: datas,
        });
    }

    async getCalender(req: Request, res: Response) {
        // #swagger.tags = ['User']
        const { id } = req.user as idType;
        const { year, month } = req.query as yearMonthType;
        res.status(200).json({
            data: await this.userService.getCalender({
                id,
                year,
                month,
            }),
        });
    }

    async patchThermometer(req: Request, res: Response) {
        const { id } = req.user as idType;

        res.status(200).json({
            data: await this.userService.patchThermometer({
                id,
                ...(req.body as patchThermometerType),
            }),
        });
    }
}

export default new UserController(
    Container.get(UserService),
    Container.get(SmsService),
    Container.get(CrawlingService),
);
