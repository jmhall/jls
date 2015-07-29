var argParse = require('minimist');
var csv = require('csv');
var path = require('path');
var util = require('util');
var models = require('../server/models');
var fs = require('fs');
var bPromise = require('bluebird');

var channels = [
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

var categories = [
    null,
    'Therapeutic',
    'Neurodevelopmental',
    'ILT',
    'LERP'
];

var parseOpts = {
	delimiter: ',',
	trim: true,
	skip_empty_lines: true,
	columns: true
};


var usage = function() {
    console.log(util.format('usage: %s [options] <filename>', path.basename(__filename, '.js')));
};
var argv = argParse(process.argv.slice(2));

var filename = '';
if (argv._.length > 0) {
    filename = argv._[0];
} else {
    console.log('%s', argv._);
    usage();
    process.exit(1);
}

console.log(util.format('Using "%s"', filename));

function CreateCategories() {
    return models.ActivityCategory.count().then(function(count) {
        if (count > 1) {
            console.log('Skipping category creation');
            return;
        }

        var categoryObjects = categories.map(function(category, index) {
            if (category) {
                return { categoryNum: index, description: category };
            }
        }).filter(function(item) { return item; });

        return models.ActivityCategory.bulkCreate(categoryObjects);
    });
}

function CreateChannels() {
    return models.ActivityChannel.count().then(function(count) {
        if (count > 1) {
            console.log('Skipping channel creation');
            return;
        }

        var channelObjects = channels.map(function(channel, index) {
            if (channel) {
                return { channelNum: index, description: channel };
            }
        }).filter(function(item) { return item; });

        return models.ActivityChannel.bulkCreate(channelObjects);
    });
}

function getParser(filename) {
    return new bPromise(function(resolve, reject) {
        var parser = csv.parse(parseOpts, function(err, data) {
            if (err) 
                reject(err);
            else
                resolve(data);
        });

        fs.createReadStream(filename).pipe(parser);
    });
}

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

function getCreatePromise(row) {
    var a = {};
    var code = parseCode(row.Code);
    if (code) {
        a.code = code.code;
        // TODO: parent activities
        a.title = row.Activity;

        return models.Activity.create(a);
    } else {
        return;
    }

}

models.Activity.truncate().then(function(count) {
    console.log('Deleted %d activities', count || 0);
}).then(function() {
    return CreateCategories();
}).then(function() {
    return CreateChannels();
}).then(function() {
    return getParser(filename);
}).then(function(results) {
    console.log('Parsed %d rows', results.length);

    var activities = results.map(function(row) {
        return getCreatePromise(row);
    }).filter(function(item) { return item; });

    return bPromise.all(activities);
}).catch(function(err) {
    console.error('Error: %s', err);
}).then(function() {
    models.sequelize.close();
});
