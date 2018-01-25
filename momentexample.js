var moment = require('moment');
var now = moment();

console.log(now.format());

console.log(now.format("Do MMM, h:m:ssa, dddd")); 

console.log(now.format("X"));  //Unix timestamps in seconds
console.log(now.format("x"));  //Unix timestamps in miliseconds

var timestamp=1516857520410;
//var timestamp=now.format("X");
var time=moment.utc(timestamp);
console.log(time.local().format("h:ma"));
