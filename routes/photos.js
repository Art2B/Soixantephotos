var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var multer  = require('multer');
var uuid = require('uuid');
var im = require('imagemagick');
var im = require('imagemagick');
var Promise = require('promise');

// Mongoose Schema
var imagesSchema = require('../database/image');
var categorySchema = require('../database/category');

var Image = mongoose.model('Image', imagesSchema);
var Category = mongoose.model('Category', categorySchema);
var router = express.Router();

/* GET ROUTES */
router.get('/', function(req, res) {
  res.render('photos/index');
});
router.get('/new', function(req, res){
  res.render('photos/new');
})

router.get('/:id', function(req, res){
  Image.findOne({_id: req.params.id}, function(err, photo){
    if(err){
      res.status(404).send('Photo not found');
    } else {
      res.contentType(photo.img.contentType);
      res.status(200).send(photo.img.data);
    }
  });
});

/* POST ROUTES */
router.post('/new', multer({
  dest: './uploads/',
  changeDest: function(dest, req, res) {
      var newDestination = dest + 'images/';
      var stat = null;
      try {
          stat = fs.statSync(newDestination);
      } catch (err) {
          fs.mkdirSync(newDestination);
      }
      if (stat && !stat.isDirectory()) {
          throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
      }
      return newDestination;
  },
  rename: function (fieldname, filename, req, res) {
    return filename.replace(/\W+/g, '-').toLowerCase() + uuid.v4();
  }
}),  function(req, res, next){
  console.log(req.body);
  // new Promise(function(fulfill, reject){
  //   im.identify(globals.directory +'/'+ req.files.image.path, function(err, features){
  //     if(err) reject(err);
  //     else {
  //       fulfill(features);
  //     }
  //   });
  // })
  // .then(function(features){
  //   return new Promise(function(fulfill, reject){
  //     if(features.height > 1920 || features.widht > 1920){
  //       console.log('if');
  //       var size = {};
  //       if(features.height > features.width){
  //         size.height = 1920;
  //         size.width = 1920/(features.height/features.width);
  //       } else {
  //         size.height = 1920/(features.height/features.width);
  //         size.widht = 1920;
  //       }
  //       im.resize({
  //         srcPath: globals.directory +'/'+ req.files.image.path,
  //         dstPath: globals.directory +'/'+ req.files.image.path,
  //         width: size.width,
  //         height: size.height,
  //         quality: 1,
  //       }, function(err){
  //         if(err) reject(err);
  //         else {
  //           im.identify(globals.directory +'/'+ req.files.image.path, function(err, features){
  //             fulfill(features);
  //           });
  //         }
  //       });
  //     } else {
  //       fulfill(features);
  //     }
  //   });
  // })
  // .then(function(features){
  //   return new Promise(function(fulfill, reject){
  //     console.log(req.body.category);
  //     Category.findOne({name: req.body.category}, function(err, doc){
  //       if(err) reject(err);
  //       else fulfill({category: doc, features: features});
  //     });
  //   });
  // })
  // .then(function(result){
  //   return new Promise(function(fulfill, reject){
  //     if(!result.category){
  //       new Category({
  //         name: req.body.category
  //       }).save(function(err, data){
  //         if(err) reject(err);
  //         else fulfill({category: data, features: result.features});
  //       });
  //     } else {
  //       fulfill({category: result.category, features: result.features});
  //     }
  //   });
  // })
  // .then(function(result){
  //   return new Promise(function(fulfill, reject){
  //     fulfill(new Image({
  //       name: req.files.image.originalname,
  //       category: result.category,
  //       sfw: req.body.sfw,
  //       img: {
  //         data: fs.readFileSync(globals.directory +'/'+ req.files.image.path),
  //         contentType: req.files.image.mimetype,
  //         size: {
  //           height: result.features.height,
  //           width: result.features.width
  //         }
  //       }
  //     }));
  //   });
  // })
  // .then(function(image){
  //   image.save(function(err, data){
  //     if(err){
  //       res.status(500).send('Something goes wrong: ',err);
  //       return console.error(err);
  //     }
  //     fs.unlink(globals.directory +'/'+ req.files.image.path);
  //     console.log('image saved :)');
  //     res.status(201).send('Image saved');
  //   });
  // });
});

/* DELETE ROUTES */
router.delete('/clear', function(req, res){
  Image.remove({}, function(err){
    if(err){
      res.status(500).send('Something goes wrong: ',err);
      return console.error(err);
    }
    res.status(200).send('Delete all database');
  })
});
router.delete('/category/clear', function(req, res){
  Category.remove({}, function(err){
    if(err){
      res.status(500).send('Something goes wrong: ',err);
      return console.error(err);
    }
    res.status(200).send('Delete all database');
  });
});
router.delete('/clear/:category', function(req, res){
  Image.remove({category: req.params.category}, function(err){
    if(err){
      res.status(500).send('Something goes wrong: ',err);
      return console.error(err);
    }
    res.status(200).send('Delete all category\'s images');
  })
});

module.exports = router;