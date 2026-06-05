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
      var brandName = _configuration["Email:FromName"] ?? "NSPC CMS";

      var body = WrapInLayout(
          subject,
          $@"
                <div class=""logo-box"">
                    <svg width=""24"" height=""24"" viewBox=""0 0 24 24"" fill=""none"" stroke=""#000000"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"">
                        <rect x=""3"" y=""11"" width=""18"" height=""11"" rx=""2"" ry=""2""/>
                        <path d=""M7 11V7a5 5 0 0 1 10 0v4""/>
                    </svg>
                </div>
                <h1>Verify your email</h1>
                <p class=""subtitle"">We need to verify your email address <strong>{toEmail}</strong> before you can access your account. Enter the code below in your open browser window.</p>

                <div class=""otp-code"">{otpCode}</div>

                <div class=""divider""></div>

                <p class=""hint-expiry"">This code expires in {expiryMinutes} minutes.</p>
                <p class=""hint-ignore"">If you didn't sign up for {WebUtility.HtmlEncode(brandName)}, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>");

      await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendPasswordResetAsync(string toEmail, string resetToken)
    {
      var frontendUrl = _configuration["App:ResetPasswordUrl"]
          ?? _configuration["App:AdminUrl"]
          ?? _configuration["App:FrontendUrl"]
          ?? _configuration["FrontendUrl"]
          ?? "http://localhost:3000";
      frontendUrl = frontendUrl.TrimEnd('/');
      var resetLink = $"{frontendUrl}/Authentication/Resetpassword?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(toEmail)}";
      const string subject = "Reset Your Password";

      var body = WrapInLayout(
          subject,
          $@"
                <div class=""logo-box"">
                    <svg width=""24"" height=""24"" viewBox=""0 0 24 24"" fill=""none"" stroke=""#000000"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"">
                        <path d=""M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4""/>
                    </svg>
                </div>
                <h1>Reset your password</h1>
                <p class=""subtitle"">We received a request to reset the password for your account. Click the button below to choose a new one.</p>

                <a href=""{resetLink}"" class=""btn"">Reset Password</a>

                <div class=""divider""></div>

                <p class=""hint-expiry"">This link expires in 30 minutes.</p>
                <p class=""hint-ignore"">If you didn't request a password reset, no action is needed &mdash; your account remains secure.</p>
                <p class=""hint-ignore"" style=""margin-top: 10px; font-size: 12px; color: #a1a1aa;"">Or copy this URL into your browser:<br>
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
                <div class=""logo-box"">
                    <svg width=""24"" height=""24"" viewBox=""0 0 24 24"" fill=""none"" stroke=""#000000"" stroke-width=""2"" stroke-linecap=""round"" stroke-linejoin=""round"">
                        <path d=""M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z""/>
                    </svg>
                </div>
                <h1>Reply to your message</h1>
                <p class=""subtitle"">Hi {safeName}, we've responded to your inquiry below.</p>

                <div class=""message-card"">
                    {safeMessage}
                </div>

                <div class=""divider""></div>
                <p class=""hint-ignore"">This reply was sent from <strong>{WebUtility.HtmlEncode(brandName)}</strong>. If you have further questions, simply reply to this email.</p>");

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
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; display: block; outline: none; }}
    a {{ color: inherit; }}

    body {{
      background-color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: #3f3f46;
      padding: 40px 16px;
    }}
    .email-card {{
      background: #ffffff;
      border-radius: 24px;
      max-width: 560px;
      margin: 0 auto;
      border: 1px solid #e4e4e7;
      box-shadow: 0 1px 3px rgba(0,0,0,0.01);
      padding: 40px;
    }}
    .logo-box {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border: 1px solid #e4e4e7;
      border-radius: 14px;
      margin-bottom: 24px;
      background: #ffffff;
    }}
    h1 {{
      font-size: 22px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }}
    .subtitle {{
      font-size: 15px;
      color: #3f3f46;
      margin-bottom: 24px;
      line-height: 1.5;
    }}
    .otp-code {{
      font-size: 38px;
      font-weight: 500;
      color: #000000;
      letter-spacing: 0.02em;
      margin: 28px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }}
    .btn {{
      display: inline-block;
      padding: 12px 28px;
      background: #000000;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      margin: 4px 0 20px;
      text-align: center;
    }}
    .btn:hover {{
      background: #1f1f23;
    }}
    .message-card {{
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 20px;
      font-size: 15px;
      color: #18181b;
      text-align: left;
      line-height: 1.6;
      margin: 4px 0 20px;
    }}
    .divider {{
      border-top: 1px solid #e4e4e7;
      margin: 28px 0;
    }}
    .hint-expiry {{
      font-size: 13px;
      color: #52525b;
      margin-bottom: 12px;
    }}
    .hint-ignore {{
      font-size: 13px;
      color: #71717a;
      line-height: 1.5;
    }}
    .hint-ignore a {{
      color: #71717a;
      text-decoration: underline;
    }}
    .link-break {{
      word-break: break-all;
      color: #000000;
    }}
    .footer-note {{
      font-size: 12px;
      color: #a1a1aa;
      margin-top: 40px;
      line-height: 1.5;
      border-top: 1px solid #f4f4f5;
      padding-top: 20px;
    }}
    @media only screen and (max-width: 600px) {{
      .email-card {{ padding: 24px; border-radius: 16px; }}
      .otp-code {{ font-size: 32px; }}
    }}
  </style>
</head>
<body>
  <div class=""email-card"">
    {content}
    
    <div class=""footer-note"">
      &copy; {DateTime.UtcNow.Year} {WebUtility.HtmlEncode(brandName)} &bull; All rights reserved
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