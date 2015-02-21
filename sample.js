//sample

var parenting = require("./parenting.js");

//set options -- note these are overridden if you customize via CLI
parenting.config.child = "Albert";
parenting.config.auto = true;

//get going
parenting.start();

