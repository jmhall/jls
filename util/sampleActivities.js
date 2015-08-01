var argParse = require('minimist');
var util = require('util');
var path = require('path');
var csv = require('csv');
var fs = require('fs');
var moment = require('moment');
var bPromise = require('bluebird');

var models = require('../server/models'); 

var sheetTypes = [
    '1 Check', 
    '3 Check Language', 
    '3 Check Steps', 
    'Percentage', 
    'YesNo'
];

var parseOpts = {
	delimiter: ',',
	trim: true,
	skip_empty_lines: true,
	columns: true
};

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

var teachers = [
    {
        lookupInitials: 'AW',
        firstName: 'Allison',
        lastName: 'Williams',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    }, 

    {
        lookupInitials: 'BI',
        firstName: 'Bailey',
        lastName: 'Iggy',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },
    {
        lookupInitials: 'BJM',
        firstName: 'Billy Joe',
        lastName: 'Martin',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'CP',
        firstName: 'Charlie',
        lastName: 'Perkins',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'EC',
        firstName: 'Edith',
        lastName: 'Collins',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'EN',
        firstName: 'Edward',
        lastName: 'Naylor',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'KD',
        firstName: 'Katie',
        lastName: 'Dee',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'MN',
        firstName: 'Melissa',
        lastName: 'Nelly',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'MRW',
        firstName: 'Mary Riley',
        lastName: 'Williams',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'SDI',
        firstName: 'Sadie Dee',
        lastName: 'Ingrid',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },

    {
        lookupInitials: 'SP',
        firstName: 'Sandy',
        lastName: 'Parker',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    },
];

var students = [
    {
        displayName: 'Charlotte F',
        firstName: 'Charlotte',
        lastName: 'F',
        startDate: moment().subtract(1, 'days').startOf('day').toDate()
    }
];

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

function removeData() {
    var rmTeacher = models.Teacher.destroy({ truncate: true, cascade: true });
    //var rmEntry = TrackingEntry.remove();
    var rmStudent = models.Student.destroy({ truncate: true, cascade: true });

    return rmStudent
    .then(function() { return rmTeacher; });
    //.then(function() { return rmStudent; });
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


    return bPromise.Promise.join(findActivity, findTeacher, function(activity, teacher) {
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

removeData().then(function() {
    console.log('Done with removing');
})
.then(function() {
    return models.Teacher.bulkCreate(teachers);
})
.then(function() {
    return models.Student.bulkCreate(students);
})
.then(function(results) {
    var parseArray = sheetTypes.map(function(value) {
        filename = util.format('%s%s.csv', filenamePrefix, value);
        return getParser(filename);
    });

    return bPromise.Promise.all(parseArray);
})
.then(function(parseResults) {
    returnObj = { parseResults: parseResults };

    // Get student ID
    return models.Student.findOne().then(function(student) { 
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

    //createEntriesArray = results.map(function(parsedResults, index) {
        //var sheetType = sheetTypes[index];
        //if (parsedResults) {
            //console.log('%s - %s rows returned', sheetType, parsedResults.length);
            //return getEntryPromises(studentId, sheetType, parsedResults);
        //} else {
            //return;
        //}
    //});

    //return createEntriesArray;
})
.then(function(createEntriesArray) {
    // So we need to do something here with all of the promises
    
    var allCreateEntryPromises = [];
    //for (var i = 0; i < createEntriesArray.length; i++) {
        //if (createEntriesArray[i])
            //allCreateEntryPromises = allCreateEntryPromises.concat(createEntriesArray[i]);
    //}
    console.log('Queueing %d promises', allCreateEntryPromises.length);
    //return bluebird.Promise.all(allCreateEntryPromises);
})
//.then(function(results) {
    //var validResults = results.filter(function(value) { return value ? true : false; });
    //console.log('%s valid results', validResults.length);
    //return TrackingEntry.create(validResults);
//})
.finally(function() {
    console.log('Done with program');
    models.sequelize.close();
});
