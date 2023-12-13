import axios from 'axios';
import { providerTokenType } from '../types';
import CustomError from '../error/customError';

export const socialEmail = async ({ provider, token }: providerTokenType) => {
    const data =
        provider === 'kakao'
            ? 'https://kapi.kakao.com/v2/user/me'
            : 'https://www.googleapis.com/userinfo/v2/me';

    try {
        const result = await axios.get(data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return provider === 'google'
            ? result.data.email
            : result.data.kakao_account.email;
    } catch (error) {
        throw new CustomError('엑세스 토큰이 유효하지 않습니다', 400);
    }
};
