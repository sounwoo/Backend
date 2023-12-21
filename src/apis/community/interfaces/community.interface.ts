import { Comment, Community } from '@prisma/client';
import { idType } from '../../../common/types';
import { CreateCommunityCommentDTO } from '../dto/create.comment.input';
import { CommentLikeCommunityDTO } from '../dto/create.comment.like.input';
import { ToggleLikeCommunityDTO } from '../dto/create.community.toggleLike';
import { CreateCommunityDTO } from '../dto/create.input';

export interface ICommunityCreate {
    id: idType['id'];
    createCommunity: CreateCommunityDTO;
}

export interface ICommunityToggleLike extends ToggleLikeCommunityDTO {
    userId: idType['id'];
}
export interface ICommentLikeCommunity extends CommentLikeCommunityDTO {
    userId: idType['id'];
}

export interface ICreateCommunityComment extends CreateCommunityCommentDTO {
    userId: idType['id'];
}

export interface IPatchCommunityComment extends ICreateCommunityComment {}

export interface IDeleteCommunityComment extends CommentIdType {
    userId: idType['id'];
}

export interface CommentIdType {
    commentId: Comment['id'];
    communityId: Community['id'];
}
