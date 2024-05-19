import { Injectable } from '@nestjs/common';
import { MailService } from '../services/email.services';
import { appConfig } from '../config/app.configuration';
import { JWTService } from '../security/jwt.security';

@Injectable()
export class UserEmailService {
  constructor(
    private mailService: MailService,
    private jwtService: JWTService,
  ) {}
  async sendAccountVerificationMail(id: string, name: string, email: string) {
    const code = await this.jwtService.generateLinkToken(id, '1d');
    const message = `Dear ${name}, \n
 Welcome to our application. Please click the link below to activate your account:\n
 ${appConfig.frontendUrl}/auth/verify/?code=${code}/\n
 
 Kindly Note that your account will be deleted after 24 hrs if you don't verify your account.\n
 
 Best Regards;\n
 Niyo Company.
 `;
    // await this.mailService.sendMail(
    //   message,
    //   undefined,
    //   [email],
    //   'Account Verification',
    // );
  }
  async sendAccountVerificationSuccessMail(name: string, email: string) {
    const message = `Dear ${name}, \n
       You have successfully verified your account, you can now login:
       ${appConfig.frontendUrl}/auth/login/
       
       Best Regards;
       Niyo Company.
       `;
    // await this.mailService.sendMail(
    //   message,
    //   undefined,
    //   [email],
    //   'Account Verification Successfully',
    // );
  }
  async sendForgotPasswordMail(id: string, name: string, email: string) {
    const code = await this.jwtService.generateLinkToken(id, '1d');
    const message = `Dear ${name}, \n
You have requested to reset your password, please click the link below to proceed:\n
 ${appConfig.frontendUrl}/auth/forgot-password/?code=${code}/\n
 
 Kindly Note that this link will expire in 24 hours.\n
       
 Best Regards;\n
 Niyo Company.
 `;
    // await this.mailService.sendMail(
    //   message,
    //   undefined,
    //   [email],
    //   'Password Reset',
    // );
  }
}
