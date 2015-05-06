var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var imagesSchema = require('../database/image');
var _ = require('lodash');
var multer  = require('multer');
var uuid = require('uuid');
var im = require('imagemagick');

var Image = mongoose.model('Image', imagesSchema);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/random', function(req, res) {
  Image.find({}, function (err, docs) {
    if(err){
      res.status(500).send('Something goes wrong: ',err);
      return console.error(err);
    }
    if(docs.length > 0){
      var doc = _.sample(docs);
      res.contentType(doc.img.contentType);
      res.status(200).send(doc.img.data);
    } else {
      res.status(204).send('No content to render');
    }
  });
});

router.get('/:category', function(req, res){
  Image.find({category: req.params.category}, function(err, docs){
    if(err){
      res.status(500).send('Something goes wrong: ',err);
      return console.error(err);
    }
    if(req.get('Accept').indexOf("html") >= 0){
      res.render('category', {photos: docs, category: req.params.category});
    } else {
      if(docs.length > 0){
        var doc = _.sample(docs);
        res.contentType(doc.img.contentType);
        res.status(200).send(doc.img.data);
      } else {
        res.status(204).send('No content to render');
      }
    }
  });
});
router.get('/photo/:id', function(req, res){
  Image.findOne({_id: req.params.id}, function(err, photo){
    if(err){
      res.status(404).send('Photo not found');
    } else {
      res.contentType(photo.img.contentType);
      res.status(200).send(photo.img.data);
    }
  });
});



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

  im.identify(globals.directory +'/'+ req.files.image.path, function(err, features){
    if (err) {
      res.status(500).send('Something goes wrong: ',err);
    }
    var imgToSave = new Image({
      name: req.files.image.originalname,
      category: req.body.category,
      img: {
        data: fs.readFileSync(globals.directory +'/'+ req.files.image.path),
        contentType: req.files.image.mimetype,
        size: {
          height: features.height,
          width: features.width
        }
      }
    });

    imgToSave.save(function(err, data){
      if(err){
        res.status(500).send('Something goes wrong: ',err);
        return console.error(err);
      }
      fs.unlink(globals.directory +'/'+ req.files.image.path);

      res.status(201).send('Image saved');
    });
  });

});

// For development purpose. Need to be remove when online
router.delete('/clear', function(req, res){
  Image.remove({}, function(err){
    if(err){
      res.status(500).send('Something goes wrong: ',err);
      return console.error(err);
    }
    res.status(200).send('Delete all database');
  })
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