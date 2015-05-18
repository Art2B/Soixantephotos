// Require npm modules
var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');

var router = express.Router();

router.get('/', function(req, res) {
  res.render('admin/index');
});
router.get('/login', function(req, res){
  res.render('admin/login', {message: req.flash('loginMessage')});
});
router.get('/signup', function(req, res){
  res.render('admin/signup', {message: req.flash('signupMessage')});
});
router.get('/profile', function(req, res){
  res.render('admin/profile', {
    user: req.user
  });
});
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// app.post('/login', do all our passport stuff here);
// app.post('/signup', do all our passport stuff here);


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;