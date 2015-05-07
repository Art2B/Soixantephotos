var express = require('express');
var mongoose = require('mongoose');
var imagesSchema = require('../database/image');
var _ = require('lodash');

var Image = mongoose.model('Image', imagesSchema);
var categorySchema = require('../database/category');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  Image.find({}, function(err, docs){
    if(err){
      throw err;
    }
    res.render('index', { title: 'Soixante photos', photoNumber: docs.length});
  });
});

router.get('/random', function(req, res) {
  Image.find({nsfw: (req.query.nsfw === true)}, function (err, docs) {
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
  Image.find({category: req.params.category, nsfw: (req.query.sfw === "true")}, function(err, docs){
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

module.exports = router;