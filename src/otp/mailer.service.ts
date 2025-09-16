import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtp(email: string, otpCode: string) {
    await this.transporter.sendMail({
      from: `"My App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
            <div style="font-family: Arial, sans-serif; padding:20px;">
                <h2>🔐 Email Verification</h2>
                <p>Your OTP code is:</p>
                <h1 style="color:#4CAF50; letter-spacing:4px;">${otpCode}</h1>
                <p>This code will expire in <b>5 minutes</b>.</p>
            </div>
        `,
    });
  }
}
