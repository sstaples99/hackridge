module.exports = function(db) {
    var express         = require('express');
    var router          = express.Router();
    var nodemailer      = require('nodemailer');
    var mg              = require('nodemailer-mailgun-transport');
    var mongoose        = require('mongoose');
    var emailSchema     = require('../models/email');
    var contactSchema   = require('../models/contact');
    var nodemailer      = require('nodemailer');
    var mg              = require('nodemailer-mailgun-transport');
    var emailValidator  = require('email-validator');
    var bodyParser      = require('body-parser');
    var path            = require('path');

    router.post('/subscribeToEmailList', function(req, res) {
      var email = new emailSchema({email: req.body.email});
      email.save(function(err) {
        if (err) res.end();
        else res.send("success");
      });
    });

    router.post('/sendMessage', function(req, res) {
      var data = req.body;
      var contact = new contactSchema(data);
      contact.save();
      var isValidEmail = emailValidator.validate(data.email);
      if (!isValidEmail) return res.send({success: false, err: 'Invalid contact email. If this is an error, please send an email info@hackridge.io. Thanks!'});
      var auth = {
        auth: {
          api_key: process.env.api_key,
          domain: process.env.domain
        }
      }
      var smtpTransporter = nodemailer.createTransport(mg(auth));
      var message = {
        from: 'signup@hackridge.io',
        to: 'hackridge@gmail.com',
        subject: 'Contact Form: ' + data.fname + " " + data.lname,
        text: "Name: " + data.fname + " " + data.lname + "\nEmail: " + data.email + "\nMessage: " + data.message
      };
      smtpTransporter.sendMail(message, function(err, info) {
         if (err) {
           return res.send({success: false, err: "Looks like our servers aren't doing so hot. Please try again later."});
           console.log(err);
         } else {
           return res.send({success: true});
         }
      });
    });


    return router;
}
