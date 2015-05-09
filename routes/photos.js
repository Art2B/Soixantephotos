var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var multer  = require('multer');
var uuid = require('uuid');
var im = require('imagemagick');
var im = require('imagemagick');
var Promise = require('promise');
var colors = require('colors');

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
});
router.get('/verify', function(req, res){
  Image.find({verified: false}, function(err, photos){
    if(err) console.log(err);
    res.render('photos/verify', {photos: photos});
  })
});
router.get('/all', function(req, res) {
  Image
  .find({})
  .populate('category')
  .exec(function(err, images){
    if(err){
      throw err;
    }
    res.render('photos/all', {photos: images});
  });
});
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
  console.log('New image to save'.green);
  new Promise(function(fulfill, reject){
    im.identify(globals.directory +'/'+ req.files.file.path, function(err, features){
      if(err) reject(err);
      else {
        fulfill(features);
      }
    });
  })
  .then(function(features){
    return new Promise(function(fulfill, reject){
      if(features.height > 1920 || features.widht > 1920){
        console.log('Need to resize image'.grey);
        var size = {};
        if(features.height > features.width){
          // console.log('Height is bigger than width'.grey);
          size.height = 1920;
          size.width = Math.round(1920/(features.height/features.width));
        } else if(features.width > features.height){
          // console.log('Width is bigger than height'.grey);
          size.height = Math.round(1920/(features.width/features.height));
          size.width = 1920;
        } else {
          // console.log('Height and width are the same size'.grey);
          size.height = 1920;
          size.width = 1920;
        }
        // console.log('Image new size: ',size);
        im.resize({
          srcPath: globals.directory +'/'+ req.files.file.path,
          dstPath: globals.directory +'/'+ req.files.file.path,
          width: size.width,
          height: size.height,
          quality: 1,
        }, function(err){
          if(err) reject(err);
          console.log('resize done'.grey);
          im.identify(globals.directory +'/'+ req.files.file.path, function(err, features){
            fulfill(features);
          });
        });
      } else {
        fulfill(features);
      }
    });
  })
  .then(function(features){
    return new Promise(function(fulfill, reject){
      // console.log('Category of image: '+req.body.category);
      Category.findOne({name: req.body.category}, function(err, doc){
        if(err) reject(err);
        else fulfill({category: doc, features: features});
      });
    });
  })
  .then(function(result){
    return new Promise(function(fulfill, reject){
      if(!result.category){
        new Category({
          name: req.body.category
        }).save(function(err, data){
          if(err) reject(err);
          else {
            // console.log('Category created :)'.grey);
            fulfill({category: data, features: result.features});
          }
        });
      } else {
        // console.log('Category already exist :) '.grey);
        fulfill(result);
      }
    });
  })
  .then(function(result){
    return new Promise(function(fulfill, reject){
      fulfill({
        image: new Image({
          name: req.files.file.originalname,
          category: result.category._id,
          nsfw: (req.body.nsfw === 'true'),
          verified: (req.body.nsfw === 'true') ? true : false,
          img: {
            data: fs.readFileSync(globals.directory +'/'+ req.files.file.path),
            contentType: req.files.file.mimetype,
            size: {
              height: result.features.height,
              width: result.features.width
            }
          }
        }),
        category: result.category
      });
    });
  })
  .then(function(result){
    return new Promise(function(fulfill, reject){
      result.image.save(function(err, data){
        if(err){
          res.status(500).send('Something goes wrong: ',err,''.red);
          reject(err);
        }
        fs.unlink(globals.directory +'/'+ req.files.file.path);
        console.log('image saved :)'.green);
        fulfill(result);
      });
    });
  })
  .then(function(result){
    // console.log('Push image to category'.cyan);
    result.category.photos.push(result.image);
    result.category.save(function(err, data){
      if(err) reject(err);
      res.status(201).send('Image saved');
    });
  });
});

/* PUT ROUTES */
router.put('/update', function(req, res){
  console.log('update photos');
});
router.put('/verify/:id', function(req, res){
  Image.findOne({_id: req.params.id}, function(err, image){
    if(err) console.log('VERIFY: Can\'t find image: ',err);
    image.verified = true;
    if(req.body.nsfw === 'true') image.nsfw = true;
    image.save(function(err, data){
      if(err) res.status(500).send('VERIFY: Error in updating image: ', err);
      res.status(200).send('Image verified');
    })
  });
})

/* DELETE ROUTES */
router.delete('/clear', function(req, res){
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
router.delete('/clear/:category', function(req, res){
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

  // Image.remove({category: req.params.category}, function(err){
  //   if(err){
  //     res.status(500).send('Something goes wrong: ',err);
  //     return console.error(err);
  //   }
  // })
});

module.exports = router;