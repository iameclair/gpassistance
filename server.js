/* ============================================
    Import Node Modules
 ==============================================*/

const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');
const path = require('path');
const authentication = require('./routes/authentication')(router);
const information = require('./routes/information')(router);
const administration = require('./routes/administration')(router);
const staff = require('./routes/staff')(router);
const appointment = require('./routes/appointment')(router);
const medicalHistory = require('./routes/medicalhistory')(router);
const prescription = require('./routes/medicalhistory')(router);
const contact = require('./routes/contact')(router);
const bodyParser = require('body-parser');


/*==================================================================
    database connection
 ===================================================================*/

mongoose.Promise = global.Promise;
mongoose.connect(config.uri, (err) =>{
    if (err) {
        console.log('Could not connect to the database: ', err);
    }else {
        console.log('Connected to database: ', config.db);
}
});

/*==================================================================
 middle ware
 ===================================================================*/
app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client/dist/'));
app.use('/authentication', authentication);
app.use('/information', information);
app.use('/admin', administration);
app.use('/staff', staff);
app.use('/appointment', appointment);
app.use('/medhistory', medicalHistory);
app.use('/prescription', prescription);
app.use('/contact', contact);
/*==================================================================
 connect server to angular
 ===================================================================*/
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});

/*==================================================================
 Connect to local server
 ===================================================================*/
app.listen(8080, ()=> {
    console.log('Listening on port 8080');
});