var express = require('express');
var app = exports.app = express();
var port = Number(process.env.PORT || 5000);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.get('/', function (req, res) {
  res.render('user_select.jade');
});

app.get('/users/:id', function (req, res) {
  var user = getUser(req.params.id);
  if (user) {
    res.send(user);
  } else {
    return res.status(400).send("No such user.");
  }
});

app.get('/users/:id/rules', function (req, res) {
  var user = getUser(req.params.id);
  if (!user) {
    res.status(400).send("No such user.");
  } else {
    applyRules(user, function (err, messages) {
      if (err !== undefined) {
        res.status(500).send(err);
      } else {
        res.send(messages);
      }
    });
  }
});

app.listen(port, function () {
  console.log("Listening on " + port);
});

function getUser(id) {
  switch (id) {
  case "bob":
    return new User({
      first: "Bob",
      last: "Belcher",
      age: 44,
      weight: 220,
      height: 72,
      sex: "m"
    });
  case "linda":
    return new User({
      first: "Linda",
      last: "Belcher",
      age: 42,
      weight: 150,
      height: 67,
      sex: "f"
    });
  case "tina":
    return new User({
      first: "Tina",
      last: "Belcher",
      age: 14,
      weight: 110,
      height: 63,
      sex: "f"
    });
  case "gene":
    return new User({
      first: "Gene",
      last: "Belcher",
      age: 10,
      weight: 110,
      height: 60,
      sex: "m"
    });
  case "louise":
    return new User({
      first: "Louise",
      last: "Belcher",
      age: 8,
      weight: 80,
      height: 56,
      sex: "f"
    });
  }
};

var User = function (jsonUser) {
  this.first = jsonUser.first;
  this.last = jsonUser.last;
  this.age = jsonUser.age;
  this.weight = jsonUser.weight.toFixed(1);
  this.height = jsonUser.height
  this.sex = jsonUser.sex;
  this.bmi = ((this.weight / (this.height * this.height)) * 703);
}

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