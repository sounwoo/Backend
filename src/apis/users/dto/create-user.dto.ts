import { User } from '@prisma/client';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export interface interestKeyword {
    interest: string;
    keyword: string[];
}

export interface Major {
    [key: string]: string;
}

export class CreateUserDTO {
    @IsEmail()
    email: User['email'];

    @IsString()
    provider: User['provider'];

    @IsString()
    @Length(2, 5)
    @Matches(/^[a-zA-Z가-힣]+$/)
    name: User['name'];

    @Length(2, 10)
    @Matches(/^[a-zA-Z가-힣]+$/)
    nickname: User['nickname'];

    @IsString()
    @Matches(/^010[0-9]{8}$/)
    phone: User['phone'];

    @IsString()
    profileImage: User['profileImage'];

    major: Major;

    interestKeyword: interestKeyword[];

    constructor(data: CreateUserDTO) {
        this.email = data.email;
        this.provider = data.provider;
        this.name = data.name;
        this.nickname = data.nickname;
        this.phone = data.phone;
        this.profileImage = data.profileImage;
        this.major = data.major;
        this.interestKeyword = data.interestKeyword;
    }
}
