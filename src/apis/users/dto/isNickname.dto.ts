import { Length, Matches } from 'class-validator';
import { User } from '@prisma/client';

export class isNicknameDTO {
    @Length(2, 10)
    @Matches(/^[a-zA-Z가-힣0-9]+$/)
    nickname: User['nickname'];

    constructor(data: isNicknameDTO) {
        this.nickname = data.nickname;
    }
}
