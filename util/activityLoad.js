var argParse = require('minimist');
var csv = require('csv');
var path = require('path');
var util = require('util');
var models = require('../server/models');
var fs = require('fs');
var bbPromise = require('bluebird');

var codeRe = /([0-9]+)\.([0-9]+)\.([0-9]+)-?([0-9]+)?/;


var trackingTypes = [
	'3 CHECK', 
	'1 CHECK', 
	'% X25', 
	'% X5', 
	'% X4', 
	'% X3', 
	'Y/N', 
	'S/S', 
	'TIME',
    'TAT',
    'LOI',
    'WKBK',
	'UNKNOWN'
];


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

function createCategories() {
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

function createChannels() {
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

function createTrackingTypes() {
    return models.TrackingType.count().then(function(count) {
        if (count > 1) {
            console.log('Skipping tracking type creation');
            return;
        }

        var typeObjects = trackingTypes.map(function(type, index) {
            if (type) {
                return { code: type, name: '' };
            }
        }).filter(function(item) { return item; });

        return models.TrackingType.bulkCreate(typeObjects);
    });
}

function getParser(filename) {
    return new bbPromise(function(resolve, reject) {
        var parser = csv.parse(parseOpts, function(err, data) {
            if (err) 
                reject(err);
            else
                resolve(data);
        });

        fs.createReadStream(filename).pipe(parser);
    });
}

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

function getCreateStepPromise(activity, stepNum, title) {
    var s = models.ActivityStep.build({
        stepNum: stepNum,
        title: title
    });

    s.setActivity(activity, { save: false });

    return s.save();
}

var getTrackingType = (function() {
    var cache = {};
    return function(rowTrackingType) {

        if (!cache.hasOwnProperty(rowTrackingType)) {
            cache[rowTrackingType] = models.TrackingType.findOne({
                where: { code: rowTrackingType }
            });
        }

        return cache[rowTrackingType];
    };
})();

var getCategory = (function() {
    var cache = {};
    return function(rowCategory) {
        
        if (!cache.hasOwnProperty(rowCategory)) {
            cache[rowCategory] = models.ActivityCategory.findOne({
                where: { categoryNum: rowCategory }
            });
        }

        return cache[rowCategory];
    };
})();

var getChannel = (function(rowChannel) {
    var cache = {};
    return function(rowChannel) {
        
        if (!cache.hasOwnProperty(rowChannel)) {
            cache[rowChannel] = models.ActivityChannel.findOne({
                where: { channelNum: rowChannel }
            });
        }

        return cache[rowChannel];
    };
})();

function getCreatePromise(row) {
    var code = parseCode(row.Code);
    if (code) {
        var a = models.Activity.build({ title: row.Activity, code: code.code });

        a.code = code.code;
        a.title = row.Activity;

        var rowTrackingType = row['Tracking Type'].toUpperCase();

        return bbPromise.join(
            getTrackingType(rowTrackingType), 
            getChannel(code.channel), 
            getCategory(code.category), 
            function(trackingType, channel, category) { 
                if (trackingType)
                    a.setTrackingType(trackingType, { save: false });
                else
                    console.error('No tracking type returned for %s', row['Tracking Type']);

                if (channel) 
                    a.setActivityChannel(channel, { save: false });
                else
                    console.error('No channel returned for %s', code.channel);

                if (category)
                    a.setActivityCategory(category, { save: false });
                else
                    console.error('No category returned for %s', code.category);

                return a;
        }).then(function(a) {
            if (a.code) 
                return a.save().then(function(a) { 
                    // Need to add a 'Step 0' for 'Introduced'
                    var promises = [];

                    var s0 = models.ActivityStep.build({
                        stepNum: 0,
                        title: 'Introduced',
                        description: 'Introduced'
                    });

                    s0.setActivity(a, { save: false });

                    promises.push(s0.save());

                    // Add steps
                    if (!row['Step 1']) {
                        var s1 = models.ActivityStep.build({
                            stepNum: 1,
                            title: 'Step 1',
                            description: ''
                        });

                        s1.setActivity(a, { save: false });

                        promises.push(s1.save());
                    } else {
                        // need to add steps 1 - 5 where 2 - 5 might or might not exist
                        for (var i = 1; i < 6; i++) {
                           var colName = util.format('Step %d', i);
                           if (row[colName]) {
                               promises.push(getCreateStepPromise(a, i, row[colName]));
                           }
                        }
                    }

                    return bbPromise.all(promises);
               });
        }).catch(function(err) {
            console.error('Error during createPromise creation: %s', err);
        });
    } else {
        return;
    }

}

var getParentActivity = (function() {
    var cache = {};
    return function(code) {

        if (!cache.hasOwnProperty(code)) {
            cache[code] = models.Activity.findOne({
                where: { code: code }
            });
        }

        return cache[code];
    };
})();

/* Everything starts here */

models.Activity.destroy({ truncate: true, cascade: true }).then(function(count) {
    console.log('Deleted %d activities', count || 0);
}).then(function() {
    return createCategories();
}).then(function() {
    return createChannels();
}).then(function() {
    return createTrackingTypes();
}).then(function() {
    return getParser(filename);
}).then(function(results) {
    console.log('Parsed %d rows', results.length);

    var activities = results.map(function(row) {
        return getCreatePromise(row);
    }).filter(function(item) { return item; });

    return bbPromise.all(activities);
}).then(function() {
    return models.Activity.findAll({
        where: {
            code: {
                $like: '%-%'
            }
        }
    }).then(function(rows) {
        console.log('%s rows with parents', rows.length);

        var promises = rows.map(function(row) {
            var match = codeRe.exec(row.code);
            if (!match) {
                throw new Error("Failed to parse code from " + row.code);
            } else {
                var parentCode = util.format('%s.%s.%s', match[1], match[2], match[3]);
                return getParentActivity(parentCode)
                    .then(function(parentActivity) {
                        return row.setParentActivity(parentActivity);
                    });
            }
        });

        return bbPromise.all(promises);
    });
}).catch(function(err) {
    console.error('Error: %s', err);
}).then(function() {
    models.sequelize.close();
});
