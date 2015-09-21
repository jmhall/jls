var JsonApiSerializer = require('jsonapi-serializer');
var url = require('url');
var util = require('util');

function StudentActivitySerializer(studentActivity, baseUrl) {
    this.serialize = function() {

        return new JsonApiSerializer(
            'student-activities',
            studentActivity, {
                attributes: [
                    'startDate',
                    'endDate',
                    'student'
                ],
                student: {
                    ref: 'id',
                    included: false,
                    attributes: []
                },
                dataLinks: {
                    self: function(sa) {
                        return util.format('%s/student-activities/%s', baseUrl, sa.id);
                    }
                }
            }
        );

    };
}

module.exports = StudentActivitySerializer;
