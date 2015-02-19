/*
	parenting
	v 0.0.1
	@ReidCarlberg - reid.carlberg@gmail.com
	February 18, 2015
*/

var Say = require('say');
var readline = require('readline');
var _ = require('lodash');

module.exports = function(options) {

	var name = options.name || "Child!";

	var prompts = [
		{"id": "1", "prompt": "have you used your napkin?"},
		{"id": "2", "prompt": "eat over your plate."},  	
		{"id": "3", "prompt": "sit up straight."},  	
		{"id": "4", "prompt": "chew with your mouth closed."},
		{"id": "5", "prompt": "stop doing that!"},  	
		{"id": "6", "prompt": "sit in your seat."},
		{"id": "7", "prompt": "use your fork."}
	];

	var sentenceQueue = [];
	var isSpeaking = false;

	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	function cleanSentenceText(target) {
		target = target.replace(/#/g,''); //hashtags
		target = target.replace(/@/g,''); //at signs
		target = target.replace(/http:\/\/t.co\/\S*/g,''); //t.co
		return target;
	}

	function handleSentence() {
		if (sentenceQueue.length == 0 || isSpeaking === true) {
			return;
		}
		isSpeaking = true;
		var currentSentence = sentenceQueue[0];
		sentenceQueue = sentenceQueue.splice(1,sentenceQueue.length-1);
		currentSentence = cleanSentenceText(currentSentence);
		Say.speak('Alex', currentSentence, function() {
			//console.log('***Said: ' + currentSentence);
			isSpeaking = false;
			handleSentence();
		})
	}

	function askQuestion() {
		rl.question("Yes? ", function(answer) {
			var prompt = _.find(prompts, { 'id': answer });

			if (prompt) {
				sentenceQueue.push(name + ", " + prompt.prompt);  	
				handleSentence();
			} else if (answer === "q") {
				rl.close();
				return;
			} else {
				for (i = 0; i < prompts.length; i++) {
					console.log(prompts[i].id + ". " + prompts[i].prompt);
				}
				console.log("(q)uit");
			}

			askQuestion();

		});

	}

	askQuestion();
}
