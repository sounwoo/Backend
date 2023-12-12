import { IsString } from 'class-validator';
import { Comment, Community } from '@prisma/client';

export class CreateCommunityCommentDTO {
    @IsString()
    id: Community['id'];

    @IsString()
    comment: Comment['comment'];

    constructor(data: CreateCommunityCommentDTO) {
        this.id = data.id;
        this.comment = data.comment;
    }
}
