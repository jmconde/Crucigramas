/**
 * @author Jose
 */

(function($) {
    var methods = {
        init : function(options) {
            var $this = $(this),
            	defaultOpt = {
            		tile_w:20, 
            		tile_h:30,
        			NUMERAL_COUNT : 1, 
    				SELECT_MODE : 0,  // 0 Horizontal, 1 Vertical
    				ALPHABET : new RegExp(/[\wÑ]/),
    				GO_NEXT : false,
    				GO_BACK : false,
    				cluesContainer : $("#clues"),
    				labelHorClues : "Horizontales",
    				labelVerClues : "Verticales",
    				onError : function(a,b,c){alert("Error!\n"+a+"\n"+b+"\n"+c);console.log(a,b,c);},
    				onTimeout : function(){alert("Timeout!\n"+a+"\n"+b+"\n"+c);console.log(a,b,c);},
    				linkVerify : $("#btnVerify"),
    				tiles : new Array(),
    				borderColor : "#000",
    				borderWidth : 1
            	};
            $.fn.extend(defaultOpt, options);
        	$.ajax({
        		url: defaultOpt.url,
        		type : "get",
        		dataType : "json",
        		success : function(data){
        			defaultOpt.layout = data.layout;
        			defaultOpt.clues = data.clues;
        			defaultOpt.id = data.id;
        			$this.data("options", defaultOpt);
        			$this.palabrejas("create");
        		},
        		error : defaultOpt.onError,
        		timeout : defaultOpt.onTimeout
        	});
        },
        create : function(){
        	var i=0, j ,$this = $(this),options =  $this.data("options"), rows = options.layout.length,
        		tile, cols, numeral, isVoid, prev, up, next, down;
        	for( ; i < rows ; i++){
        		cols = options.layout[i].length;
        		for(j = 0 ; j < cols ; j++){
        			isVoid = $.trim(options.layout[i][j]) == "";
        			tile = $this.palabrejas("createTile",j,i, isVoid);
        			//options.tiles.push(tile.hide());
        			$this.append(tile);
        			//tile.fadeIn(Math.floor(Math.random()*1500));
        			if(!isVoid){
        				numeral = $this.palabrejas("setNumeral",j,i);
        				if(numeral != -1){
        					tile.append("<span class='numeral'>"+numeral+"</span>");
        				}
        			}
        		}
        	}
        	$this.css({
        		width: ((cols * options.tile_w) + (cols  * options.borderWidth) + 2) + "px",
        		height: ((rows * options.tile_h) + (rows * options.borderWidth) + 2) + "px"
        	});
        	$this.palabrejas("setBorders");
        	$this.palabrejas("addClues");
        	$this.palabrejas("addEvents");
        },
        addClues : function(){
        	var i = 0, $this = $(this),options =  $this.data("options"), len = options.clues[0].length, clue, li,
        		horClues = $("<div class='clue-container'><ul id='hor-clues'></ul></div>"), 
        		verClues = $("<div class='clue-container'><ul id='ver-clues'></ul></div>");
        		horClues.prepend("<h3>"+options.labelHorClues+"</h3>");
        		for(; i < len ; i++){
        			clue = options.clues[0][i];
        			li = $("<li><span>"+clue.numeral+"</span>"+clue.clue+"</li>");
        			clue.elem = li;
        			horClues.find("ul").append(li);
        		}
        		i = 0;
        		len = options.clues[1].length
        		verClues.prepend("<h3>"+options.labelVerClues+"</h3>");
        		for(; i < len ; i++){
        			clue = options.clues[1][i];
        			li = $("<li><span>"+clue.numeral+"</span>"+clue.clue+"</li>");
        			clue.elem = li;
        			verClues.find("ul").append(li);
        		}
        		options.cluesContainer.append(horClues).append(verClues);
        },
        setNumeral : function(x,y){
        	var k=0, i, $this = $(this),options =  $this.data("options"), clue;
        	for(; k < 2 ; k++){
        		len = options.clues[k].length;
        		for(i = 0 ; i < len ; i ++){
	        		clue = options.clues[k][i];
	        		if(clue.x == x && clue.y == y){
	        			clue.numeral = options.NUMERAL_COUNT++;
	        			return clue.numeral;
	        		}
	        	}	
        	}
        	return -1;
        },
        createTile : function(pos_x, pos_y, isVoid){
        	var $this = $(this),options =  $this.data("options")
        		width = options.tile_w,
        		height = options.tile_h,
        		left = (pos_x * options.tile_w) ,
        		tp = (pos_y * options.tile_h),
        		tile = $("<span id='t"+pos_x+"-"+pos_y+"' class='tile'></span>").css({
					width	: 	width,
					height	: 	height
				});
			if(isVoid){
				tile.addClass("void");
			}else{
				tile.addClass("active");
				tile.append("<input type='text' maxlength='1' size='1' />")
				tile.click(function(e){$this.palabrejas("tileClicked",e,$(this))});
			}
			if(pos_x == 0){
				tile.addClass("left");
			}
			if(pos_y == 0){
				tile.addClass("top");
			}
			tile.data("pos",{x:parseInt(pos_x,10), y: parseInt(pos_y,10)});		
			return tile;
       },
       addEvents: function(input){
       		var $this = $(this),options =  $this.data("options"), pos, next, send, val, tile;
       		options.linkVerify.click(function(e){
       			send = "";
       			$(".tile").each(function(){
    				tile = $(this);
    				if(tile.hasClass("void")){
    					send = send + "#";
    				}else{
    					val = ((tile.find("input").val() == "") ? " " : tile.find("input").val());
    					send = send + val.toUpperCase();
    				}
    			});
    			console.log(send);
       			$.ajax({
	        		url: options.verify,
	        		type : "post",
	        		dataType : "json",
	        		data : {data : send},
	        		success : function(data){
	        			if(data.correct == "true"){
	        				alert("Correcto!!!");
	        			}else if(data.correct == "false"){
	        					alert("INcorrecto!!!");
	        			}
	        		},
	        		error : options.onError,
	        		timeout : options.onTimeout
	        	});		
       		});
       		$(".tile input").keydown(function(e){
       			var keynum;
				if(window.event){
					keynum = e.keyCode; 	//IE
				}else if(e.which){
					keynum = e.which; 	// Netscape/Firefox/Opera
				}
				//console.log(keynum);
				if(keynum == 8){
					if($(this).val() == ""){
						options.GO_BACK = true;
					}
					return true;
				}
				if(options.ALPHABET.test(String.fromCharCode(keynum))){
					options.GO_NEXT = true;
					return true;
				} 
				return false;
       		}).keyup(function(e){
       			if(options.GO_NEXT){
					pos = $(this).parent(".tile").data("pos");
					if(options.SELECT_MODE == 0){
						next = $this.palabrejas("getTile",(pos.x + 1), pos.y);
					}else{
						next = $this.palabrejas("getTile",pos.x, (pos.y + 1));
					}
					if(next != null){
						next.click();
						next.find("input").focus();
					}
					options.GO_NEXT = false;			
				}
				if(options.GO_BACK){
					pos = $(this).parent(".tile").data("pos");
					if(options.SELECT_MODE == 0){
						next = $this.palabrejas("getTile",(pos.x - 1), pos.y);
					}else{
						next = $this.palabrejas("getTile",pos.x, (pos.y - 1));
					}
					if(next != null){
						next.click();
						next.find("input").focus();
					}
					options.GO_BACK = false;	
				}
       		});
       		/*.attr('unselectable', 'on')
                 .css('user-select', 'none')
                 .on('selectstart', false);*/
       },
       tileClicked : function(e,tile){
       		var $this = $(this),options =  $this.data("options"), initTile;
       		if(tile.hasClass("selected")){
       			if($this.palabrejas("hasAdjacent",tile, true)){
	       			if(options.SELECT_MODE == 0){
	       				options.SELECT_MODE = 1;
	       			}else{
	       				options.SELECT_MODE = 0;
	       			}
	       		}
       		}else{
       			if(!$this.palabrejas("hasAdjacent",tile, false)){
       				if(options.SELECT_MODE == 0){
	       				options.SELECT_MODE = 1;
	       			}else{
	       				options.SELECT_MODE = 0;
	       			}
       			}
       		}
       		$(".tile").removeClass("selected").removeClass("shadowed");
       		tile.addClass("selected");
       		initTile = $this.palabrejas("getInitTile",tile);
       		$this.palabrejas("shadow",initTile);
       		$this.palabrejas("highlightClue",initTile);
       },
       getInitTile : function(tile){
       		var $this = $(this),options =  $this.data("options"), pos = tile.data("pos"), previous;
       		if(options.SELECT_MODE == 0){
       			if(pos.x == 0){
       				return tile;
       			}else if(pos.x > 0){
       				previous = $this.palabrejas("getTile",(pos.x - 1), pos.y);
       				while(previous != null && !previous.hasClass("void")){
       					pos = previous.data("pos");
       					tile = previous;
       					previous = $this.palabrejas("getTile",(pos.x - 1), pos.y);
       				}
       				return tile;
       			}
       		}else{
       			if(pos.y == 0){
       				return tile;
       			}else if(pos.y > 0){
       				previous = $this.palabrejas("getTile",pos.x, (pos.y - 1));
       				while(previous != null && !previous.hasClass("void")){
       					pos = previous.data("pos");
       					tile = previous;
       					previous = $this.palabrejas("getTile",pos.x, (pos.y - 1));
       				}
       				return tile;
       			}
       		}
       },
       highlightClue : function(tile){
       		var $this = $(this),options =  $this.data("options"),
       		i = 0, len = options.clues[options.SELECT_MODE].length, clue, pos = tile.data("pos");
       		for(; i < len ; i++){
       			clue = options.clues[options.SELECT_MODE][i];
       			if(pos.x == clue.x && pos.y == clue.y){
       				$("#clues ul li").removeClass("highlighted");
       				clue.elem.addClass("highlighted");
       				break;
       			}
       		}
       },
       shadow : function(initial){
       		var $this = $(this),options =  $this.data("options"), initialPos = initial.data("pos"),
       			next;
       		if(options.SELECT_MODE == 0){
       			next = $this.palabrejas("getTile",(initialPos.x + 1), initialPos.y);
       			while(next != null  && !next.hasClass("void")){
       				initial.addClass("shadowed");
       				initial = next;
       				initialPos = initial.data("pos");
       				next = $this.palabrejas("getTile",(initialPos.x + 1), initialPos.y);
       			}
       			initial.addClass("shadowed");
       		}else{
       			initial.addClass("shadowed");
       			next = $this.palabrejas("getTile",initialPos.x, (initialPos.y + 1));
       			while(next != null  && !next.hasClass("void")){
       				next.addClass("shadowed");
       				initial = next;
       				initialPos = initial.data("pos");
       				next = $this.palabrejas("getTile",initialPos.x, (initialPos.y + 1));
       			}
       			       			
       		}
       },
       getTile : function(x,y){
       		var i = 0, layout = $(".tile"), len = layout.length, tile, pos;
       		for(; i < len ; i++){
       			tile = $(layout[i]);
       			pos = tile.data("pos");
       			if(pos.x == x && pos.y == y){
       				return tile;
       			}
       		}
       		return null;
       },
       hasAdjacent : function(tile, twisted){
       		var $this = $(this),options =  $this.data("options"), pos = tile.data("pos"), ret,
       		up = $this.palabrejas("getTile",pos.x,(pos.y -1)), 
       		prev = $this.palabrejas("getTile",(pos.x - 1),pos.y ),
       		next = $this.palabrejas("getTile",(pos.x + 1),pos.y),
       		down = $this.palabrejas("getTile",pos.x,(pos.y + 1));
       		if(options.SELECT_MODE == 1){
       			if(twisted){
       				return ((prev && !prev.hasClass("void")) || (next != null && !next.hasClass("void")));
       			}else{
	       			return ((up && !up.hasClass("void")) || (down && !down.hasClass("void")));
	       		}
       		}else{
       			if(twisted){
	       			return ((up && !up.hasClass("void")) || (down && !down.hasClass("void")));
	       		}else{
	       			return ((prev && !prev.hasClass("void")) || (next != null && !next.hasClass("void")));
	       		}
       		}
       },
       	setBorders : function(){
       		var $this = $(this),options =  $this.data("options"), prev, up, next, down, pos, tile, voidBorder
       			border = "1px solid "+ options.borderColor;
       		$(".tile").each(function(){
       			tile = $(this);
       			if(tile.hasClass("void")){
	       			pos = tile.data("pos");
		       		/*prev = $this.palabrejas("getTile",(pos.x - 1), pos.y);
		       		up = $this.palabrejas("getTile",pos.x,(pos.y - 1))*/
		       		next = $this.palabrejas("getTile",(pos.x + 1), pos.y);
		       		down = $this.palabrejas("getTile",pos.x,(pos.y + 1));
		       		if(next && next.hasClass("active")){
		       			tile.addClass("right");
		       		}
		       		if(down && down.hasClass("active")){
		       			tile.addClass("bottom");
		       		}
       			}
       		});
       	}
    };

    $.fn.palabrejas = function(method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.modal');
        }
    };
})(jQuery);
