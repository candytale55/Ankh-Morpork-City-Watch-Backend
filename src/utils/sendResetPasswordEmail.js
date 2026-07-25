const nodemailer = require('nodemailer');


// Sends a password reset email to the user with a reset link.
const sendResetPasswordEmail = async (user, resetUrl) => {
    // 
    const testEmailAccount = await nodemailer.createTestAccount();

    // 
    const transporter = nodemailer.createTransport({
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
        // Development workaround for self-signed or untrusted certificates. For production, you would use a real email service like SendGrid, Mailgun, or your own SMTP server.
    });


    // Create and send the test email
    const info = await transporter.sendMail({
        from: `"Ankh-Morpork City Watch" <${testEmailAccount.user}>`,
        to: user.email,
        subject: "Reset your password",
        text: `Hello ${user.name},\n\nYou requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nAnkh-Morpork City Watch`,
    });

    // Display a link where you can view the test email.
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`Password reset email sent to ${user.email}. Preview it at: ${previewUrl}`);

    return previewUrl; // Return the preview URL for testing purposes

}

module.exports = { sendResetPasswordEmail };

