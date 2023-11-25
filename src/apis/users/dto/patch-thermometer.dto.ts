import { UserCompetition, UserIntern, UserLanguage } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { Path } from '../../../common/crawiling/interface';

export class PatchThermometerDTO {
    @IsString()
    path: Path['path'] | 'language';

    @IsString()
    @IsOptional()
    thermometerId: string;

    @IsString()
    @IsOptional()
    activeContent: UserCompetition['activeContent'];

    @IsString()
    @IsOptional()
    period?: UserIntern['period'];

    @IsString()
    @IsOptional()
    score?: UserLanguage['score'];

    constructor(data: PatchThermometerDTO) {
        this.path = data.path;
        this.thermometerId = data.thermometerId;
        this.activeContent = data.activeContent;
        this.period = data.period;
        this.score = data.score;
    }
}
