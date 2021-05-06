const nodemailer = require("nodemailer");
const config = require("../config/auth.config");

const user = config.user;
const pass = config.pass;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "YOUR-EMAIL@gmail.com",
    pass: "YOUR-PASSWORD",
  },
});



module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    transport.sendMail({
      from: user,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:3000/confirm/${confirmationCode}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
  };


  module.exports.sendPasswordResetLink = (name, email, confirmationCode) => {
    transport.sendMail({
      from: user,
      to: email,
      subject: "Reset your passowd your account",
      html: `
          <h2>Hello ${name},</h2>
          <p>Forgot your password? No worries, we’ve got you covered. Click the link below to reset your password.</p>
          <a href=http://localhost:3000/reset/${confirmationCode}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
  };