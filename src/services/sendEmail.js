const nodemailer = require("nodemailer");

const mailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  maxConnections: Infinity,
  maxMessages: Infinity,
  pool: true,
  auth: {
    user: process.env.smtp_email,
    pass: process.env.smtp_password
  },
});


const sendEmail = async (payload) => {
  try {
    console.log('Sending Email !');
    let { data = "", email, subject = "",attachments=[] } = payload;
    
      let mailDetails = {
        from: process.env.smtp_email,
        to: email,
        subject: subject,
        text: data,
        attachments:attachments 
      };

      let response = await new Promise((resolve, reject) => {
        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.error('Error Occurs', err);
            return ({status: 0, err: err});
          }
          else {
            console.log('Email sent successfully to - ', email);
            resolve(true);
            return ({status: 0, err: err});
          }
        });
      });
      
      return response;
  } catch (e) {
    // error(e);
    console.log(e);
    return e;
  }
};


module.exports = sendEmail;

// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: process.env.MAIL_USERNAME,
//       pass: process.env.MAIL_PASSWORD,
//       clientId: process.env.OAUTH_CLIENTID,
//       clientSecret: process.env.OAUTH_CLIENT_SECRET,
//       refreshToken: process.env.OAUTH_REFRESH_TOKEN
//     }
//   });