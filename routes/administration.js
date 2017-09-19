//information of the user
const User = require('../models/users');
const Info = require('../models/info');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const nodemailer = require('nodemailer');

module.exports = (router) => {

    //create new staff
    router.post('/add_staff', (req, res) => {
        //find the use we would like to promote to staff
        User.findOne({ email: req.body.email }).select()
            .exec((err, user) => {
                if(err){
                    res.json({ success: false, message: err });
                }else{
                    if(!user){
                        res.json({ success: false, message: 'Email does not exist'});
                    }else{
                        if(!req.body.medicalSpecialities){
                            res.json({ success: false, message: 'Provide a Speciality'});
                        }else if(!req.body.permission){
                            res.json({ success: false, message: 'Provide user permission'});
                        }else if(!req.body.position){
                            res.json({ success: false, message: 'Provide user position '});
                        }
                        else{
                            if(req.body.permission !== 'staff'){
                                res.json({ success: false, message: 'The user permission should be staff'});
                            }else{
                                //construct new staff
                                if(user.permission === 'staff'){
                                    res.send({ success: false, message: ''+user.first_name+' has already been promoted' +
                                    'to staff'});
                                }else{
                                    user.permission = req.body.permission;
                                    user.medicalSpecialities = req.body.medicalSpecialities;
                                    user.position = req.body.position;
                                    user.save((err) => {
                                        if(err) { res.json({success: false, message: 'could not save', err})}
                                        else{
                                            res.json({success: true, message: ''+user.first_name+' have been ' +
                                            'promoted to staff'});
                                        }
                                    });
                                }

                            }
                        }
                    }
                }

            })
    });

    //view list of all staff
    router.get('/get_staff', (req, res) =>{
        User.find({permission: "staff"}).select().exec((err, user) =>{
           if(err) res.json({success: false, message: err});
           else res.json({success: true, users: user});
        });
    });

    //search one staff
    router.get('/get_user/:email', (req, res) => {
        User.findOne({email: req.params.email}).select().exec((err, user) =>{
            if(err) res.json({success: false, message: err});
            else{
                if(!user){res.json({success: false, message: 'stuff not found'})}
                else{
                    res.json({success: true, message: user});
                }
            }
        });
    });

    //view list of all patients
    router.get('/get_patients', (req, res) => {
        User.find({permission: "user"}).select().exec((err, user) =>{
            if(err) res.json({success: false, message: err});
            else res.json({success: true, message: user});
        });
    });


    router.delete('/delete_user/:id', (req, res) => {
        User.findByIdAndRemove(req.params.id, (err, user)=>{
            if(err) res.json({success: false, message: true});
            else{
                if(!user){
                    res.json({success: false, message: 'user not found'})
                }else{
                    res.json({success: true, message: user.first_name+' deleted successfully'});
                }
            }
        });
    });

    return router;
};


