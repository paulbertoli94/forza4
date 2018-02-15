var vals = function() {
	this.colors = ["gold", "red"];
	this.cols = [0,0,0,0,0,0,0];
	this.myTurn = false;
	this.end = false;

	return this;
};

//values.end = false;
//values.myTurn = false;
//for (var z = 0; z < 6; z += 1) {
//	values.cols[i] = 0;
//	}


//socket.disconnect();
$("#whoPlaysMessage").css("display", "inline");
$("#whoPlaysMessage").html("Forza 4");
$("#attesa").html("In attesa di un'altro giocatore ");
$("#winner").html("");


var values = vals();
var container = $("#container");
var socket = io.connect('http://localhost:8080');

	socket.on("message", function(data) {
	//if new move is sent from opponent
	if (data.move!= null) {
		values.myTurn = true;
		$("#whoPlaysMessage").html("È il tuo turno. Gioca!");
		console.log("received ", data.move);
		fillTheHole(data.move, oponentColor);
	}
	//begining of the game, both players are on, server sends who plays first
	if (data.turn) {
		playerColor = values.colors[data.turn-1];
		oponentColor = values.colors[data.turn % 2];

		if(data.turn == 1 && !values.end)
		{
			values.myTurn = true;
			$("#whoPlaysMessage").html("Inizi tu a giocare!");
			$("#attesa").html("");
		}
		else {
			$("#whoPlaysMessage").html("Aspetta che il tuo avversario giochi!");
			$("#attesa").html("");
		}

		for( var i = 0; i < 7; i += 1) {
			$("#arrow"+i).css("background-color", playerColor);
		}
	}
	//server sends who won, end of the game
	if (data.win) {
		console.log(data.win);
		if (data.win == "win") {$("#winner").html("HAI VINTO!!!");
			setTimeout(function(){ location.reload(); }, 5000);
			$("#arrows").html("Nuova partita tra 5 secondi");
			};
		if (data.win == "lost") {$("#winner").html("HAI PERSO!!!");
			setTimeout(function(){ location.reload(); }, 5000);
			$("#arrows").html("Nuova partita tra 5 secondi");
			};
		if (data.win == "tie") {$("#winner").html("NON HA VINTO NESSUNO.");
			setTimeout(function(){ location.reload(); }, 5000);
			$("#arrows").html("Nuova partita tra 5 secondi");
			};

		$("#whoPlaysMessage").css("display", "none");

		values.end = true;
		values.myTurn = false;

	}
});

//fine on message

var sendMove = function(col){
	values.myTurn = false;
	$("#whoPlaysMessage").html("Aspetta che il tuo avversario giochi!");
	socket.emit("submit-move", {move: col});
};
var fillTheHole = function(col, color) {
	var index = "#cel" + col  + values.cols[col];
	$(index).css("background-color", color);
	values.cols[col] += 1;
};
var cleanBoard = function(){
	var myNode = document.getElementById("container");
	while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
	}
};
var createBoard = function(){
	for (var i = 5; i >= 0; i -= 1) {
			var tempRow = $("<div>").attr("id", "row" + i);
			for (var j = 0; j < 7; j += 1) {
				var tempCell = $("<div>").attr("id", "cel" + j + i).data("col", j);
				tempRow.append(tempCell);
			}
			container.append(tempRow);
	}
}

$(function(){
	cleanBoard();
	createBoard();
	
	//listeners for selecting column
	container.on("click", function(e) {
		if (values.myTurn && !values.end) {
			var selectedCol = $("#" + e.target.id).data("col");
			console.log(selectedCol);
			if (cols[selectedCol] < 6) { 	// limit check, if whole column if full do nothing
				fillTheHole(selectedCol, playerColor);
				sendMove(selectedCol);
				console.log("after sending ", selectedCol);
				$("#arrow"+selectedCol).css("visibility","hidden");
			}
		}
	});

	// on hover over the columns coin (arrow divs) appears on top
	container.children().hover(

		function(e) {
			$("#arrows > span").css("visibility","hidden");
			
			var selectedCol = $("#" + e.target.id).data("col");
			if (values.myTurn == true && !values.end) { 
			$("#arrow"+selectedCol).css("visibility","visible");
			$("#arrow"+selectedCol).css("animation-play-state","running");
			}

		},
			function(e){
			var selectedCol = e.target.id.charAt(3);
			$("#arrow"+selectedCol).css("visibility","hidden");
		}
	);

	if (end == true) {
		socket.disconnect();
	}
	
});

