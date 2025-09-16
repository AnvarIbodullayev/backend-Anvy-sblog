import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from 'src/dto/signup.dto';
import { SignInDto } from 'src/dto/signin.dto';
import { JwtGuard } from 'src/guard/jwt.guard';
import { OtpService } from 'src/otp/otp.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  //   signup
  @Post('signup')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  //   signin
  @Post('signin')
  signin(@Body() dto: SignInDto) {
    return this.authService.signin(dto);
  }

  //   profile
  @UseGuards(JwtGuard)
  @Get('profile')
  profile(@Req() req: any) {
    return { user: req.user, message: 'Profile loaded.' };
  }

  // verifyOtp
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.otpService.verifyOtp(body.email, body.otp);
  }
}
