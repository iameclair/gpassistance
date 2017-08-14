//information of the user
const User = require('../models/users');
const Info = require('../models/info');
const MedicalHistory = require('../models/medicalhistory');
const Profile = require('../models/profile');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
   destination: function (req, file, cb){
       cb(null, 'client/src/uploads/')
   } ,
   filename: function (req, file, cb) {
       cb(null, file.fieldname+req.decoded.userId+'-'+Date.now()+path.extname(file.originalname));
   }
});
/**/
const upload = multer({ storage: storage}).single('avatar');



module.exports = (router) => {

     //middleware to intercept the route
    router.use((req, res, next) => {
         const token = req.headers['authorization'];
         if(!token){
            res.json({ success: false, message: 'No token provided'});
         }else{
             jwt.verify(token, config.secrete, (err, decoded) => {
                 if (err){
                     res.json({ success: false, message: 'Invalid token: '+ err});
                 } else{
                     req.decoded = decoded;
                     next();
                 }
            });
         }
     });
    //get user permission
    router.get('/permission', (req, res) => {
        User.findOne({ _id: req.decoded.userId }).select('permission').exec((err, user) => {
            if(err) {
                res.json({ success: false, message: err });
            }else{
                if(!user){
                    res.json({ success: false, message: 'User not found' });
                }else{
                    res.json({ success: true, permission: user.permission });
                }
            }
        });
    });


    //get user details
    router.get('/profile', (req, res) => {
        Info.findOne({ owner: req.decoded.userId })
        .populate('owner')
        .exec((err, info) =>{
            if (err) {
                res.json({ success: false, message: err });
            }else{
                if(!info){
                    res.json({ success: false, message: 'User not found' });
                }else{
                    res.json({ success: true, info: info });
                }
            }
        });
    });

    //see my medical history
    router.get('/view_medical_history', (req, res) => {
        MedicalHistory.find({patient: req.decoded.userId}).select().exec((err, medicalHistory) =>{
            if(err){
                res.json({ success: false, message: err });
            }else{
                if(!medicalHistory){
                    res.json({ success: false, message: 'No medical history' });
                }else{
                    res.json({ success: true, medicalHistory: medicalHistory });
                }
            }
        });
    });

    //get otp
    router.get('/otp', (req, res) => {
        User.findOne({ _id: req.decoded.userId })
            .select('otp')
            .exec((err, otp) => {
                if(err) {
                    res.json({success: false, message: err});
                }else{
                    if(!otp){
                        res.json({ success: false, message: 'You are not authorize to access this resource'})
                    }else{
                        res.json({success: true, otp: otp});
                    }
                }
            });
    });

    //login user
    router.get('/loginasadmin/:otp', (req, res) =>{
        if(!req.params.otp) {
            res.json({ success: false, message: "No otp provided"});
        }else{
            //search for the user in the db
            User.findOne({ otp: req.params.otp }, (err, user) => {
                if (err){
                    res.json({ success: false, message:'failed to login', err});
                }
                else{
                    if(!user){
                        res.json({success: false, message: 'Invalid OTP request a new OTP.'})
                    }else{
                        if(user.permission !== 'superuser'){
                                    res.json({ success: false, message: 'You can not login your account ' +
                                    'do not have permission to access the resource'});
                        }else{
                                res.json({ success: true, message: 'Welcome Admin: '+user.first_name, user: user});
                            }
                        }
                    }
            });
        }
    });

    //login user
    router.get('/loginasstaff/:otp', (req, res) =>{
        if(!req.params.otp) {
            res.json({ success: false, message: "No otp provided"});
        }else{
            //search for the user in the db
            User.findOne({ otp: req.params.otp }, (err, user) => {
                if (err){
                    res.json({ success: false, message:'failed to login', err});
                }
                else{
                    if(!user){
                        res.json({success: false, message: 'Invalid OTP request a new OTP.'})
                    }else{
                        if(user.permission !== 'staff'){
                            res.json({ success: false, message: 'You can not login your account ' +
                            'do not have permission to access the resource'});
                        }else{
                            res.json({ success: true, message: 'Welcome Staff: '+user.first_name, user: user});
                        }
                    }
                }
            });
        }
    });

    router.post('/avatar', function(req, res){
       upload(req, res, function (err){
           if(err){
               res.json({success: false, message:err});
           }else{
               const profile = new Profile();
               profile.avatar = req.file.filename;
               profile.owner = req.decoded.userId;
               profile.save((err) =>{
                   if(err){
                       res.json({success: false, message:'Cant save Image', error: err});
                   }else{
                       res.json({success: true, message:'Image Uploaded'});
                   }
               })
           }
        });
    });

    return router;
};

