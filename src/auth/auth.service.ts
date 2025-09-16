import { BadRequestException, Injectable } from '@nestjs/common';
import { SignInDto } from 'src/dto/signin.dto';
import { SignUpDto } from 'src/dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { MailerService } from 'src/otp/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private mailer: MailerService,
  ) {}

  //   signup
  async signup(dto: SignUpDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existUser) throw new BadRequestException('Email already registered');

    // hash
    const hash = await bcrypt.hash(dto.password, 10);

    const { otpCode, otpExpire } = this.otpService.generateOtp();

    await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        otpCode,
        otpExpire,
      },
    });

    await this.mailer.sendOtp(dto.email, otpCode);

    return { message: 'OTP sent to your email' };
  }

  //   signin
  async signin(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('Invalid credentials');

    // compare pass
    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) throw new BadRequestException('Invalid credentials');

    // check verified
    if (user.isVerified === false)
      throw new BadRequestException('Please verify your account for signin');

    const token = this.generate_token(user.id, user.email);

    return {
      user: user,
      access_token: token.access_token,
      message: 'Sign in successfuly',
    };
  }

  //   generate_token
  generate_token(id: number, email: string) {
    const payload = { sub: id, email };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { access_token, refresh_token };
  }
}
