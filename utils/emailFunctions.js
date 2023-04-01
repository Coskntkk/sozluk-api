// 3rd party
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const AppError = require('./appError');

const registerEmail = async (options) => {
    try {
        // Compile email template
        const filePath = path.join(__dirname, './emailTemplates/registerEmail.html');
        const source = fs.readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);
        const replacements = {
            url: options.url
        };
        const htmlToSend = template(replacements);
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            // service: process.env.SMPT_SERVICE,
            // secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMPT_MAIL, // generated ethereal user
                pass: process.env.SMPT_PASSWORD // generated ethereal password
            }
        });
        // Set email options
        const mailOptions = {
            from: '"Sozluk" <sozluk@mail.com>', // sender address
            to: options.email,
            subject: "Sozluk - Register",
            text: `Great to see you in Sozluk. We're thrilled to have you on board.`,
            html: htmlToSend,
        };
        // Send email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error);
        throw new AppError('Error while sending email', 500);
    }
};

const changePassword = async (options) => {
    try {
        // Compile email template
        const filePath = path.join(__dirname, './emailTemplates/changePasswordEmail.html');
        const source = fs.readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);
        const replacements = {
            url: options.url
        };
        const htmlToSend = template(replacements);
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            // service: process.env.SMPT_SERVICE,
            // secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMPT_MAIL, // generated ethereal user
                pass: process.env.SMPT_PASSWORD // generated ethereal password
            }
        });
        // Set email options
        const mailOptions = {
            from: '"Sozluk" <sozluk@mail.com>', // sender address
            to: options.email,
            subject: "Sozluk - Change Password",
            text: `You have requested to change your password. Please click the link below to change your password.`,
            html: htmlToSend,
        };
        // Send email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error);
        throw new AppError('Error while sending email', 500);
    }
};

module.exports = { registerEmail, changePassword };
