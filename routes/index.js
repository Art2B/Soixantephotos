var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var imagesSchema = require('../database/image');
var _ = require('lodash');
var multer  = require('multer');
var uuid = require('uuid');

var Image = mongoose.model('Image', imagesSchema);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/random', function(req, res) {

  Image.find({}, function (err, docs) {
    if(err){
      res.status(500).send('Something goes wrong',err);
      return console.error(err);
    }
    if(docs.length > 0){
      var doc = _.sample(docs);
      res.contentType(doc.img.contentType);
      res.status(200).send(doc.img.data);
    } else {
      res.status(404).send('Random image can\'t be found');
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

  var imgToSave = new Image({
    name: req.files.image.originalname,
    category: req.body.category,
    img: {
      data: fs.readFileSync(globals.directory +'/'+ req.files.image.path),
      contentType: req.files.image.mimetype
    }
  });

  imgToSave.save(function(err, data){
    if(err) throw err;

    res.send('Image saved');
  });
});

// For development purpose. Need to be remove when online
router.delete('/clear', function(req, res){
  Image.remove({}, function(err){
    if(err) throw err;
    res.send('DELETE ALL DATABASE');
  })
});

module.exports = router;