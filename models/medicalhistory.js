const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const User = require('./users');
const Info = require('./info');

//medical history schema
const medicalHistorySchema = new Schema({
    created: {type: String, default: Date.now()},
    date: {type: String, require: true},
    reason: {type: String, require: true},
    symptoms: [{name:String, description: String}],
    medications:[{name:String}],
    prescriptions: [{name: String, instruction: String, repeating: Boolean}],
    doctor: { type: Schema.Types.ObjectId, ref: 'User'},
    patient: { type: Schema.Types.ObjectId, ref: 'User'},
});

module.exports =  mongoose.model('MedicalHistory', medicalHistorySchema);