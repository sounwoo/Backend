import { IThermometerUser } from '../../apis/users/interfaces/user.interface';
import { PercentageType } from '../../apis/users/types/thermometer.type';

const length = (data: number, num: number): number => {
    return data >= num ? 100 / 5 : ((data / num) * 100) / 5;
};

export const percentage = (user: IThermometerUser): PercentageType => {
    const { userCompetition, userIntern, userLanguage, userOutside, userQnet } =
        user;

    const competitionPercentage = length(userCompetition.length, 5);
    const outsidePercentage = length(userOutside.length, 5);
    const qnetPercentage = length(userQnet.length, 4);
    const languagePercentage = length(userLanguage.length, 4);
    const internPercentage = length(userIntern.length, 2);

    const sum =
        competitionPercentage +
        outsidePercentage +
        qnetPercentage +
        languagePercentage +
        internPercentage;

    return {
        competition: {
            barType: 'competition',
            percent: competitionPercentage,
        },
        outside: {
            barType: 'outside',
            percent: outsidePercentage,
        },
        qnet: {
            barType: 'qnet',
            percent: qnetPercentage,
        },
        language: {
            barType: 'language',
            percent: languagePercentage,
        },
        intern: {
            barType: 'intern',
            percent: internPercentage,
        },
        sum,
    };
};

export const ThermometerPaths = {
    outside: 'userOutside',
    intern: 'userIntern',
    competition: 'userCompetition',
    language: 'userLanguage',
    qnet: 'userQnet',
};
