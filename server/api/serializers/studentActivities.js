var JsonApiSerializer = require('jsonapi-serializer');

function StudentActivitySerializer(studentActivity) {
    this.serialize = function() {
        return new JsonApiSerializer(
            'student-activities', 
            studentActivity, {
                attributes: [
                    'startDate',
                    'endDate'
                ],
                student: {
                    ref: 'id'
                }
            }
        );

    };
}

module.exports = StudentActivitySerializer;
