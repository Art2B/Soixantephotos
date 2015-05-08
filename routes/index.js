var express = require('express');
var mongoose = require('mongoose');
var _ = require('lodash');
var Promise = require('promise');

var imagesSchema = require('../database/image');
var categorySchema = require('../database/category');
var Image = mongoose.model('Image', imagesSchema);
var Category = mongoose.model('Category', categorySchema);

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  Image
  .find({})
  .populate('category')
  .exec(function(err, images){
    if(err){
      throw err;
    }
    res.render('index', { title: 'Soixante photos', photos: images});
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
  Category
  .findOne({name: req.params.category}, function(err, category){
    if(err) console.log(err);
    if(category){
      Category.findOne(category)
      .populate('photos')
      .exec(function(err, category){
        if(err) console.log(err);
        console.log('Voici la categorie: ',category);
        if(req.get('Accept').indexOf("html") >= 0){
          res.status(200).render('category', {photos: category.photos, category: req.params.category});
        } else {
          if(category.photos.length > 0){
            var doc = _.sample(category.photos);
            res.contentType(doc.img.contentType);
            res.status(200).send(doc.img.data);
          } else {
            res.status(204).send('No content to render');
          }
        }
      });
    } else {
      if(req.get('Accept').indexOf("html") >= 0){
        res.status(200).render('category', {photos: [], category: req.params.category});
      } else {
        res.status(204).send('No content to render');
      }
    }
  });
});

module.exports = router;