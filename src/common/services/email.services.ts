import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  SESClient,
  SendEmailCommandInput,
  SendEmailCommand,
} from '@aws-sdk/client-ses';
import * as process from 'process';

@Injectable()
export class MailService {

  private async sendEmail(transporter, mailOptions) {
    try {
      const response: SMTPTransport.SentMessageInfo =
        await transporter.sendMail(mailOptions);
      Logger.log('Email Response: ', response);
    } catch (error) {
      Logger.log('Email Error: ', error);
    }
  }

  transporter: Transporter<SMTPTransport.SentMessageInfo> = createTransport({
    host: 'smtp-mail.outlook.com',
    secure: false,
    port: 587,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  async sendMail(
    text: string,
    html: string | undefined,
    recipients: string[],
    subject: string,
  ) {
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: recipients,
      subject,
      text,
    };
    if (html !== undefined) mailOptions['html'] = html;
    await this.sendEmail(this.transporter, mailOptions);
  }
}

@Injectable()
export class AWSSESMailService extends MailService {
  private ses: SESClient;
  constructor() {
    super();
    this.ses = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async sendMail(
    text: string,
    html: string | undefined,
    recipients: string[],
    subject: string,
  ) {
    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: process.env.NODEMAILER_USER,
    };
    if (html !== undefined)
      params.Message.Body.Html = {
        Charset: 'UTF-8',
        Data: html,
      };
    try {
      await this.ses.send(new SendEmailCommand(params));
    } catch (error) {
      Logger.log('AWS SES Email Error: ', error);
    }
  }

  transporter = createTransport({
    SES: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION, // Replace with your region
    },
  });
}
