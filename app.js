
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var less = require('less-middleware');

var index = require('./routes/index');
var login = require('./routes/login');
var signup = require('./routes/signup');
var home = require('./routes/home');
var about = require('./routes/about');
var challenge = require('./routes/challenge');
var clas = require('./routes/class');
var profile = require('./routes/profile');
var addclass = require('./routes/addclass');
var leaders = require('./routes/leaders');
var finalanswer = require('./routes/finalanswer');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
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

// Add routes here
app.get('/', index.view);
app.get('/login.html', login.view);
app.get('/signup.html', signup.view);
app.get('/home.html', home.view);
app.get('/about.html', about.view);
app.get('/challenge.html', challenge.view);
app.get('/class.html', clas.view);
app.get('/profile.html', profile.view);
app.get('/addclass.html', addclass.view);
app.get('/leaders.html', leaders.view);
app.get('/finalanswer.html', finalanswer.view);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
