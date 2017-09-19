const User = require('../models/users');
const MedicalHistory = require('../models/medicalhistory');
const Info = require('../models/info');
const Appointment = require('../models/appointment');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const nodemailer = require('nodemailer');

module.exports = (router) => {

    ///activate account

    router.post('/create_appointment', (req, res) =>{
        if(!req.body.date){
            res.json({success: false, message: 'Date and time is required'});
        }else{
            const appointment = new Appointment();
            appointment.date = req.body.date;
            appointment.doctor = req.decoded.userId;

            appointment.save((err) =>{
                if(err){
                    res.json({success: false, message: err});
                }else{
                    res.json({success: true, message: 'appointment created successfully ', appointment});
                }
            });
        }
    });

    //display doctors appointment
    router.get('/appointment_list', (req, res) => {
        Appointment.find({doctor: req.decoded.userId}).select().exec((err, appointment) => {
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

    //delete time table

    router.delete('/delete_appointment/:id', (req, res) => {
        Appointment.findByIdAndRemove(req.params.id, (err, appointment) =>{
           if(err) res.json({success: false, message: err}) ;
           else{
               res.json({success: true, message: 'appointment deleted successfully'});
           }
        });
    });

    //get time slot
    router.get('/get-time-slot/:id', (req, res) => {
        Appointment.findById(req.params.id, (err, timeSlot) => {
           if(err){
               res.json({success: false, message: err})
           } else{
               if(!timeSlot){
                   res.json({success: false, message: 'No valid time slot Id'})
               }else{
                   res.json({success: true, timeslot: timeSlot})
               }
           }
        });
    });

    //update time table
    router.put('/update-timeslot', (req, res) =>{
       Appointment.findOne({_id: req.body._id}, (err, appointment) =>{
           if(err){
               res.json({success: false, message: err});
           }else{
               appointment.date = req.body.date;
               appointment.save((err) =>{
                   if(err){
                       res.json({success: false, message: err})
                   }else{
                       res.json({success: true, message: 'Time-Slot update successfully'})
                   }
               });
           }
       })
    });
    //cancel appointments with patients
    router.put('/cancel_appointment/:id', (req, res) => {
        Appointment.findById({_id: req.params.id, status: true}, (err, appointment) =>{
            if(err) res.json({success: false, message: err});
            else {
                if(!appointment){
                    res.json({success: false, message: 'Invalid Appointment'})
                }else{
                    appointment.reason = '';
                    appointment.patient = null;
                    appointment.status = false;
                    //save the appointment
                    appointment.save((err) =>{
                        if(err){
                            res.json({success: false, message: err});
                        } else{
                            //successful
                            //1. send email
                            //2. return feedback
                            res.json({success: true, message: 'The appointment has been canceled', appointment});
                        }
                    });

                }
            }
        });
    });
    //view appointments with patients

    //view patients details
    router.get('/view-patient-detail/:id', (req, res) => {
        Info.findOne({owner: req.params.id})
            .populate('owner')
            .exec((err, patient) =>{
           if(err) { res.json({success: false, message: err})}
           else{
               if(!patient){
                   res.json({success: false, message: 'Can not find this patient'});
               }else{
                   res.json({success: true, patient: patient});
               }
           }
        });
    });

    router.get('/patient-medical-history/:id', (req, res) =>{
        MedicalHistory.find({patient: req.params.id}).select()
            .exec((err, medicalHistory) => {
           if(err){
               res.json({success: false, message: err})
           } else{
               if(!medicalHistory){
                   res.json({success: false, message: 'Wrong patient Id'})
               }else{
                   res.json({success: true, medicalhistory: medicalHistory })
               }
           }
        });
    });

    router.get('/view_my_appointment', (req, res) => {
        Appointment.find({doctor: req.decoded.userId, status: true})
            .populate('patient')
            .exec((err, appointment)=>{
                if(err) res.json({success: false, message: err});
                else{
                    if(!appointment){
                        res.json({success: false, message: 'You have no appointment'})
                    }else{
                        res.json({success: true, appointment: appointment});
                    }
                }
            });
    });

    //message patients

    router.post('/medical_report', (req, res) =>{
        if(!req.body.date || !req.body.reason){
            res.json({success: false, message: 'fill in all the required field'})
        }else{
            const medicalHistory = new MedicalHistory();
            medicalHistory.date = req.body.date;
            medicalHistory.reason = req.body.reason;
            medicalHistory.symptoms = req.body.symptoms;
            medicalHistory.prescriptions = req.body.prescriptions;
            medicalHistory.medications = req.body.medications;
            medicalHistory.patient = req.body.patient;
            medicalHistory.doctor = req.decoded.userId;

            medicalHistory.save((err) =>{
               if(err){
                   res.json({success: false, message: err})
               } else{
                   res.json({success: true, message: 'medical report created'})
               }
            });
        }
    });

    return router;
};



