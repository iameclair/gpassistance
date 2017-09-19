const config = require('config');
const google_config = config.get('google');

const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(google_config.client_id, google_config.client_secret, google_config.redirect_uri);

const calendar = google.calendar('v3');

exports.oauth2Client = oauth2Client;
exports.calendar = calendar;
exports.config = google_config;