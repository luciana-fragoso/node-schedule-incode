const nodemailer = require("nodemailer");
const config = require("../config/auth.config");

const user = "YOUR-EMAIL.gmail.com";
const pass = "YOUR-PASSWORD";





sendConfirmationEmail = async function(name, email, confirmationCode) {
    
  const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: user,
      pass: pass,
    },
  }); 

  const mailOptions = {
    from: user,
    to: email,
    subject: "Reset your passowd your account",
    html: `<h1>Email Confirmation</h1>
    <h2>Hello ${name}</h2>
    <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
    <a href=http://localhost:3000/confirm/${confirmationCode}> Click here</a>
    </div>`,
    };

    return transport.sendMail(mailOptions);
  };


  sendPasswordResetLink = async function(name, email, confirmationCode) {
    
    const transport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: user,
        pass: pass,
      },
    }); 


    const mailOptions = {
      from: user,
      to: email,
      subject: "Reset your passowd your account",
      html: `
          <h2>Hello ${name},</h2>
          <p>Forgot your password? No worries, we’ve got you covered. Click the link below to reset your password.</p>
          <a href=http://localhost:3000/reset/${confirmationCode}> Click here</a>
          </div>`,
      };

    return transport.sendMail(mailOptions);

  };

  

  module.exports = {sendConfirmationEmail,sendPasswordResetLink}