// IMPORTS
"use strict";

var Hyperion = require('hyperion-client');
var SunCalc = require('./suncalc');
var t = require('tap');
var app = require('http').createServer();
var io = require('socket.io')(app);

// VARs
var currentColor = {"r":0,"g":0,"b":0};
var defaultColor = {"r":255,"g":255,"b":255};
var darkTimer,lightTimer,isDark,isLight;
var firstRun = false;
var maxLED = 192;
var interval;
var toggle = true;
var hyperion;


io.on('connection', function (socket) {
	LMRemote.firstConnect();
	socket.emit('connected', { hello: 'world' });
	socket.on('color', function (data) {
		console.log(data);
		LMRemote.color(data);
	});
	socket.on('effect', function (data) {
		console.log(data);
		LMRemote.effect(data);
	});
	socket.on('auto', function (data) {
		console.log(data);
		LMRemote.automation(data);
	});
	socket.on('timer', function (data) {
		console.log(data);
	});
	socket.on('defaultColor', function () {
		LMRemote.setDefaultColor();
	});
	socket.on('notify', function (data) {
		if(data.enable){
			LMRemote.effect(data);
		}else{
			LMRemote.clearAll();
			LMRemote.color(currentColor);
		}
	});
});
app.listen(5555);

// BASE FUNCTIONS
var LMRemote = {
	firstConnect : function(){
		if(!firstRun){
			while(!firstRun){
				hyperion = new Hyperion('127.0.0.1', 19444 );
				hyperion.on('connect', function(){
					firstRun = true;
					hyperion.setColor([ 255, 0, 0,0,255,0,0,0,255], function( err, result ){});
				});
				hyperion.on('error', function(error){
					console.error('error:', error)
				});
			}
		}
	},
	color : function(rgbColor){
			currentColor = rgbColor;
		    hyperion.setColor([currentColor.r,currentColor.g,currentColor.b], function( err, result ){});
	},
	effect : function(data){
		switch(data.name){
			case "clock":
				Effects.clock();
				break;
			case "mood":
				Effects.mood();
				break;
			case "notify":
				Effects.notify(data);
				break;
			case "sunrise":
				Effects.sunrise(data.color);
				break;
			case "rainbow":
				Effects.rainbow();
				break;
			case "nightsky":
				Effects.nightsky();
				break;
			default:
				this.clearAll();
				break;
		}
	},
	automation : function(data){
		switch(data){
			case "night":
				Timers.darkness();
				break;
			case "sunrise":
				Timers.sunrise();
				break;
			default:
				this.clearAll();
				break;
		}

	},
	clearAll : function(){
		clearInterval(interval);
	},
	lightOn : function(){
		this.color(defaultColor);
	},
	setDefaultColor : function(){
		defaultColor = currentColor;
	}
}

// EFFECT FUNCTIONS
var Effects = {
	rainbow : function(){
			hyperion.setEffect('Rainbow swirl', {}, function( err, result ){});
	},
	clock : function(){
		var leds = maxLED / 60;
		var current = 0;
		interval = setInterval(function() {
			var byteArray = Array();
			if(current >= maxLED){
				current = 0;
			}
			for (var i = current; i >= 0; i--) {
				byteArray.push(currentRed) // R
				byteArray.push(currentGreen) // G
				byteArray.push(currentBlue) // B      
			};
			for (var i = maxLED-leds; i >= 0; i--) {
				byteArray.push(0) // R
				byteArray.push(0) // G
				byteArray.push(0) // B
			};
			current = current+leds;
			hyperion.setColor(byteArray, function( err, result ){});
		},1000);
	},
	mood : function(){
		hyperion.setEffect('Cold mood blobs',{}, function( err, result ){});
	},
	notify : function(color){
		var half = maxLED / 2;
		interval = setInterval(function() {
			var byteArray = Array();
			for (var i = half; i >= 0; i--) {
				byteArray.push(currentColor.r) // R
				byteArray.push(currentColor.g) // G
				byteArray.push(currentColor.b) // B
			};
			for (var i = half; i >= 0; i--) {
				if(toggle){
					byteArray.push(color.r) // R
					byteArray.push(color.g) // G
					byteArray.push(color.b) // B      
				}else{
					byteArray.push(0) // R
					byteArray.push(0) // G
					byteArray.push(0) // B
				}
			};
			toggle = !toggle;
			hyperion.setColor(byteArray, function( err, result ){});
    	}, 2000);
	},
	sunrise : function(){

	},
	nightsky : function(){
		interval = setInterval(function() {
			var byteArray = Array();
			for (var i = maxLED; i >= 0; i--) {
				if(Tools.randomBoolean()){
					byteArray.push(41) // R
					byteArray.push(86) // G
					byteArray.push(143) // B
				}else{
					byteArray.push(255) // R
					byteArray.push(255) // G
					byteArray.push(255) // B 
				}
			};
			hyperion.setColor(byteArray, function( err, result ){});
		},5000);
	}
}

// TIME BASED FUNCTIONS
var Timers = {
	darkness : function(data){
		this.setDarknessTime();
		darkTimer = setInterval(function(){
			var d = new Date();
			if(d >= isDark){
				LMRemote.lightOn();
			}
		}, 60000);
	},	
	sunrise : function(data){
		this.setSunriseTime();
		lightTimer = setInterval(function(){
			var d = new Date();
			if(d >= isDark){
				Effects.sunrise();
			}
		}, 60000);
	},	
	updateEventTimes : function(){
		setInterval(function(){
			var d = new Date();
			var h = d.getHours();
			if(h === 0){
				this.setSunriseTime();
				this.setDarknessTime();
			}
		}, 60000);
	},
	setSunriseTime : function(){

	},
	setDarknessTime : function(){

	},
}


var Tools = {
	randomInt : function(low, high) {
		return Math.floor(Math.random() * (high - low) + low);
	},
	randomBoolean : function(){
		return Math.random() < 0.90;
	}
}