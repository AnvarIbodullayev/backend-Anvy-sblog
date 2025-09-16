import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from 'src/dto/post.dto';
import { JwtGuard } from 'src/guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  //   create
  @UseGuards(JwtGuard)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() dto: PostDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    if (file) {
      dto.image = `http://localhost:3333/uploads/${file.filename}`;
    }
    return this.postService.create(dto, userId);
  }

  //   all posts for global field
  @UseGuards(JwtGuard)
  @Get('all-posts')
  allPosts(@Query('page') page = '1', @Query('limit') limit = '1') {
    return this.postService.allPosts(Number(page), Number(limit));
  }

  //   my posts
  @UseGuards(JwtGuard)
  @Get('my-posts')
  myPosts(@Req() req: any) {
    const email = req.user.email;
    return this.postService.myPosts(email);
  }

  //   each post
  @UseGuards(JwtGuard)
  @Get('each-post/:id')
  eachPost(@Param('id') postId: string, @Req() req: any) {
    const userId = req.user.userId; // hozirgi foydalanuvchi
    return this.postService.eachPost(Number(postId), userId);
  }

  // edit each post
  @UseGuards(JwtGuard)
  @Patch('edit-each-post/:id')
  editEachPost(
    @Req() req: any, //email
    @Param('id') postId: string, //post id
    @Body() dto: PostDto, // prev info for placeholder
  ) {
    const email = req.user.email;

    return this.postService.editEachPost(email, Number(postId), dto);
  }

  //   delete each
  @UseGuards(JwtGuard)
  @Delete('delete-each/:id')
  deleteEach(@Req() req: any, @Param('id') postId: string) {
    const userId = req.user.userId;

    return this.postService.deleteEach(userId, Number(postId));
  }

  // toggle like post
  @UseGuards(JwtGuard)
  @Patch('toggle-like/:id')
  toggleLike(
    @Req() req: any,
    @Param('id') postId: string,
    // @Body('isLiked') isLiked: boolean,
  ) {
    const userId = req.user.userId;
    return this.postService.toggleLike(userId, Number(postId));
  }

  // search post
  @Get('search')
  searchPosts(@Query('query') query: string) {
    return this.postService.searchPosts(query);
  }

  // delete account
  @UseGuards(JwtGuard)
  @Delete('delete-account')
  deleteAccount(@Req() req: any) {
    const userId = req.user.userId;
    return this.postService.deleteAccount(Number(userId));
  }
}
