var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }, 
    displayName: String,
    azureId: { type: String, unique: true },
    isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
