(function(window, document, $){
	"use strict";

	$(document).ready(function() {
		board.reset(24);
		$("#redo").on( "click", function() {
			board.reset(24);
		});
	});

	//	API middle man
	var api = {
		url: "./api",
		latest: function(limit) {
			if(typeof(limit)==='undefined') limit = 16;
			return this.url+"/latest.py?limit="+limit;
		}
	};

	//	Get helper
    var get = function(url) {
        var ret = new $.Deferred();
        $.getJSON(url, function(data) {
                ret.resolve(JSON.parse(data));
        });
        return ret.promise();
    };

    //	One card on the board
	function Card(id, face, row, col) {
		this.row = row;
		this.col = col;
		this.face = face;
		this.back = "whisper-logo.png";
		this.matchId = id;
		this.visible = false;
		this.matched = false;
		this.rowColId = "#"+this.row+"-"+this.col;
		this.show = function(side) {
			if(typeof(side)==='undefined') {	//	Flip the card
				this.visible = !this.visible;
				side = this.visible;
			} 
			if(side === false) {	//	Show card back
				this.visible = false;
				$(this.rowColId).css('background-image', 'url(' + this.back + ')');
			}
			else {	//	Show card face
				this.visible = true;
				$(this.rowColId).css('background-image', 'url(' + this.face + ')');
			}
		};
		this.match = function() {
			this.matched = true;
			$(this.rowColId).hide(1000);
		};
	}

	var board = {
		score: 0,
		visible: [],
		size: 10,
		board: [],
		create: function(wData) {
			var rows = 2;	//	Default to 2 rows of cards
			var length = wData.length;
			for(var i = 0; i < length; i++) {	//	Need duplicate entries for the game
				wData.push(wData[i]);
			}
			length = wData.length;
			if(length % 2 !== 0) {	//	Make sure we have an even number of images
				if(length < 2) {
					window.console.log("Can't create a board! Not enough cards!");
					return false;
				}
				else {
					wData.pop();	//	Remove an element to make length an even number
					length = wData.length;
				}
			}
			if(length % 3 === 0) {	//	Make 3 rows
				rows = 3;
			}

			for (var k = wData.length - 1; k > 0; k--) {	//	Fisher-yates shuffle
				var j = Math.floor(Math.random() * (k + 1));
				var temp = wData[k];
				wData[k] = wData[j];
				wData[j] = temp;
			}

			var cols = length/rows;
			var newBoard = [];
			for(var row = 0; row < rows; row++){
				newBoard[row] = [];    
				$("#board").append('<div class="row">');
				for(var col = 0; col < cols; col++){ 
					$("#board").append('<div class="card" id="'+row+'-'+col+'">');
					newBoard[row][col] = this.formCard(row, col, wData[row*cols + col]);   
					$("#board").append('</div>');  
				} 
				$("#board").append('</div>');   
			}
			this.board = newBoard;
			$(".card").on( "click", function(){
				var id = this.id.split("-");
				var row = parseInt(id[0], 10);
				var col = parseInt(id[1], 10);
				var card = board.board[row][col];
				board.update(card);
			});
		},
		reset: function(size) {	//	Reset the game board
			$("#board").empty();
			if(typeof(size)!=='undefined') {
				this.size = size;
			}
			get(api.latest(this.size/2)).done(function(data){
				this.visible = [];
				board.updateScore(0);
				board.create(data);
			});
		},
		formCard: function(row, col, data) {	//	Create a new card from whisper data
			var id = data["wid"];
			var image = data["url"];
			return new Card(id, image, row, col);
		},
		update: function(card) {	//	Update the board
			if(card.matched === true) {	//	Card already matched
				return;
			}
			var length = this.visible.length;
			if(length > 0) {	
				for(var i = 0; i < length; i++) {
					if(this.visible[i].rowColId === card.rowColId) {	//	Same card clicked twice
						return;
					}
				}
				if(length > 1) {	//	Too many cards already visible, hide them
					for(var j = 0; j < length; j++) {
						this.visible[j].show(false);
					}
					this.visible = [];
				}
			}
			this.visible.push(card);
			card.show();
			if(this.visible.length === 2) {	//	Found a match
				if(this.visible[0].matchId === this.visible[1].matchId && this.visible[0].rowColId !== this.visible[1].rowColId) {
					this.updateScore(this.score+1);
					this.visible[0].match();
					this.visible[1].match();
					this.visible = [];
				}
			}
		},
		updateScore: function(score) {
			this.score = score;
			$("#score-count").empty();
			$("#score-count").html(this.score*10);
		}
	};


})(window, document, window.jQuery);