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
            var body = $@"
                <h2>Your Verification Code</h2>
                <p>Use the following OTP code to verify your account:</p>
                <h1 style='letter-spacing:4px;font-size:36px;color:#4f46e5'>{otpCode}</h1>
                <p>This code expires in {_configuration["App:OtpExpiryMinutes"] ?? "10"} minutes.</p>
                <p>If you did not request this, please ignore this email.</p>";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordResetAsync(string toEmail, string resetToken)
        {
            var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/Authentication/Resetpassword?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(toEmail)}";

            var body = $@"
                <h2>Reset Your Password</h2>
                <p>Click the button below to reset your password:</p>
                <a href='{resetLink}' style='display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600'>Reset Password</a>
                <p style='margin-top:16px'>Or copy this link: <a href='{resetLink}'>{resetLink}</a></p>
                <p>This link expires in 30 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>";

            await SendEmailAsync(toEmail, "Reset Your Password", body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
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
            message.To.Add(toEmail);

            await client.SendMailAsync(message);
        }
    }
}
