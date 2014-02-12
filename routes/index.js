// Controller /////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// Data ///////////////////////////////////////////////////////////////////////

var Users = [
    { user: {
        username: 'Nora',
        email: 'ntarano@stanford.edu',
        about: 'EE Masters student at Stanford University.',
        classes: [{ class: { name: 'CS 147', classname: 'CS 147', totalPoints: 10 } }]
    }},
    { user: {
        username: 'Diana', 
        email: 'bdiana@stanford.edu',
        about: 'Awesome possum. Loves walks on the beach and being awesome, in general.',
        classes: [
            { class: {
                name: 'CS 147',
                classname: 'CS 147',
                totalPoints: 15,
                history: []
            }}
        ]
    }},
    { user: {
        username: 'Ish', 
        email: 'menjivar@stanford.edu',
        about: 'CS Junior at Stanford University.',
        classes: [{ class: { name: 'CS 147', classname: 'CS 147', totalPoints: 8 } }]
    }}
];
var Classes = [
    { class: {
        name: 'CS 147',
        description: 'Introduction to Human Computer Interaction',
        tags: ['js', 'html', 'css', 'servers'],
        questions: [{
            id: '#0',
            question: 'What does CSS stand for?',
            correctAnswer: 'Cascading Style Sheets',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'css'},{tag: 'servers'}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: ['html']
        }]
    }}, { class: {
        name: 'CS 154',
        description: 'CS Theory',
        tags: ['js', 'html', 'css', 'servers'],
        questions: [{
            id: '#0',
            question: 'What does CSS stand for?',
            correctAnswer: 'Cascading Style Sheets',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'css'},{tag: 'servers'}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: ['html']
        }]
    }}, { class: {
        name: 'CS 309A',
        description: 'Cloud Computing',
        tags: ['marketing', 'tech', 'servers'],
        questions: [{
            id: '#0',
            question: 'What does CSS stand for?',
            correctAnswer: 'Cascading Style Sheets',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: [{tag: 'css'},{tag: 'servers'}]
        },{
            id: '#1',
            question: 'What does HTML stand for?',
            correctAnswer: 'Hypertext Markup Language',
            incorrectAnswers: ['Chef Stephanie Santander', 'Channeling System Sustenance', 'Clear Skies and Slumber'],
            tags: ['html']
        }]
    }}
];


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
    if (username != req.session.username) {
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
    var username = req.params.username;
    var classname = req.params.classname;
    var userObject = findUser(username);
    var userClassObject = findUserClass(userObject, classname);
    var classObject = findClass(classname);
    userClassObject.tags = classObject.tags;
    var data = {
        user: userObject,
        class: userClassObject
    }
    
    res.render('class', data);
};

exports.view.challenge = function(req, res) {
    var questionObject = Classes[0].class.questions[0];   // TODO
    var question = {
        id: questionObject.id,
        question: questionObject.question,
        optionA: questionObject.incorrectAnswers[0],    // TODO make random
        optionB: questionObject.incorrectAnswers[2],
        optionC: questionObject.correctAnswer,
        optionD: questionObject.incorrectAnswers[1],
        tags: questionObject.tags
    }
    res.render('challenge', question);
};

exports.view.finalanswer = function(req, res) {
    var qid = req.query.qid;
    var timedOut = req.query.timedOut == 'true';
    var selected = req.query.selected;
    var question = findQuestion(Classes[0].class, qid); // TODO
    var data = {
        correct: selected == question.correctAnswer,
        selected: selected,
        timedOut: timedOut,
        correctAnswer: question.correctAnswer,
        tags: question.tags
    };
    res.render('finalanswer', data);
};

exports.view.leaders = function(req, res) {
    var classname = req.params.classname;
    var username = req.params.username;
    var leaderboard = Leaderboard(classname, 10, username);
    var data = {
        classname: classname,
        username: username,
        leaderboard: leaderboard,
        helpers: { place: leaderPlace }
    }
    res.render('leaders', data);
}

exports.view.classprofile = function(req, res) {
    var username = req.params.username;
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        var classname = req.params.classname;
        
        var userObject = findUser(req.session.username);
        var profileObject = findUser(username);
        
        var userClassObject = findUserClass(userObject, classname);
        var profileClassObject = findUserClass(profileObject, classname);
        
        if (profileClassObject) {
            userClassObject.username = userObject.username;
            profileClassObject.username = profileObject.username;
            profileClassObject.about = profileObject.about;
            var data = { 
                user: userClassObject, 
                profile: profileClassObject,
                self: userClassObject.username == profileClassObject.username,
                helpers: { foreach: foreach }
            };
            res.render('classprofile', data);
        } else {
            res.redirect('/login');
        }
    }
};

exports.view.profile = function(req, res) {
    var username = req.params.username;
    if (username == req.session.username) {
        var userObject = findUser(username);
        if (userObject) {
            var data = { 
                user: userObject,
                profile: userObject,
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
            classes.push({ class: { name: Classes[c].class.name, description: Classes[c].class.description, disable: disable } });
        }
        classes.sort(sortAlpha);
        res.render('addclass', { user: userObject, classes: classes });
    } else {
        res.render('login');
    }
}

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
    var classesToAdd = req.query.classes;
    var userClasses = Users[u].user.classes;
    var count = req.query.count;
    if (count == 1) {
        var dontAdd = false;
        var classToAdd = classesToAdd;
        console.log(classesToAdd);
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
    return null;
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
        return b.leader.totalPoints-a.leader.totalPoints;
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
    return { class: {
        name: classname,
        classname: classname,
        totalPoints: 0,
        history: []
    }};
}

function User(username, email) {
    return { user: {
        username: username, 
        email: email,
        about: '',
        classes: []
    }};
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
        return options.fn(item);
    }).join('');
}

function leaderPlace(index) {
    return index+1;
}











