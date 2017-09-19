const Prescription = require('../models/prescription');
const accountSid = 'AC8dd22b7052680607a0a894b02856566f';
const authToken = '5bc67c53b069bdbcbbe737d07a4e6e67';
const client = require('twilio')(accountSid, authToken);
const nodemailer = require('nodemailer');

//construct the transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'eclairlumu@gmail.com',
        pass: 'divinmaitre'
    }
});


let reminderArray = [];
sendNotifications = function(callback) {
    Prescription.find().select().exec((err, prescriptions) =>{
        if(err){
            console.log(err);
            return;
        }else{
            prescriptions.forEach(pres =>{
                if(pres.requiresNotification()){
                    if(pres.sendSms){
                        const options = {
                            to: pres.phone,
                            from: '+441173252242',
                            /* eslint-disable max-len */
                            body: 'Hi '+pres.patient+', Just a reminder that you have a prescription refill due on' +
                            'the '+pres.refill.getDate()+"/"+(pres.refill.getMonth()+1)+"/"+pres.refill.getFullYear()+".",
                            /* eslint-enable max-len */
                        };

                        client.messages.create(options, function(err, response) {
                            if (err) {
                                // Just log it for now
                                console.error(err);
                            } else {
                                console.log('sms sent');
                            }
                        });
                    }
                    const email = {
                        from: "eclairlumu@gmail.com",
                        to: pres.email,
                        subject: "Prescription Reminder",
                        text: "Hey "+pres.patient+" just a reminder that your prescription refill is due on the " +
                        ""+pres.refill.getDate()+"/"+(pres.refill.getMonth()+1)+"/"+pres.refill.getFullYear()+".",
                    };
                    transporter.sendMail(email, function(err, info){
                        if (err){
                            console.log(err);
                        }
                        else {
                            console.log('Message sent: ' + info.response);
                            message.save((err) =>{
                                if(err){
                                    console.log('Message not sent\n '+ err)
                                }else{
                                    console.log('Message sent success!')
                                }
                            });
                        }
                    });
                }
            })
        }
    });
};

const notificationWorkerFactory = (()=>{
    return {
        run: function () {
            sendNotifications();
        },
    };
});
module.exports = notificationWorkerFactory();
