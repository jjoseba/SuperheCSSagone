var hexWaves = [
	[
		[1,0,1,1,1,1],
		[1,1,0,1,1,0],
		[1,1,1,0,1,1],
		[1,1,1,1,0,1],
		[1,1,1,1,1,0],
		[0,1,1,1,1,1]
	],[
		[1,1,0,1,1,1],
		[1,1,1,1,1,0],
		[1,1,0,1,1,1],
		[1,1,1,1,1,0],
		[1,1,1,0,1,1],
		[1,1,1,1,1,0],
		[1,0,1,0,1,1],
		[1,1,1,1,1,0]
	],[
		[1,0,1,0,1,1],
		[0,1,1,1,0,1],
		[1,0,1,0,1,1],
		[1,1,1,1,1,0],
		[0,1,1,1,1,1]
	]
];

var hexNum = 5;
var cycleDuration = 4000;
var hexDuration = cycleDuration / hexNum; 
var rotFactor = 0.3;

var requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(a){ setTimeout(a,20); };

$(function(){
	var currentWave;
	var game = $('#game');
	var menu = $('#menu');

	var hex = $('.hex').hide();
	var hexPath, hexes, arrow;
	
	var controls = { left: false, right: false, space: false};
	var rotation = 0;
	var startTime = prevTime = lastHex = 0;	
	
	window.onkeydown = function(e){
		if (e.keyCode == 32){
			if ((game.hasClass('stop')) && (!controls.space)){ startGame(); }
			controls.space = true; 
		}
		else if (e.keyCode == 39){ controls.left = true;  }
		else if (e.keyCode == 37){ controls.right = true; }
	}
	window.onkeyup = function(e){
		if (e.keyCode == 32) { controls.space = false; }
		else if (e.keyCode == 39) { controls.left = false;  }
		else if (e.keyCode == 37) { controls.right = false; }
	};
	
	function loadWave(){
		var nextWave = Math.floor(Math.random() * hexWaves.length);
		currentWave = hexWaves[nextWave].slice();
	}

	function updateHex(hexPosition){
		hex = hexes.eq(hexPosition);
		wave = currentWave.shift();
		hex.find('i').each(function(side){
			$(this).attr('class', wave[side]?'':'hide');
		});
		if (currentWave.length == 0) { loadWave(); }
	}
	
	function startGame(){
		menu.removeClass('start retry');
		game = game.clone().replaceAll(game).removeClass('stop');
		hexPath = game.find('#hexes').empty();
		arrow = game.find('#arrow');
		loadWave();
		lastHex = 0;
		
		for (i=0; i<hexNum; i++){ 
			hexPath.append(hex.clone().show()); 
		}
		hexes = game.find('.hex');
		for (i=0; i<hexNum; i++){ updateHex(i); }
		prevTime = startTime = new Date().getTime();	
		requestAnimationFrame(updateLogic); 
	}
	
	function endGame(totalTime){
		game.addClass('stop');
		menu.removeClass('start').addClass('retry');
		var bestTime = localStorage.getItem('superhecssagon-best') || 0;
		if (bestTime < totalTime){
			bestTime = totalTime;
			localStorage.setItem('superhecssagon-best', totalTime);
		}
		menu.find('#last').find('span').html(Math.floor(totalTime/1000)).next().html('.' + totalTime%1000);
		menu.find('#best').find('span').html(Math.floor(bestTime/1000)).next().html('.' + bestTime%1000);
		menu.find('.record').toggle(bestTime == totalTime);
	}
	
	function hexInCollisionZone(time){ return ((time > (hexDuration - 150)) && (time < (hexDuration - 50))); }
	
	function checkCollision(hex){
		var sector = (Math.floor(rotation/60) + 6) % 6;
		return !hexes.eq(hex).children().eq(sector).hasClass('hide');
	}
	
	var updateLogic = function(){
		if (game.hasClass('stop')) return;

		var now = new Date().getTime();
		var dt = now - prevTime;
		var currentHex = Math.ceil((now - startTime) / hexDuration) % hexNum;
		var gameTime = now - startTime;
		if (hexInCollisionZone( gameTime % hexDuration ) && (currentHex != lastHex)){
			if (gameTime > (cycleDuration - hexDuration)) { 
				updateHex(lastHex);
				var collides = checkCollision(currentHex);
				if (collides) endGame(gameTime);
			}
			lastHex = currentHex;
		}
		prevTime = now;
		if (controls.left) rotation += dt * rotFactor;
		else if (controls.right) rotation -= dt * rotFactor;
		rotation = rotation % 360;
		if (controls.left || controls.right) arrow.css('transform', 'rotate('+rotation+'deg)');
		requestAnimationFrame(updateLogic);	
	}
});
