import { validate } from 'class-validator';
import CustomError from '../error/customError';
import { NextFunction, Request, Response } from 'express';
import { CreateCommunityDTO } from '../../apis/community/dto/create.input';
import { asyncHandler } from '../../middleware/async.handler';
import { FindOneCommunityDTO } from '../../apis/community/dto/findOne.community';
import { FindManyCommunityDTO } from '../../apis/community/dto/findMany.community';
import {
    email,
    findOneUserByIDType,
    idType,
    phoneType,
    categoryType,
    nicknameType,
    providerTokenType,
    pathIdtype,
    pathPageCountType,
    yearMonthType,
} from '../types';
import { ToggleLikeCommunityDTO } from '../../apis/community/dto/create.community.toggleLike';
import { CreateCommunityCommentDTO } from '../../apis/community/dto/create.comment.input';
import { CommentLikeCommunityDTO } from '../../apis/community/dto/create.comment.like.input';
import { UpdateUserDTO } from '../../apis/users/dto/update-user.dto';
import { FindOneUserByEmailDTO } from '../../apis/users/dto/findOneUserByEmail.dto';
import { FindOneUserByIdDTO } from '../../apis/users/dto/findOneUserByID.dto';
import { CreateUserDTO } from '../../apis/users/dto/create-user.dto';
import { SendTokenSmsDTO } from '../util/sms/dto/sendTokenSMS.dto';
import { ValidateTokenDTO } from '../util/sms/dto/validateToken.dto';
import { ScrappingDTO } from '../../apis/users/dto/scrapping.dto';
import { isNicknameDTO } from '../../apis/users/dto/isNickname.dto';
import { SocialLoginDTO } from '../../apis/auth/dto/socialLogin.dto';
import { GetUserScrapDTO } from '../../apis/users/dto/getUserScrap.dto';
import { CreateThermometerDTO } from '../../apis/users/dto/create-thermometer.dto';
import { ThermometerPath } from '../../apis/users/types/thermometer.type';
import { FindPathThermometerDTO } from '../../apis/users/dto/findPathThermometer.dto';
import { LoginDTO } from '../../apis/auth/dto/login.dto';
import { GetCalenderDTO } from '../../apis/users/dto/getCalender.dto';
import { PatchThermometerDTO } from '../../apis/users/dto/patch-thermometer.dto';

class Validate {
    constructor() {
        this.createCommunity = asyncHandler(this.createCommunity.bind(this));
        this.findOneCommunity = asyncHandler(this.findOneCommunity.bind(this));
        this.findManyCommunity = asyncHandler(
            this.findManyCommunity.bind(this),
        );
        this.toggleLikeCommunity = asyncHandler(
            this.toggleLikeCommunity.bind(this),
        );
        this.createCommunityComment = asyncHandler(
            this.createCommunityComment.bind(this),
        );
        this.commentLikeCommunity = asyncHandler(
            this.commentLikeCommunity.bind(this),
        );
        this.updateProfile = asyncHandler(this.updateProfile.bind(this));
        this.findOneUserByEmail = asyncHandler(
            this.findOneUserByEmail.bind(this),
        );
        this.findOneUserByID = asyncHandler(this.findOneUserByID.bind(this));
        this.createUser = asyncHandler(this.createUser.bind(this));
        this.sendTokenSMS = asyncHandler(this.sendTokenSMS.bind(this));
        this.validateToken = asyncHandler(this.validateToken.bind(this));
        this.updateProfile = asyncHandler(this.updateProfile.bind(this));
        this.isNickname = asyncHandler(this.isNickname.bind(this));
        this.socialLogin = asyncHandler(this.socialLogin.bind(this));
        this.scrapping = asyncHandler(this.scrapping.bind(this));
        this.getUserScrap = asyncHandler(this.getUserScrap.bind(this));
        this.updateThermometer = asyncHandler(
            this.updateThermometer.bind(this),
        );
        this.login = asyncHandler(this.login.bind(this));
        this.getCalender = asyncHandler(this.getCalender.bind(this));
        this.patchThermometer = asyncHandler(this.patchThermometer.bind(this));
    }

    async errors<T extends object>(dto: T) {
        const errors = await validate(dto);

        if (errors.length > 0) {
            const errorMessage = errors.map((error) => {
                const temp =
                    error.constraints && Object.values(error.constraints);
                return `${error.property} : ${temp}`;
            });

            throw new CustomError(errorMessage, 400);
        }
    }

    async createCommunity(req: Request, _: Response, next: NextFunction) {
        await this.errors(new CreateCommunityDTO(req.body));

        next();
    }

    async findManyCommunity(req: Request, _: Response, next: NextFunction) {
        await this.errors(new FindManyCommunityDTO(req.query as categoryType));

        next();
    }

    async findOneCommunity(req: Request, _: Response, next: NextFunction) {
        await this.errors(new FindOneCommunityDTO(req.params as idType));

        next();
    }

    async toggleLikeCommunity(req: Request, _: Response, next: NextFunction) {
        const { id: communityId } = req.params as idType;
        await this.errors(new ToggleLikeCommunityDTO({ communityId }));

        next();
    }
    async createCommunityComment(
        req: Request,
        _: Response,
        next: NextFunction,
    ) {
        const { comment, id: communityId } = req.body;
        await this.errors(
            new CreateCommunityCommentDTO({ communityId, comment }),
        );

        next();
    }

    async commentLikeCommunity(req: Request, _: Response, next: NextFunction) {
        const { id: commentId } = req.params as idType;
        await this.errors(new CommentLikeCommunityDTO({ commentId }));

        next();
    }

    async updateProfile(req: Request, _: Response, next: NextFunction) {
        const { profileImage, nickname, interests } = req.body;
        await this.errors(
            new UpdateUserDTO({ profileImage, nickname, interests }),
        );

        next();
    }

    async findOneUserByEmail(req: Request, _: Response, next: NextFunction) {
        const { email } = req.query as email;
        await this.errors(new FindOneUserByEmailDTO({ email }));

        next();
    }

    async findOneUserByID(req: Request, _: Response, next: NextFunction) {
        const { name, phone } = req.query as findOneUserByIDType;
        await this.errors(new FindOneUserByIdDTO({ name, phone }));

        next();
    }

    async createUser(req: Request, _: Response, next: NextFunction) {
        await this.errors(new CreateUserDTO(req.body));

        next();
    }

    async sendTokenSMS(req: Request, _: Response, next: NextFunction) {
        const { phone } = req.body as phoneType;
        await this.errors(new SendTokenSmsDTO({ phone }));

        next();
    }

    async validateToken(req: Request, _: Response, next: NextFunction) {
        await this.errors(new ValidateTokenDTO(req.body));

        next();
    }

    async isNickname(req: Request, _: Response, next: NextFunction) {
        const { nickname } = req.query as nicknameType;
        await this.errors(new isNicknameDTO({ nickname }));

        next();
    }

    async login(req: Request, _: Response, next: NextFunction) {
        const { id } = req.body as idType;
        await this.errors(new LoginDTO({ id }));

        next();
    }

    async socialLogin(req: Request, _: Response, next: NextFunction) {
        const { provider, token } = req.body as providerTokenType;
        await this.errors(new SocialLoginDTO({ provider, token }));

        next();
    }

    async scrapping(req: Request, _: Response, next: NextFunction) {
        const { path, scrapId } = req.body as pathIdtype;
        await this.errors(new ScrappingDTO({ path, scrapId }));

        next();
    }

    async getUserScrap(req: Request, _: Response, next: NextFunction) {
        const { ...data } = req.query as pathPageCountType;
        await this.errors(new GetUserScrapDTO({ ...data }));

        next();
    }

    async updateThermometer(req: Request, _: Response, next: NextFunction) {
        await this.errors(new CreateThermometerDTO(req.body));

        next();
    }

    async findPathThermometer(req: Request, _: Response, next: NextFunction) {
        const { ...data } = req.query as ThermometerPath;
        await this.errors(new FindPathThermometerDTO(data));
    }

    async getCalender(req: Request, _: Response, next: NextFunction) {
        const { year, month } = req.query as yearMonthType;
        await this.errors(new GetCalenderDTO({ year, month }));

        next();
    }

    async patchThermometer(req: Request, _: Response, next: NextFunction) {
        console.log(req.body);
        await this.errors(new PatchThermometerDTO(req.body));

        next();
    }
}
export default new Validate();
