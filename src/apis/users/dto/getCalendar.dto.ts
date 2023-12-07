import { IsString } from 'class-validator';

export class GetCalendarDTO {
    @IsString()
    year: string;

    @IsString()
    month: string;

    constructor(data: GetCalendarDTO) {
        this.year = data.year;
        this.month = data.month;
    }
}
