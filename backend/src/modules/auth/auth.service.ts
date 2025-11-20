import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is locked or inactive');
    }

    const otpSecret = speakeasy.generateSecret({ name: `Sales Management (${user.username})` });
    const otp = speakeasy.totp({
      secret: otpSecret.base32,
      encoding: 'base32',
    });

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.usersService.update(user.id, {
      otpSecret: otpSecret.base32,
      otpExpiresAt: otpExpiry,
    });

    if (user.email) {
      //await this.emailService.sendOtp(user.email, otp);
      console.log('OTP:', otp);
    }

    return {
      message: 'OTP sent to your email',
      username: user.username,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersService.findByUsername(verifyOtpDto.username);
    if (!user || !user.otpSecret) {
      throw new UnauthorizedException('Invalid OTP request');
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP expired');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: verifyOtpDto.otp,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.usersService.update(user.id, {
      otpSecret: null,
      otpExpiresAt: null,
    });

    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles?.map((r) => r.name) || [],
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        roles: user.roles?.map((r) => r.name) || [],
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException();
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        roles: user.roles?.map((r) => r.name) || [],
      };

      const accessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

