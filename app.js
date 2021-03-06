// Application Configuration //////////////////////////////////////////////////

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var less = require('less-middleware');
var mongoose = require('mongoose');

var index = require('./routes/index');

// mongoose
var local_database_name = 'classbattles';
var local_database_uri  = 'mongodb://localhost/' + local_database_name
var database_uri = process.env.MONGOLAB_URI || local_database_uri
mongoose.connect(database_uri);

// all environments
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('dingodile'));
app.use(express.session());
app.use(app.router);
app.use(less({
    src    : path.join(__dirname, 'public', 'less'),
    paths  : [path.join(__dirname, 'public', 'less')],
    dest   : path.join(__dirname, 'public', 'css'),
    prefix : '/css',
    debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var models = require('./models');
app.get('/challenges', function(req, res) {
	models.Challenge.find().lean().exec(function(err, challenges) {
		res.send(challenges);
	});
});

app.get('/challenges/remove', function(req, res) {
	models.Challenge.find().remove().exec(function(err, challenges) {
		res.redirect('/challenges');
	});
});

// Routing ////////////////////////////////////////////////////////////////////

app.get('/', index.view.index);
app.get('/login', index.view.login);
app.get('/logout', index.view.logout);
app.get('/signup', index.view.signup);
app.get('/about', index.view.about);
app.get('/home', index.view.home);
app.get('/b', index.view.index_b);

// api
app.get('/api/login', index.api.login);
app.get('/api/signup', index.api.signup);
app.get('/api/:username/class/add', index.api.addclass);
app.get('/api/:username/class/all', index.api.classes);
app.get('/api/:username/profile/edit', index.api.editprofile);
app.get('/api/:username/class/:classname/beginchallenge', index.api.beginchallenge);
app.get('/api/:username/class/:classname/endchallenge', index.api.endchallenge);


// user, class, challenge
app.get('/:username/home', index.view.home);
app.get('/:username/profile', index.view.profile);
app.get('/:username/profile/edit', index.view.editprofile);
app.get('/:username/class/add', index.view.addclass);
app.get('/:username/class/:classname/leaderboard', index.view.leaders);
app.get('/:username/class/:classname/random', index.view.random);
app.get('/:username/class/:classname/profile', index.view.classprofile);
app.get('/:username/class/:classname/challenge', index.view.start);
app.get('/:username/class/:classname/challenge/question', index.view.challenge);
app.get('/:username/class/:classname/challenge/answer', index.view.finalanswer);
app.get('/:username/class/:classname', index.view.class);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
