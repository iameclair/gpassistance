const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

//info schema
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

module.exports =  mongoose.model('Info', infoSchema);
