import nodemailer from 'nodemailer';
import { Subscription } from '@prisma/client';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendRenewalReminder(userEmail: string, userName: string, subscriptions: Subscription[]) {
    try {
      const subject = `Renewly: ${subscriptions.length} subscription${subscriptions.length > 1 ? 's' : ''} renewing tomorrow`;

      const html = this.generateReminderEmail(userName, subscriptions);

      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: userEmail,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Reminder email sent to ${userEmail}:`, result.messageId);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${userEmail}:`, error);
      throw error;
    }
  }

  generateReminderEmail(userName: string, subscriptions: Subscription[]) {
    const totalCost = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);

    const subscriptionList = subscriptions
      .map(sub => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; font-weight: 500;">${sub.name}</td>
          <td style="padding: 12px 0; text-align: right; color: #ef4444; font-weight: 600;">
            $${sub.cost.toFixed(2)}
          </td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Renewal Reminder</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
                🔔 Renewly Reminder
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Your subscriptions are renewing tomorrow
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151;">
                Hi ${userName},
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                This is your friendly reminder that ${subscriptions.length} subscription${subscriptions.length > 1 ? 's are' : ' is'} 
                renewing tomorrow. Here's what to expect:
              </p>

              <!-- Subscriptions Table -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 2px solid #e5e7eb;">
                      <th style="padding: 12px 0; text-align: left; font-weight: 600; color: #374151;">Service</th>
                      <th style="padding: 12px 0; text-align: right; font-weight: 600; color: #374151;">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${subscriptionList}
                    <tr style="border-top: 2px solid #e5e7eb;">
                      <td style="padding: 16px 0; font-weight: 700; color: #111827;">Total</td>
                      <td style="padding: 16px 0; text-align: right; font-weight: 700; color: #ef4444; font-size: 18px;">
                        $${totalCost.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                💡 <strong>Tip:</strong> If you no longer need any of these services, consider canceling 
                before the renewal date to avoid charges.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                Sent with ❤️ by Renewly
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                You're receiving this because you have active subscription reminders enabled.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection successful');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();