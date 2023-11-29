import { IsString, IsOptional, Length, Matches } from 'class-validator';
import { interestKeyword } from './create-user.dto';

export class UpdateUserDTO {
    @IsOptional()
    @IsString()
    profileImage?: string;

    @IsOptional()
    @Length(2, 10)
    @Matches(/^[a-zA-Z가-힣]+$/)
    nickname?: string;

    @IsOptional()
    interestKeyword?: interestKeyword[];

    constructor(data: UpdateUserDTO) {
        this.profileImage = data.profileImage;
        this.nickname = data.nickname;
        this.interestKeyword = data.interestKeyword;
    }
}
