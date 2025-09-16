import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { MailerService } from './otp/mailer.service';
import { OtpService } from './otp/otp.service';
import { PostModule } from './post/post.module';
import { PostService } from './post/post.service';

@Module({
  imports: [AuthModule, PrismaModule, PostModule, PostModule],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    PostService,
    PrismaService,
    MailerService,
    OtpService,
  ],
})
export class AppModule {}
