var mongoose = require('mongoose');
var colors = require('colors');
var config = require('../config');
mongoose.connect('mongodb://'+config.mongodb.address+'/'+config.mongodb.nsp);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log('Connected to database'.green);
});