import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  // generateOtp
  generateOtp() {
    // otp
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    return { otpCode, otpExpire };
  }

  // verifyOtp
  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('User already verified');

    if (user.otpCode !== otp) throw new BadRequestException('Invalid OTP code');

    if (!user.otpExpire || user.otpExpire < new Date())
      throw new BadRequestException('OTP expired');

    await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpire: null,
      },
    });

    return { message: 'Account verified successfully' };
  }
}
