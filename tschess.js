const readline = require('readline');


const startBoard = () => {
    const board = []
    const pieces = ['r','k','b','Q','K','b','k','r'];
    for(let i=0; i<8; i++){
        board.push(new Array(8));
        for(let j=0; j<8; j++){
            if(i==0 || i==7){
                board[i][j] = ((i==0) ? "b" : "w") + pieces[j];
            } else if(i==1 || i==6){
                board[i][j] = ((i==1) ? "b" : "w") + "p";
            }else{
                board[i][j] = '--';
            }
        }
    }
    return board;
}


const makeMove = (board, moveDescription, beatenWhite, beatenBlack) => {
    if(moveDescription.length != 5){
        return board;
    }
    moveDescription = moveDescription.toLowerCase();
    if(!/^[a-h][1-8] [a-h][1-8]$/.test(moveDescription)){
        return board;
    }
    const fromTo = moveDescription.split(' ');
    if(fromTo.length != 2){
        return board;
    }
    fromX = fromTo[0][0].charCodeAt(0) - 97;
    fromY = fromTo[0][1] - 1;
    toX = fromTo[1][0].charCodeAt(0) - 97;
    toY = fromTo[1][1] - 1;

    const invertedMove = invertMove(fromX, fromY, toX, toY);

    board[invertedMove.toY][invertedMove.toX] = board[invertedMove.fromY][invertedMove.fromX];
    board[invertedMove.fromY][invertedMove.fromX] = '--';
    return board;
}


const invertMove = (fromX, fromY, toX, toY) => {
    const inverted =  {
        fromX: fromX,
        fromY: 7 - fromY,
        toX: toX,
        toY: 7 - toY
    };
    console.log(inverted);
    return inverted;
}


const getPiece = (board, x, y) => {
    // Another insight on functional programming: the importance of a
    // type system. It may not be neccessary, but it easily adds a
    // validation layer, telling you what function compositions are
    // valid. Additionally, we see here that we always return a string,
    // but in case there is no piece, because we left the board,
    // we return an empty string, which is not really verbatim.
    if(x > 7 || x < 0 || y > 7 || y < 0){
        return '';
    }
    return board[y][x];
}

const isValidMoveDescription = (moveDescription) => {
    console.log("Checking move: \"" + moveDescription.toLowerCase() + "\"")
    return (moveDescription.length == 5) && (/^[a-h][1-8] [a-h][1-8]$/.test(moveDescription.toLowerCase()))
}

const coordinateToField = (x, y) => {
    if(x < 0 || x > 7 || y < 0 || y > 7){
        return '--';
    } else {
        return String.fromCharCode(x + 97) + (y + 1);
    }
}

const moveIsPossible = (board, moveDescription) => {
    if(!isValidMoveDescription(moveDescription)){
        return false;
    }
    const fromTo = moveDescription.split(' ');
    if(fromTo.length != 2){
        return board;
    }
    fromX = fromTo[0][0].charCodeAt(0) - 97;
    fromY = fromTo[0][1] - 1;
    toX = fromTo[1][0].charCodeAt(0) - 97;
    toY = fromTo[1][1] - 1;

    const invertedMove = invertMove(fromX, fromY, toX, toY);

    const piece = getPiece(board, invertedMove.fromX, invertedMove.fromY);
    const pieceMoves = getPieceMoves(board, piece, invertedMove.fromX, invertedMove.fromY);
    if(pieceMoves.some(pm => (pm[0] == invertedMove.toX) && (pm[1] == invertedMove.toY))) {
        return true;
    }
    return false;
}

const oppositeColor = (color) => {
    switch (color[0]) {
        case "w":
            return "b";
        case "b":
            return "w";
    
        default:
            return "-";
    }
}

const calculateRogueMoves = (board, piece, x, y) => {
    const moves = [];
    for(let x2=x+1; x2 <= 7; x2++){
        if(isOccupiedByColor(board, x2, y, piece[0])){
            break;
        }
        moves.push([x2, y]);
        if(isOccupiedByColor(board, x2, y, oppositeColor(piece[0]))){
            break;
        }
    }
    for(let x2=x-1; x2 >= 0; x2--){
        if(isOccupiedByColor(board, x2, y, piece[0])){
            break;
        }
        moves.push([x2, y]);
        if(isOccupiedByColor(board, x2, y, oppositeColor(piece[0]))){
            break;
        }
    }
    for(let y2=y+1; y2 <= 7; y2++){
        if(isOccupiedByColor(board, x, y2, piece[0])){
            break;
        }
        moves.push([x, y2]);
        if(isOccupiedByColor(board, x, y2, oppositeColor(piece[0]))){
            break;
        }
    }
    for(let y2=y-1; y2 >= 0; y2--){
        if(isOccupiedByColor(board, x, y2, piece[0])){
            break;
        }
        moves.push([x, y2]);
        if(isOccupiedByColor(board, x, y2, oppositeColor(piece[0]))){
            break;
        }
    }
    return moves;
}

const calculatePawnMoves = (board, piece, x, y) => {
    const moves = [];
    moves.push([
        x,
        piece[0] === "b" ? y+1 : y-1
    ]);

    if(y == 1 && piece[0] === "b"){
        moves.push([
            x,
            y+2
        ]);
    }

    if(y == 6 && piece[0] === "w"){
        moves.push([
            x,
            y-2
        ]);
    }

    return moves;
}

const calculateKnightMoves = (board, piece, x, y) => {
    const moves = [];
    moves.push([x+2, y+1]);
    moves.push([x+2, y-1]);
    moves.push([x+1, y+2]);
    moves.push([x+1, y-2]);
    moves.push([x-2, y+1]);
    moves.push([x-2, y-1]);
    moves.push([x-1, y+2]);
    moves.push([x-1, y-2]);
    return moves;
}

const calculateBishopMoves = (board, piece, x, y) => {
    const moves = [];
    for(let inc=1; (x+inc <= 7) && (y+inc <= 7); inc++){
        const x2 = x+inc;
        const y2 = y+inc;
        if(isOccupiedByColor(board, x2, y2, piece[0])){
            break;
        }
        moves.push([x2, y2]);
        if(isOccupiedByColor(board, x2, y2, oppositeColor(piece[0]))){
            break;
        }
    }

    for(let inc=1; (x-inc >= 0) && (y-inc >= 0); inc++){
        const x2 = x-inc;
        const y2 = y-inc;
        if(isOccupiedByColor(board, x2, y2, piece[0])){
            break;
        }
        moves.push([x2, y2]);
        if(isOccupiedByColor(board, x2, y2, oppositeColor(piece[0]))){
            break;
        }
    }

    for(let inc=1; (x+inc <= 7) && (y-inc >= 0); inc++){
        const x2 = x+inc;
        const y2 = y-inc;
        if(isOccupiedByColor(board, x2, y2, piece[0])){
            break;
        }
        moves.push([x2, y2]);
        if(isOccupiedByColor(board, x2, y2, oppositeColor(piece[0]))){
            break;
        }
    }

    for(let inc=1; (x-inc >= 0) && (y+inc <= 7); inc++){
        const x2 = x-inc;
        const y2 = y+inc;
        if(isOccupiedByColor(board, x2, y2, piece[0])){
            break;
        }
        moves.push([x2, y2]);
        if(isOccupiedByColor(board, x2, y2, oppositeColor(piece[0]))){
            break;
        }
    }
    return moves;
}

const getPieceMoves = (board, piece, x, y) => {
    const moves = [];
    // now this is why pattern matching was invented, right?
    // Because in functional programming, there are no methods tied to
    // objects, but just data und functions, we sometimes have to
    // apply different functions to data to receive a certain modified
    // version of that data. Without pattern matching we have to do what we are doing here:
    // switch over some variable that tells us what kind of data we are looking at
    // and select the according method.
    switch(piece[1]){
        case "k": { // a knights move
            calculateKnightMoves(board, piece, x, y).forEach(move => moves.push(move));
            break;
        }
        case "r": { // a rooks move
            calculateRogueMoves(board, piece, x, y).forEach(move => moves.push(move));
            break;
        }
        case "p": {
            calculatePawnMoves(board, piece, x, y).forEach(move => moves.push(move));
            break;
        }
        case "b": {
            calculateBishopMoves(board, piece, x, y).forEach(move => moves.push(move));
            break;
        }
        default: {
            break;
        }
    }
    return moves.filter(m => (m[0]>=0 && m[0]<8 && m[1]>=0 && m[1]<8));
}


const isOccupiedByColor = (board, x, y, color) => {
    return (x >= 0 && x < 8) && (y >= 0 && y < 8) && (board[y][x].length == 2) && (board[y][x][0] === color)
}


function printBoard(board, beatenWhite, beatenBlack){
    let indent = "  ";
    let out = indent + " a b c d e f g h \n\n";
    for(let y=0; y<board.length; y++){
        out += 8-y + indent;
        for(let x=0; x<board.length; x++){
            out +=  board[y][x];
        }
        out += '\n';
    }
    out += "\n" + indent + " a b c d e f g h \n";
    out += "\n" + "Beaten whites:" + beatenWhite.join(', ') + "\n";
    out += "\n" + "Beaten blacks:" + beatenBlack.join(', ') + "\n";
    return out;
}


function repl() {

    let board = startBoard();
    let beatenWhite = [];
    let beatenBlack = [];

    console.log(printBoard(board, beatenWhite, beatenBlack));

    return new Promise(function(resolve, reject){
        let rl = readline.createInterface(process.stdin, process.stdout)
        rl.setPrompt('Your move: ')
        rl.prompt();
        rl.on('line', function(line) {
            if (line === "exit" || line === "quit" || line == 'q') {
                rl.close()
                return // bail here, so rl.prompt() isn't called again
            }

            if(moveIsPossible(board, line)){
                board = makeMove(board, line, beatenWhite, beatenBlack);
                console.log(printBoard(board, beatenWhite, beatenBlack));
            } else {
                console.log("Move is not possible.");
            }
            
            rl.prompt()
        }).on('close',function(){
            console.log('bye')
            resolve(42) // this is the final result of the function
        });
    });
}

function game(){
    
    repl();
}


game();