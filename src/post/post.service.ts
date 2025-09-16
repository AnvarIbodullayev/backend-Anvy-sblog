import { Injectable, NotFoundException } from '@nestjs/common';
import { PostDto } from 'src/dto/post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  //   create
  async create(dto: PostDto, userId: number) {
    await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        ...(dto.image && { image: dto.image }),
        userId,
      },
    });

    return { message: 'Post successfuly created' };
  }

  //   all posts for global field
  async allPosts(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count(),
    ]);

    return {
      message: 'Fresh global posts came',
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  //   my posts
  async myPosts(email: string) {
    const existUser = await this.prisma.user.findUnique({ where: { email } });
    if (!existUser)
      throw new NotFoundException('User not found please sign in');

    const posts = await this.prisma.post.findMany({
      where: {
        User: {
          email,
        },
      },
    });
    return { message: 'Fresh all your posts came', posts };
  }

  //   each post
  async eachPost(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        User: { select: { email: true } },
        Like: { where: { userId } }, // current user like mavjudligini tekshirish
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return {
      message: 'Post successfully found',
      post: {
        ...post,
        likedByUser: post.Like.length > 0,
      },
    };
  }

  //   edit each post
  async editEachPost(email: string, postId: number, dto: PostDto) {
    const existUser = await this.prisma.user.findUnique({ where: { email } });
    if (!existUser) throw new NotFoundException('User not found');

    const existPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!existPost || existPost.userId !== existUser.id) {
      throw new NotFoundException('Post not found or unauthorized');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: dto.title,
        content: dto.content,
        ...(dto.image && { image: dto.image }),
      },
    });

    return { message: 'Post successfully updated', post: updatedPost };
  }

  //   delete each post
  async deleteEach(userId: number, postId: number) {
    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existUser)
      throw new NotFoundException('User not found please sign in');

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== existUser.id) {
      throw new NotFoundException('Post not found or unauthorized');
    }

    await this.prisma.like.deleteMany({
      where: { postId: postId },
    });

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post successfuly deleted' };
  }

  // toggle like post
  async toggleLike(userId: number, postId: number) {
    const existUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existUser) throw new NotFoundException('User not found');

    const existPost = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        User: { select: { email: true } },
        Like: { where: { userId } }, // current user like mavjudligini tekshirish
      },
    });
    if (!existPost) throw new NotFoundException('Post not found');

    // Foydalanuvchi oldin like qilganmi?
    const existLike = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existLike) {
      // Like mavjud => o'chirish (unlike)
      await this.prisma.like.delete({ where: { id: existLike.id } });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });
      return { message: 'You unliked this post' };
    } else {
      // Like mavjud emas => yaratish (like)
      await this.prisma.like.create({
        data: { userId, postId },
      });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return { message: 'You liked this post' };
    }
  }

  // search post
  async searchPosts(query: string) {
    const foundedPosts = await this.prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return { message: 'Founded posts came', foundedPosts };
  }

  // delete account
  async deleteAccount(userId: number) {
    await this.prisma.post.deleteMany({ where: { userId: userId } });
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Account successfuly deleted' };
  }
}
