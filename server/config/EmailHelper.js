import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER, // Your Brevo SMTP username
        pass: process.env.SMTP_PASS // Your Brevo SMTP password
    }
});

export default transporter;