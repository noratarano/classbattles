if (!Array.prototype.map) {
	Array.prototype.map = function(fun /*, thisp*/) {
		var len = this.length;
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var res = new Array(len);
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this) {
				res[i] = fun.call(thisp, this[i], i, this);
			}
		}
		return res;
	};
}

var mongoose = require('mongoose');
var models   = require('./models');

var local_database_name = 'classbattles';
var local_database_uri  = 'mongodb://localhost/' + local_database_name
var database_uri = process.env.MONGOLAB_URI || local_database_uri
mongoose.connect(database_uri);

models.User.find().remove().exec(function(err) {
models.Class.find().remove().exec(function(err) {
models.Tag.find().remove().exec(function(err) {
models.Question.find().remove().exec(function(err) {
models.Challenge.find().remove().exec(function(err) {
		
	// Setup Classes ///////////////////////////////////////////////////////////

	var num_classes = 3;

	var questions_json = require('./questions.json').questions;

	// CS147
	var CS147 = new models.Class({
		name: 'CS147',
		description: 'Introduction to Human-Computer Interaction',
		tags: []
	});
	setup_class("CS147");

	// CS106A
	var CS106A = new models.Class({
		name: 'CS106A',
		description: 'Programming Methodology',
		tags: []
	});
	setup_class("CS106A");

	// Triv101
	var Triv101 = new models.Class({
		name: 'Triv101',
		description: 'Great Trivia Questions',
		tags: []
	});
	setup_class("Triv101");

	// Helper Functions ////////////////////////////////////////////////////////

	function get_class(classname) {
		switch (classname) {
			case 'CS147': return CS147;
			case 'CS106A': return CS106A;
			case 'Triv101': return Triv101;
			default: console.log("Error: "+classname+" does not exist.");
		}
	}

	function all_done(err) {
		if (err) console.log(err);
		if (num_classes == 0) {
			console.log("All done!");
			mongoose.connection.close();
		}
	}

	function setup_class(classname) {
		var ClassModel = get_class(classname);
		for (i in questions_json) {
			// get json doc
			var json = questions_json[i];
			if (json.classs != classname) continue;
			// create the new question object & add fields
			var question = new models.Question({
				lecture: json.lecture,
				question: json.question,
				answer: json.answer,
				choices: json.choices,
				classname: json.classs,
				tags: []
			});
			// add tags to question object
			for (t in json.tags) {
				// create the tag object
				tag = new models.Tag(json.tags[t]);
				//tag.save();
				// add the tag object to the question
				question.tags.push(tag);
				// add tag to class
				var found = false;
				for (t in ClassModel.tags) {
					if (ClassModel.tags[t].name === tag.name) {
						found = true;
						ClassModel.tags[t].points += tag.points;
						break;
					}
				}
				if (!found) {
					console.log("["+classname+"] Adding tag: " + tag.name);
					ClassModel.tags.push(new models.Tag({ name: tag.name, points: tag.points }));
				}
			}
			question.save();
		}
		ClassModel.save(function(err) {
			num_classes--;
			all_done(err);
		});
	}
});
});
});
});
});