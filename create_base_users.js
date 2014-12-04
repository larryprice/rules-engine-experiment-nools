var fs = require('fs'),
  mongoose = require('mongoose'),
  config = require('./config');

mongoose.connect(config.db[process.env.NODE_ENV || 'development']);

var User = require('./models/user');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  repopulate();
});

function repopulate() {
  User.find({}, function (e, u) {
    if (e) {
      console.error(e);
    } else {
      for (var i = 0; i < u.length; ++i) {
        u[i].remove();
      }
      populate();
    }
  });
}

var users = [{
  first: "Bob",
  last: "Belcher",
  age: 44,
  weight: 220,
  height: 72,
  sex: "m"
}, {
  first: "Linda",
  last: "Belcher",
  age: 42,
  weight: 150,
  height: 67,
  sex: "f"
}, {
  first: "Tina",
  last: "Belcher",
  age: 14,
  weight: 110,
  height: 63,
  sex: "f"
}, {
  first: "Gene",
  last: "Belcher",
  age: 10,
  weight: 110,
  height: 60,
  sex: "m"
}, {
  first: "Louise",
  last: "Belcher",
  age: 8,
  weight: 80,
  height: 56,
  sex: "f"
}];

function populate() {
  var userCount = 0;
  for (var i = 0; i < users.length; ++i) {
    User.create(users[i], function (e, f) {
      if (++userCount === users.length) {
        mongoose.disconnect();
      }
    });
  }
}