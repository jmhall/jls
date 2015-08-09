'use strict';

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

function getYesNoTrackingData(step) {
    var stepNum = -1;
    var value = '';

    switch(step.toUpperCase()) {
        case 'YES':
            stepNum = 1;
        value = 'YES';
        break;
        case 'NO':
            stepNum = 1;
        value = 'NO';
        break;
    } // switch
 
    return { stepNum: stepNum, value: value };
}

function get1CheckTrackingData(step) {
    var stepNum = -1;
    var value = '';

    switch(step.toUpperCase()) {
        case 'PREVIOUSLY MASTERED':
            stepNum = 1;
        value = 'PM';
        break;
        case 'INTRODUCED':
            stepNum = 0;
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
        value = '1';
    } else if (step < 41) {
        stepNum = 2;
        value = '1';
    } else if (step < 61) {
        stepNum = 3;
        value = '1';
    } else if (step < 81) {
        stepNum = 4;
        value = '1';
    } else  {
        stepNum = 5;
        value = '1';
    }
    
    value = '1';

    return { stepNum: stepNum, value: value };
}

function get3CheckLanguageTrackingData(step) {
    var stepNum = -1;
    var value = '';

    switch(step.toUpperCase()) {
        case 'PREVIOUSLY MASTERED':
            stepNum = 5;
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
        value = 'REVIEW';
        break;
        case 'FO2 MASTERED':
            stepNum = 1;
        value = 'MASTERED';
        break;
        case 'FO3 REVIEW':
            stepNum = 2;
        value = 'REVIEW';
        break;
        case 'FO3 MASTERED':
            stepNum = 2;
        value = 'MASTERED';
        break;
        case 'V1 REVIEW':
            stepNum = 3;
        value = 'REVIEW';
        break;
        case 'V1 MASTERED':
            stepNum = 3;
        value = 'MASTERED';
        break;
        case 'V2 REVIEW':
            stepNum = 4;
        value = 'REVIEW';
        break;
        case 'V2 MASTERED':
            stepNum = 4;
        value = 'MASTERED';
        break;
        case 'V3 REVIEW':
            stepNum = 5;
        value = 'REVIEW';
        break;
        case 'V3 MASTERED':
            stepNum = 5;
        value = 'MASTERED';
        break;
    }// switch

    return { stepNum: stepNum, value: value };
}

function get3CheckStepsTrackingData(step) {
    var stepNum = -1;
    var value = '';

    switch(step.toUpperCase()) {        
        case 'PREVIOUSLY INTRODUCED':
            stepNum = 0;
        value = 'PI';
        break;
        case 'INTRODUCED':
            stepNum = 0;
        value = 'INTRODUCED';
        break;
        case 'STEP 1':
            stepNum = 1;
        value = 'MASTERED';
        break;
        case 'STEP 2':
            stepNum = 2;
        value = 'MASTERED';
        break;
        case 'STEP 3':
            stepNum = 3;
        value = 'MASTERED';
        break;
        case 'STEP 4':
            stepNum = 4;
        value = 'MASTERED';
        break;
    }// switch

    return { stepNum: stepNum, value: value };
}

function createEntry(studentId, sheetType, row) {
    // Determine step number by looking at step
    // Determine value by looking at step
    var date = moment(row.Date, 'M-D-YYYY');

    if (date > new Date(2015, 6, 4)){
        console.warn("Future date '%s' for %s", date, row[0]);
    }

    var activityCode = row.Code;
    var teacherInitials = row["Teacher's Initials"];
    var step = row.Step;

    var findActivity = models.Activity.findOne({
        where: { code: activityCode }
    });
    var findTeacher = models.Teacher.findOne({
        where: { lookupInitials: teacherInitials }
    });

    var entry = { 
        date: date.toDate(),
        studentId: studentId
    };

    return bPromise.Promise.join(findActivity, findTeacher, function(activity, teacher) {
        var returnVal = false;

        if (activity && teacher) {

            // At this point we have an activity ID, a teacher ID.  Need an 
            // activity step ID, which depends on what data was entered
            // for the activity and what type of measure is used for the activity.

            var stepData = null;
            switch (sheetType) { 
                case '3 Check Language': 
                    stepData = get3CheckLanguageTrackingData(step);
                    break;
                case '1 Check':
                    stepData = get1CheckTrackingData(step);
                    break;
                case 'Percentage':
                    stepData = getPercentageData(step);
                    break;
                case 'YesNo':
                    stepData = getYesNoTrackingData(step);
                    break;
                case '3 Check Steps':
                    stepData = get3CheckStepsTrackingData(step);
                    break;
                default:
                    return returnVal;
            }

            if (stepData.stepNum >= 0) {
                entry.teacherId = teacher.id;

                return models.ActivityStep.findOne({ 
                    where: {stepNum: stepData.stepNum, activityId: activity.id }
                }).then(function(activityStep) {
                    if (!activityStep) {
                        console.error('Failed lookup for %s, %s', stepData.stepNum, activity.id);
                        return;
                    }
                    var newEntry = models.TrackingEntry.build();
                    newEntry.date = entry.date;
                    newEntry.value = stepData.value;
                    newEntry.setActivityStep(activityStep.id, { save: false });
                    newEntry.setStudent(entry.studentId, { save: false });
                    newEntry.setTeacher(entry.teacherId, { save: false });

                    return newEntry.save().catch(function(err) {
                        console.error('Error: %s', err);
                    });
               });
            } else { 
                console.error("Unable to convert '%s' to stepData");
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
    console.log("Getting promises for '%s' from %d rows", sheetType, rows.length);

    var createArray = rows.map(function(row) { 
        return createEntry(studentId, sheetType, row);
    });

    // Should have array of promises that resolve to new entries here

    return createArray;
}


function createTeachers() {
    return models.Teacher.count().then(function(count) { 
        if (count === 0) {
            return models.Teacher.bulkCreate(teachers);
        } else {
            console.log('Skipping teacher creation');
            return;
        }
    });
}

function createStudents() {
    return models.Student.count().then(function(count) { 
        if (count === 0) {
            return models.Student.bulkCreate(students);
        } else {
            console.log('Skipping student creation');
            return;
        }
    });
}


// Starts here 

//var promise = new bPromise(function(resolve, reject) {
    //resolve();
//});

//promise
models.TrackingEntry.destroy({truncate: true})
.then(function() {
    return createTeachers();
})
.then(function() {
    return createStudents();
})
.then(function(results) {
    var parseArray = sheetTypes.map(function(value) {
        var filename = util.format('%s%s.csv', filenamePrefix, value);
        return getParser(filename);
    });

    return bPromise.Promise.all(parseArray);
})
.then(function(parseResults) {
    var returnObj = { parseResults: parseResults };

    // parseResults is:
    // array[index for sheetTypes] = parsedResults

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

    var studentId = returnObj.student.id;
    var results = returnObj.parseResults;

    var createEntriesArray = results.map(function(parsedResults, index) {
        // Find type of results we've parsed
        var sheetType = sheetTypes[index];

        if (parsedResults) {
            console.log('%s - %s rows returned', sheetType, parsedResults.length);
            return getEntryPromises(studentId, sheetType, parsedResults);
        } else {
            return;
        }
    });

    // At this point we have an array of arrays, where the inner arrays hold
    // promises to create tracking entries.
    return createEntriesArray;
})
.then(function(createEntriesArray) {
    // So we need to do something here with all of the promises
    
    var allCreateEntryPromises = [];
    for (var i = 0; i < createEntriesArray.length; i++) {
        if (createEntriesArray[i])
            allCreateEntryPromises = allCreateEntryPromises.concat(createEntriesArray[i]);
    }
    console.log('Queueing %d promises', allCreateEntryPromises.length);
    return bPromise.all(allCreateEntryPromises);
})
.then(function(results) {
    var validResults = results.filter(function(value) { return value ? true : false; });
    console.log('%s valid results', validResults.length);

    //return models.TrackingEntry.create(trackingEntries);
})
.finally(function() {
    console.log('Done with program');
    models.sequelize.close();
});
