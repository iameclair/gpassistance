const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const User = require('./users');
const Info = require('./info');

//profile schema
const profileSchema = new Schema({
    created: {type: String, default: Date.now()},
    avatar: {type: String, require: true},
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
});

module.exports =  mongoose.model('Profile', profileSchema);