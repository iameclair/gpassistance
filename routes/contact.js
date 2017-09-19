const User = require('../models/users');
const Info = require('../models/info');
const Appointment = require('../models/appointment');
const Message = require('../models/message');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const nodemailer = require('nodemailer');

module.exports = (router) => {

    //construct the transporter
    const client = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'eclairlumu@gmail.com',
            pass: 'divinmaitre'
        }
    });

    ///activate account

    router.post('/send-message', (req, res) =>{
        if(!req.body.subject){
            res.json({success: false, message: 'Subject required'});
        }
        if(!req.body.content){
            res.json({success: false, message: 'Content is required'});
        }
        else{
            if(!req.body.to){
                res.json({success: false, message: 'Specify the sender'});
            }else{
                User.findById(req.decoded.userId, (err, user) =>{
                    if(err){
                        res.json({success: false, message: err})
                    }else{
                        if(!user){
                            res.json({success: false, message: 'user not found'})
                        }else{
                            const message = new Message();
                            message.to = req.body.to;
                            message.from = user.email;
                            message.subject = req.body.subject;
                            message.content = req.body.content;

                            const email = {
                                from: user.email,
                                to: req.body.to,
                                subject: req.body.subject,
                                text: req.body.content,
                            };

                            client.sendMail(email, function(err, info){
                                if (err){
                                    console.log(err);
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                    message.save((err) =>{
                                        if(err){
                                            res.json({success: false, message: err});
                                        }else{
                                            res.json({success: true, message: 'message sent'});
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });

    router.get('/message-sent', (req, res) => {
        User.findById(req.decoded.userId, (err, user) =>{
            if(err){
                res.json({success: false, message: err});
            }else{
                if(!user){
                    res.json({success: false, message: 'user not found'});
                }else{
                    Message.find({from: user.email}).select().exec((err, mail) =>{
                        if(err){
                            res.json({success: false, message: err});
                        }else{
                            if(!mail){
                                res.json({success: false, message: 'no message'});
                            }else{
                                res.json({success: true, message: mail});
                            }
                        }
                    });
                }
            }
        });

    });

    router.get('/message-received', (req, res) => {
        User.findById(req.decoded.userId, (err, user) =>{
            if(err){
                res.json({success: false, message: err});
            }else{
                if(!user){
                    res.json({success: false, message: 'user not found'});
                }else{
                    Message.find({to: user.email}).select().exec((err, mail) =>{
                        if(err){
                            res.json({success: false, message: err});
                        }else{
                            if(!mail){
                                res.json({success: false, message: 'no message'});
                            }else{
                                res.json({success: true, message: mail});
                            }
                        }
                    });
                }
            }
        });
    });

    router.get('/get-message/:id', (req, res) => {

       Message.findById(req.params.id).select().exec((err, email) =>{
           if(err){
               res.json({success: false, message: err})
           }else{
               if(!email){
                   res.json({success: false, message: 'no email found'});
               }else{
                   res.json({success: true, message: email});
               }
           }
       })
    });

    //hide message
    router.put('/hide-message', (req, res) => {
        Message.findOne({_id:req.body._id}, (err, message) =>{
            if(err){
                res.json({success: false, message: err})
            } else{
                if(!message){
                    res.json({success: false, message: 'no message found'})
                }else{
                    message.showOwner = false;
                    message.save((err) =>{
                        if(err){
                            res.json({success: false, message: 'could hide message', error: err})
                        }else{
                            res.json({success: true, message: 'Deleted'})
                        }
                    })
                }
            }
        });
    });

    return router;
};
