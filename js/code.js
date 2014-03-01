var hexLevel = [
	[1, 0, 0, 1, 0, 1],
	[1, 1, 0, 1, 1, 0],
	[1, 0, 1, 0, 1, 1],
	[1, 1, 1, 0, 0, 1],
	[1, 1, 0, 1, 1, 1],
	[1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 0, 1],
	[1, 0, 1, 1, 1, 1],
	[1, 1, 0, 0, 1, 1],
	[0, 1, 0, 1, 0, 1],
	[1, 0, 0, 1, 1, 1],
	[0, 1, 0, 1, 0, 1],
	[1, 0, 1, 0, 1, 0],
	[0, 1, 0, 1, 0, 1],
	[1, 0, 1, 0, 0, 1],
	[1, 1, 1, 0, 1, 1],
	[1, 1, 0, 1, 1, 1],
	[1, 0, 1, 1, 1, 1],
	[0, 1, 1, 1, 1, 1],
	[1, 1, 1, 0, 1, 0],
	[1, 1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1, 0]
];

var obstacleHTML = '<div class="obstacle"><i><hr></i><i><hr></i><i><hr></i><i><hr></i><i><hr></i><i><hr></i></div>';
var hexNum = 5;
var cycleDuration = 4000;
var hexDuration = cycleDuration / hexNum; 
var rotFactor = 0.3;

$(function(){
	
	var container = $('#container');
	var menu = $('#menu');
	var arrow = document.getElementById('arrow');
	var controls = { left: false, right: false, space: false};
	for (var i=0; i<hexNum; i++){ container.find('#obstacles').append(obstacleHTML); }
	
	window.onkeydown = function(e){
		if (e.keyCode == 32){
			if ( (container.hasClass('stopped')) && (!controls.space)){ startGame(); }
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
	
	var requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(a){setTimeout(a,20);};
	
	function updateHex(hex, bars){
		obstacles.eq(hex).find('i').each(function(i){
			$(this).attr('class', bars[i]?'':'hide');
		});
	}
	
	function startGame(){
		container = container.clone().replaceAll(container).removeClass('stopped');
		obstacles = container.find('.obstacle');
		arrow = document.getElementById('arrow');
		menu.removeClass('start retry');
		prevTime = startTime = new Date().getTime();	
		lastHex = 0;
		
		//Cargamos los hexs iniciales
		for (var i=0; i<hexNum; i++){ updateHex(i, hexLevel.shift()); }
		requestAnimationFrame(updateLogic); 
	}
	
	function endGame(totalTime){
		container.addClass('stopped');
		menu.removeClass('start').addClass('retry');
		var bestTime = localStorage.getItem('superhecssagon-best') || 0;
		if (bestTime < totalTime){
			bestTime = totalTime;
			localStorage.setItem('superhecssagon-best', totalTime);
		}
		console.log(bestTime);
		menu.find('#last').find('span').html(Math.floor(totalTime/1000)).next().html('.' + totalTime%1000)
		menu.find('#best').find('span').html(Math.floor(bestTime/1000)).next().html('.' + bestTime%1000)
		menu.find('.new-record').toggle(bestTime == totalTime);
	}
	
	function hexInCollisionZone(time){ return ((time > (hexDuration - 150)) && (time < (hexDuration - 50)));	}
	
	function checkCollision(hex){
		var sector = (Math.floor(rotation/60) + 6) % 6;
		return !obstacles.eq(hex).children().eq(sector).hasClass('hide');
	}
	
	var obstacles = container.find('.obstacle');
	var rotation = 0;
	var startTime = prevTime = new Date().getTime();	
	var lastHex = 0;
	
	var updateLogic = function(){
		if (container.hasClass('stopped')) return;
		
		var now = new Date().getTime();
		var dt = now - prevTime;
		var currentHex = Math.ceil((now - startTime) / hexDuration) % hexNum;
		var gameTime = now - startTime;
		if ( hexInCollisionZone( gameTime % hexDuration ) && (currentHex != lastHex) ){
			//Actualizamos el último Hex oculto siempre que haya pasado el tiempo inicial
			if (gameTime > (cycleDuration - hexDuration)) { 
				updateHex(lastHex, hexLevel.shift()); 
				var collides = checkCollision(currentHex);
				if (collides) endGame(gameTime);
			}
			lastHex = currentHex;
		}
		prevTime = now;
		if (controls.left) rotation += dt * rotFactor;
		else if (controls.right) rotation -= dt * rotFactor;
		rotation = rotation % 360;
		if (controls.left || controls.right) arrow.style['-webkit-transform'] = 'rotate(' + rotation + 'deg)';
		requestAnimationFrame(updateLogic);	
	}
});
