var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
    displayName: String,
    firstName: String,
    lastName: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
