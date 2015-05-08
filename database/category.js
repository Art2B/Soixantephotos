var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
  name:  String,
  photos: [{type: Schema.Types.ObjectId, ref: 'Image'}]
});

module.exports = categorySchema;