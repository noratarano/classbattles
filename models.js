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
	username: 		String,
	challenger: 	String, 
	
	tags: 			[TagSchema],
	questions: 		[QuestionSchema],
	history: 		[HistorySchema],
	challengerHistory: [HistorySchema]
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
ChallengeSchema.methods.incrPoints = function(question) {
	if (question) {
		for (t in question.tags) {
			this.incr(question.tags[t].name, question.tags[t].points);
		}
		this.markModified('questions');
	}
};
ChallengeSchema.methods.addHistory = function(history) {
	if (history) {
		this.history.push(history);
		this.markModified('history');
	}
};
ChallengeSchema.methods.addChallengerHistory = function(history) {
	if (history) {
		this.challengerHistory.push(history);
		this.markModified('challengerHistory');
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
ChallengeSchema.methods.nextQuestion = function() {
	var questions = this.questions;
	for (q in questions) {
		var question = questions[q];
		var inhistory = false;
		for (h in this.history) {
			var history = this.history[h];
			inhistory |= question.question == history.question;
		}
		if (inhistory) {
			continue;
		} else {
			return question;
		}
	}
	return null;
};
exports.Challenge = Mongoose.model('Challenge', ChallengeSchema);

// User ///////////////////////////////

exports.encodePassword = function(pass) {
	return SHA2.b64_hmac(pass, salt);
};

// only live within user
var UserClassSchema = new Mongoose.Schema({
	name: 			String,
	classname: 		String,
	
	tags: 			[TagSchema],
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
UserClassSchema.methods.addHistory = function(history) {
	if (history) {
		this.history.push(history);
		this.markModified('history');
	}
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
UserSchema.methods.incrClassQ = function(classname, question) {
	var i = this.userClassIndex(classname);
	if (question && i > -1) {
		for (t in question.tags) {
			this.classes[i].incr(question.tags[t].name, question.tags[t].points);
		}
		this.markModified('classes');
	}
};
UserSchema.methods.addHistory = function(classname, history) {
	var i = this.userClassIndex(classname);
	if (history && i > -1) {
		this.classes[i].addHistory(history);
		this.markModified('classes');
	}
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







