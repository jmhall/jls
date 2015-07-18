var mongoose = require('mongoose');
var trackingTypes = require('./trackingTypes');
var Schema = mongoose.Schema;

var trackingEntrySchema = new Schema({
    activityId: {type: Schema.Types.ObjectId, index: true},
    studentId: {type: Schema.Types.ObjectId, index: true},
    teacherId: {type: Schema.Types.ObjectId, index: true},
    date: Date,
    trackingType: {type: String, enum: trackingTypes},
    trackingData: { stepNum: Number, value: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrackingEntry', trackingEntrySchema);
