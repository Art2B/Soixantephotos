// Require npm modules
var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var mongoose = require('mongoose');

var router = express.Router();

// Mongoose Schema
var imagesSchema = require('../database/schemas/image');
var categorySchema = require('../database/schemas/category');
var Image = mongoose.model('Image', imagesSchema);
var Category = mongoose.model('Category', categorySchema);
var User = require('../database/models/user');

// GET Routes
router.get('/', function(req, res) {
  if(req.user){
    res.redirect('/admin/dashboard');
  } else {
    User.find({}, function(err, users){
      if(err) res.status(500).send('Something goes wrong: ',err);
      if(users.length > 0){
        res.render('admin/index', {message: req.flash('loginMessage')});
      } else {
        res.redirect('admin/signup');
      }
    });
  }
});
router.get('/signup', function(req, res){
  res.render('admin/signup', {message: req.flash('signupMessage')});
});
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
router.get('/dashboard', function(req, res){
  if(req.user){
    res.render('admin/dashboard', {user: req.user});
  } else {
    res.redirect('/admin/');
  }
});
router.get('/photos/verify', function(req, res){
  if(req.user){
    User.findOne(req.user, function(err, user){
      if(err) res.status(500).send('Something goes wrong: ',err);
      if(user.rank === 'admin'){
        Image.find({verified: false}, function(err, photos){
          if(err) console.log(err);
          res.render('admin/photos/verify', {photos: photos});
        });
      } else {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
});
router.get('/photos/all', function(req, res) {
  if(req.user){
    Image
    .find({})
    .populate('category')
    .exec(function(err, images){
      if(err){
        throw err;
      }
      res.render('admin/photos/all', {photos: images});
    });
  } else {
    res.redirect('/');
  }
});


// POST Routes
router.post('/login', passport.authenticate('login', {
    successRedirect : 'dashboard',
    failureRedirect : '/admin',
    failureFlash : true
}));
router.post('/signup', passport.authenticate('signup', {
  successRedirect : 'dashboard',
  failureRedirect : 'signup',
  failureFlash : true
}));

// PUT Routes
router.put('/verify/:id', function(req, res){
  Image.findOne({_id: req.params.id}, function(err, image){
    if(err){
      res.status(500).send('VERIFY: Can\'t find image: ',err);
      return console.error(err);
    }
    image.verified = true;
    if(req.body.nsfw === 'true') image.nsfw = true;
    image.save(function(err, data){
      if(err) res.status(500).send('VERIFY: Error in updating image: ', err);
      res.status(200).send('Image verified');
    })
  });
});

/* DELETE ROUTES */
router.delete('/photos/clear', function(req, res){
  new Promise(function(fulfill, reject){
    Image.remove({}, function(err){
      if(err){
        res.status(500).send('Something goes wrong: ',err);
        reject(err);
      } else {
        fulfill();
      }
    })
  })
  .then(function(){
    Category.remove({}, function(err){
      if(err){
        res.status(500).send('Something goes wrong: ',err);
        return console.error(err);
      }
      res.status(200).send('Delete all database');
    });
  });
});
router.delete('/photos/clear/:category', function(req, res){
  Category
  .findOne({name: req.params.category})
  .populate('photos')
  .exec(function(err, category){
    var nbPhotos = category.photos.length;

    new Promise(function(fulfill, reject){
      category.photos.forEach(function(photo, key){
        Image.remove(photo, function(err){
          if(err){
            res.status(500).send('Something goes wrong: ',err);
            console.error(err);
          }
          console.log('Image deleted'.red);
          if(key == nbPhotos-1){
            fulfill();
          }
        });
      });
    })
    .then(function(){
      Category.remove({name: req.params.category}, function(err){
        if(err){
          res.status(500).send('Something goes wrong: ',err);
          console.error(err);
        } else {
          res.status(200).send('Delete all category\'s images');
        }
      });
    })
  });
});


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;