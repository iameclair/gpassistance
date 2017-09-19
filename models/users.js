const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const Info = require('../models/info');

//backend validation of the schema
let emailLengthChecker = (email) => {
  if(!email) {
      return false;
  } else {
      if(email.length < 5 || email.length > 30) {
          return false;
      }else {
          return true;
      }
  }
};

let validEmailChecker = (email) => {
    if(!email){
        return false;
    }else {
        //use regex
        const regexp = new
            RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            return regexp.test(email);
    }
};

let namesLengthChecker = (name) => {
    if(!name) {
        return false;
    }else {
        if(name.length < 2 || name.length > 100){
            return false;
        }else{
            return true;
        }
    }
};

let validNameChecker = (name) => {
    if(!name){
        return false;
    }else {
        const regexp = new RegExp(/^[a-zA-Z ]+$/);
        return regexp.test(name);
    }
};

let passwordLengthChecker = (password) => {
  if(!password || password.length < 8) {
      return false;
  }else{
      return true;
  }
};

let validPasswordChecker = (password) => {
    if(!password) return false;
    const regex = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,100}$/);
    return regex.test(password);
};

const emailValidators = [
    {
        validator: emailLengthChecker, message: 'The email you are using the size is not valid'
    },
    {
        validator: validEmailChecker,
        message: 'The email you have entered is invalid'
    }
];

const nameValidators = [
    {
        validator: namesLengthChecker, message: "Invalid Name too long or too short"
    },
    {
        validator: validNameChecker, message: "Invalid Name must not contain numbers or character"
    }
];

const passwordValidators = [
    {
        validator: passwordLengthChecker, message: "password must at least 8 characters long"
    },
    {
        validator: validPasswordChecker, message: "Password must conatain at least 1 upper case and 1 special character and a number"
    }
];

//validation for firstname and last name and password

//user schema
const userSchema = new Schema({
   email: { type: String, require:true, unique:true, lowercase:true, validate: emailValidators},
   first_name : {type: String, require:true, validate: nameValidators},
   middle_name : {type: String, require:false},
   last_name : {type: String, require:true, validate: nameValidators},
   password: {type: String, require:true, validate: passwordValidators},
   active: {type: Boolean, required: true, default: false },
   otp: {type: String, require:false},
   temporarytoken: { type: String, required: true},
   resetPasswordToken: {type: String, require: false},
   permission: { type: String, required: true, default: 'user'}, //roles user, staff, superuser
   medicalSpecialities: [{name:String}],
   position: {type: String, required: false},
   personal_info: { type: Schema.Types.ObjectId, ref: 'Info'}
});

/**Create Miiddleware for schema to encrypt the password**/
userSchema.pre('save', function (next){
    if(!this.isModified('password')) return next();

    //run the encryption
    bcrypt.hash(this.password, null, null, (err, hash) => {
        if(err) return next(err);
        this.password = hash;
        next();
    })
});


//decrypt the password

userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.isSuperUser = function (user) {
    if(user.permission === 'superuser') return true;
};

module.exports =  mongoose.model('User', userSchema);