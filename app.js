
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var less = require('less-middleware');

var index = require('./routes/index');

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

// Routes
app.get('/', index.view.index);
app.get('/login', index.view.login);
app.get('/logout', index.view.index);
app.get('/signup', index.view.signup);
app.get('/challenge', index.view.challenge);
app.get('/answer', index.view.finalanswer);
app.get('/about', index.view.about);

app.get('/api/login', index.api.login);
app.get('/api/signup', index.api.signup);
app.get('/api/:username/class/add', index.api.addclass);

app.get('/:username/home', index.view.home);
app.get('/:username/profile', index.view.profile);
app.get('/:username/class/add', index.view.addclass);
app.get('/:username/class/:classname/leaderboard', index.view.leaders);
app.get('/:username/class/:classname/profile', index.view.classprofile);
app.get('/:username/class/:classname', index.view.class);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
