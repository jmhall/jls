var mongoose = require('mongoose');
var trackingTypes = require('./trackingTypes');
var Schema = mongoose.Schema;

var stepSchema = new Schema({
    stepNum: Number,
    stepTitle: String,
    stepDesc: String
});

var activitySchema = new Schema({
    code: {type: String, index: true},
    rollupCode: String,
    channelNum: Number,
    channelDesc: String,
    categoryNum: Number,
    categoryDesc: String,
    title: String,
    description: String,
    rollup: Boolean,
    trackingType: {type: String, enum: trackingTypes},
    stepsAreProgressive: Boolean,
    customPerStudent: Boolean,
    steps: [stepSchema],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', activitySchema);
