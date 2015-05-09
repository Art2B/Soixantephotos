global.globals = {
  directory: __dirname
};

var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer');
var sass = require('node-sass');
var colors = require('colors');

var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');

var db = require('./database/index.js');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + /public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/photos', photos);
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Sass compiler
compileSass();

fs.watch('sass/', function(event, filename){
  console.log('Sass files changed'.cyan);
  compileSass();
});

function compileSass(){
  sass.render({
    file: 'sass/main.scss',
    outFile: 'public/css/style.css',
    // outputStyle: 'compressed'
  }, function(err, result) {
    fs.writeFile('public/css/style.css', result.css, function(err){
      if(err) console.log('Error in compiling sass: ', err);
      else console.log('Sass compiled'.cyan);
    });
  });
}

module.exports = app;
