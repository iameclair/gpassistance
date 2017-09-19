//information of the user
const User = require('../models/users');
const Info = require('../models/info');
const Appointment = require('../models/appointment');
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

    //find user by id
    router.get('/get_doctor/:id', (req, res) => {
       User.findById(req.params.id). select().exec((err, user) => {
          if(err){
              res.json({success: false, message: err});
          } else{
              if(!user){
                  res.json({success: false, message: 'Sorry the Doctor is not found in our database'})
              }else{
                  res.json({success: true, user: user});
              }
          }
       });
    });

    //display doctors appointment
    router.get('/appointment_list/:id', (req, res) => {
       Appointment.find({doctor: req.params.id, status: false}).select().exec((err, appointment) => {
           if(err){
               res.json({success: false, message: err});
           } else{
               if(!appointment){
                   res.json({success: false, message: 'No appointment for this doctor'})
               }else{
                   res.json({success: true, appointment: appointment});
               }
           }
       }) ;
    });

    //create new staff
    router.get('/search_doctor/:name', (req, res) => {
        //find doctor by name
        let name = req.params.name;
        console.log(name);
        User.find({$or: [{first_name:{$regex: new RegExp(name, 'i')}},
            {last_name:{$regex: new RegExp(name, 'i')}}]})
            .select()
            .exec((err, user)=>{
                if(err){
                    res.json({ success: false, message: err });
                }else{
                    if(!user){
                        res.json({ success: false, message: 'Name not found'});
                    }else{
                        //user found return user
                        res.json({ success: true, message: user});
                    }
                }
        });
    });

    //view list of all staff
    router.get('/search_category/:category', (req, res) =>{
        let category = req.params.category;
        User.find({category: {$regex: new RegExp(category, 'i')} }).select().exec((err, user) => {
           if(err){
               res.json({success: false, message: err})
           } else{
               if(!user){
                   res.json({success: false, message: 'Category Non existant'})
               }else{
                   res.json({success: true, message:'user found', user});
               }
           }
        });
    });

    //search one staff
    router.get('/check_availability/:id', (req, res) => {
        Appointment.find({status: false, doctor: req.params.id}).select().exec((err, appoitment) =>{
            if(err) res.json({success: false, message: err});
            else{
                if(!appoitment){res.json({success: false, message: 'No available appointment slots'})}
                else{
                    res.json({success: true, message: appoitment});
                }
            }
        });
    });
    //check availability of a specifique date
    router.get('/check_availability_date/:date', (req, res) => {
        Appointment.find({date: req.params.date}).select().exec((err, appoitment) =>{
            if(err) res.json({success: false, message: err});
            else{
                if(!appoitment){res.json({success: false, message: 'No available appointment slots'})}
                else{
                    res.json({success: true, appointment: appoitment});
                }
            }
        });
    });

    router.get('/book_appointment/:id', (req, res) => {
        Appointment.findById({_id: req.params.id, status: false}, (err, appointment) =>{
            if(err) res.json({success: false, message: err});
            else {
                if(!appointment){
                    res.json({success: false, message: 'Invalid Appointment'})
                }else{
                    res.json({success: true, appointment: appointment})
                }
            }
        });
    });

    //view list of all patients
    router.post('/book_appointment', (req, res) => {
        Appointment.findById(req.body._id, (err, appointment) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                if(!appointment){
                    res.json({success: false, message: 'Invalid appointment'})
                }else{
                    if(!appointment.status){
                        if(!req.body.reason){
                            res.json({success: false, message: 'Provide a reason for your appointment'})
                        }else{
                            appointment.reason = req.body.reason;
                            appointment.patient = req.decoded.userId;
                            appointment.status = true;
                            console.log('Patient ID: '+appointment.patient);
                            // res.json({Success: true, message: appointment});
                            //save the appointment
                            appointment.save((err) =>{
                                if(err){
                                    res.json({success: false, message: err});
                                } else{
                                    //successful
                                    let patientUser;
                                    let doctorUser;
                                    User.findOne({_id:req.decoded.userId}, (err, user) =>{
                                       if(err){
                                           res.json({success: false, message: err});
                                       } else{
                                           if(user){
                                               patientUser = user;
                                               User.findOne({_id:appointment.doctor}, (err, doctor) =>{
                                                   if(err){
                                                       res.json({success: false, message: err});
                                                   }else{
                                                       if(doctor){
                                                           doctorUser = doctor;
                                                       }
                                                   }
                                               });
                                               //1. send email
                                               let day = renderDate(appointment.date);
                                               let time = renderTime(appointment.date);
                                               //successful in registering the user send email
                                               const email = {
                                                   from: 'GP Assistant, noreply@gpassistant.com',
                                                   to: user.email,
                                                   subject: 'Appointment Confirmation',
                                                   text: 'Confirmation appointment booked for the '+day+' at '+ time,
                                                   html: '<p>Confirmation appointment booked for the '+day+' at'+ time+'</p>'
                                               };

                                               client.sendMail(email, function(err, info){
                                                   if (err){
                                                       console.log(err);
                                                   }
                                                   else {
                                                       console.log('Message sent: ' + info.response);
                                                   }
                                               });

                                           }
                                       }
                                    });
                                    //2. return feedback
                                    res.json({success: true, message: 'You have booked an appointment for ' +
                                    'successfully'});
                                }
                            });
                        }
                    }
                }
            }
        });

    });


    router.get('/my-appointment', (req, res) => {
        Appointment.find({patient: req.decoded.userId})
            .populate('doctor')
            .exec((err, appointment)=>{
            if(err) {
                res.json({success: false, message: err})

            }
            else{
                if(!appointment){
                    res.json({success: false, message: 'You have no appointment'})
                }else{
                    res.json({success: true, appointment: appointment});
                }
            }
        });
    });

    router.get('/cancel_appointment/:id', (req, res) =>{
        Appointment.findById(req.params.id, (err, appointment) =>{
            if(err) res.json({success: false, message: err});
            else{
                if(!appointment){
                    res.json({success: false, message: 'Invalid Appointment'})
                }else{
                    res.json({success: true, appointment: appointment})
                }
            }
        })
    });


    router.put('/cancel_appointment', (req, res) => {
        Appointment.findOne({_id:req.body._id}, (err, appointment) =>{
            if(err) res.json({success: false, message: err});
            else {
                if(!appointment){
                    res.json({success: false, message: 'Invalid Appointment'})
                }else{
                        appointment.reason = '';
                        appointment.patient = null;
                        appointment.status = false;
                        appointment.canceled = true;
                        //save the appointment
                        appointment.save((err) =>{
                            if(err){
                                res.json({success: false, message: err});
                            } else{
                                //successful
                                //1. send email
                                let patientUser;
                                let doctorUser;
                                User.findOne({_id:req.decoded.userId}, (err, user) =>{
                                    if(err){
                                        res.json({success: false, message: err});
                                    } else{
                                        if(user){
                                            patientUser = user;
                                            console.log('Doctor id \n'+ appointment.doctor);
                                            User.findOne({_id:appointment.doctor}, (err, doctor) =>{
                                                if(err){
                                                    res.json({success: false, message: err});
                                                }else{
                                                    if(doctor){
                                                        console.log('Doctor object \n'+doctor);
                                                        //1. send email
                                                         let day = renderDate(appointment.date);
                                                         let time = renderTime(appointment.date);
                                                         //successful in registering the user send email
                                                         const email = {
                                                             from: 'GP Assistant, noreply@gpassistant.com',
                                                             to: doctor.email,
                                                             subject: 'Appointment Cancellation',
                                                             text: 'Confirmation appointment booked for the '+day+' at '+ time,
                                                             html: '<p>'+patientUser.first_name +' have Canceled the appointment for the '+day+' at '+ time+'</p>'
                                                         };

                                                         client.sendMail(email, function(err, info){
                                                             if (err){
                                                                 console.log(err);
                                                             }
                                                             else {
                                                                 console.log('Message sent: ' + info.response);
                                                             }
                                                         });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                                //2. return feedback
                                res.json({success: true, message: 'The appointment has been canceled', appointment});
                            }
                        });
                }
            }
        });
    });

    //display all the appointments
    router.get('/appointments', (req, res) => {
       Appointment.find((err, appointments) =>{
           if(err){
               res.json({success: false, message: err})
           }else{
               res.json({success: true, appointments: appointments})
           }
       })
    });

    const renderDate = ((date) =>{
        let day, month, year;
        let dob = new Date(date);

        day = dob.getDate();
        month = dob.getMonth()+1;
        year = dob.getFullYear();

        switch(month){
            case 1: month = 'January'; break;
            case 2: month = 'February'; break;
            case 3: month = 'March'; break;
            case 4: month = 'April'; break;
            case 5: month = 'May'; break;
            case 6: month = 'June'; break;
            case 7: month = 'July'; break;
            case 8: month = 'August'; break;
            case 9: month = 'September'; break;
            case 10: month = 'October'; break;
            case 11: month = 'November'; break;
            case 12: month = 'December'; break;
        }

        return ""+day+"-"+month+"-"+year+"";
    });

    const renderTime = ((time) =>{
        let date = new Date(time);
        let hours = date.getHours()-1;
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let label;
        if(hours <12 || hours === 24){
            label = 'AM';
        }else
        if(hours >= 12 && hours <=23){
            label = 'PM';
        }

        if(minutes === 0){
            return hours+':'+minutes+'0'+' '+label;
        }

        return hours+':'+minutes+' '+label;
    });


    return router;
};

