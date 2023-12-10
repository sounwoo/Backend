import {
    Community,
    MainMajor,
    Prisma,
    PrismaClient,
    User,
    UserCompetition,
    UserIntern,
    UserLanguage,
    UserOutside,
    UserQnet,
} from '@prisma/client';
import { Path, paths } from '../../../common/crawiling/interface';
import { idType } from '../../../common/types';
import { CreateUserDTO, interestKeyword } from '../dto/create-user.dto';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { ScrappingDTO } from '../dto/scrapping.dto';
import { GetUserScrapDTO } from '../dto/getUserScrap.dto';

export interface IUserCreateDTO {
    createDTO: CreateUserDTO;
}

export interface IFindUserKeyword {
    id: User['id'];
    path: paths['path'];
    classify: string;
}

export interface IUserFindOneUserByID {
    name: CreateUserDTO['name'];
    phone: CreateUserDTO['phone'];
}

export interface IUpdateProfile {
    id: User['id'];
    updateDTO: IUserUpdateDTO;
}

export interface IUserUpdateDTO {
    profileImage?: CreateUserDTO['profileImage'];
    nickname?: CreateUserDTO['nickname'];
    interestKeyword?: CreateUserDTO['interestKeyword'];
}

export interface IScrapping {
    id: User['id'];
    scrappingDTO: ScrappingDTO;
}

export interface IGetCalendar {
    id: User['id'];
    year: string;
    month: string;
}

export interface IGetUserScrap {
    id: User['id'];
    getUserScrapDTO: GetUserScrapDTO;
}

export interface ISaveInterestKeyword {
    prisma: Omit<
        PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
        | '$connect'
        | '$disconnect'
        | '$on'
        | '$transaction'
        | '$use'
        | '$extends'
    >;
    interestKeyword: interestKeyword[];

    id: User['id'];
}

export interface IThermometerUpdate {
    id: idType['id'];
    path: Path['path'] | 'language';
    createThermometer: {
        field: string;
        category: Community['category'];
        activeTitle: UserIntern['activeTitle'];
        activeContent: UserIntern['activeContent'];
        period?: UserIntern['period'];
        score?: UserLanguage['score'];
    };
    mainMajorId: MainMajor['id'];
    thermometerId?: string | undefined;
}

export interface IThermometerUser {
    userCompetition: UserCompetition[];
    userOutside: UserOutside[];
    userQnet: UserQnet[];
    userIntern: UserIntern[];
    userLanguage: UserLanguage[];
}

export interface ITopPercentage {
    id: idType['id'];
    mainMajorId: MainMajor['id'];
}

export interface IThermometerFindPath {
    id: idType['id'];
    path: Path['path'] | 'language';
}

export interface IThermometerPatch {
    id: idType['id'];
    path: Path['path'] | 'language';
    thermometerId: string;
    patchThermometer: {
        activeContent: UserIntern['activeContent'];
        period?: UserIntern['period'];
        score?: UserLanguage['score'];
    };
}

export interface ITransData {
    field: string;
    activeTitle: string;
}

export interface IThermometerFindMany {
    userCompetition: {
        field: string;
        activeTitle: string[];
    };
    userOutside: {
        field: string;
        activeTitle: string[];
    };
    userQnet: {
        field: string;
        activeTitle: string[];
    };
    userLanguage: {
        field: string;
        activeTitle: string[];
    };
    userIntern: {
        field: string;
        activeTitle: string[];
    };
}

export interface IFindThermometerTopPercentage {
    top: User['top'];
}
