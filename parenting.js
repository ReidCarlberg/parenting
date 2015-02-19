/*
	parenting
	v 0.0.1
	@ReidCarlberg - reid.carlberg@gmail.com
	February 18, 2015
*/

var Say = require('say');
var readline = require('readline');
var _ = require('lodash');

var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

var Parenting = {

	name: "Phineas",

	prompts: [
		{"id": "1", "prompt": "have you used your napkin?"},
		{"id": "2", "prompt": "eat over your plate."},  	
		{"id": "3", "prompt": "sit up straight."},  	
		{"id": "4", "prompt": "chew with your mouth closed."},
		{"id": "5", "prompt": "stop doing that!"},  	
		{"id": "6", "prompt": "sit in your seat."},
		{"id": "7", "prompt": "use your fork."},
		{"id": "8", "prompt": "clean your room."}
	],

	sentenceQueue: [],

	isSpeaking: false,

	handleSentence: function() {
		if (this.sentenceQueue.length == 0 || this.isSpeaking === true) {
			return;
		}
		isSpeaking = true;
		var currentSentence = this.sentenceQueue[0];
		this.sentenceQueue = this.sentenceQueue.splice(1,this.sentenceQueue.length-1);
		Say.speak('Alex', currentSentence, function() {
			isSpeaking = false;
			this.handleSentence();
		})
	},

	ask: function() {
		that = this;
		rl.question("Yes? ", function(answer) {
			var prompt = _.find(that.prompts, { 'id': answer });

			if (prompt) {
				that.sentenceQueue.push(that.name + ", " + prompt.prompt);  	
				that.handleSentence();
			} else if (answer === "q") {
				rl.close();
				return;
			} else {
				for (i = 0; i < that.prompts.length; i++) {
					console.log(that.prompts[i].id + ". " + that.prompts[i].prompt);
				}
				console.log("(q)uit");
			}

			that.ask();

		});
	},

	start: function() {
		this.ask();
	}	

}

module.exports = Parenting;