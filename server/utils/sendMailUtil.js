const nodemailer = require('nodemailer');

// Export sendMailUtil directly as a function
module.exports = async (subject, textMessage, sent_to, sent_from, reply_to) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        PORT: "587",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    const options = {
        from: {
            name: "Jashini Shyni",
            address: sent_from,
        },
        to: sent_to,
        replyTo: reply_to,
        subject: subject,
        text: textMessage,
    };

    // Send Mail
    transporter.sendMail(options, function(err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
};