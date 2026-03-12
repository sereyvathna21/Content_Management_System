using MailKit.Net.Smtp;
using MimeKit;

namespace Backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
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

        // ── Shared layout wrapper ─────────────────────────────────────────────

        private static string Layout(string previewText, string bodyContent) => $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <meta name="color-scheme" content="light" />
              <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
              <title>NSPC CMS</title>
            </head>
            <body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Segoe UI',Arial,sans-serif;">
              <!-- Preview text (hidden) -->
              <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{previewText}</span>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#eef2f7;padding:32px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#2f7a34 0%,#4CAF4F 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
                          <div style="display:inline-flex;align-items:center;gap:12px;">
                            <div style="width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:10px;display:inline-block;vertical-align:middle;line-height:40px;text-align:center;">
                              <span style="color:#ffffff;font-size:22px;font-weight:800;">N</span>
                            </div>
                            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;vertical-align:middle;">NSPC CMS</span>
                          </div>
                        </td>
                      </tr>

                      <!-- Body card -->
                      <tr>
                        <td style="background:#ffffff;padding:40px 48px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
                          {bodyContent}
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px 48px;text-align:center;">
                          <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">
                            &copy; {DateTime.UtcNow.Year} NSPC CMS &nbsp;&bull;&nbsp; National Social Protection Council
                          </p>
                          <p style="margin:0;color:#cbd5e1;font-size:11px;">
                            This is an automated message. Please do not reply to this email.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;

        // ── Verify Email (link-based, kept for compatibility) ─────────────────

        public async Task SendVerificationEmailAsync(string toEmail, string verificationUrl)
        {
            var body = $"""
                <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1f5e2a;">Verify Your Email Address</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                  Thank you for creating an NSPC CMS account. Click the button below to confirm your email address and activate your account.
                </p>

                <!-- Divider -->
                <div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>

                <!-- CTA Button -->
                <div style="text-align:center;margin:32px 0;">
                  <a href="{verificationUrl}"
                     style="display:inline-block;padding:14px 40px;background:#4CAF4F;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                    ✓ &nbsp;Verify My Email
                  </a>
                </div>

                <!-- Fallback URL -->
                <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
                  If the button doesn't work, copy and paste this link into your browser:<br />
                  <a href="{verificationUrl}" style="color:#2e7d32;word-break:break-all;">{verificationUrl}</a>
                </p>

                <!-- Security note -->
                <div style="margin-top:28px;padding:14px 18px;background:#eef7ee;border-left:4px solid #4CAF4F;border-radius:0 6px 6px 0;">
                  <p style="margin:0;font-size:12px;color:#1f5e2a;line-height:1.6;">
                    <strong>Security notice:</strong> This link expires in <strong>24 hours</strong>.
                    If you did not create an account, you can safely ignore this email.
                  </p>
                </div>
                """;

            await SendAsync(toEmail, "Verify Your Email — NSPC CMS",
                Layout("Confirm your email address to activate your NSPC CMS account.", body));
        }

        // ── OTP Verification Email ────────────────────────────────────────────

        public async Task SendOtpEmailAsync(string toEmail, string otp)
        {
            // Split OTP into individual digit spans for a tile-style display
            var digits = string.Concat(otp.Select(d =>
              $"<span style=\"display:inline-block;width:44px;height:54px;line-height:54px;margin:0 4px;background:#eef7ee;border:2px solid #bfe6c8;border-radius:10px;font-size:28px;font-weight:800;color:#2f6f2f;text-align:center;\">{d}</span>"));

            var body = $"""
                <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#4CAF4F;">Your Verification Code</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                  Use the one-time code below to verify your NSPC CMS account.
                  The code is valid for <strong style="color:#4CAF4F;">10 minutes</strong>.
                </p>

                <!-- Divider -->
                <div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>

                <!-- OTP tile display -->
                <div style="text-align:center;margin:32px 0;">
                  <p style="margin:0 0 16px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;">One-Time Passcode</p>
                  <div style="display:inline-block;">{digits}</div>
                  <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
                    &#x23F1; Expires in 10 minutes
                  </p>
                </div>

                <!-- Security note -->
                <div style="margin-top:28px;padding:14px 18px;background:#eef7ee;border-left:4px solid #4CAF4F;border-radius:0 6px 6px 0;">
                  <p style="margin:0;font-size:12px;color:#1f5e2a;line-height:1.6;">
                    <strong>Security notice:</strong> Never share this code with anyone.
                    NSPC CMS will never ask for your OTP via phone or chat.
                    If you did not request this code, please ignore this email.
                  </p>
                </div>
                """;

            await SendAsync(toEmail, "Your Verification Code — NSPC CMS",
                Layout($"Your one-time verification code is {otp}. It expires in 10 minutes.", body));
        }

        // ── Password Reset Email ──────────────────────────────────────────────

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetUrl)
        {
            var body = $"""
                <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1e3a8a;">Reset Your Password</h1>
                <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                  We received a request to reset the password for your NSPC CMS account.
                  Click the button below to choose a new password.
                </p>

                <!-- Divider -->
                <div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>

                <!-- CTA Button -->
                <div style="text-align:center;margin:32px 0;">
                  <a href="{resetUrl}"
                     style="display:inline-block;padding:14px 40px;background:#4CAF4F;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                    &#128274; &nbsp;Reset My Password
                  </a>
                </div>

                <!-- Fallback URL -->
                <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
                  If the button doesn't work, copy and paste this link into your browser:<br />
                  <a href="{resetUrl}" style="color:#3b82f6;word-break:break-all;">{resetUrl}</a>
                </p>

                <!-- Security note -->
                <div style="margin-top:28px;padding:14px 18px;background:#fef2f2;border-left:4px solid #f87171;border-radius:0 6px 6px 0;">
                  <p style="margin:0;font-size:12px;color:#b91c1c;line-height:1.6;">
                    <strong>Didn't request this?</strong> Your password has <strong>not</strong> been changed.
                    This link expires in <strong>1 hour</strong>.
                    If you didn't request a reset, you can safely ignore this email.
                  </p>
                </div>
                """;

            await SendAsync(toEmail, "Reset Your Password — NSPC CMS",
                Layout("You requested a password reset for your NSPC CMS account.", body));
        }
    }
}
