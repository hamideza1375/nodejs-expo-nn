var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: 'reza.attar1375@yahoo.com',
    pass: 'reza1375'
  }
});

var mailOptions = {
  from: 'reza.attar1375@yahoo.com',
  to: 'reza.attar1375@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});