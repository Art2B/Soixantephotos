var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
  name:  String,
  category:   String,
  sfw: Boolean,
  img: {
    data: Buffer,
    contentType: String,
    size: {
      height: Number,
      width: Number
    }
  }
});

module.exports = imageSchema;