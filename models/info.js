const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const User = require('./users');

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
const infoSchema = new Schema({
    email: { type: String, require: true },
    title: { type: String, require:true},
    dob: {type: Date, require: true},
    age: {type: String, require: false, default: '0'},
    nhs_number: {type: String, require:false},
    gender: {type: String, require:true},
    height: {type: String, require:true},
    weight: {type: String, require:true},
    country_of_birth: {type: String, required:true},
    ethnicity: {type: String, required: true},
    phone_number: {type:String, required: true},
    address_line1: {type: String, required: true},
    address_line2: {type: String, required: false},
    postcode: {type: String, required: true},
    city: {type: String, required: true},
    country_of_residence: {type: String, required: true},
    emergency_name: {type: String, required: true},
    emergency_relationship: {type: String, required: true},
    emergency_phone: {type: String, required: true},
    emergency_address: {type: String, required: true},
    emergency_name2: {type: String, required: false},
    emergency_relationship2: {type: String, required: false},
    emergency_phone2: {type: String, required: false},
    emergency_address2: {type: String, required: false},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
});

module.exports =  mongoose.model('Info', infoSchema);/**
 * Created by User on 7/19/2017.
 */
