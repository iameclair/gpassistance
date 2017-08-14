const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const User = require('./users');
const Info = require('./info');

//message schema
const messageSchema = new Schema({
    created: {type: String, default: Date.now()},
    from: {type: String, require: true},
    to: {type: String, require: true},
    subject:{type: String, require: true},
    content: {type: String, require: true},
    showOwner: {type: Boolean, require: false, default: true}
});

module.exports =  mongoose.model('Message', messageSchema);