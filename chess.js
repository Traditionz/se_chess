class Chess{
  constructor(size=8, pieces=null){
    if(pieces == null){
      pieces = Chess.start_board_pieces();
    }
    this.board = this.create_empty_board(size);
    this.removed_pieces_p1 = new Set();
    this.removed_pieces_p2 = new Set();
    this.current_pieces = new Set();
    this.p1_turn = true;

    pieces.forEach((piece) => {
      this.add_piece(piece);
    });
  }
  static start_board_pieces(){
    return [new Piece("rock", 0, 0, true), new Piece("knight", 0, 1, true), new Piece("bishop", 0, 2, true), new Piece("queen", 0, 3, true)
           ,new Piece("king", 0, 4, true), new Piece("bishop", 0, 5, true), new Piece("knight", 0, 6, true), new Piece("rock", 0, 7, true)
           ,new Piece("pawn", 1, 0, true), new Piece("pawn", 1, 1, true), new Piece("pawn", 1, 2, true), new Piece("pawn", 1, 3, true)
           ,new Piece("pawn", 1, 4, true), new Piece("pawn", 1, 5, true), new Piece("pawn", 1, 6, true), new Piece("pawn", 1, 7, true)
           ,new Piece("rock", 7, 7, false), new Piece("knight", 7, 6, false), new Piece("bishop", 7, 5, false), new Piece("queen", 7, 3, false)
           ,new Piece("king", 7, 4, false), new Piece("bishop", 7, 2, false), new Piece("knight", 7, 1, false), new Piece("rock", 7, 0, false)
           ,new Piece("pawn", 6, 0, false), new Piece("pawn", 6, 1, false), new Piece("pawn", 6, 2, false), new Piece("pawn", 6, 3, false)
           ,new Piece("pawn", 6, 4, false), new Piece("pawn", 6, 5, false), new Piece("pawn", 6, 6, false), new Piece("pawn", 6, 7, false)
          ];

  }
  create_empty_board(size){
    var board = new Array(size);
    for(var i = 0; i < size; i ++){
      board[i] = new Array(size);
    }
    return board;
  }
  add_piece(piece){
    if(!ChessRules.is_valid_piece(piece)){
      throw "Invalid type of chess piece!";
    }
    var pos = piece.pos;
    if(pos.row >= this.board.length|| pos.col >= this.board.length){
      throw "Chess piece is out of range!";
    }
    if(this.board[pos.row][pos.col] != null){
      throw "This position has been occupied"
    }
    this.board[pos.row][pos.col] = piece;
    this.current_pieces.add(piece);
  }
  move(row, col, next_row, next_col){
    if(!ChessRules.is_valid_pos(row, col, this.board) || this.board[row][col] == null)
      return [false, "In valid or empty position"];
    var piece = this.board[row][col];
    if(this.p1_turn != piece.is_player1)
      return [false, "It is the other player turn"];
    return ChessRules.move(next_row, next_col, piece, this);
  }
  available_moves(row, col){
    return ChessRules.available_moves(piece, this)
  }
  toString(){
    var board_string = [];
    for(var r = 0; r < this.board.length; r++){
      var row_string = [];
      for(var c = 0; c < this.board.length; c++){
        var cell_string = "     ";
        if(this.board[r][c] != null)
          cell_string = this.board[r][c].toString();
        row_string.push(cell_string);
      }
      board_string.push(row_string.join("|"));
    }
    return board_string.join("\n");
  }
}
class Piece{
  constructor(type, row, col, is_player1=true){
    //Player 1 is in the upper side of the board
    //Player 2 is in the lower side of the board
    this.type = type.toLowerCase();
    this.pos = new Pos(row, col);
    this.is_player1 = is_player1;
  }
  toString(){
    var player = '1';
    if(!this.is_player1)
      player = '2';
    return this.type.slice(0, 4) + player;
  }

}
class Pos{
  constructor(row, col){
    this.row = row;
    this.col = col;
  }
  static compare(a, b){
    if(a.row == b.row && a.col == b.col)
      return true;
    return false;
  }
}
class ChessRules{
  static is_valid_piece(piece){
    var type = piece.type;
    switch(type){
      case "king":
        return true;
      case "queen":
        return true;
      case "pawn":
        return true;
      case "rock":
        return true;
      case "bishop":
        return true;
      case "knight":
        return true;
      default:
        return false;
    }
  }
  static is_valid_pos(row, col, board){
    if(row < 0 || col < 0 || row >= board.length || col >= board.length)
      return false;
    return true;
  }
  static is_valid_to_move(row, col, piece, board){
    if(!ChessRules.is_valid_pos(row, col, board))
      return false;
    if(row == piece.pos.row && piece.pos.col == col)
      return false;
    if(board[row][col] != null && board[row][col].is_player1 == piece.is_player1)
      return false;
    return true;
  }
  static king_moves(piece, board){
    var moves = [];
    for(var row_padding = -1; row_padding < 2; row_padding++){
      for(var col_padding = -1; col_padding < 2; col_padding++){
        var next_row = piece.pos.row + row_padding;
        var next_col = piece.pos.col + col_padding;
        if(!ChessRules.is_valid_to_move(next_row, next_col, piece, board))
          continue;
        moves.push(new Pos(next_row, next_col));
      }
    }
    return moves;
  }
  static knight_moves(piece, board){
    var move_padding = [[2, 1], [2,-1], [-2, -1], [-2, 1], [1, 2], [-1, 2], [-1, -2], [1, -2]];
    var moves = [];
    for(var i = 0; i < move_padding.length; i++){
      var padding = move_padding[i];
      var next_row = piece.pos.row + padding[0];
      var next_col = piece.pos.col + padding[1];
      if(!ChessRules.is_valid_to_move(next_row, next_col, piece, board))
        continue;
      moves.push(new Pos(next_row, next_col));
    }
    return moves;
  }
  static pawn_moves(piece, board){
    var moves = [];
    var direction = 1;
    var move_padding = [[1, 1], [1, 0], [2, 0], [1, -1]];
    if(!piece.is_player1)
      direction = -1
    for(var i = 0; i < move_padding.length; i++){
      var padding = move_padding[i];
      var next_row = piece.pos.row + padding[0]*direction;
      var next_col = piece.pos.col + padding[1]*direction;
      if(!ChessRules.is_valid_pos(next_row, next_col, board))
        continue;
      //Special for pawn: if move diagional => some opponent piece of chess have to be present
      if(padding[0]*padding[1] != 0 && board[next_row][next_col] == null)
        continue;
      //Spcial for pawn: If move up, cannot move if blocked
      if(padding[0]*padding[1] == 0 && board[next_row][next_col] != null)
        continue;
      moves.push(new Pos(next_row, next_col));
    }
    return moves;
  }
  static move_to_direction(row_padding, col_padding, piece, board){
    var next_row = piece.pos.row + row_padding;
    var next_col = piece.pos.col  + col_padding;
    var moves = [];
    while(ChessRules.is_valid_pos(next_row, next_col, board)){
      if(board[next_row][next_col] != null){
        if(board[next_row][next_col].is_player1 != piece.is_player1){
          moves.push(new Pos(next_row, next_col));
        }
        break;
      }
      moves.push(new Pos(next_row, next_col));

      next_row = next_row + row_padding;
      next_col = next_col + col_padding;
    }
    return moves;
  }
  static rock_moves(piece, board){
    var moves_up = ChessRules.move_to_direction(-1, 0, piece, board);
    var moves_down = ChessRules.move_to_direction(1, 0, piece, board);
    var moves_left = ChessRules.move_to_direction(0, -1, piece, board);
    var moves_right = ChessRules.move_to_direction(0, 1, piece, board);
    var moves = moves_up.concat(moves_down, moves_left, moves_right);
    return moves;
  }
  static bishop_moves(piece, board){
    var moves_up_left = ChessRules.move_to_direction(-1, -1, piece, board);
    var moves_up_right = ChessRules.move_to_direction(-1, 1, piece, board);
    var moves_down_left = ChessRules.move_to_direction(1, -1, piece, board);
    var moves_down_right = ChessRules.move_to_direction(1, 1, piece, board);
    var moves = moves_up_left.concat(moves_up_right, moves_down_left, moves_down_right);
    return moves;
  }
  static queen_moves(piece, board){
    var moves_up = ChessRules.move_to_direction(-1, 0, piece, board);
    var moves_down = ChessRules.move_to_direction(1, 0, piece, board);
    var moves_left = ChessRules.move_to_direction(0, -1, piece, board);
    var moves_right = ChessRules.move_to_direction(0, 1, piece, board);
    var moves_up_left = ChessRules.move_to_direction(-1, -1, piece, board);
    var moves_up_right = ChessRules.move_to_direction(-1, 1, piece, board);
    var moves_down_left = ChessRules.move_to_direction(1, -1, piece, board);
    var moves_down_right = ChessRules.move_to_direction(1, 1, piece, board);
    var moves = moves_up.concat(moves_down, moves_left, moves_right, moves_up_left, moves_up_right, moves_down_left, moves_down_right);
    return moves;
  }
  static available_moves(piece, chess){
    var board = chess.board;
    var pos = piece.pos;
    var type = piece.type;
    if(!chess.current_pieces.has(piece) || board[pos.row][pos.col] != piece){
      throw "The piece does not exist in the current board";
    }
    switch(piece.type){
      case "king":
        return ChessRules.king_moves(piece, board);
      case "queen":
        return ChessRules.queen_moves(piece, board);
      case "pawn":
        return ChessRules.pawn_moves(piece, board);
      case "rock":
        return ChessRules.rock_moves(piece, board);
      case "bishop":
        return ChessRules.bishop_moves(piece, board);
      case "knight":
        return ChessRules.knight_moves(piece, board);
      default:
        throw "Invalid chess piece";
    }
  }
  static move(next_row, next_col, piece, chess){
    var board = chess.board;
    var valid_moves = ChessRules.available_moves(piece, chess);
    var valid = false;
    var next_pos = new Pos(next_row, next_col);
    //console.log(valid_moves);
    for(var i = 0; i < valid_moves.length; i++){
      var pos = valid_moves[i];
      if(Pos.compare(next_pos, pos)){
        valid = true;
        break;
      }
    }

    if(!valid)
      return [false, "Invalid Move"];

    var removed_piece = board[next_row][next_col];

    if(removed_piece != null){
      chess.current_pieces.delete(removed_piece);
      if(removed_piece.is_player1){
        chess.removed_pieces_p1.add(removed_piece);
      }
      else {
        chess.removed_pieces_p2.add(removed_piece);
      }
    }
    board[piece.pos.row][piece.pos.col] = null;
    board[next_row][next_col] = piece;
    piece.pos.row = next_row;
    piece.pos.col = next_col;
    chess.p1_turn = !chess.p1_turn;
    return [true, "Success!"];
  }
}

module.exports = Chess;
