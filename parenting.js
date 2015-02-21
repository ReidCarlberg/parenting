/*
	parenting
	v 0.0.6
	@ReidCarlberg
	reid.carlberg@gmail.com
	February 18, 2015
*/

var Say = require('say'),
	readline = require('readline'),
	_ = require('lodash'),
	fs = require('fs'),
	js = require('jsonfile'),
	util = require('util');

var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

var configFile = "./parenting.config.json";

var defaultConfig = {
	voice: "Alex",
	child: "DefaultName",
	prompt: "Yes?",
	mute: false,
	auto: false,
	prompts: [
		{"id": "1", "prompt": "have you used your napkin?"},
		{"id": "2", "prompt": "eat over your plate."},  	
		{"id": "3", "prompt": "sit up straight."},  	
		{"id": "4", "prompt": "chew with your mouth closed."},
		{"id": "5", "prompt": "stop doing that!"},  	
		{"id": "6", "prompt": "sit in your seat."},
		{"id": "7", "prompt": "use your fork."},
		{"id": "8", "prompt": "clean your room."}
	]
};

var Parenting = {

	configFile: "./parenting.config.json",

	config: {},

	sentenceQueue: [],

	isSpeaking: false,

	nextAuto: 0,

	handlers: {

		t: function() {
			console.log("test!");
		},

		q: function() {
			console.log('Goodbye!');
			that.saveConfig();
			rl.close();		
			process.exit(1);	
		},

		r: function() {
			console.log('Resetting config to defaults.');
			that.config = defaultConfig;
		},

		m: function() {
			if (that.config.mute === false) {
				console.log("muted!");
				that.config.mute = true;
			} else {
				console.log("unmuted!");
				that.config.mute = false;
			}
		},

		c: function(data) {
			var newChild = data.substring(data.indexOf(' ')+1);
			console.log("Setting new child name to " + newChild);
			that.config.child = newChild;
		},

		v: function(data) {
			//doesn't appear to actually change voices? 
			var voices = ["Alex", "Samantha"];
			var newVoice = data.substring(data.indexOf(' ')+1);
			if (_.contains(voices, newVoice) > -1) {
				console.log("Setting new voice to " + newVoice);
				that.config.voice = newVoice;
			} else {
				console.log("Voices: " + voices);
			}
		}, 

		p: function(data) {
			var newPrompt = data.substring(data.indexOf(' ')+1);
			if (newPrompt) {
				console.log("Setting new prompt to " + newPrompt);
				that.config.prompt = newPrompt;
			}
		},

		o: function(data) {
			//data = \o 11 something something 
			//where 11 is the key, something something is the prompt
			//console.log("handling o");
			if (_.trim(data).length < 6) {
				console.log("Syntax: \\o {id} {prompt} -- eg \\o 1 eat your vegetables");
				return;
			}
			var firstSpace = data.indexOf(' ');
			var secondSpace = data.indexOf(' ', data.indexOf(' '));
			var newPrompt = data.substring(firstSpace + secondSpace+1);
			var newId = data.substring(firstSpace + 1, firstSpace + secondSpace);
			//console.log("1:" + firstSpace + ", 2: " + secondSpace);
			var newElement = { 
				'id': newId,
				'prompt': newPrompt
			};

			that.config.prompts.push(newElement);
		},

		k: function() {
			console.log("Killing all prompts. \\r to reset to default.");
			that.config.prompts = [];
		},

		a: function() {
			if (that.config.auto === false) {
				console.log("Entering auto mode.");
				that.config.auto = true;
				that.handleNextAutoSentence();
				that.handleSentence();
			} else {
				console.log("Leaving auto mode.");
				that.config.auto = false;
			}
		}
	},

	handleNextAutoSentence: function() {
		//console.log("in handleNextAutoSentence");
		if (this.nextAuto > this.config.prompts.length - 1) {
			this.nextAuto = 0;
		}
		//console.log(this.nextAuto);
		this.sentenceQueue.push(this.buildAskSentence(this.config.prompts[this.nextAuto]));
		this.nextAuto++;
	},

	handleSentence: function() {
		that = this;
		if (this.sentenceQueue.length == 0 || this.isSpeaking === true || this.config.mute === true) {
			return;
		}
		isSpeaking = true;
		var currentSentence = this.sentenceQueue[0];
		this.sentenceQueue = this.sentenceQueue.splice(1,this.sentenceQueue.length-1);
		Say.speak('Alex', currentSentence, function() {
			isSpeaking = false;
			if (that.config.auto === true) {
				//console.log("in auto");
				if (that.config.prompts.length == 0) {
					console.log("Use \o id prompt to add a prompt.");
				} else {
					//console.log("getting next sentence");
					that.handleNextAutoSentence();
				}	
			}
			that.handleSentence();

		})
	},

	buildAskSentence: function(data) {
		that = this;
		var sentenceTemp = that.config.child + ", " + data.prompt;
		return sentenceTemp;
	},

	ask: function() {
		that = this;
		rl.question(that.config.prompt + " ", function(answer) {
			var handled = false;
			var prompt = _.find(that.config.prompts, { 'id': answer });

			if (prompt) {
				var sentenceTemp = that.buildAskSentence(prompt);
				if (that.config.mute === false) {
					that.sentenceQueue.push(sentenceTemp);					
					that.handleSentence();	
				} else {
					console.log("[muted] " + sentenceTemp);
				}
				handled = true;
			}

			if (!handled && answer.match(/^\\.*$/)) {
				var command = answer.substring(1,2);
				var handler = that.handlers[command];
				if (handler) {
					handler.call(that, answer);
					handled = true;
				}
			} 

			if (!handled) {
				for (i = 0; i < that.config.prompts.length; i++) {
					console.log(that.config.prompts[i].id + ". " + that.config.prompts[i].prompt);
				}
				console.log("\\(q)uit (a)uto (m)ute (v)oice (c)hild (r)eset (t)est (o)ption (k)ill");
			}

			that.ask();

		});
	},

	readConfig: function() {
		if (fs.existsSync(configFile)) {
			this.config = js.readFileSync(configFile);
		} else {
			this.config = defaultConfig;
		}
	},

	saveConfig: function() {
		js.writeFileSync(configFile, this.config);
	},

	start: function() {
		this.readConfig();
		if (this.config.auto === true) {
			console.log("Starting in Auto Parenting mode \\a to exit.");
			this.handleNextAutoSentence();
			this.handleSentence();
		}
		this.ask();
	}	

}

module.exports = Parenting;