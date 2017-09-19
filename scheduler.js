const CronJob = require('cron').CronJob;
const scheduler = require('node-schedule');
const notificationsWorker = require('./worker/notificationsWorker');
const moment = require('moment');


/*let minJob = scheduler.scheduleJob('* * * * *', function(){
    console.log('I run the first day of the month');
});*/

const schedulerFactory = function() {
    return {
        start: function() {
            new CronJob('* * * * *', function() {
                notificationsWorker.run();
            }, null, true, '');
        },
    };
};

module.exports = schedulerFactory();
