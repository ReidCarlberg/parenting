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

		}
	},

	handleSentence: function() {
		if (this.sentenceQueue.length == 0 || this.isSpeaking === true || this.config.mute === true) {
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
		rl.question(that.config.prompt + " ", function(answer) {
			var handled = false;
			var prompt = _.find(that.config.prompts, { 'id': answer });

			if (prompt) {
				var sentenceTemp = that.config.child + ", " + prompt.prompt;
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
				console.log("\\(q)uit (m)ute (v)oice (c)hild (r)eset (t)est");
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
		this.ask();
	}	

}

module.exports = Parenting;