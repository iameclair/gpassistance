const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const moment = require('moment');
const Schema = mongoose.Schema;

//prescription schema
const prescriptionSchema = new Schema({
    created: {type: String, default: Date.now()},
    doctor: {type: String, require: true},
    patient: {type: String, require: true},
    email: {type: String, require: true},
    phone: {type: String, require: true},
    sendSms: {type: Boolean, default: false},
    pres_name: {type: String, require: true},
    refill:{type: Date, require: true},
    startReminder: {type: Date, require: true},
    owner: {type: Schema.Types.ObjectId, ref: 'User'}
});

prescriptionSchema.methods.requiresNotification = function() {
    let currentTime =new Date(Date.now());
    if(currentTime.getHours() === this.startReminder.getHours() &&
        currentTime.getMinutes() === this.startReminder.getMinutes()){
         console.log('Time are equal send signal');
         return true;
    }
};

module.exports =  mongoose.model('Prescription', prescriptionSchema);