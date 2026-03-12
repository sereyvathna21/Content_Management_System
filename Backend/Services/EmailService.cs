using MailKit.Net.Smtp;
using MimeKit;

namespace Backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["Email:FromName"], _config["Email:FromEmail"]));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["Email:SmtpHost"],
                _config.GetValue<int>("Email:SmtpPort", 587),
                MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(
                _config["Email:Username"],
                _config["Email:Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public async Task SendVerificationEmailAsync(string toEmail, string verificationUrl)
        {
            var html = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                  <h2 style="color:#1e40af;">Verify Your Email</h2>
                  <p>Thank you for registering with NSPC CMS. Click the button below to verify your email address.</p>
                  <a href="{verificationUrl}"
                     style="display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;font-weight:600;">
                    Verify Email
                  </a>
                  <p style="color:#6b7280;font-size:13px;margin-top:24px;">
                    This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
                  </p>
                </div>
                """;
            await SendAsync(toEmail, "Verify Your Email — NSPC CMS", html);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetUrl)
        {
            var html = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                  <h2 style="color:#1e40af;">Reset Your Password</h2>
                  <p>We received a request to reset the password for your NSPC CMS account.</p>
                  <a href="{resetUrl}"
                     style="display:inline-block;padding:12px 28px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;font-weight:600;">
                    Reset Password
                  </a>
                  <p style="color:#6b7280;font-size:13px;margin-top:24px;">
                    This link expires in 1 hour. If you did not request a password reset, ignore this email.
                  </p>
                </div>
                """;
            await SendAsync(toEmail, "Password Reset — NSPC CMS", html);
        }
    }
}
