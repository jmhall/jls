var argParse = require('minimist');
var util = require('util');
var path = require('path');
var mongoose = require('mongoose');
var csv = require('csv');
var fs = require('fs');
var moment = require('moment');
var bluebird = require('bluebird');
var configMongoose = require('../server/configure/configMongoose');

var Teacher = require('../server/models/teacher');
var TrackingEntry = require('../server/models/trackingEntry');
var Student = require('../server/models/student');
var Activity = require('../server/models/activity');

//mongoose.set('debug', true);


// Constants
var DBNAME = 'test';

var sheetTypes = [
    '1 Check', 
    '3 Check Language', 
    '3 Check Steps', 
    'Percentage', 
    'YesNo'
];


function usage() {
    console.log(util.format('usage: %s <filename prefix>', path.basename(__filename, '.js')));
}

var argv = argParse(process.argv.slice(2));
var filenamePrefix = '';

if (argv._.length > 0) {
    filenamePrefix = argv._[0];
} else {
    console.log('%s', argv._);
    usage();
}

console.log(util.format('Using "%s"', filenamePrefix));
console.log(util.format('Using connStr: %s', configMongoose.connStr));

mongoose.connect(configMongoose.connStr);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));


var teachers = [
    {
        lookupInitials: 'AW',
        firstName: 'Allison',
        lastName: 'Williams'
    }, 

    {
        lookupInitials: 'BI',
        firstName: 'Bailey',
        lastName: 'Iggy'
    },

    {
        lookupInitials: 'BJM',
        firstName: 'Billy Joe',
        lastName: 'Martin'
    },

    {
        lookupInitials: 'CP',
        firstName: 'Charlie',
        lastName: 'Perkins'
    },

    {
        lookupInitials: 'EC',
        firstName: 'Edith',
        lastName: 'Collins'
    },

    {
        lookupInitials: 'EN',
        firstName: 'Edward',
        lastName: 'Naylor'
    },

    {
        lookupInitials: 'KD',
        firstName: 'Katie',
        lastName: 'Dee'
    },

    {
        lookupInitials: 'MN',
        firstName: 'Melissa',
        lastName: 'Nelly'
    },

    {
        lookupInitials: 'MRW',
        firstName: 'Mary Riley',
        lastName: 'Williams'
    },

    {
        lookupInitials: 'SDI',
        firstName: 'Sadie Dee',
        lastName: 'Ingrid'
    },

    {
        lookupInitials: 'SP',
        firstName: 'Sandy',
        lastName: 'Parker'
    },
];

var students = [
    {displayName: 'Charlotte F',
        firstName: 'Charlotte',
        lastName: 'F'}
];


function getParser(parseFilename) { 

    // Otherwise return a promise that parses the file
    var pStat = new mongoose.Promise();

    fs.stat(parseFilename, function(err) { 
        if(err) pStat.fulfill();
        pStat.fulfill(true);
    });

    var pParser = new mongoose.Promise();

    var parser = csv.parse({delimiter: ','}, function(err, data){
        if (err) pParser.reject(err);
        else pParser.fulfill(data);
    });

    return pStat.then(function(results) { 
        if (results) {
            fs.createReadStream(parseFilename).pipe(parser);
            return pParser;
        } else {
            return;
        }
    });
}

function removeData() {
    var rmTeacher = Teacher.remove();
    var rmEntry = TrackingEntry.remove();
    var rmStudent = Student.remove();

    return rmTeacher
    .then(function() { return rmEntry; })
    .then(function() { return rmStudent; });
}

function get1CheckTrackingData(step) {
    var stepNum = -1;
    var value = '';

    switch(step.toUpperCase()) {
        case 'PREVIOUSLY MASTERED':
            stepNum = 0;
        value = 'PM';
        break;
        case 'INTRODUCED':
            stepNum = 1;
        value = 'INTRODUCED';
        break;
        case 'MASTERED':
            stepNum = 1;
        value = 'MASTERED';
        break;
    } // switch
 
    return { stepNum: stepNum, value: value };
}

function getPercentageData(step) {
    var stepNum = -1;
    var value = '';

    step = parseInt(step);
    if (step < 21) {
        stepNum = 1;
    } else if (step < 41) {
        stepNum = 2;
    } else if (step < 61) {
        stepNum = 3;
    } else if (step < 81) {
        stepNum = 4;
    } else  {
        stepNum = 5;
    }
    
    value = '1';

    return { stepNum: stepNum, value: value };
}

function get3CheckLanguageTrackingData(step) {
    var stepNum = -1;
    var value = '';

    switch(step.toUpperCase()) {
        case 'PREVIOUSLY MASTERED':
            stepNum = 0;
        value = 'PM';
        break;
        case 'PREVIOUSLY INTRODUCED':
            stepNum = 0;
        value = 'PI';
        break;
        case 'INTRODUCED':
            stepNum = 0;
        value = 'INTRODUCED';
        break;
        case 'FO2 REVIEW':
            stepNum = 1;
        value = 'FO2 REVIEW';
        break;
        case 'FO2 MASTERED':
            stepNum = 1;
        value = 'FO2 MASTERED';
        break;
        case 'FO3 REVIEW':
            stepNum = 2;
        value = 'FO3 REVIEW';
        break;
        case 'FO3 MASTERED':
            stepNum = 2;
        value = 'FO3 MASTERED';
        break;
        case 'V1 REVIEW':
            stepNum = 3;
        value = 'V1 REVIEW';
        break;
        case 'V1 MASTERED':
            stepNum = 3;
        value = 'V1 MASTERED';
        break;
        case 'V2 REVIEW':
            stepNum = 4;
        value = 'V2 REVIEW';
        break;
        case 'V2 MASTERED':
            stepNum = 4;
        value = 'V2 MASTERED';
        break;
        case 'V3 REVIEW':
            stepNum = 5;
        value = 'V3 REVIEW';
        break;
        case 'V3 MASTERED':
            stepNum = 5;
        value = 'V3 MASTERED';
        break;
    }// switch

    return { stepNum: stepNum, value: value };
}

function createEntry(studentId, sheetType, row) {
    // Determine step number by looking at step
    // Determine value by looking at step

    var date = moment(row[0], 'M-D-YYYY');

    if (date > new Date(2015, 06, 04)){
        console.warn("Future date '%s' for %s", date, row[0]);
    }

    var activityCode = row[2];
    var teacherInitials = row[3];
    var step = row[4];

    var findActivity = Activity.findOne({'code': activityCode}, 'id trackingType').exec();
    var findTeacher = Teacher.findOne({'lookupInitials': teacherInitials}, 'id').exec();

    var entry = { 
        date: date.toDate(),
        studentId: studentId
    };


    return bluebird.Promise.join(findActivity, findTeacher, function(activity, teacher) {
        var returnVal = false;

        if (activity && teacher) {

            var trackingData = null;
            switch (sheetType) { 
                case '3 Check Language': 
                    trackingData = get3CheckLanguageTrackingData(step);
                    break;
                case '1 Check':
                    trackingData = get1CheckTrackingData(step);
                    break;
                case 'Percentage':
                    trackingData = getPercentageData(step);
                    break;
                default:
                    return returnVal;
            }

            if (trackingData.stepNum >= 0) {
                entry.activityId = activity.id;
                entry.trackingType = activity.trackingType;
                entry.teacherId = teacher.id;
                entry.trackingData = trackingData;

                returnVal = entry;
            } else { 
                console.error("Unable to convert '%s' to trackingData");
            }

        } else {

            if (!activity)
                console.error('Failed lookup for activity: %s', activityCode);
            if (!teacher)
                console.error('Failed lookup for teacher: %s', teacherInitials);

        }

        return returnVal;
    });
}

function getEntryPromises(studentId, sheetType, rows) {
    rows.shift(); // Drop 1st row since it has headers
    console.log('Getting promises for %s from %d rows', sheetType, rows.length);

    var createArray = rows.map(function(row) { 
        return createEntry(studentId, sheetType, row);
    });

    return createArray;
}

// Starts here
db.once('open', function(callback) {
    console.log('Connected');

    removeData().then(function() {
        console.log('Done with removing');
    })
    .then(function() {
        return Teacher.create(teachers);
    })
    .then(function() {
        return Student.create(students);
    })
    .then(function(results) {
        var parseArray = sheetTypes.map(function(value) {
            filename = util.format('%s%s.csv', filenamePrefix, value);
            return getParser(filename);
        });

        return bluebird.Promise.all(parseArray);
    })
    .then(function(parseResults) {
        returnObj = { parseResults: parseResults };

        // Get student ID
        return Student.findOne().then(function(student) { 
            returnObj.student = student;

            return returnObj;
        });
    })
    .then(function(returnObj) {
        if (!returnObj)
            throw new Error('No returnObj');
        else if (!returnObj.parseResults) 
            throw new Error('No returnObj.parseResults');
        else if (!returnObj.student) 
            throw new Error('No returnObj.student');

        studentId = returnObj.student.id;
        results = returnObj.parseResults;


        // We have an array of parsed results, with array entry index corresponding 
        // to sheetTypes entry.

        createEntriesArray = results.map(function(parsedResults, index) {
            var sheetType = sheetTypes[index];
            if (parsedResults) {
                console.log('%s - %s rows returned', sheetType, parsedResults.length);
                return getEntryPromises(studentId, sheetType, parsedResults);
            } else {
                return;
            }
        });

        return createEntriesArray;

        //return bluebird.Promise.all(reviewParsedDataArray);
    })
    .then(function(createEntriesArray) {
        // So we need to do something here with all of the promises
        
        var allCreateEntryPromises = [];
        for (var i = 0; i < createEntriesArray.length; i++) {
            if (createEntriesArray[i])
                allCreateEntryPromises = allCreateEntryPromises.concat(createEntriesArray[i]);
        }
        console.log('Queueing %d promises', allCreateEntryPromises.length);
        return bluebird.Promise.all(allCreateEntryPromises);
    })
    .then(function(results) {
        var validResults = results.filter(function(value) { return value ? true : false; });
        console.log('%s valid results', validResults.length);
        return TrackingEntry.create(validResults);
    })
    .then(function() {
        console.log('Done with program');
        mongoose.connection.close();
    });
});
