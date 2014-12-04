var express = require('express');
var app = exports.app = express();
var port = Number(process.env.PORT || 5000);

var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.get('/', function (req, res) {
  res.render('user_select.jade');
});

var config = require('./config');
var mongoose = require('mongoose');
app.set('dbUrl', config.db[app.settings.env]);
mongoose.connect(app.get('dbUrl'));

var User = require('./models/user');

app.get('/users', function (req, res) {
  User.find(function (e, u) {
    if (e) {
      return res.status(500).send("Database connection issue");
    } else {
      return res.send(u);
    }
  });
});

app.get('/users/:id', function (req, res) {
  User.findById(req.params.id, function (e, u) {
    if (e) {
      return res.status(400).send("No such user.");
    } else {
      return res.send(u);
    }
  });
});

app.put('/users/:id', function (req, res) {
  User.update({
    _id: req.params.id
  }, {
    $set: req.body
  }).exec();
  res.send(req.params.id);
});

app.get('/users/:id/rules', function (req, res) {
  User.findById(req.params.id, function (e, u) {
    if (e) {
      return res.status(400).send("No such user.");
    } else {
      applyRules(u, function (err, messages) {
        if (err !== undefined) {
          return res.status(500).send(err);
        } else {
          return res.send(messages);
        }
      });
    }
  });
});

app.listen(port, function () {
  console.log("Listening on " + port);
});

var nools = require("nools");

var noolsSource = "rule 'men over 40' {" + "   when {" +
  "     u : User u.age > 40 && u.sex == 'm';" + "   }" + "   then {" +
  "       messages.push('Recommend annual prostate examinations.');" + "   }" + "}" +
  "rule 'women over 40' {" + "   when {" +
  "     u : User u.age > 40 && u.sex == 'f';" + "   }" + "   then {" +
  "       messages.push('Recommend annual mammograms.');" + "   }" + "}" +
  "rule 'anyone over 40' {" + "   when {" +
  "     u : User u.age > 40;" + "   }" + "   then {" +
  "       messages.push('Recommend a diet higher in fiber.');" + "   }" + "}" +
  "rule 'teenage girls' {" + "   when {" +
  "     u : User u.age > 11 && u.age < 25;" + "   }" + "   then {" +
  "       messages.push('Recommend HPV vaccination.');" + "   }" + "}" +
  "rule 'children' {" + "   when {" +
  "     u : User u.age < 12;" + "   }" + "   then {" +
  "       messages.push('Keep up to date on all vaccinations.');" + "   }" + "}" +
  "rule 'high bmi' {" + "   when {" +
  "     u : User u.bmi > 25;" + "   }" + "   then {" +
  "       messages.push('Consider eating more vegetables and performing more aerobic exercises.');" + "   }" +
  "}" +
  "rule 'low bmi' {" + "   when {" +
  "     u : User u.bmi < 18.5;" + "   }" + "   then {" +
  "       messages.push('Consider eating more protein and performing more anaerobic exercises.');" + "   }" +
  "}";

function applyRules(user, callback) {
  var messages = [];
  var flow = nools.compile(noolsSource, {
    define: {
      User: User
    },
    scope: {
      messages: messages
    },
    name: "health concerns"
  });
  var session = flow.getSession(user);
  session.match(function (err) {
    nools.deleteFlow("health concerns");
    if (err) {
      callback(err);
    } else {
      callback(undefined, messages);
    }
  });
}