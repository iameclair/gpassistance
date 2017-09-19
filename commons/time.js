const config = require('config');
const app_timezone = config.get('app.timezone');
const moment = require('moment-timezone');
moment.tz.setDefault(app_timezone);

exports.config = {
    timezone: app_timezone
};

exports.moment = moment;