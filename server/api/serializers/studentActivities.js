var JsonApiSerializer = require('jsonapi-serializer');

function StudentActivitySerializer(studentActivity) {
    this.serialize = function() {
        return new JsonApiSerializer(
            'student-activities', 
            studentActivity, {
                attributes: [
                    'student',
                    'activity'
                ],
                student: {
                    ref: 'id'
                }
            }
        );

    };
}

module.exports = StudentActivitySerializer;
