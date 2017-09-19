//information of the user
const User = require('../models/users');
const Info = require('../models/info');
const Appointment = require('../models/appointment');
const MedicalHistory = require('../models/medicalhistory');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const nodemailer = require('nodemailer');

module.exports = (router) => {

    //create medical history for patients
    router.post('/create/:id', (req, res) => {
        let userID  = req.params.id;
        let doctorID = req.decoded.userId;
        User.findOne({_id : userID}, (err, user) =>{
            if(err){
                res.json({success: false, message: err})
            }
            else{
                const medicalhistory = new MedicalHistory();
                medicalhistory.date = req.body.date;
                medicalhistory.time = req.body.time;
                medicalhistory.reason = req.body.reason;
                medicalhistory.symptoms = req.body.symptoms;
                medicalhistory.medication = req.body.medication;
                medicalhistory.prescription = req.body.prescription;
                medicalhistory.patient = user._id;
                medicalhistory.doctor = doctorID;

                medicalhistory.save((err) =>{
                    if(err){
                        res.json({success: false, message: err})
                    }else{
                        res.json({success: true, message: 'medical history created successfully'})
                    }
                });
            }
        });
    });

    //update medical history of a patient
    router.put('/update/:id', (req, res) => {
        let userID  = req.params.id;
        let doctorID = req.decoded.userId;
        User.findOne({_id : userID}, (err, user) =>{
            if(err){
                res.json({success: false, message: err})
            }
            else{
                //find medical history
                MedicalHistory.findOne({patient : user._id}, (err, medicalhistory) => {
                    if(err){
                        res.json({success: false, message: err})
                    }else{
                        medicalhistory.date = req.body.date;
                        medicalhistory.time = req.body.time;
                        medicalhistory.reason = req.body.reason;
                        medicalhistory.symptoms = req.body.symptoms;
                        medicalhistory.medication = req.body.medication;
                        medicalhistory.prescription = req.body.prescription;
                        medicalhistory.patient = user._id;
                        medicalhistory.doctor = doctorID;

                        medicalhistory.save((err) =>{
                            if(err){
                                res.json({success: false, message: err})
                            }else{
                                res.json({success: true, message: 'medical history created successfully'})
                            }
                        });
                    }
                });
            }
        });
    });

    router.get('/view/:id', (req, res) =>{
        MedicalHistory.findOne({patient: req.params.id}).select().exec((err, medicalhistory) =>{
           if(err){
               res.json({success: false, message: err});
           } else{
               res.json({success: true, data: medicalhistory});
           }
        });
    });
    return router;
};
