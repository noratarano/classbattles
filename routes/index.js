// Controller /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

var Data = require('./data');
var Users = Data.Users;
var Colors = Data.Colors;
var Classes = Data.Classes;


// Routing Functions //////////////////////////////////////////////////////////

exports.view = {};
exports.api = {};


// View

exports.view.index = function(req, res) {
    req.session.username = null;
    res.render('index', {});
};

exports.view.login = function(req, res) {
    req.session.username = null;
    res.render('login', {});
};

exports.view.logout = function(req, res) {
    req.session.username = null;
    res.render('index', {});
};

exports.view.signup = function(req, res) {
    res.render('signup', {});
};

exports.view.about = function(req, res) {
    var userObject = findUser(req.session.username);
    res.render('about', {user: userObject});
};

exports.view.home = function(req, res) {
    var username = req.params.username;
    if (!username && req.session.username) {
        res.redirect('/'+req.session.username+'/home');
    } else if (username != req.session.username) {
    // not logged in or wrong user
        res.redirect('/login');
    } else {
    // logged in
        var userObject = findUser(username);
        if (userObject) {
            var data = { user: userObject, helpers: { foreach: foreach } };
            res.render('home', data);
        } else {
            res.redirect('/login');
        }
    }
};

exports.view.class = function(req, res) {
    var username        = req.params.username;
	if (username != req.session.username) {
		res.redirect('/login');
		return;
	}
    var classname       = req.params.classname;
    var userObject      = findUser(username);
    var userClassObject = findUserClass(userObject, classname);
    var data = {
        user: userObject,
        'class': userClassObject,
		classes: [{class: userClassObject}],
		helpers: {foreach: foreach}
    }
    
    res.render('class', data);
};

exports.view.start = function(req, res) {
	if (req.session.username) {
		var classname = req.params.classname;
		var user = findUser(req.session.username);
		
		initCurrentChallenge(classname);
    	
		res.render('startchallenge', {
			user: user,
			classname: classname 
		});
	} else {
		res.redirect('/login');
	}
};

exports.view.challenge = function(req, res) {
	var classname = req.params.classname;
	var username = req.session.username;
	if (username) {
		// objects
		var classObject = findClass(classname);
		var userObject = findUser(username);
		var userClassObject = findUserClass(userObject, classname);
		var challengers = [];
		var question = null;
		if (username == req.params.username) {
			question = nextQuestion(userClassObject, classObject);
			challengers = findChallengers(userObject, classname);
		} else {
			var challengerClassObject = findUserClass(req.params.username);
			challengers.push(challengerClassObject);
			question = nextQuestion(userClassObject, classObject); // TODO: coordinate
		}
    	res.render('challenge', {
			user: userObject,
			userChallenger: userClassObject,
			challengers: challengers, 
			classname: classname,
			question: question,
			helpers: { pixels: pixels }
		});
	} else {
		res.redirect('/login');
	}
};

exports.view.finalanswer = function(req, res) {
    var qid = req.query.qid;
    var timedOut = req.query.timedOut == 'true';
    var selected = req.query.selected;
	var classname = req.params.classname;
	var username = req.session.username;
	
	if (username) {
		// objects
		var classObject = findClass(classname);
		var userObject = findUser(username);
		var userClassObject = findUserClass(userObject, classname);
		var question = findQuestion(classObject, qid);
		var challengers = [];
		if (username == req.params.username) {
			challengers = findChallengers(userObject, classname);
		} else { // TODO...
			var challengerClassObject = findUserClass(req.params.username);
			challengers.push(challengerClassObject);
		}
		// update points
		var correct = selected == question.answer;
		var userI = findUserIndex(username);
		var userClassI = findUserClassIndex(Users[userI].user, classname);
		if (correct) {
			for (t in question.tags) {
				Users[userI].user
				.classes[userClassI].class
				.currentChallenge.points += question.tags[t].points;
			}
		}
		Users[userI].user.classes[userClassI].class.history.splice(0, 0,{
			question: question.question,
			correct: correct
		});
		var done = !nextQuestion(
			Users[userI].user.classes[userClassI].class, 
			classObject
		);
		console.log("DONE = " + done);
		var data = {
	        correct: correct,
	        selected: selected,
	        timedOut: timedOut,
	        correctAnswer: question.answer,
	        tags: question.tags,
			classname: classname,
			user: Users[userI].user,
			userChallenger: Users[userI].user.classes[userClassI].class,
			challengers: challengers,
			done: done,
			helpers: { pixels: pixels }
	    };
	    res.render('finalanswer', data);
	} else {
		res.redirect('/login');
	}
};

exports.view.leaders = function(req, res) {
    var classname = req.params.classname;
    var username = req.params.username;
    var leaderboard = Leaderboard(classname, 10, username);
    var data = {
        classname: classname,
        username: username,
        leaderboard: leaderboard,
        helpers: { place: leaderPlace, totalPoints: totalPoints }
    }
    res.render('leaders', data);
}

exports.view.classprofile = function(req, res) {
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        var classname = req.params.classname;
        
        var userObject = findUser(req.session.username);
        var profileObject = findUser(req.params.username);
        if (profileObject) {
            var data = { 
                user: userObject, 
                profile: profileObject,
                self: userObject.username == profileObject.username,
				classname: classname,
                helpers: { foreach: foreach }
            };
            res.render('profile', data);
        } else {
            res.redirect('/login');
        }
    }
};

exports.view.profile = function(req, res) {
	var username = req.session.username;
    if (username) {
        var userObject = findUser(username);
        if (userObject) {
            var data = { 
                user: userObject,
                profile: userObject,
				self: true,
                helpers: { foreach: foreach } 
            };
            res.render('profile', data);
        } else {
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};

exports.view.addclass = function(req, res) {
    function sortAlpha(a,b) {
        return a.class.name.localeCompare(b.class.name);
    }
    var userObject = findUser(req.params.username);
    if (userObject) {
        var classes = [];
        for (c in Classes) {
            var disable = false;
            for (uc in userObject.classes) {
                if (userObject.classes[uc].class.name == Classes[c].class.name) {
                    disable = true;
                    break;
                }
            }
            classes.push({ 'class': { name: Classes[c].class.name, description: Classes[c].class.description, disable: disable } });
        }
        classes.sort(sortAlpha);
        res.render('addclass', { user: userObject, classes: classes });
    } else {
        res.render('login');
    }
};


// API

exports.api.login = function(req, res) {
    var username = req.query.username;
    var userObject = findUser(username);
    if (userObject) {
        req.session.username = userObject.username;
        res.redirect('/'+username+'/home');
    } else {
        res.redirect('/login');
    }
};

exports.api.signup = function(req, res) {
    var username = req.query.username;
    var email = req.query.email;
    var userObject = findUser(username);
    if (!userObject) {
        userObject = User(username, email);
        Users.push(userObject);
    }
    req.session.username = username;
    res.redirect('/'+username+'/home');
};

exports.api.addclass = function(req, res) {
    var username = req.params.username;
    var u = findUserIndex(username);
	if (u < 0) {
		res.redirect('/login');
		return;
	}
    var classesToAdd = req.query.classes;
    var userClasses = Users[u].user.classes;
    var count = req.query.count;
    if (count == 1) {
        var dontAdd = false;
        var classToAdd = classesToAdd;
        for (uc in userClasses) {
            if (classToAdd == userClasses[uc].class.name) {
                dontAdd = true;
            }
        }
        if (!dontAdd) {
            Users[u].user.classes.push(UserClass(classToAdd));
            res.redirect('/'+[username, 'class', classToAdd].join('/'));
            return;
        }
    } else {
        for (var c = 0; c < count; c++) {
            var dontAdd = false;
            var classToAdd = classesToAdd[c];
            for (uc in userClasses) {
                if (classToAdd == userClasses[uc].class.name) {
                    dontAdd = true;
                }
            }
            if (!dontAdd) {
                Users[u].user.classes.push(UserClass(classToAdd));
            }
        }
    }
    res.redirect('/' + username + '/home');
};

exports.api.classes = function(req, res) {
    var username = req.params.username;
    var data = {
        classes: null,
        colors: null
    };
    if (req.session.username) {
        data.classes = findUser(username).classes;
        data.colors = Colors;
    } else {
        res.redirect('/login');
    }
    res.send(data);
};


// Controller Helpers /////////////////////////////////////////////////////////

function findQuestion(classObject, qid) {
    for (var i = 0; i < classObject.questions.length; i++) {
        if (classObject.questions[i].id == qid) {
            return classObject.questions[i];
        }
    }
    return null;
}

function findUser(username) {
    for (user in Users) {
        var userObject = Users[user].user;
        if (userObject.username == username) {
            return userObject;
        }
    }
    return null;
}

function findUserIndex(username) {
    for (user in Users) {
        var userObject = Users[user].user;
        if (userObject.username == username) {
            return user;
        }
    }
    return -1;
}

function findUserClass(userObject, classname) {
    if (userObject) {
        for (i in userObject.classes) {
            var classObject = userObject.classes[i].class;
            if (classObject.name == classname) {
                return classObject;
            }
        }
    }
    return null;
}

function findUserClassIndex(userObject, classname) {
    if (userObject) {
        for (i in userObject.classes) {
            var classObject = userObject.classes[i].class;
            if (classObject.name == classname) {
                return i;
            }
        }
    }
    return -1;
}

function findClass(classname) {
    for (var i = 0; i < Classes.length; i++) {
        var classObject = Classes[i].class;
        if (classObject.name == classname) {
            return classObject;
        }
    }
    return null;
}

function Leaderboard(classname, size, username) {
    function sortDescending(a,b) {
        return totalPoints(b.leader)-totalPoints(a.leader);
    }
    
    var students = [];
    for (user in Users) {
        var userObject = Users[user].user;
        var leader = findUserClass(userObject, classname);
        if (leader) {
            leader.username = userObject.username;
            if (leader.username == username) {
                leader.highlight = true;
            } else {
                leader.highlight = false;
            }
            students.push({leader: leader});
        }
    }
    
    students.sort(sortDescending);

    return students.slice(0, size);
}

function HistoricalEntry(timestamp, question, correct) {
    return { entry: {
        timestamp: timestamp,
        question: question,
        correct: correct
    }};
}

function UserClass(classname) {
    var classObject = findClass(classname);
    var userClassObject = null;
    if (classObject) {
        // setup user class object
        userClassObject = { 'class': {
            name: classObject.name,
            classname: classObject.classname,
            tags: classObject.tags,
            history: [],
			currentChallenge: {points: 0, possible: 1}
        }};
        // add and init points properties to tags
        for (t in userClassObject.class.tags) {
            userClassObject.class.tags[t].points = 0;
        }
    }
    return userClassObject;
}

function User(username, email) {
    return { user: {
        username: username, 
        email: email,
        about: '',
        online: true,
        classes: []
    }};
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function nextQuestion(userClassObject, classObject) {
	for (q in classObject.questions) {
		var questionObject = classObject.questions[q];
		var different = true;
		for (h in userClassObject.history) {
			var entry = userClassObject.history[h];
			different &= (entry.question != questionObject.question);
		}
		if (!different) {
			continue;
		}
		var options = questionObject.options;
		var shuffledOptions = shuffle(options);
	    var question = {
	        id: questionObject.id,
	        question: questionObject.question,
	        optionA: shuffledOptions[0],
	        optionB: shuffledOptions[1],
	        optionC: shuffledOptions[2],
	        optionD: shuffledOptions[3],
			correctAnswer: questionObject.answer,
	        tags: questionObject.tags
	    }
		return question;
	}
	return null;
}

function findChallengers(userObject, classname) {
	var challengers = [];
	for (u in Users) {
		var candidateObject = Users[u].user;
		var candidateClassObject = findUserClass(candidateObject, classname);
		if (candidateObject.username == userObject.username || !candidateClassObject) {
			continue;
		} else {
			challengers.push(candidateClassObject);
		}
	}
	return challengers;
}

function initCurrentChallenge(classname) {
	for (u in Users) {
		var userObject = Users[u].user;
	    if (userObject) {
	        for (i in userObject.classes) {
	            var classObject = userObject.classes[i].class;
	            if (classObject.name == classname) {
					var I = Math.floor(Math.random() + 0.5);
	                Users[u].user.classes[i].class.currentChallenge = {points: 30*I + 20*(1-I), possible: 100}; // TODO
	            }
	        }
	    }
	}
}


// Handlebars Helpers /////////////////////////////////////////////////////////

function foreach(arr, options) {
    if(options.inverse && !arr.length)
        return options.inverse(this);
    return arr.map(function(item,index) {
        item.$index = index;
        item.$first = index === 0;
        item.$last  = index === arr.length-1;
		item.$even  = index % 2 === 0;
		item.$odd   = index % 2 === 1;
        item.$total = arr.length;
        return options.fn(item);
    }).join('');
}

function leaderPlace(index) {
    return index+1;
}

function totalPoints(leader) {
    var pts = 0;
    for (var i = 0; i < leader.tags.length; i++) {
        pts += leader.tags[i].points;
    }
    return pts;
}

function pixels(pointstr) {
	var points = parseInt(pointstr);
	var PX = 298;
	console.log('pts: ' + points + 'px: ' + Math.floor(points * PX / 100));
	return Math.floor(points * PX / 100);
}










