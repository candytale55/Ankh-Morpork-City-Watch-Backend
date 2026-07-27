const nodemailer = require('nodemailer');

// Sends a password reset email to the user with a reset link.
const sendResetPasswordEmail = async (user, resetUrl) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 0);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === 'true';

    let transporter;
    let fromAddress;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
        // Real email delivery when SMTP credentials exist in environment variables.
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        fromAddress = process.env.SMTP_FROM || smtpUser;
    } else {
        // Fallback for local development/testing when no SMTP config is provided.
        const testEmailAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: testEmailAccount.smtp.host,
            port: testEmailAccount.smtp.port,
            secure: testEmailAccount.smtp.secure,
            auth: {
                user: testEmailAccount.user,
                pass: testEmailAccount.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        fromAddress = testEmailAccount.user;
    }


    // Create and send the test email
    const info = await transporter.sendMail({
        from: `"Ankh-Morpork City Watch" <${fromAddress}>`,
        to: user.email,
        subject: "Reset your password",
        text: `Hello ${user.name},\n\nYou requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nAnkh-Morpork City Watch`,
    });

    // Display a link where you can view the test email.
    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
        console.log(`Password reset email sent to ${user.email}. Preview it at: ${previewUrl}`);
    } else {
        console.log(`Password reset email sent to ${user.email}.`);
    }

    return previewUrl; // Return the preview URL for testing purposes

}

module.exports = { sendResetPasswordEmail };

