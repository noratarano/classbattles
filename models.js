var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var SHA2 = new (require('jshashes').SHA512)();
var salt = "StanfordClassBattles";

// Schemas ////////////////////////////////////////////////////////////////////

var TagSchema = new Mongoose.Schema({
	name: 			{ type: String, required: true },
	points: 		{ type: Number, default: 0 }
});
exports.Tag = Mongoose.model('Tag', TagSchema);

// only live within userclass
var HistorySchema = new Mongoose.Schema({
	question: 		String,
	correct: 		Boolean,
});
exports.History = Mongoose.model('History', HistorySchema);

// Question ///////////////////////////

// only live within class or challenge
var QuestionSchema = new Mongoose.Schema({
	lecture: 		{ type: Boolean, required: true },
    question: 		{ type: String, required: true },
    answer: 		{ type: String, required: true },
    choices: 		[{ type: String, required: true }],
	classname: 		{ type: String, required: true },
	
    tags: 			[TagSchema]			// multiple
});
exports.Question = Mongoose.model('Question', QuestionSchema);

// Challenge //////////////////////////

var ChallengeSchema = new Mongoose.Schema({
	lecture: 		Boolean,
	active: 		{ type: Boolean, default: false },
	classname: 		String,
	challenger: 	String, 
	
	tags: 			[TagSchema],
	questions: 		[QuestionSchema],
	history: 		[HistorySchema],
});
ChallengeSchema.methods.resetTags = function() {
	for (t in this.tags) {
		this.tags[t].points = 0;
		this.markModified('tags');
	}
};
ChallengeSchema.methods.incr = function(name, points) {
	for (t in this.tags) {
		if (this.tags[t].name == name) {
			this.tags[t].points += points;
			this.markModified('tags');
			return;
		}
	}
};
ChallengeSchema.methods.addHistory = function(history) {
	if (history) {
		this.history.push(history);
		this.markModified('history');
	}
};
ChallengeSchema.methods.correct = function(question) {
	if (question) {
		for (h in this.history) {
			if (this.history[h].question == question.question) {
				return this.history[h].correct;
			}
		}
	}
	return false;
};
exports.Challenge = Mongoose.model('Challenge', ChallengeSchema);

exports.encodePassword = function(pass) {
	return SHA2.b64_hmac(pass, salt);
};

// User ///////////////////////////////

// only live within user
var UserClassSchema = new Mongoose.Schema({
	name: 			String,
	classname: 		String,
	
	tags: 			[TagSchema],
	records: 		[ChallengeSchema],	// multiple
	history: 		[HistorySchema]		// multiple
});
UserClassSchema.methods.incr = function(name, points) {
	for (t in this.tags) {
		if (this.tags[t].name == name) {
			this.tags[t].points += points;
			this.markModified('tags');
			return;
		}
	}
};
UserClassSchema.virtual('tags.total').get(function() {
	var total = 0;
	for (t in this.tags) {
		total += this.tags[c].points;
	}
	return total;
});
UserClassSchema.methods.addRecord = function(challenge) {
	if (challenge) {
		this.records.push(challenge);
		this.markModified('records');
	}
}
// class challenges
UserClassSchema.methods.classChallengeIndex = function(username) {
	if (username) {
		for (var r = 0; r < this.records.length; r++) {
			if (this.records[r].challenger == username) {
				return r;
			}
		}
	} else {
		for (var r = 0; r < this.records.length; r++) {
			if (this.records[r].lecture) {
				return r;
			}
		}
	}
	return -1;
};
UserClassSchema.methods.classChallenge = function(username) {
	console.log(username);
	var i = this.classChallengeIndex(username);
	return i > -1 ? this.records[i] : null;
};
UserClassSchema.methods.classChallengeIncrPoints = function(question, username) {
	var i = this.classChallengeIndex(username);
	if (question && i > -1) {
		for (t in question.tags) {
			this.records[i].incr(question.tags[t].name, question.tags[t].points);
		}
		this.markModified('records');
	}
};
UserClassSchema.methods.classChallengeRandomPoints = function(question, username) {
	if (question && Math.random() < 0.25) {
		this.classChallengeIncrPoints(question, username);
		return true;
	}
	return false;
};
UserClassSchema.methods.classChallengeDone = function(username) {
	var i = this.classChallengeIndex(username);
	if (i > -1) {
		var questions = this.records[i].questions;
		for (q in questions) {
			var question = questions[q];
			var inhistory = false;
			for (h in this.records[i].history) {
				var history = this.records[i].history[h];
				inhistory |= question.question == history.question;
			}
			if (inhistory) {
				continue;
			} else {
				return false;
			}
		}
	}
	return true;
};
UserClassSchema.methods.classChallengeCommit = function(username) {
	var i = this.classChallengeIndex(username);
	if (i > -1) {
		for (t in this.records[i].tags) {
			this.incr(this.records[i].tags[t].name, this.records[i].tags[t].points);
		}
		for (var h = 0; h < this.records[i].history.length; h++) {
			this.history.push(new exports.History({
				question: this.records[i].history[h].question,
				correct: this.records[i].history[h].correct
			}));
			this.markModified('history');
		}
		
		this.records[i].active = false;
		this.records.splice(i,1);
		this.markModified('records');
	}
};
UserClassSchema.methods.classChallengeQuestion = function(username) {
	var i = this.classChallengeIndex(username);
	if (i > -1) {
		var questions = this.records[i].questions;
		for (q in questions) {
			var question = questions[q];
			var inhistory = false;
			for (h in this.records[i].history) {
				var history = this.records[i].history[h];
				inhistory |= question.question == history.question;
			}
			if (inhistory) {
				continue;
			} else {
				return question;
			}
		}
	}
	return null;
};
UserClassSchema.methods.classChallengeAddHistory = function(history, username) {
	var i = this.classChallengeIndex(username);
	if (i > -1 && history) {
		this.records[i].addHistory(history);
		this.markModified('records');
	}
};
UserClassSchema.methods.classChallengeCorrect = function(question, username) {
	var i = this.classChallengeIndex(username);
	if (i > -1 && question) {
		return this.records[i].correct(question);
	}
	return false;
};
exports.UserClass = Mongoose.model('UserClass', UserClassSchema);

var UserSchema = new Mongoose.Schema({
	username: 		{ type: String, unique: true, trim: true, required: true },
	password: 		{ type: String, set: exports.encodePassword, required: true },
	email: 			{ type: String, unique: true, trim: true, lowercase: true, required: true },
	online: 		{ type: Boolean, default: false },
	b_test: 		{ type: Boolean, required: true }, 
	
	classes: 		[UserClassSchema],	// multiple
});
UserSchema.methods.userClass = function(classname) {
	for (c in this.classes) {
		if (this.classes[c].name == classname) {
			return this.classes[c];
		}
	}
	return null;
};
UserSchema.methods.userClassIndex = function(classname) {
	for (c in this.classes) {
		if (this.classes[c].name == classname) {
			return c;
		}
	}
	return -1;
};
UserSchema.methods.incrClass = function(classname, name, points) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		this.classes[i].incr(name, points);
		this.markModified('classes');
	}
};
UserSchema.methods.addRecord = function(classname, challenge) {
	var i = this.userClassIndex(classname);
	if (i > -1 && challenge) {
		this.classes[i].addRecord(challenge);
		this.markModified('classes');
	}
};
UserSchema.methods.classChallengeIndex = function(classname, username) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		return this.classes[i].classChallengeIndex(username);
	}
	return -1;
};
UserSchema.methods.classChallenge = function(classname, username) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		console.log(username);
		return this.classes[i].classChallenge(username);
	}
	return null;
};
UserSchema.methods.classChallengeIncrPoints = function(classname, question, username) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		this.classes[i].classChallengeIncrPoints(question, username);
		this.markModified('classes');
	}
	/*var r = this.classChallengeIndex(classname);
	if (i > -1 && r > -1) {
		for (t in question.tags) {
			for (rt in this.classes[i].records[r].tags) {
				if (this.classes[i].records[r].tags[rt].name == question.tags[t].name) {
					this.classes[i].records[r].tags[rt].points += question.tags[t].points;
					this.markModified('classes');
					this.markModified('classes.records');
					this.markModified('classes.records.tags');
				}
			}
		}
	}*/
};
UserSchema.methods.classChallengeRandomPoints = function(classname, question, username) {
	var i = this.userClassIndex(classname, username);
	if (i > -1) {
		var correct = this.classes[i].classChallengeRandomPoints(question, username);
		this.markModified('classes');
		return correct;
	}
	return false;
};
UserSchema.methods.classChallengeDone = function(classname, username) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		return this.classes[i].classChallengeDone(username);
	}
	return true;
};
UserSchema.methods.classChallengeCommit = function(classname, username) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		this.classes[i].classChallengeCommit(username);
		this.markModified('classes');
	}
};
UserSchema.methods.classChallengeQuestion = function(classname, username) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		return this.classes[i].classChallengeQuestion(username);
	}
	return null;
};
UserSchema.methods.classChallengeAddHistory = function(classname, history, username) {
	var i = this.userClassIndex(classname);
	if (i > -1) {
		this.classes[i].classChallengeAddHistory(history, username);
		this.markModified('classes');
	}
};
UserSchema.methods.classChallengeCorrect = function(question, username) {
	var i = this.userClassIndex(question.classname);
	if (i > -1 && question) {
		return this.classes[i].classChallengeCorrect(question, username);
	}
	return false;
};
exports.User = Mongoose.model('User', UserSchema);

// Class //////////////////////////////

var ClassSchema = new Mongoose.Schema({
	name: 			{ type: String, required: true },
	description: 	String,

	tags: 			[TagSchema],		// multiple
	challenges: 	[ChallengeSchema]
});
exports.Class = Mongoose.model('Class', ClassSchema);







