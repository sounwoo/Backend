import { Service } from 'typedi';
import { UserService } from '../users/users.service';
import { Comment, CommentLike, Community, CommunityLike } from '@prisma/client';
import { CustomPrismaClient } from '../../database/prismaConfig';
import {
    ICommentLikeCommunity,
    ICommunityCreate,
    ICommunityToggleLike,
    ICreateCommunityComment,
    IDeleteCommunityComment,
    IPatchCommunityComment,
} from './interfaces/community.interface';
import { idType } from '../../common/types';
import { FindManyCommunityDTO } from './dto/findMany.community';
import { CommunityFindManyType } from '../crawling/interfaces/returnType/bestData.interface';
import CustomError from '../../common/error/customError';

@Service()
export class CommunityService {
    constructor(
        private readonly prisma: CustomPrismaClient, //

        private readonly userService: UserService, //
    ) {}

    async create({
        id: userId,
        createCommunity,
    }: ICommunityCreate): Promise<Community> {
        await this.userService.isUserByID(userId);

        return this.prisma.community.create({
            data: { userId, ...createCommunity },
        });
    }

    findeMany({
        category,
        title,
        nickName: nickname,
        content,
        page,
        main,
    }: FindManyCommunityDTO & { main?: boolean }): Promise<
        CommunityFindManyType[]
    > {
        return this.prisma.community.findMany({
            where: {
                ...(category && category !== '전체' && { category }),
                ...(title && { title: { contains: title } }),
                ...(nickname && { user: { nickname: { contains: nickname } } }),
                ...(content && {
                    OR: [
                        { title: { contains: content } },
                        { detail: { contains: content } },
                    ],
                }),
            },
            select: {
                id: true,
                category: true,
                title: true,
                date: true,
                view: true,
                like: true,
                comment: true,
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                ...(main ? { view: 'desc' } : { date: 'desc' }),
            },
            ...(page && { skip: (+page - 1) * 10, take: 10 }),
        });
    }

    async findOne({ id }: idType): Promise<Community> {
        const data = await this.prisma.community.findUnique({ where: { id } });

        if (!data) throw new CustomError('존재하지 않는 게시물 입니다.', 404);

        return this.prisma.community.update({
            where: { id },
            data: {
                view: { increment: 1 },
            },
            include: {
                user: true,
                comments: {
                    select: {
                        id: true,
                        date: true,
                        comment: true,
                        user: {
                            select: {
                                id: true,
                                profileImage: true,
                                nickname: true,
                            },
                        },
                        commentLike: {
                            select: {
                                commentId: true,
                                user: {
                                    select: {
                                        id: true,
                                        profileImage: true,
                                        nickname: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        date: 'desc',
                    },
                },
                communitiyLikes: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
            },
        });
    }
    async toggleLike({
        userId,
        communityId,
    }: ICommunityToggleLike): Promise<CommunityLike[]> {
        await this.userService.isUserByID(userId);

        const likeCommunity = await this.prisma.communityLike.findFirst({
            where: { AND: [{ communityId, userId }] },
        });

        return this.prisma.community
            .update({
                where: { id: communityId },
                data: {
                    like: likeCommunity ? { decrement: 1 } : { increment: 1 },
                    communitiyLikes: likeCommunity
                        ? { delete: { id: likeCommunity.id } }
                        : { create: { userId } },
                },
                include: {
                    communitiyLikes: {
                        include: {
                            user: true,
                        },
                    },
                },
            })
            .then((el) => el.communitiyLikes);
    }

    async findeOneComment({ id }: { id: string }): Promise<Comment | null> {
        const data = await this.prisma.comment.findUnique({ where: { id } });

        if (!data) throw new CustomError('존재하지 않는 댓글 입니다.', 404);

        return data;
    }

    async createComment({
        userId,
        id,
        comment,
    }: ICreateCommunityComment): Promise<Comment[]> {
        await this.userService.isUserByID(userId);

        return await this.prisma.community
            .update({
                where: { id },
                data: {
                    comment: { increment: 1 },
                    comments: {
                        create: {
                            comment,
                            userId,
                        },
                    },
                },
                include: {
                    comments: {
                        include: {
                            user: true,
                        },
                        orderBy: {
                            date: 'desc',
                        },
                    },
                },
            })
            .then((el) => el.comments);
    }

    async patchComment({
        userId,
        id,
        comment,
    }: IPatchCommunityComment): Promise<Comment> {
        await this.userService.isUserByID(userId);
        await this.findeOneComment({ id });
        return this.prisma.comment.update({
            where: { id },
            data: { comment },
        });
    }

    async deleteComment({
        userId,
        commentId,
        communityId,
    }: IDeleteCommunityComment): Promise<Comment[]> {
        await this.userService.isUserByID(userId);

        await this.findeOneComment({ id: commentId });

        await this.prisma.community.update({
            where: { id: communityId },
            data: {
                comment: { decrement: 1 },
                comments: { deleteMany: { AND: [{ id: commentId, userId }] } },
            },
        });

        return this.prisma.comment.findMany({
            where: { communityId },
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    async commentLike({
        userId,
        commentId,
    }: ICommentLikeCommunity): Promise<CommentLike[]> {
        await this.userService.isUserByID(userId);

        const commentLike = await this.prisma.commentLike.findFirst({
            where: { AND: [{ commentId, userId }] },
        });

        return this.prisma.comment
            .update({
                where: { id: commentId },
                data: {
                    commentLike: commentLike
                        ? { delete: { id: commentLike.id } }
                        : { create: { userId } },
                },
                include: {
                    commentLike: {
                        include: {
                            user: true,
                        },
                    },
                },
            })
            .then((el) => el.commentLike);
    }
}
