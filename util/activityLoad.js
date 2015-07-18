var argParse = require('minimist');
var async = require('async');
var csv = require('csv');
var path = require('path');
var util = require('util');
var moment = require('moment');
var ActivityModel = require('../server/models/activity');
var mongoose = require('mongoose');
var configMongoose = require('../server/configure/configMongoose');
var fs = require('fs');


var DBNAME = 'test';
var COLLNAME = 'activities';

var start = moment();

var CHANNELMAP = [
	null,
	'Tactility',
	'Auditory',
	'Visual',
	'Language',
	'Manual',
	'Mobility',
	'Math',
	'Reading'
];

var CATEGORYMAP = [
	null,
	'Therapeutic',
	'Neurodevelopmental',
	'ILT',
	'LERP'
];

var usage = function() {
	console.log(util.format('usage: %s [options] <filename>', path.basename(__filename, '.js')));
};
var argv = argParse(process.argv.slice(2), {'boolean': ['d', 'delete']});

var deleteExisting = false;
var filename = '';
if (argv._.length > 0) {
	filename = argv._[0];
} else {
	console.log('%s', argv._);
	usage();
	process.exit(1);
}

deleteExisting = ('d' in argv || 'delete' in argv);

console.log(util.format('Using "%s", deleteExisting: %s\n', filename, deleteExisting));
console.log(util.format('Using connStr: %s', configMongoose.connStr));

mongoose.connect(configMongoose.connStr);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var parseOpts = {
	delimiter: ',',
	trim: true,
	skip_empty_lines: true,
	columns: true
};

var codeRe = /([0-9]+)\.([0-9]+)\.([0-9]+)-?([0-9]+)?/;

function parseCode(code) {
	var o = {code: '', channel: '', category: '', num: '', subNum: ''};
	var match = codeRe.exec(code);
	if (!match) {
		o = null;
		console.log("Could not parse code from '%s'", code);
	} else {
		o.code = match[0];
		o.channel = match[1];
		o.category = match[2];
		o.num = match[3];
		if (match[4])
			o.subNum = match[4];
	}

	return o;
}


var numStepsRe = /^[0-9]+$/;

function createActivity(item) {
	var a = new ActivityModel();
	var code = parseCode(item.Code);
	if (code) {
		a.code = code.code;
		if (code.subNum) 
			a.rollupCode = util.format('%s.%s.%s', code.channel, code.category, code.num);
		a.channelNum = code.channel;
		a.channelDesc = CHANNELMAP[a.channelNum];
		a.categoryNum = code.category;
		a.categoryDesc = CATEGORYMAP[a.categoryNum];
		a.title = item.Activity;
		a.description = '';
        if (item['Roll-up?'] && item['Roll-up?'] === 'Y')
            a.rollup = true;
        else
            a.rollup = false;

		a.trackingType = item['Tracking Type'];

        if (a.trackingType === '%')
            a.trackingType = 'Percent';

		if (item['Steps are progressive?'] && 
            item['Steps are progressive?'] === 'Y')
			a.stepsAreProgressive = true;
		else
			a.stepsAreProgressive = false;

		// Add steps
		for (var i = 0; i < 5; i++) {
			var colId = util.format('Step %d', i+1);
			if (item[colId]) {
				var step = {stepNum: i+1, stepTitle: item[colId], stepDesc: ''};
				a.steps.push(step);
			}
		}
	} else {
		a = null;
	}

	return a;
}


function addActivity(item, callback) {
	var a = createActivity(item);
	if (a && a.trackingType) {
		a.save(function(err) { callback(err); });
	} else {
		callback(null);
	}
}


var parser = csv.parse(parseOpts, function(err, data) {
	console.log('Adding %d items', data.length);
	async.eachSeries(data, addActivity, function(err) {
		if (err) {
			console.error(err);
		}
		console.log('Done');
		mongoose.connection.close();
	});
});



function parseCsv(err, result) {
	console.log('Parse CSV');
	if (err) 
		console.error('Error: %s', err);
	else {
		fs.createReadStream(filename).pipe(parser);
	}
}

function deleteCollection(cb) {
	mongoose.connection.db.collections(function(err, results) {
		if (results.filter(function(c) { return c.collectionName === COLLNAME; }).length > 0) {
			console.log('Deleting %s', COLLNAME);
			mongoose.connection.db.dropCollection('activities', cb);
		} else {
			cb();
		}
	});
}

db.once('open', function (callback) {
	console.log('Connected');
	if (deleteExisting) {
		deleteCollection(parseCsv);
	} else {
		parseCsv();
	}
});
