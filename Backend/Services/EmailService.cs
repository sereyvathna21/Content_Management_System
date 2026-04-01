using System.Net;
using System.Net.Mail;

namespace Backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendOtpAsync(string toEmail, string otpCode, string subject = "Your Verification Code")
        {
            var expiryMinutes = _configuration["App:OtpExpiryMinutes"] ?? "10";

            var digits = string.Join("</span><span class=\"otp-digit\">",
                                     otpCode.ToCharArray().Select(c => c.ToString()));

            var body = WrapInLayout(
                subject,
                $@"
                <div class=""icon-wrap"">
                    <svg width=""32"" height=""32"" viewBox=""0 0 24 24"" fill=""none"" stroke=""#4f46e5"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"">
                        <rect x=""3"" y=""11"" width=""18"" height=""11"" rx=""2"" ry=""2""/><path d=""M7 11V7a5 5 0 0 1 10 0v4""/>
                    </svg>
                </div>
                <h1>Verification Code</h1>
                <p class=""subtitle"">Use the code below to verify your account. It will expire in <strong>{expiryMinutes}&nbsp;minutes</strong>.</p>

                <div class=""otp-row"">
                    <span class=""otp-digit"">{digits}</span>
                </div>

                <p class=""hint"">If you didn&rsquo;t request this code, you can safely ignore this email.</p>");

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordResetAsync(string toEmail, string resetToken)
        {
            var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/Authentication/Resetpassword?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(toEmail)}";
            const string subject = "Reset Your Password";

            var body = WrapInLayout(
                subject,
                $@"
                <div class=""icon-wrap"">
                    <svg width=""32"" height=""32"" viewBox=""0 0 24 24"" fill=""none"" stroke=""#4f46e5"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"">
                        <path d=""M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4""/>
                    </svg>
                </div>
                <h1>Reset Your Password</h1>
                <p class=""subtitle"">We received a request to reset the password for your account. Click the button below to choose a new one.</p>

                <a href=""{resetLink}"" class=""btn"">Reset Password</a>

                <div class=""divider""></div>

                <p class=""hint"">This link expires in <strong>30&nbsp;minutes</strong>. If you didn&rsquo;t request a password reset, no action is needed &mdash; your account remains secure.</p>
                <p class=""hint small"">Or copy this URL into your browser:<br>
                    <a href=""{resetLink}"" class=""link-break"">{resetLink}</a>
                </p>");

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendContactReplyAsync(string toEmail, string toName, string subject, string message)
        {
            var replyTo = _configuration["Email:ReplyTo"];
            var brandName = _configuration["Email:FromName"] ?? "NSPC CMS";
            var safeName = WebUtility.HtmlEncode(toName);
            var safeMessage = WebUtility.HtmlEncode(message)
                .Replace("\r\n", "\n")
                .Replace("\n", "<br />");

            var body = WrapInLayout(
                subject,
                $@"
                <div class=""icon-wrap"">
                    <svg width=""32"" height=""32"" viewBox=""0 0 24 24"" fill=""none"" stroke=""#4f46e5"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"">
                        <path d=""M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z""/>
                    </svg>
                </div>
                <h1>Reply to Your Message</h1>
                <p class=""subtitle"">Hi {safeName}, we&rsquo;ve responded to your inquiry below.</p>

                <div class=""message-card"">
                    {safeMessage}
                </div>

                <div class=""divider""></div>
                <p class=""hint"">This reply was sent from <strong>{WebUtility.HtmlEncode(brandName)}</strong>. If you have further questions, simply reply to this email.</p>");

            await SendEmailAsync(toEmail, subject, body, replyTo, toName);
        }

        // ─────────────────────────────────────────────────────────────
        //  Layout wrapper — shared chrome for every email
        // ─────────────────────────────────────────────────────────────

        private string WrapInLayout(string previewText, string content)
        {
            var brandName = _configuration["Email:FromName"] ?? "NSPC CMS";
            return $@"<!DOCTYPE html>
<html lang=""en"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <meta name=""x-apple-disable-message-reformatting"" />
  <title>{WebUtility.HtmlEncode(previewText)}</title>
  <style>
    /* ── Reset ─────────────────────────────────────────── */
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; display: block; outline: none; }}
    a {{ color: inherit; }}

    /* ── Base ───────────────────────────────────────────── */
    body {{
      background-color: #f0f0ed;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #1a1a1a;
    }}

    /* ── Outer wrapper ──────────────────────────────────── */
    .email-wrapper {{
      padding: 40px 16px;
      background-color: #f0f0ed;
    }}

    /* ── Card ───────────────────────────────────────────── */
    .email-card {{
      background: #ffffff;
      border-radius: 16px;
      max-width: 560px;
      margin: 0 auto;
      overflow: hidden;
      border: 1px solid #e3e3de;
    }}

    /* ── Header ─────────────────────────────────────────── */
    .email-header {{
      background: #1a1c1a;
      padding: 28px 40px;
      text-align: center;
    }}
    .brand-title {{
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.6px;
    }}

    /* ── Body ───────────────────────────────────────────── */
    .email-body {{
      padding: 40px 40px 32px;
      text-align: center;
    }}

    /* ── Icon wrap ──────────────────────────────────────── */
    .icon-wrap {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: #eeedfe;
      border-radius: 50%;
      margin-bottom: 24px;
    }}

    /* ── Typography ─────────────────────────────────────── */
    h1 {{
      font-size: 22px;
      font-weight: 600;
      color: #111111;
      margin-bottom: 10px;
      letter-spacing: -0.3px;
    }}
    .subtitle {{
      font-size: 15px;
      color: #555550;
      margin-bottom: 28px;
    }}
    .subtitle strong {{ color: #111111; }}
    .hint {{
      font-size: 13px;
      color: #888880;
      margin-top: 24px;
    }}
    .hint.small {{ font-size: 12px; }}

    /* ── OTP digits ─────────────────────────────────────── */
    .otp-row {{
      display: inline-flex;
      gap: 8px;
      margin-bottom: 8px;
    }}
    .otp-digit {{
      display: inline-block;
      width: 48px;
      height: 56px;
      line-height: 56px;
      background: #f5f5f2;
      border: 1px solid #ddddd8;
      border-radius: 10px;
      font-size: 26px;
      font-weight: 700;
      color: #4f46e5;
      letter-spacing: 0;
      text-align: center;
    }}

    /* ── CTA Button ─────────────────────────────────────── */
    .btn {{
      display: inline-block;
      padding: 13px 32px;
      background: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.1px;
      margin-top: 4px;
      margin-bottom: 8px;
    }}
    .btn:hover {{ background: #4338ca; }}

    /* ── Message card ───────────────────────────────────── */
    .message-card {{
      background: #f8f8f5;
      border: 1px solid #e3e3de;
      border-radius: 10px;
      padding: 20px 24px;
      font-size: 15px;
      color: #333330;
      text-align: left;
      line-height: 1.7;
      margin: 4px 0 8px;
    }}

    /* ── Divider ────────────────────────────────────────── */
    .divider {{
      width: 100%;
      height: 1px;
      background: #e8e8e3;
      margin: 28px 0 0;
    }}

    /* ── Link break ─────────────────────────────────────── */
    .link-break {{
      word-break: break-all;
      color: #4f46e5;
    }}

    /* ── Footer ─────────────────────────────────────────── */
    .email-footer {{
      padding: 20px 40px 28px;
      text-align: center;
      border-top: 1px solid #eeeee9;
    }}
    .email-footer p {{
      font-size: 12px;
      color: #aaaaaa;
      line-height: 1.6;
    }}
    .email-footer a {{ color: #aaaaaa; text-decoration: underline; }}

    /* ── Responsive ─────────────────────────────────────── */
    @media only screen and (max-width: 600px) {{
      .email-body {{ padding: 28px 24px 24px; }}
      .email-footer {{ padding: 16px 24px 24px; }}
      .email-header {{ padding: 20px 24px; }}
      .otp-digit {{ width: 40px; height: 48px; line-height: 48px; font-size: 22px; }}
    }}
  </style>
</head>
<body>
  <div class=""email-wrapper"">
    <div class=""email-card"">

      <!-- Header -->
      <div class=""email-header"">
        <div class=""brand-title"">{WebUtility.HtmlEncode(brandName)}</div>
      </div>

      <!-- Body -->
      <div class=""email-body"">
        {content}
      </div>

      <!-- Footer -->
      <div class=""email-footer"">
        <p>
          &copy; {DateTime.UtcNow.Year} {WebUtility.HtmlEncode(brandName)} &bull; All rights reserved<br />
          You are receiving this email because an action was performed on your account.
        </p>
      </div>

    </div>
  </div>
</body>
</html>";
        }

        private async Task SendEmailAsync(
            string toEmail,
            string subject,
            string htmlBody,
            string? replyTo = null,
            string? toName = null)
        {
            var smtpHost = _configuration["Email:SmtpHost"]!;
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"]!;
            var smtpPassword = _configuration["Email:SmtpPassword"]!;
            var fromName = _configuration["Email:FromName"] ?? "NSPC CMS";
            var fromAddress = _configuration["Email:FromAddress"]!;

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPassword),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromAddress, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            message.To.Add(string.IsNullOrWhiteSpace(toName)
                ? new MailAddress(toEmail)
                : new MailAddress(toEmail, toName));

            if (!string.IsNullOrWhiteSpace(replyTo))
                message.ReplyToList.Add(new MailAddress(replyTo));

            await client.SendMailAsync(message);
        }
    }
}