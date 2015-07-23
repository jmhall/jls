var connectRedis = require('connect-redis');

module.exports = function(session) {
    var RedisStore = connectRedis(session);
    var redisHost = process.env.REDIS_HOST || 'localhost';
    var redisPort = process.env.REDIS_PORT || 6379;
    var redisPassword = process.env.REDIS_PASSWORD || '';

    var redisOptions = {
        host: redisHost,
        port: redisPort,
        pass: redisPassword
    };

    return new RedisStore(redisOptions);
};
