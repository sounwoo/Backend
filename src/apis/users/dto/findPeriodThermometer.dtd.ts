import { IsOptional, IsString } from 'class-validator';

export class findPeriodThermometerDTO {
    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    count?: string;

    constructor(data: findPeriodThermometerDTO) {
        this.count = data.count;
        this.page = data.page;
    }
}
