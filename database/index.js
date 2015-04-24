var mongoose = require('mongoose');
var config = require('../config');
mongoose.connect('mongodb://'+config.mongodb.address+'/'+config.mongodb.nsp);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log('connected to database');
});