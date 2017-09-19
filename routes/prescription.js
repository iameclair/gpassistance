const User = require('../models/users');
const Info = require('../models/info');
const MedicalHistory = require('../models/medicalhistory');
const Profile = require('../models/profile');
const Prescription = require('../models/prescription');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const nodemailer = require('nodemailer');

module.exports = (router) => {
    //create prescription reminder
    router.post('/create', (req, res) => {
        const prescription = new Prescription();
        prescription.doctor = req.body.doctor;
        prescription.patient = req.body.patient;
        prescription.email = req.body.email;
        prescription.phone = req.body.phone;
        prescription.sendSms = req.body.sendSms;
        prescription.pres_name = req.body.pres_name;
        prescription.refill = req.body.refill;
        prescription.startReminder = req.body.startReminder;
        prescription.owner = req.decoded.userId;

        prescription.save(err => {
            if(err){
                res.json({success: false, message: err})
            }else{
                res.json({success: true, message: 'reminder set'});
            }
        });
    });

    //get prescriptions
    router.get('/prescriptions', (req, res) =>{
       Prescription.find({owner: req.decoded.userId}, (err, prescription) => {
           if(err){
               res.json({success: false, message: err})
           }else{
               res.json({success: true, prescriptions: prescription})
           }
       })
    });

    //get prescription
    router.get('/prescriptions/:id', (req, res) =>{
        Prescription.findOne({_id:req.params.id}, (err, prescription) => {
            if(err){
                res.json({success: false, message: err})
            }else{
                console.log(prescription);
                res.json({success: true, prescription: prescription})
            }
        })
    });
    //reset reminder date
    router.put('/prescriptions', (req, res) =>{
        Prescription.findOne({_id: req.body._id}, (err, prescription) => {
            if(err){
                res.json({success: false, message: err})
            }else{
                if(!prescription){
                    res.json({success: false, message: 'wrong prescription id'});
                }else{
                    prescription.startReminder = req.body.startReminder;
                    prescription.save(err =>{
                        if(err){
                            res.json({success: false, message:'could not save prescription\n'+ err})
                        } else{
                            res.json({success: true, message: 'reminder reset'})
                        }
                    });
                }
            }
        })
    });

    return router;
};
