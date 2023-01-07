import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@userV1/interfaces/user.interface';
import { COMMON } from '@globalV1/constants';

class EmailService {
  private renderTemplate(path: string, data: any) {
    return ejs.render(fs.readFileSync(__dirname + `/templates/${path}`, 'utf8'), {
      ...data,
      appName: COMMON.APP_NAME
    });
  }
  public renderPasswordResetTemplate(username: string, resetLink: string): string {
    return this.renderTemplate('forgot-password.template.ejs', {
      username,
      resetLink,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }

  public renderPasswordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date } = templateParams;
    return this.renderTemplate('reset-password.template.ejs', {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}
export const emailService: EmailService = new EmailService();
