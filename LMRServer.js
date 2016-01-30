// IMPORTS


"use strict";

var SunCalc = require('./suncalc');
var t = require('tap');
var app = require('http').createServer();
var io = require('socket.io')(app);
var ledController = require("rpi-ws2801");
var colorLight = function(c,n,i,d){for(i=3;i--;c[i]=d<0?0:d>255?255:d|0)d=c[i]+n;return c}

// VARs
var currentColor = {"r":0,"g":0,"b":0};
var defaultColor = [255,255,255];
var darkTimer,lightTimer,isDark,isLight;
var firstRun = false;
var maxLED = 158;
ledController.connect(maxLED);
var interval;
var toggle = true;
var lat = 49.5121;
var lng = 8.5316;
var tempInterval2;
var colorChange = false;

// EXIT H&&LER
process.on( 'SIGINT', function() {
  ledController.clear(); 
  ledController.disconnect();
  process.exit( )
})
var multiplikator = Math.round(maxLED/4)*3;
var musicArray = new Buffer(multiplikator*4);
var times = SunCalc.getTimes(new Date(), lat, lng);
var sunset = times.sunset;
console.log(times.sunset);

// APP CONNECTION
io.on('connection', function (socket) {
	socket.emit('connected', { hello: 'world' });
	socket.on('color', function (data) {
		LMRemote.color(data);
	});
	socket.on('effect', function (data) {
		LMRemote.effect(data);
	});
	socket.on('auto', function (data) {
		LMRemote.automation(data);
	});
	socket.on('timer', function (data) {
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
	color : function(rgbColor){
			currentColor = rgbColor;
			if(!colorChange){
				this.clearAll();
				colorChange = true;
				this.sendColor(false,[rgbColor.r,rgbColor.g,rgbColor.b], function(result){
					LMRemote.sendColor(false,[currentColor.r,currentColor.g,currentColor.b], function(){});
					colorChange = false;
				});
			}
	},
	effect : function(data){
		this.clearAll();
		this.clearColor
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
			case "array":
				setTimeout(function(){
					var temp = data.array;
					/*if (temp == 0) {
						for (var i = 0; i < multiplikator*4; i+=3) {
							musicArray[i] = 0;
							musicArray[i+1] = 0;
							musicArray[i+2] = 0;
						}
					}*/
					if (temp >= 20 && temp <= 40) {
						for (var i = 0; i < multiplikator*4; i+=3) {
							musicArray[i] = 0;
							musicArray[i+1] = 0;
							musicArray[i+2] = 0;
						}
						for (var i = 0; i < multiplikator; i+=3) {
							musicArray[i] = 255;
							musicArray[i+1] = 0;
							musicArray[i+2] = 0;
						}
					}
					else if (temp >= 100 && temp <= 150) {
						for (var i = 0; i < multiplikator*4; i+=3) {
							musicArray[i] = 0;
							musicArray[i+1] = 0;
							musicArray[i+2] = 0;
						}
						for (var i = multiplikator; i < (multiplikator*2); i+=3) {
							musicArray[i] = 0;
							musicArray[i+1] = 255;
							musicArray[i+2] = 0;
						}
					}
					else if (temp >= 1000 && temp <= 2000) {
						for (var i = 0; i < multiplikator*4; i+=3) {
							musicArray[i] = 0;
							musicArray[i+1] = 0;
							musicArray[i+2] = 0;
						}
						for (var i = (multiplikator*2); i < (multiplikator*3); i+=3) {
							musicArray[i] = 0;
							musicArray[i+1] = 0;
							musicArray[i+2] = 255;
						}
					}
					else if (temp >= 6000 && temp <= 10000) {
						for (var i = 0; i < multiplikator*4; i+=3) {
							musicArray[i] = 0;
							musicArray[i+1] = 0;
							musicArray[i+2] = 0;
						}
						for (var i = (multiplikator*3); i < (multiplikator*4); i+=3) {
							musicArray[i] = 255;
							musicArray[i+1] = 255;
							musicArray[i+2] = 255;
						}
					}
					
					ledController.sendRgbBuffer(musicArray);
				},10);
			default:
				this.clearAll();
				break;
		}
	},
	automation : function(data){
		this.clearAll();
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
	clearColor : function(){
		this.sendColor(false,byteArray, function( err, result ){});
	},
	lightOn : function(){
		this.clearAll();
		this.color(defaultColor);
	},
	setDefaultColor : function(){
		defaultColor = currentColor;
	},
	sendColor : function(num,rgbArray,callback){
		setTimeout(function(){
			if(num){
				var x = 100;
				var transColor = new Buffer(ledController.getChannelCount());
				clearInterval(tempInterval2);
				tempInterval2 = setInterval(function(){
					var colorBuffer = new Buffer(ledController.getChannelCount());
					for (var i=0; i<rgbArray.length; i+=3){
						var temp = blendColors(rgbArray[i],rgbArray[i+1],rgbArray[i+2],defaultColor[i],defaultColor[i+1],defaultColor[i+2],(x/100))
						transColor[i] = temp.r;
						transColor[i+1] = temp.g;
						transColor[i+2] = temp.b;
					}
					for (var i=0; i<colorBuffer.length; i+=3){
						colorBuffer[i] = transColor[i];
						colorBuffer[i+1] = transColor[i+1];
						colorBuffer[i+2] = transColor[i+2];
					}
					ledController.sendRgbBuffer(colorBuffer);
					x--;
					if(x <= 0){
						clearInterval(tempInterval2);
						defaultColor = rgbArray;
						callback(true);
					} 
				}, 5);
			}else{
				var x = 100;
				clearInterval(tempInterval2);
				tempInterval2 = setInterval(function(){
					var temp = blendColors(rgbArray[0],rgbArray[1],rgbArray[2],defaultColor[0],defaultColor[1],defaultColor[2],(x/100))
					var colorBuffer = new Buffer(ledController.getChannelCount());
					for (var i=0; i<colorBuffer.length; i+=3){
						colorBuffer[i] = temp.r;
						colorBuffer[i+1] = temp.g;
						colorBuffer[i+2] = temp.b;
					}
					ledController.sendRgbBuffer(colorBuffer);
					x=x-5;
					if(x <= 0){
						clearInterval(tempInterval2);
						defaultColor = rgbArray;
						callback(true);
					} 
				}, 5);
			}
		}, 10);
	}
}

function blendColors(r1,g1,b1,r2,g2,b2,balance) {
    var bal = Math.min(Math.max(balance,0),1);
    var nbal = 1-bal;
    return {
            r : Math.floor(r1*nbal + r2*bal),
            g : Math.floor(g1*nbal + g2*bal),
            b : Math.floor(b1*nbal + b2*bal)
           };
}   

function rgb2hsv () {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
 	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
	s /= 100;
	v /= 100;
 
	if(s == 0) {
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
 
	h /= 60;
	i = Math.floor(h);
	f = h - i;
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
 
	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
 
		case 1:
			r = q;
			g = v;
			b = p;
			break;
 
		case 2:
			r = p;
			g = v;
			b = t;
			break;
 
		case 3:
			r = p;
			g = q;
			b = v;
			break;
 
		case 4:
			r = t;
			g = p;
			b = v;
			break;
 
		default:
			r = v;
			g = p;
			b = q;
	}
 
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hex (c) {
  var s = "0123456789abcdef";
  var i = parseInt (c);
  if (i == 0 || isNaN (c))
    return "00";
  i = Math.round (Math.min (Math.max (0, i), 255));
  return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
}

function convertToHex (rgb) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

function trim (s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }

function convertToRGB (hex) {
  var color = [];
  color[0] = parseInt ((trim(hex)).substring (0, 2), 16);
  color[1] = parseInt ((trim(hex)).substring (2, 4), 16);
  color[2] = parseInt ((trim(hex)).substring (4, 6), 16);
  return color;
}

// EFFECT FUNCTIONS
var Effects = {
	rainbow : function(){
		var colorBuffer = new Buffer(ledController.getChannelCount());
		var animationTick = 0.005;
		var angle = 0;
		var ledDistance = 0.3;
		var brightness = 1.0;
		var saturation = 1.0;
		interval = setInterval(function(){
			var ledData = Array()
			for (var x = 0; i < maxLED; i++) {		
				for (var i = 0; i < maxLED; i++) {		
					var hue = i/maxLED;
					var rgb = hsvToRgb(hue, saturation, brightness);
					ledData.push(rgb[0]);
					ledData.push(rgb[1]);
					ledData.push(rgb[2]);
				};
				ledController.sendRgbBuffer(ledData);
			};
		},5);
	},
	clock : function(){
		var fireColor = [255,215,40];
		var ledData = Array();
		interval = setInterval(function(){
			ledData = [];
			for (var x = 0; x < maxLED; x++){
				var flicker = Tools.randomInt(0,150);
				var r1 = fireColor[0]-flicker;
				var g1 = fireColor[1]-flicker;
				var b1 = fireColor[2]-flicker;
				if(g1<0) g1=0;
				if(r1<0) r1=0;
				if(b1<0) b1=0;
				ledData.push(r1);
				ledData.push(g1);
				ledData.push(b1);
			} 
			ledController.sendRgbBuffer(ledData);
		}, Tools.randomInt(50,150));
		/*
		var leds = maxLED / 60;
		var current = 0;
		interval = setInterval(function() {
			var byteArray = Array();
			if(current >= maxLED){
				current = 0;
			}
			for (var i = current; i >= 0; i--) {
				byteArray.push(currentColor.r) // R
				byteArray.push(currentColor.g) // G
				byteArray.push(currentColor.b) // B      
			};
			for (var i = maxLED-leds; i >= 0; i--) {
				byteArray.push(0) // R
				byteArray.push(0) // G
				byteArray.push(0) // B
			};
			current = current+leds;
			LMRemote.sendColor(false,byteArray, function( err, result ){});
		},1000);
		*/
	},
	mood : function(){
		var amplitudePhase = 0.0;
		var rotateColors = false;
		var baseColorChangeStepCount = 0;
		var baseHSVValue = 1;
		var tempColor = Array();
		var hueChange = 60;
		var numberOfRotates = 0;
		var baseColorChangeRate = 40;
		var baseColorRangeLeft = 0.0;
		var baseColorRangeRight = 360.0;
		var baseColorChangeIncreaseValue = 1.0 / 360.0;
		var baseHSVValue = 198;
		var blobs = 4;
		var colors = Array(maxLED);
		var amplitudePhaseIncrement = blobs * Math.PI * 0.1 / 20.0;
		var splitter = maxLED/(blobs*2);
		var set = [0,65,244,0,225,255,163,255,210,0,255,178,0,255,89];
		var counter = 0;
		interval = setInterval(function(){
					for (var i = 0; i <= maxLED; i++) {
						var baseHSVValue = (baseHSVValue + baseColorChangeIncreaseValue) % 1.0;
						var hue = (baseHSVValue + hueChange * Math.sin(2*Math.PI * i / maxLED)) % 1.0;
                		var rgb = hsvToRgb(hue, 73, 80);
                		tempColor.push(rgb[0]);
                		tempColor.push(rgb[1]);
                		tempColor.push(rgb[2]);
					}
					for (var i = maxLED; i >= 0; i--) {
						var amplitude = Math.max(0.0,Math.sin(-amplitudePhase + 2*Math.PI * blobs * i / maxLED));
						colors[3*i+0] = (parseInt(tempColor[3*i+0] * amplitude));
						colors[3*i+1] = (parseInt(tempColor[3*i+1] * amplitude));
						colors[3*i+2] = (parseInt(tempColor[3*i+2] * amplitude));
					}
					ledController.sendRgbBuffer(colors);
					amplitudePhase = (amplitudePhase + amplitudePhaseIncrement) % (2*Math.PI);
					tempColor = [];
					colors = [];
		},8);
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
			LMRemote.sendColor(false,byteArray, function( err, result ){});
    	}, 2000);
	},
	sunrise : function(){

	},
	nightsky : function(){
		var tempArray = Array();
		for (var i = maxLED; i >= 0; i--) {
			tempArray.push(41);
			tempArray.push(86);
			tempArray.push(143);
		}
		LMRemote.sendColor(true,tempArray,function(){});
		interval = setInterval(function() {
			var byteArray = Array();
			for (var i = maxLED; i >= 0; i--) {
				if(Tools.randomBoolean()){
					byteArray.push(41);
					byteArray.push(86);
					byteArray.push(143);
				}else{
					byteArray.push(255);
					byteArray.push(255);
					byteArray.push(255);				}
			};
			LMRemote.sendColor(true,byteArray,function(){});
		},10000);
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
		return Math.random() < 0.96;
	}
}