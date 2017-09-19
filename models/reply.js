const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const Message = require('./message');

//message schema
const replySchema = new Schema({
    created: {type: String, default: Date.now()},
    from: {type: String, require: true},
    to: {type: String, require: true},
    subject:{type: String, require: true},
    content: {type: String, require: true},
    replyTo: {type: Schema.Types.ObjectId, ref: 'Message'},
    showOwner: {type: Boolean, require: false, default: true}
});

module.exports =  mongoose.model('Reply', messageSchema);