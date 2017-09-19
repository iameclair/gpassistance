const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const User = require('./users');
const Info = require('./info');

//appoitment schema
const appointmentSchema = new Schema({
    date: {type: Date, require: true},
    reason: {type: String, required: false},
    doctor: { type: Schema.Types.ObjectId, ref: 'User'},
    patient: { type: Schema.Types.ObjectId, ref: 'User'},
    status: { type: Boolean, default: false},
    canceled: {type: Boolean, default: false}
});

module.exports =  mongoose.model('Appointment', appointmentSchema);
