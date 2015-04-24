var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
  name:  String,
  category:   String,
  img: {
    data: Buffer,
    contentType: String
  }
});

module.exports = imageSchema;