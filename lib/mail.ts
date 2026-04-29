import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ''),
  },
});

export default transporter;

export async function sendMail({ to, subject, text, html, attachments }: { 
  to: string, 
  subject: string, 
  text?: string, 
  html?: string, 
  attachments?: any[] 
}) {
  const mailOptions = {
    from: `"Drishyam News" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  };

  return transporter.sendMail(mailOptions);
}
