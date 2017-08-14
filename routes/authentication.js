//authenticate user
const User = require('../models/users');
const Info = require('../models/info');
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

    //create the user account
    router.post('/register', (req, res) => {
        if(!req.body.email){
            res.json({success: false, message: 'You must provide an e-mail'});
        }else{
            if(!req.body.first_name){
                res.json({success: false, message: 'You must provide an first name'});
            }else if(!req.body.last_name){
                res.json({success: false, message: 'You must provide last_name'});
            }else{
                if(!req.body.password) {
                    res.json({success: false, message: 'You must provide password'});
                }
                else{
                    //construct user
                    const user = new User();
                    //set the user properties
                    user.email = req.body.email.toLowerCase();
                    user.first_name = req.body.first_name;
                    user.middle_name = req.body.middle_name;
                    user.last_name= req.body.last_name,
                    user.password = req.body.password,
                    user.temporarytoken = jwt.sign({email: user.email, first_name: user.first_name},
                        config.secrete, {expiresIn: '1440m'});
                    user.personal_info = Info._id;
                    //save the user to the database
                    user.save((err) =>{
                        if (err) {
                            if(err.code === 11000){
                                res.json({success: false, message: 'The email you are trying to use already exist'});
                            }
                            else if(err.errors){
                                if(err.errors.email){
                                    res.json({success: false, message:err.errors.email.message});
                                }else if(err.errors.last_name){
                                    res.json({success: false, message: err.errors.last_name.message});
                                }else if(err.errors.first_name) {
                                    res.json({success: false, message: err.errors.first_name.message});
                                }else if(err.errors.password){
                                    res.json({success: false, message: err.errors.password.message});
                                }else{
                                    res.json({success: false, message: 'Could not save user. Error: ', err});
                                }

                            }else{
                                res.json({success: false, message: 'Could not save user. Error: ', err});
                            }

                        }else{
                            //successful in registering the user send email
                                const email = {
                                from: 'GP Assistant, noreply@gpassistant.com',
                                to: user.email,
                                subject: 'Account Activation',
                                text: 'Hello '+ 'Eclair' +' Thank you for registering' +
                                ' with GP Assistant. Please copy the link into your browser to verify your account' +
                                'http://localhost:8080/activate/'+ 'token here',
                                html: 'Hello <strong>'+ user.first_name +'</strong>,<br /> Thank you for registering' +
                                ' with </strong>GP Assistant</strong>. Please click on the link below to verify your account' +
                                '<br /><a href="http://localhost:4200/activate_account/'+ user.temporarytoken +'">' +
                                'http://gpassistant.com/activate/xysfgdz#~gtyjk*^</a> '
                            };

                            client.sendMail(email, function(err, info){
                                if (err){
                                    console.log(err);
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });

                            res.json({success: true, message: 'Account created successfully! Please check ' +
                            'your email for activation link.'});
                        }
                    });
                }
            }

        }

    });

    //check email
    router.get('/checkEmail/:email', (req, res) =>{
        if(!req.params.email){
            res.json({success: false, message: 'provide email'});
        }else{
            User.findOne({email: req.params.email}, (err, user) =>{
                if(err){
                    res.json({success: false, message: err})
                }else{
                    if(user){
                        res.json({success: false, message: 'Email is already taken'});
                    }else{
                        res.json({success: true, message: 'Email is available'});
                    }
                }
            })
        }
    });

    //login user
    router.post('/login', (req, res) =>{
        if(!req.body.email) {
            res.json({ success: false, message: "provide email to login in"});
        }else{
            if(!req.body.password){
                res.json({ success: false, message: 'No password provided. ' });
            }else {
                //search for the user in the db
                User.findOne({ email: req.body.email }, (err, user) => {
                    if (err){
                        res.json({ success: flase, message:'failed to login', err});
                    } else{
                        if(!user){
                            res.json({success: false, message: 'Email Not found.'})
                        }else{
                            //user found
                            if(!user.active){
                                res.json({ success: false, message: 'You can not login your account ' +
                                'is not activated. Please check your email to activate your account'})
                            }else{
                                const validPassword = user.comparePassword(req.body.password);
                                if(!validPassword) {
                                    res.json({ success: false, message: 'Password invalid'});
                                }else{
                                    let otp = '';
                                    if(user.permission === 'superuser'){
                                        otp = randomString(4)+'super';
                                    }else if(user.permission === 'staff'){
                                        otp = randomString(4)+'staff';
                                    }
                                    user.otp = otp;
                                    let secret = config.secrete;
                                    const token = jwt.sign({userId: user._id}, secret, { expiresIn: '1h' });
                                    res.json({ success: true, message: 'Successful login!', token: token,
                                        user: { email: user.email, first_name: user.first_name, last_name: user.last_name
                                            , active: user.active, permission: user.permission}});

                                    user.save((err) =>{
                                       if(err){
                                           res.json({success: false, message: err});
                                       }
                                    });
                                }
                            }
                        }
                    }
                });
            }
        }
    });

    //reset password
    router.put('/resetpassword', (req, res)=>{
        User.findOne({ email: req.body.email }).select('email first_name resetPasswordToken').exec((err, user) => {
            if(err) {
                res.json({ success: false, message: err });
            }else{
                if(!user){
                    res.json({ success: false, message: 'User not found' });
                }else{
                    //create a token for password activation
                    user.resetPasswordToken = jwt.sign({ email: user.email }, config.secrete, {expiresIn: '24h'});
                    //save it
                    user.save((err) =>{
                        if(err){
                            res.json({ success: false, message: err });
                        } else{
                            const email = {
                                from: 'GP Assistant, noreply@gpassistant.com',
                                to: user.email,
                                subject: 'Account Activation',
                                text: 'Hello '+ 'Eclair' +' Click on the link below to change your password' +
                                'http://localhost:8080/resetpassword/'+ 'token here',
                                html: 'Hello <strong>'+ user.first_name +'</strong>,<br /> Click on the link below ' +
                                'to change your password' +
                                '<br /><a href="http://localhost:4200/resetpassword/'+ user.resetPasswordToken +'">' +
                                'http://gpassistant.com/resetpassword/xxyz10@r~gdh</a>'
                            };

                            client.sendMail(email, function(err, info){
                                if (err){
                                    console.log(err);
                                }
                                else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });
                            res.json({ success: true, message: 'Email was sent to your email address to modify your ' +
                            'password'});
                        }
                    });
                }
            }
        });
    });

    //reset password
    router.get('/resetpassword/:token', (req, res) => {
        User.findOne({ resetPasswordToken: req.params.token }).select().exec((err, user) => {
            if(err){
                res.json({ success: false, message: err });
            }else{
                if(!user){
                    res.json({ success: false, message: 'token not found '});
                }else{
                    const token = req.params.token;
                    jwt.verify(token, config.secrete, (err, decoded)=>{
                        if(err){
                            res.json({ success: false, message: 'Password link as expired'});
                        }else{
                            res.json({ success: true, user: user});
                        }

                    });
                }
            }
        });
    });

    //save new password password

    router.put('/savepassword/:email', (req, res) =>{
        User.findOne({ email: req.params.email }).select().exec((err, user) => {
            if(err){res.json({success: false, message: err});}
            else{
                if(!user){
                    res.json({success: false, message: 'account not found'});
                }else{
                    user.password = req.body.password;
                    user.resetPasswordToken = false;
                    user.save((err) =>{
                        if(err){
                            res.json({success: false, message: err});
                        }else{
                            res.json({success: true, message: 'Password reset successfully'});
                        }
                    })
                }
            }
        });
    });

    ///activate account
    router.put('/activate/:key', (req, res) =>{
        //search the database
        User.findOne({ temporarytoken: req.params.key }).select('email first_name temporarytoken')
            .exec((err, user) =>{
                if(err) {
                    res.json({ success: false, message: err });
                }else{
                    const token = req.params.key;

                    jwt.verify(token, config.secrete, (err, decoded) =>{
                        if (err){
                            res.json({ success: false, message: 'activation link as expired' })
                        } else if(!user){
                            res.json({ success: false, message: 'No valid token' })
                        } else{
                            user.temporarytoken = false;
                            user.active = true;
                            user.save((err) =>{
                                if(err){
                                    console.log(err);
                                } else{
                                    res.json({ success: true, message: 'Account activated' });
                                }
                            });
                        }

                    });

                }

            });
    });

    //register user information

    router.post('/info', (req, res) => {
        //find user
        User.findOne({ email: req.body.email }).select().exec((err, user) => {
            if(err){
                res.json({success: false, message: err})
            }if(!user){
                res.json({success: false, message: 'Email invalid'})
            } else{
                //user found
                const info = new Info();
                info.email = req.body.email;
                info.title= req.body.title;
                info.dob = req.body.dob;
                info.nhs_number = req.body.nhs_number;
                info.gender = req.body.gender;
                info.height = req.body.height;
                info.weight = req.body.weight;
                info.country_of_birth =  req.body.country_of_birth;
                info.ethnicity =  req.body.ethnicity;
                info.phone_number = req.body.phone_number;
                info.address_line1 = req.body.address_line1;
                info.address_line2 =  req.body.address_line2;
                info.postcode = req.body.postcode;
                info.city = req.body.city;
                info.country_of_residence =  req.body.country_of_residence;
                info.emergency_name = req.body.emergency_name;
                info.emergency_relationship =  req.body.emergency_relationship;
                info.emergency_phone = req.body.emergency_phone;
                info.emergency_address = req.body.emergency_address;
                info.emergency_name2 = req.body.emergency_name2;
                info.emergency_relationship2 =  req.body.emergency_relationship2;
                info.emergency_phone2 = req.body.emergency_phone2;
                info.emergency_address2 = req.body.emergency_address2;
                info.owner = user._id;

                info.save((err) =>{
                    if(err){
                        if(err.name === 'ValidationError'){
                            res.json({success: false, message: 'fill in all the required field'});
                        }else{
                            res.json({success: false, message:err});
                        }
                    }else{
                        res.json({success: true, message: 'success fully registered your information!'});
                    }
                });


            }

        });
    });

    const randomString = ((length) =>{
        let text = "";
        let possible = "ABCDEFGHKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(let i = 0; i< length; i++){
            text +=possible.charAt(Math.floor(Math.random()*possible.length));
        }
        return text;
    });



    return router;
};