var c = document.getElementById('board')
var ctx = c.getContext('2d')
var s = 600/8

var pos = [] //client

//server
var pieces = []
var captured = [ [], [] ] //white + black captured pieces
var last = [] //last moved piece's position
//

function draw_Board() { //draws the 8x8 tiles
	var b = false

	for (var x=0; x < 8; x++) {
		b = !b
		for (var y=0; y < 8; y++) {
			b = !b
			
			if (b) {
				ctx.fillStyle = '#035c22'
			}
			else {
				ctx.fillStyle = '#dfe6e1'
			}
			ctx.fillRect(s*x, s*y, s, s)
		}
	}
}

function draw_Piece(p) {
	img = document.getElementById(p.side + " " + p.rank)
	ctx.drawImage(img, (p.x - 1)*s, (p.y - 1)*s, s, s)
}

function update(data) {
	draw_Board()

	for (let p of pieces) {
		draw_Piece(p)
	}
}
//LOGIC START
function get_Piece(pieces, x, y) {
	for (let p of pieces) {
		if (p.x == x && p.y == y)
			return p
	}
	
	return false
}

function get_Piece_Index(pieces, x, y) {
	var i = 0
	
	for (let p of pieces) {
		if (p.x == x && p.y == y)
			break
		i++
	}
	
	return i
}

function blocked(pieces, x0, y0, x1, y1) { //checks for any pieces between (x0, y0) and (x1, y1)
	var dX = x1 - x0
	var dY = y1 - y0
	
	var hit = false
	
	var p = get_Piece(pieces, x0, y0)
	
	if (dX == 0 || dY == 0) {//move like a rook
		if (dX == 0) {
			if (dY > 0) {
				
				for (var y=y0 + 1; y < y1; y++) {
					if (get_Piece(pieces, x0, y)) {
						hit = true
						break
					}
				}
				
			}
			else {
				
				for (var y=y0 - 1; y > y1; y--) {
					if (get_Piece(pieces, x0, y)) {
						hit = true
						break
					}
				}
				
			}
		}
		else { //y == 0
			if (dX > 0) {
				
				for (var x=x0 + 1; x < x1; x++) {
					if (get_Piece(pieces, x, y0) || p.rank == "king" && attacking(pieces, p.side, x, y0)) {
						hit = true
						break
					}
				}
				
			} else {
				
				for (var x=x0 - 1; x < x1; x--) {
					if (get_Piece(pieces, x, y0) || p.rank == "king" && attacking(pieces, p.side, x, y0)) {
						hit = true
						break
					}
				}
				
			}
		}
	}
	else { //move like a bishop
		if (dX > 0 && dY > 0) {
			
			for (var i=1; i < Math.abs(dX); i++) {
				if (get_Piece(pieces, x0 + i, y0 + i)) {
					hit = true
					break
				}
			}
			
		}
		else if (dX > 0 && dY < 0) {
			
			for (var i=1; i < Math.abs(dX); i++) {
				if (get_Piece(pieces, x0 + i, y0 - i)) {
					hit = true
					break
				}
			}
			
		}
		else if (dX < 0 && dY < 0) {
			
			for (var i=1; i < Math.abs(dX); i++) {
				if (get_Piece(pieces, x0 - i, y0 - i)) {
					hit = true
					break
				}
			}
			
		}
		else if (dX < 0 && dY > 0) {
			
			for (var i=1; i < Math.abs(dX); i++) {
				if (get_Piece(pieces, x0 - i, y0 + i)) {
					hit = true
					break
				}
			}
			
		}
	}
	return hit
}

function movable(pieces, x0, y0, x1, y1) { //returns whether it can move here or not
	//pieces is the list of pieces on the board
	//x0, y0 is the pos of the piece being moved
	//x1, y1 is the desired pos to move to
	p = get_Piece(pieces, x0, y0)
	p2 = get_Piece(pieces, x1, y1)
	
	if (!p) return false
	
	var dX = x1 - x0
	var dY = y1 - y0
	
	if (p.rank == 'pawn') {
		var dir = 1
		
		if (p.side == 'white') {
			dir = -1
		}
		if (dX == 0) {//moving forward
			p3 = get_Piece(pieces, x0, y0 + dir)
			
			if (dY == 2*dir) {
				if (p.moves == 0 && !p2 && !p3)
					return true
			}
			else if (dY == dir)
				if (!p2)
					return true
		}
		else if (Math.abs(dX) == 1 && dY == dir) { //normal capture
			if (p2 && p2.side != p.side)
				return true
			else { //en passante
				//only usable right after the capture target moved there!
				var p3 = get_Piece(pieces, last[0], last[1])
				
				if (!p2 && p3 && p3.side != p.side && last[0] == x1 && last[1] == y1 - dir) {
					//if move to spot is empty, capture piece exists,
					//capture piece is in the right spot
					//AND it has only moved 1x before!
					if (p3.y == 4 || p3.y == 5 && p3.rank == "pawn") {
						if (p3.moves == 1) {
							p.x = x1
							p.y = y1
							p3 = pieces.splice(get_Piece_Index(pieces, p3.x, p3.y), 1)[1]
							
							if (!in_Check(pieces, p.side)) {
								console.log("EN PASSANT")
								return true
							}
							else {
								p.x = x0
								p.y = y0
								pieces.push(p3)
							}
						}
					}
				}
			}
		}
	}
	else if (p.rank == 'knight') {
		if (Math.abs(dX) == 1 && Math.abs(dY) == 2 || Math.abs(dX) == 2 && Math.abs(dY) == 1)
			//follows knight movement
			if (!p2 || p2 && p2.side != p.side) //trying to capture a piece
				return true
	}
	else if (p.rank == 'bishop') {
		if (Math.abs(dX) == Math.abs(dY) && !blocked(pieces, x0, y0, x1, y1))
			if (!p2 || p2 && p2.side != p.side)
				return true
	}
	else if (p.rank == 'rook') {
		if (Math.abs(dX) == 0 || Math.abs(dY) == 0)
			if (!blocked(pieces, x0, y0, x1, y1))
				if (!p2 || p2 && p2.side != p.side)
					return true
	}
	else if (p.rank == 'queen') {
		if (Math.abs(dX) == Math.abs(dY) || Math.abs(dX) == 0 || Math.abs(dY) == 0)
			if (!blocked(pieces, x0, y0, x1, y1))
				if (!p2 || p2 && p2.side != p.side)
					return true
	}
	else if (p.rank == 'king') {
		if (Math.abs(dX) <= 1 && Math.abs(dY) <= 1) {
			if (!p2 || p2 && p2.side != p.side)
				return true
		}
		else if (p.moves == 0 && Math.abs(dX) == 2 && dY == 0) {
			var x = 3
			
			if (dX < 0) //queenside castle
				x = -4
			
			if (!blocked(pieces, x0, y0, x0 + x, y0)) {
				var p3 = get_Piece(pieces, x0 + x, y0)
				
				if (p3 && p3.moves == 0 && p3.rank == 'rook' && p3.side == p.side && !in_Check(pieces, p.side))
					//& NOT IN CHECK
					return true //dont forget to also move the rook!
			}
		}
	}
	return false
}

function in_Check(pieces, side) {
	var check = false
	
	for (let king of pieces) {
		if (king.side == side && king.rank == "king") {
		
			for (let p of pieces) {
				if (p.side != side) { //if enemy can attack the king..
					if (movable(pieces, p.x, p.y, king.x, king.y)) {
						check = true //IN CHECK!
						console.log("IN CHECK")
						break
					}
				}
			}
			
			break
		}
	}
	
	return check
}

function attacking(pieces, side, x, y) {
	var attacked = false
	var enemy = "white"
	
	if (side == enemy)
		enemy = "black"
	
	for (let p of pieces) {
		if (p.side == enemy) { //if enemy can attack the king..
			if (movable(pieces, p.x, p.y, x, y)) {
				attacked = true //IN CHECK!
				console.log("ATTACKED")
				break
			}
		}
	}
	
	return attacked
}

function in_Checkmate(pieces, enemy) {
	var checkmate = true
	
	if (in_Check(pieces, enemy)) { //enemy is in check
		//now see if they can do anything to get out of check
		for (let p of pieces) {
			if (p.side == enemy) {
				//check it moving to all possible locations
				//if it can move there and isnt in check anymore,
				//it isn't checkmate
				for (var x=1; x <= 8; x++) {
					for (var y=1; y <= 8; y++) {
						var x0 = p.x
						var y0 = p.y
						
						if (movable(pieces, x0, y0, x, y)) {
							p.x = x
							p.y = y
							//SEE IF YOUR IN CHECK NOW
							if (!in_Check(pieces, enemy)) {
								//found a case where they can get out of check, so NOT checkmate
								checkmate = false
							}
							
							p.x = x0
							p.y = y0
							if (!checkmate)
								break
						}
					}
				}
				
			}
		}
	}
	else
		checkmate = false
	
	return checkmate
}

//LOGIC END
function get_Pos(e) {
	var box = c.getBoundingClientRect()
	var x = e.clientX - box.left - c.clientLeft
	var y = e.clientY - box.top - c.clientTop
	
	x = Math.ceil(x/s)
	y = Math.ceil(y/s)
	
	return [x, y]
}

function down(e) { //get pos when mouse held down
	pos = get_Pos(e)
}

function up(e) { //send request to make move
	var pos2 = get_Pos(e)
	var p = get_Piece(pieces, pos[0], pos[1])
	
	var dX = pos2[0] - pos[0]
	var dY = pos2[0] - pos[0]
	
	var dirX = Math.abs(dX)/dX
	
	if (movable(pieces, pos[0], pos[1], pos2[0], pos2[1])) {
		if (p.rank == "king" && Math.abs(dX) == 2) {
			var x = 1
			
			if (dirX < 0)
				x = -2
			
			var p2 = get_Piece(pieces, pos2[0] + x, pos[1]) //rook
			console.log("CASTLING")
			p2.moves++
			p2.x = pos2[0] - dirX
			//p.x = pos2[0]
			
			if (in_Check(p.side)) { //CANNOT CASTLE INTO CHECK
				console.log("CANNOT PUT YOURSELF IN CHECK")
				p2.moves--
				p2.x = pos2[0] + x
			}
		}
		
		var captured = false
		var cp = get_Piece(pieces, pos2[0], pos2[1])
		
		if (cp && cp.side != p.side) { //capture piece
			captured = pieces.splice(get_Piece_Index(pieces, pos2[0], pos2[1]), 1)[1]
		}
		
		p.moves++
		p.x = pos2[0]
		p.y = pos2[1]
		
		if (in_Check(pieces, p.side)) {
			//UNDO EVERYTHING, CANNOT PUT YOURSELF IN CHECK
			console.log("CANNOT PUT YOURSELF IN CHECK")
			p.moves--
			p.x = pos[0]
			p.y = pos[1]
			
			if (captured)
				pieces.push(captured)
		}
		else {
			last = [ pos2[0], pos2[1] ]
			//pawn promotion checks
			if (p.rank == "pawn") {
				if (p.side == "white") {
					if (p.y == 1) {
						p.rank = "queen"
						console.log("PAWN PROMOTION!")
					}
				}
				else {
					if (p.y == 8) {
						p.rank = "queen"
						console.log("PAWN PROMOTION!")
					}
				}
			}
			
			var enemy = ''
			
			if (p.side == "white")
				enemy = "black"
			else
				enemy = "white"
			
			if (in_Checkmate(pieces, enemy)) {
				console.log(enemy + " HAS BEEN CHECKMATED, GG")
			}
			update()
		}
	}
	else
		console.log("NOT A VALID MOVEMENT")
}

for (var x=1; x <= 8; x++) {

	for (var y=1; y <= 2; y++) {
		var rank = "pawn"
		
		if (y == 1) {
			if (x == 1 || x == 8)
				rank = "rook"
			else if (x == 2 || x == 7)
				rank = "knight"
			else if (x == 3 || x == 6)
				rank = "bishop"
			else if (x == 4)
				rank = "queen"
			else
				rank = "king"
		}
		
		pieces.push({x: x, y: y, side: "black", rank: rank, moves: 0})
	}

}

for (var x=1; x <= 8; x++) {

	for (var y=7; y <= 8; y++) {
		var rank = "pawn"
		
		if (y == 8) {
			if (x == 1 || x == 8)
				rank = "rook"
			else if (x == 2 || x == 7)
				rank = "knight"
			else if (x == 3 || x == 6)
				rank = "bishop"
			else if (x == 4)
				rank = "queen"
			else
				rank = "king"
		}
		
		pieces.push({x: x, y: y, side: "white", rank: rank, moves: 0})
	}

}

update()
document.addEventListener("mousedown", down)
document.addEventListener("mouseup", up)

//socket.on('update', drawPiece)