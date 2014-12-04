var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var User = (function () {
  var schema = function () {
    var s = new Schema({
      first: String,
      last: String,
      age: Number,
      weight: Number,
      height: Number,
      sex: String
    });

    s.set('toJSON', {
      virtuals: true,
      transform: function (doc, ret, opts) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    });

    return s;
  };

  var model = function () {
    return mongoose.model('User', schema());
  };

  return {
    model: model
  };
}());

module.exports = User.model();