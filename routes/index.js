// Controller /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

var Data = require('./data');
var Users = Data.Users;
var Colors = Data.Colors;
//var Classes = Data.Classes;
var models = require('../models');


// Routing Functions //////////////////////////////////////////////////////////

exports.view = {};
exports.api = {};


// View

exports.view.index = function(req, res) {
    res.render('index', {});
};

exports.view.login = function(req, res) {
    res.render('login', {});
};

exports.view.logout = function(req, res) {
	var username = req.session.username;
	models.User.findOne({ username: username }).exec(function(err, user) {
		if (err) console.log(err);
		if (user) {
			user.online = false;
			user.save(function(err) {
				if (err) console.log(err);
			    req.session.username = null;
			    res.render('index', {});
			});
		}
	});
};

exports.view.signup = function(req, res) {
    res.render('signup', {});
};

exports.view.about = function(req, res) {
	models.User.findOne({ username: req.session.username }, function(err, user) {
		if (err) console.log(err);
		res.render('about', { user: user });
	});
    //var userObject = findUser(req.session.username);
	//res.render('about', {user: userObject});
};

exports.view.home = function(req, res) {
    var username = req.params.username;
    if (!username && req.session.username) {
        res.redirect('/'+req.session.username+'/home');
    } else if (username != req.session.username) {
    // not logged in or wrong user
		console.log('Not logged in or wrong user.');
        res.redirect('/login');
    } else {
    // logged in
		console.log('User has logged in.');
		models.User.findOne({ username: username }).exec(function(err, userObject) {
	        if (userObject && userObject.online) {
	            var data = { user: userObject, helpers: { foreach: foreach } };
				console.log(data);
	            res.render('home', data);
	        } else {
	            res.redirect('/login');
	        }
		});
    }
};

exports.view.class = function(req, res) {
    var username = req.params.username;
	if (username != req.session.username) {
		res.redirect('/login');
		return;
	}
	models.User.findOne({ username: username }).lean().exec(function(err, user) {
		if (err) console.log(err);
		if (user) {
			var classname = req.params.classname;
			var userClassObject = findUserClass(user, classname);
		    var data = {
		        user: user,
		        'class': userClassObject,
				classes: [{class: userClassObject}],
				challenges: userClassObject.records,
				helpers: { foreach: foreach, ifChallengerIsNotMe: ifChallengerIsNotMe }
		    }
		    res.render('class', data);
			function ifChallengerIsNotMe(username, challengername, classname) {
				var html = '<a href="/'+challengername+'/class/'+classname+'/challenge" class="btn btn-block btn-info">Challenge</a>';
				console.log("u %s c %s cl %s", username, challengername, classname);
				return username != challengername ? html : null;
			}
		} else {
			res.redirect('/login');
		}
	});
	//     var classname       = req.params.classname;
	//     var userObject      = findUser(username);
	//     var userClassObject = findUserClass(userObject, classname);
	//     var data = {
	//         user: userObject,
	//         'class': userClassObject,
	// classes: [{class: userClassObject}],
	// helpers: {foreach: foreach}
	//     }
	//     
	//     res.render('class', data);
};

exports.view.start = function(req, res) {
	var username = req.session.username;
	if (!username) {
		res.redirect('/login');
		return;
	}
	var classname = req.params.classname;
	var studentBattle = (username != req.params.username);
	var challengername = req.params.username;
	models.User.findOne({ username: username }).exec(function(err, user) {
		if (err) console.log(err);
		if (studentBattle) {
			models.User.findOne({ username: challengername }).exec(function(err, challenger) {
				if (err) console.log(err);
				models.Question.find({ lecture: false, classname: classname }).exec(function(err, questions) {
					if (err) console.log(err);
					var randomQuestions = shuffle(questions).slice(0,15);
					user.addRecord(classname, new models.Challenge({
						lecture: false,
						active: true,
						classname: classname,
						challenger: challenger.username,
						tags: make_tags(randomQuestions),
						questions: randomQuestions,
						history: []
					}));
					user.save(function(err) {
						if (err) console.log(err);
						challenger.addRecord(classname, new models.Challenge({
							lecture: false,
							active: true,
							classname: classname,
							challenger: challenger.username,
							tags: make_tags(randomQuestions),
							questions: randomQuestions,
							history: []
						}));
						challenger.save(function(err) {
							if (err) console.log(err);
							res.render('startchallenge', {
								'user': user,
								'classname': classname,
								'challenger': challenger,
								'studentBattle': true,
								helpers: { foreach: foreach }
							});
						});
					});
					function make_tags(questions) {
						var tags = [];
						for (var i = 0; i < questions.length; i++) {
							for (var qt = 0; qt < questions[i].tags.length; qt++) {
								var tagfound = false;
								for (t in tags) {
									if (questions[i].tags[qt].name == tags[t].name) {
										tagfound = true;
										break;
									}
								}
								if (!tagfound) {
									tags.push(new models.Tag({
										name: questions[i].tags[qt].name
									}));
								}
							}
						}
						return tags;
					}
				});
			});
		} else {
			res.render('startchallenge', {
				user: user,
				classname: classname,
				challenger: null,
				studentBattle: studentBattle,
				helpers: { foreach: foreach }
			});
		}
	});
};

exports.view.challenge = function(req, res) {
	var classname = req.params.classname;
	var username = req.session.username;
	var studentBattle = username != req.params.username;
	var challengername = req.params.username;
	if (!username) {
		res.redirect('/login');
		return;
	}
	models.Class.findOne({ name: classname }).exec(function(err, classObject) {
		if (err) console.log(err);
		models.User.findOne({ username: username }).exec(function(err, user) {
			if (err) console.log(err);
			if (!user) {
				res.redirect('/login');
			}
			if (!studentBattle) {
				// class battle mode
				models.User.find({ "classes.name": classname }).exec(function(err, students) {
					process_challenge(err, students);
				});
			} else {
				// student battle mode
				models.User.find({ "classes.name": classname, username: { $in: [username, challengername] } })
				.exec(function(err, students) {
					process_challenge(err, students, challengername);
				});
			}
			
			function process_challenge(err, students, challengername) {
				if (err) console.log(err);
				// get challengers
				var challengers = [];
				var user = null;
				for (var s = 0; s < students.length; s++) {
					var student = students[s];
					if (student.username != username) {
						var challenger = null;
						if (studentBattle) {
							challenger = student.classChallenge(classname, student.username);
						} else {
							challenger = student.classChallenge(classname);
						}
						challenger.username = student.username;
						challengers.push(challenger);
					} else {
						user = student;
					}
				}
				// get user
				var userChallenge = user.classChallenge(classname, challengername);
				userChallenge.username = user.username;
				var question = Question(user.classChallengeQuestion(classname, challengername));
		    	res.render('challenge', {
					user: user,
					userChallenger: userChallenge,
					challengers: challengers, 
					classname: classname,
					question: question,
					studentBattle: studentBattle,
					helpers: {
						pixels: pixels, 
						pixelsTotalPoints: pixelsTotalPoints, 
						totalPoints: totalPoints 
					}
				});
			}
		});
	});
	
	/*if (username) {
		// objects
		var classObject = findClass(classname);
		var userObject = findUser(username);
		var userClassObject = findUserClass(userObject, classname);
		var challengers = [];
		var question = null;
		var studentBattle = false;
		if (username == req.params.username) {
			question = nextQuestion(userClassObject, classObject);
			challengers = findChallengers(userObject, classname);
		} else {
			var challengerUserObject = findUser(req.params.username);
			var challengerClassObject = findUserClass(challengerUserObject, classname);
			challengerClassObject.username = req.params.username;
			challengers.push(challengerClassObject);
			question = nextQuestion(userClassObject, classObject);
			studentBattle = true;
		}
    	res.render('challenge', {
			user: userObject,
			userChallenger: userClassObject,
			challengers: challengers, 
			classname: classname,
			question: question,
			studentBattle: studentBattle,
			helpers: { pixels: pixels }
		});
	} else {
		res.redirect('/login');
	}*/
};

exports.view.finalanswer = function(req, res) {
    var qid = req.query.qid;
    var timedOut = req.query.timedOut == 'true';
    var selected = req.query.selected;
	var classname = req.params.classname;
	var username = req.session.username;
	var studentBattle = (username != req.params.username);
	if (!username) {
		res.redirect('/login');
		return;
	}
	// get the user
	models.User.findOne({ username: username }).exec(function(err, user) {
		if (err) console.log(err);
		if (!user) res.redirect('/login');
		models.Question.findOne({ _id: qid }).lean().exec(function(err, question) {
			if (err) console.log(err);
			if (!studentBattle) {
				// class battle mode
				models.User.find({ "classes.name": classname }).exec(function(err, students) {
					processChallenge(err, students);
				});
			} else {
				// student battle mode
				var challenger = req.params.username;
				models.User.find({ "classes.name": classname, username: { $in: [username, challenger] } })
				.exec(function(err, students) {
					processChallenge(err, students, challenger);
				});
			}
			function processChallenge(err, students, challengername) {
				if (err) console.log(err);
				// grade responses
				var numstudents = students.length;
				var challengers = [];
				var user = null;
				students.forEach(function (student) {
					// points
					var correct = null;
					if (student.username == username) {
						// user
						correct = selected == question.answer;
						if (correct) {
							student.classChallengeIncrPoints(classname, question, challengername);
						}
					} else {
						// challenger
						correct = student.classChallengeRandomPoints(classname, question, challengername);
					}
					// history
					student.classChallengeAddHistory(classname, new models.History({ 
						question: question.question, 
						correct: correct 
					}), challengername);
					// get next question
					var done = student.classChallengeDone(classname, challengername);
					if (done) {
						student.classChallengeCommit(classname, challengername);
					}
				    student.save(function(err) {
				    	if (err) console.log(err);
						if (student.username != username) {
							var challenger = student.classChallenge(classname, challengername);
							challenger.username = student.username;
							challengers.push(challenger);
						} else {
							user = student;
						}
						numstudents--;
						if (numstudents == 0) {
							var userChallenge = user.classChallenge(classname, challengername);
							var data = {
						        correct: user.classChallengeCorrect(question, challengername),
						        selected: selected,	// user
						        timedOut: timedOut,	// user
						        correctAnswer: question.answer,
						        tags: question.tags,
								classname: classname,
								user: user,
								userChallenger: userChallenge,
								challengers: challengers,
								done: !userChallenge.active,
								studentBattle: studentBattle, // user
								helpers: { 
									pixels: pixels, 
									pixelsTotalPoints: pixelsTotalPoints, 
									totalPoints: totalPoints 
								}
						    };
						    res.render('finalanswer', data);
						}
				    });
				});
			}
		});
	});

	/*if (username) {
		// objects
		var classObject = findClass(classname);
		var userObject = findUser(username);
		var userClassObject = findUserClass(userObject, classname);
		var question = findQuestion(classObject, qid);
		var challengers = [];
		
		if (!studentBattle) {
			challengers = findChallengers(userObject, classname);
		} else { // TODO...
			var challengerUserObect = findUser(req.params.username);
			var challengerClassObject = findUserClass(challengerUserObect, classname);
			challengerClassObject.username = req.params.username;
			challengers.push(challengerClassObject);
		}
		
		// update points
		var correct = selected == question.answer;
		var userI = findUserIndex(username);
		var userClassI = findUserClassIndex(Users[userI].user, classname);
		if (correct) {
			for (t in question.tags) {
				// current challenge points
				Users[userI].user
				.classes[userClassI].class
				.currentChallenge.points += question.tags[t].points;
				// current challenge tags
				Users[userI].user
				.classes[userClassI].class
				.currentChallenge.tags.push(question.tags[t]);
			}
		}
		// update history
		Users[userI].user.classes[userClassI].class.history.splice(0, 0,{
			question: question.question,
			correct: correct
		});
		var done = !nextQuestion(
			Users[userI].user.classes[userClassI].class, 
			classObject
		);
		if (done) {
			endCurrentChallenge(username, classname, studentBattle);
		}
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
			studentBattle: studentBattle,
			helpers: { pixels: pixels }
	    };
	    res.render('finalanswer', data);
	} else {
		res.redirect('/login');
	}*/
};

exports.view.leaders = function(req, res) {
	var username = req.session.username;
    var classname = req.params.classname;
	if (!username) {
		res.redirect('/login');
		return;
	}
	if (username != req.params.username) {
		res.redirect('/' + username + '/home');
		return;
	}
	models.User.find({ "classes.name": classname }).exec(function(err, users) {
		if (err) console.log(err);
		var leaderboard = Leaderboard(classname, 10, username, users);
	    var data = {
	        classname: classname,
	        username: username,
	        leaderboard: leaderboard,
	        helpers: { place: leaderPlace, totalPoints: totalPoints }
	    }
	    res.render('leaders', data);
	});
    /*var leaderboard = Leaderboard(classname, 10, username);
    var data = {
        classname: classname,
        username: username,
        leaderboard: leaderboard,
        helpers: { place: leaderPlace, totalPoints: totalPoints }
    }
    res.render('leaders', data);*/
}

exports.view.classprofile = function(req, res) {
	if (!req.session.username) {
		res.redirect('/login');
		return;
	}
	models.User.findOne({ username: req.session.username }).lean().exec(function(err, userObject) {
		if (err) console.log(err);
		models.User.findOne({ username: req.params.username }).lean().exec(function(err, profileObject) {
			if (err) console.log(err);
			var classname = req.params.classname;
	        if (userObject && profileObject) {
	            var data = { 
	                user: userObject, 
	                profile: profileObject,
	                self: userObject.username == profileObject.username,
					classname: classname,
	                helpers: { foreach: foreach }
	            };
	            res.render('profile', data);
	        } else {
	        	res.redirect('/login');		// XXX
	        }
		});
	});
    /*if (!req.session.username) {
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
    }*/
};

exports.view.profile = function(req, res) {
	var username = req.session.username;
	if (!username) {
		res.redirect('/login');
		return;
	}
	models.User.findOne({ username: username }).lean().exec(function(err, user) {
		if (err) console.log(err);
		if (user && user.online) {
            var data = { 
                user: user,
                profile: user,
				self: true,
                helpers: { foreach: foreach } 
            };
            res.render('profile', data);
		} else {
			res.redirect('/login');
		}
	});
    /*if (username) {
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
    }*/
};

exports.view.editprofile = function(req, res) {
	var username = req.session.username;
	if (!username) {
		res.redirect('/login');
		return;
	}
	models.User.findOne({ username: username }).exec(function(err, user) {
		if (err) console.log(err);
		if (user) {
            var data = { 
                user: user,
				success: 'Change the information you would like to change, and enter your password to submit changes.',
                helpers: { foreach: foreach } 
            };
            res.render('editprofile', data);
		} else {
			res.redirect('/'+username+'/home');
		}
	});
};

exports.view.addclass = function(req, res) {
    function sortAlpha(a,b) {
        return a.class.name.localeCompare(b.class.name);
    }
    models.User.findOne({ username: req.params.username }, function(err, userObject) {
    	if (err) console.log(err);
	    if (userObject) {
			models.Class.find().lean().exec(function(err, Classes) {
		        var classes = [];
		        for (c in Classes) {
		            var disable = false;
		            for (uc in userObject.classes) {
		                if (userObject.classes[uc].name == Classes[c].name) {
		                    disable = true;
		                    break;
		                }
		            }
		            classes.push({ 'class': { 
						name: Classes[c].name, 
						description: Classes[c].description, 
						disable: disable 
					} });
		        }
		        classes.sort(sortAlpha);
		        res.render('addclass', { user: userObject, classes: classes });
			});
	    } else {
	        res.render('login');
	    }
    });
	
	/*var userObject = findUser(req.params.username);
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
    }*/
};

// API

exports.api.login = function(req, res) {
    var username = req.query.username;
	var password = req.query.password;
	models.User.findOne({ username: username, password: models.encodePassword(password) })
	.exec(function(err, user) {
		if (err) console.log(err);
		if (user) {
			user.online = true;
			user.save(function(err) {
				if (err) console.log(err);
		        req.session.username = username;
		        res.redirect('/'+username+'/home');
			});
		} else {
	        res.render('login', { 
				error: 'Error: incorrect username & password.',
				username: username
			});
		}
	});
    /*var userObject = findUser(username);
    if (userObject) {
        req.session.username = userObject.username;
        res.redirect('/'+username+'/home');
    } else {
        res.render('login', { 
			error: 'Error: incorrect username & password.',
			username: username
		});
    }*/
};

exports.api.signup = function(req, res) {
    var username = req.query.username;
    var email = req.query.email;
	var password = req.query.password;
	if (!username || !email || !password) {
		res.render('signup', {
			error: 'Error: all fields must be filled out.',
			username: username,
			email: email,
			password: password
		});
		return;
	}
	models.User.findOne({ username: username }).exec(function(err, user) {
		if (!user) {
			var newUser = new models.User({
				username: username,
				email: email,
				online: true,
				classes: []
			});
			newUser.set('password', password);
			newUser.save(function(err) {
				if (err) console.log(err);
				req.session.username = username;
				res.redirect('/'+username+'/home');
			});
		} else {
	    	res.render('signup', {
	    		error: 'Error: Username ' + username + ' already exists. Choose another one.',
				username: '',
				email: email,
				password: password
	    	});
		}
	});
    /*var userObject = findUser(username);
    if (!userObject) {
        userObject = User(username, email);
        Users.push(userObject);
    } else {
    	res.render('signup', {
    		error: 'Error: username ' + username + ' already exists. Choose another one.',
			username: '',
			email: email,
			password: password
    	});
		return;
    }
    req.session.username = username;
    res.redirect('/'+username+'/home');*/
};

exports.api.addclass = function(req, res) {
    var username = req.params.username;
	models.User.findOne({ username: username }).exec(function(err, user) {
		if (err) console.log(err);
		if (user) {
			var classesToAdd = req.query.classes;
		    var count = req.query.count;
			var userClasses = user.classes;
			var query = [];
	        for (var c = 0; c < count; c++) {
	            var dontAdd = false;
	            var classToAdd = count == 1 ? classesToAdd : classesToAdd[c];
	            for (uc in userClasses) {
	                if (classToAdd == userClasses[uc].name) {
	                    dontAdd = true;
	                }
	            }
	            if (!dontAdd) {
	                query.push({ name: classToAdd });
	            }
	        }
			models.Class.find({ $or: query }).lean().exec(function(err, classes) {
				if (err) console.log(err);
				for (c in classes) {
					var classObject = classes[c];
					if (classObject) {
						user.classes.push(new models.UserClass(UserClassData(classObject)));
					}
				}
				user.save(function(err) {
					if (err) console.log(err);
					res.redirect('/' + username + '/home');
				});
			});
		} else {
			res.redirect('/login');
		}
	});
	
	{
    /* var u = findUserIndex(username);
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
    res.redirect('/' + username + '/home');*/
	}
};

exports.api.classes = function(req, res) {
    var username = req.params.username;
	models.User.findOne({ username: username }).exec(function(err, user) {
		if (err) console.log(err);
		if (username && user) {
			res.send({
				classes: user.classes,
				colors: Colors
			});
		} else {
			res.redirect('/login');
		}
	});
	
    /*var data = {
        classes: null,
        colors: null
    };
    if (req.session.username) {
        data.classes = findUser(username).classes;
        data.colors = Colors;
    } else {
        res.redirect('/login');
    }
    res.send(data);*/
};

exports.api.editprofile = function(req, res) {
	var username = req.session.username;
	if (!username) {
		res.redirect('/login');
		return;
	}
	models.User.findOne({ username: username}).exec(function(err, currUser) {
		models.User.findOne({ username: username, password: models.encodePassword(req.query.password) })
		.exec(function(err, user) {
			if (err) console.log(err);
			var newUsername = req.query.username;
			var newEmail = req.query.email;
			var newPassword = req.query.newpassword;
			var data = { 
				error: null,
				success: null,
				user: {
					username: newUsername,
					email: newEmail
				},
		        helpers: { foreach: foreach }
		    };
			if (!user) {
				data.error = 'Error: Incorrect password.';
				res.render('editprofile', data);
				return;
			}
			var nothingChanged = true;
			if (newUsername && newUsername != user.username) {
				user.username = newUsername;
				nothingChanged = false;
			}
			if (newEmail && newEmail != user.email) {
				user.email = newEmail;
				nothingChanged = false;
			}
			if (newPassword) {
				user.set('password', newPassword);
				nothingChanged = false;
			}
			user.save(function(err) {
				var retUser = user;
				if (err) {
					console.log(err);
					if (err.err.indexOf('email') != -1) {
						if (!data.error) data.error = '';
						else data.error += '\n';
						data.error += 'Error: The email '+ newEmail + ' is already in use. Please choose a different email.'
						retUser = currUser;
					}
					if (err.err.indexOf('username') != -1) {
						if (!data.error) data.error = '';
						else data.error += '\n';
						data.error += 'Error: The username '+ newUsername + ' is already in use. Please choose a different username.'
						retUser = currUser;
					}
				} else if (nothingChanged) {
					data.success = 'Nothing was changed.'
					retUser = currUser;
				} else {
					data.success = 'Success: Your profile was changed.';
					req.session.username = retUser.username;
					req.params.username = retUser.username;
				}
				data.user = retUser;
				res.render('editprofile', data);
			});
		});
	});
	/*var user = findUser(username);
	var newUsername = req.query.username;
	var newPassword = req.query.password;
	var newEmail = req.query.email;
	var data = { 
		error: null,
		success: null,
        user: user,
        helpers: { foreach: foreach }
    };
	if (newUsername && newUsername != user.username) {
		if (findUser(newUsername)) {
			data.error = 'Error: That username is already taken.';
			newUsername = username;
		}
	} else {
		newUsername = username;
	}
	if (!(newPassword && newPassword != user.password)) {
		newPassword = user.password;
	}
	if (!(newEmail && newEmail != user.email)) {
		newEmail = user.email;
	}
	if (!data.error) {
		var i = findUserIndex(username);
		Users[i].user.username = newUsername;
		Users[i].user.password = newPassword;
		Users[i].user.email = newEmail;
		data.success = 'Success: Your profile was changed.';
	}
	res.render('editprofile', data);*/
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
            var classObject = userObject.classes[i];
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
            var classObject = userObject.classes[i];
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

function Leaderboard(classname, size, username, users) {
    function sortDescending(a,b) {
        return totalPoints(b.leader)-totalPoints(a.leader);
    }
    
    var students = [];
    for (u in users) {
        var user = users[u];
        var leader = user.userClass(classname);
        if (leader) {
            leader.username = user.username;
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

function UserClassData(classObject) {
	if (!classObject) return null;
    var userClassData = {
        name: classObject.name,
        classname: classObject.name,
        tags: [],
        history: [],
		records: []
    };
	for (c in classObject.challenges) {
		var classChallenge = classObject.challenges[c];
		var challenge = new models.Challenge({
			lecture: classChallenge.lecture,
			active: classChallenge.active,
			classname: classChallenge.classname,
			tags: [],
			questions: classChallenge.questions,
			history: []
		});
		for (t in classChallenge.tags) {
			challenge.tags.push(new models.Tag({
				name: classChallenge.tags[t].name
			}));
		}
		userClassData.records.push(challenge);
	}
    for (t in classObject.tags) {
        userClassData.tags.push(new models.Tag({
        	name: classObject.tags[t].name
        }));
    }
	return userClassData;
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

function Question(questionObject) {
	var question = null;
	if (questionObject) {
		var options = questionObject.choices;
		var shuffledOptions = shuffle(options);
	    question = {
	        id: questionObject._id,
	        question: questionObject.question,
	        optionA: shuffledOptions[0],
	        optionB: shuffledOptions[1],
	        optionC: shuffledOptions[2],
	        optionD: shuffledOptions[3],
			correctAnswer: questionObject.answer,
	        tags: questionObject.tags,
			classname: questionObject.classname
	    }
	}
	return question;
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function nextQuestion(userClassObject, questions) {
	for (q in questions) {
		var questionObject = questions[q];
		var different = true;
		for (h in userClassObject.history) {
			var entry = userClassObject.history[h];
			different &= (entry.question != questionObject.question);
		}
		if (!different) {
			continue;
		}
		var options = questionObject.choices;
		var shuffledOptions = shuffle(options);
	    var question = {
	        id: questionObject._id,
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

function findChallengers(userObject, users, classname) {
	var challengers = [];
	for (u in users) {
		var candidateObject = users[u];
		var candidateClassObject = findUserClass(candidateObject, classname);
		var challenge = findClassChallenge(candidateClassObject.records);
		if (candidateObject.username == userObject.username || !candidateClassObject) {
			continue;
		} else if (challenge) {
			candidateClassObject.currentChallenge = challenge;
			challengers.push(candidateClassObject);
		}
	}
	return challengers;
}

function initCurrentChallenge(username, classname, studentBattle) {
	for (u in Users) {
		var userObject = Users[u].user;
	    if (userObject && userObject.username == username) {
	        for (i in userObject.classes) {
	            var userClassObject = userObject.classes[i].class;
	            if (userClassObject && userClassObject.name == classname) {
	                Users[u].user.classes[i].class.currentChallenge = {
						points: 0,
						possible: possiblePoints(classname), 
						lecture: !studentBattle,
						active: true,
						tags: []
					};
	            }
	        }
	    }
	}
}

function endCurrentChallenge(username, classname, studentBattle) {
	var u = findUserIndex(username);
	var i = findUserClassIndex(Users[u].user, classname);
	
	var userObject = Users[u].user;
	var userClassObject = userObject.classes[i].class;
	var currentChallenge = userClassObject.currentChallenge;
	
	for (ct in currentChallenge.tags) {
		for (ut in userClassObject.tags) {
			if (userClassObject.tags[ut].tag == currentChallenge.tags[ct].tag) {
				Users[u].user.classes[i].class.tags[ut].points += currentChallenge.tags[ct].points;
				break;
			}
		}
	}
	Users[u].user.classes[i].class.currentChallenge.active = false;
}

function possiblePoints(classname) {
	var classObject = findClass(classname);
	var total = 0;
	for (q in classObject.questions) {
		for (t in classObject.questions[q].tags) {
			total += classObject.questions[q].tags[t].points;
		}
	}
}

function findClassChallenge(challenges) {
	for (c in challenges) {
		if (challenges[c].lecture && challenges[c].active) {
			return challenges[c];
		}
	}
	return null;
}

function findClassChallengeIndex(challenges) {
	for (c in challenges) {
		if (challenges[c].lecture && challenges[c].active) {
			return c;
		}
	}
	return null;
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
	//console.log('pts: ' + points + 'px: ' + Math.floor(points * PX / 100));
	return Math.floor(points * PX / 100);
}

function pixelsTotalPoints(leader) {
    return pixels(totalPoints(leader)+'');
}








