var Player = function (name, color, board) {
    this.name = name;
    this.color = color;
    this.board = board;
    this.start = new Base('start', this.color, this.board);
    this.end = new Base('end', this.color, this.board);
    this.setPath();
    this.setPawns();
    this.isFocused = false;
    this.isFinished = false;
};

Player.prototype.setPath = function () {
    var start = (this.color - 2) * 10,
        p = this.board.path,
        size = p.length;

    this.path = start > 0 ? p.slice(start, size).concat(p.slice(0, start)) : [].concat(p);
    this.path = this.path.concat(this.end.getPath());
};

Player.prototype.setPawns = function () {
    var i = 0,
        field,
        pawn;

    this.pawns = [];

    for (i = 0; i < 4; i++) {
        pawn = new Pawn(this, 0, 0);
        field = this.start.getFreeField();
        if (field) {
            field.setPawn(pawn);
            pawn.move([field]);
        }
        this.pawns[i] = pawn;
        this.board.add(pawn.$elem);
    }
    this.currentPawn = 0;
};

Player.prototype.getCurrentPawn = function () {
    return this.pawns[this.currentPawn] || null;
}

Player.prototype.nextPawn = function () {
    var prev = this.currentPawn;
    if (this.currentPawn == 3) {
    	this.currentPawn = 0;
    } else {
    	this.currentPawn++;
    }
    this.pawns[prev].blur();
    this.pawns[this.currentPawn].focus();
}
Player.prototype.prevPawn = function () {
    var prev = this.currentPawn;
    if (this.currentPawn == 0) {
    	this.currentPawn = 3;
    } else {
    	this.currentPawn--;
    }
    this.pawns[prev].blur();
    this.pawns[this.currentPawn].focus();
}

Player.prototype.focus = function () {
    this.isFocused = true;
};

Player.prototype.blur = function () {
    this.isFocused = false;
};

Player.prototype.isMovable = function () {
    var i = 0;

    while (this.pawns[i]) {
        if (this.pawns[i].isMovable()) {
            return true;
        }
        i++;
    }

    return false;
};

Player.prototype.move = function (distance, pawn) {
    var fields = [],
        nextPawn,
        nextPos,
        dest,
        steps,
        i,
        switchPlayer = false;

    if (!this.isFocused || !pawn) {
        return false;
    }

    // pawn is still inside base
    if (pawn.position < 0) {
        if (distance !== 6) {
            return false;
        }
        // enter the board
        nextPos = 0;
        fields.push(this.board.getField(this.path[0]));
        switchPlayer = false;
    // pawn is moving on the board
    } else {
        nextPos = pawn.position + distance;
        steps = this.path.slice(pawn.position + 1, nextPos + 1);
        if (steps.length) {
            i = 0;
            while (steps[i]) {
                fields.push(this.board.getField(steps[i]));
                i++;
            }
        }
        switchPlayer = true;
    }

    // moving on the board
    if ((nextPos < 44) || ((nextPos > 44) && (nextPos <= 49))) {
        dest = this.path[nextPos];
        nextPawn = this.board.getField(dest).getPawn();
        // pawn stands on next field
        if (nextPawn) {
            // this is players pawn - can't move
            if (nextPawn.player === this) {
                return false;
            }
            // this is other player's pawn - kill him
            nextPawn.kill();
        }
    } else if (nextPos == 44) {
        this.pawns[this.currentPawn].kill();
    } else {
        return false;
    }

    pawn.move(fields);
    pawn.position = nextPos;
    if (switchPlayer) {
        nextPlayer();
    } else {
        playAward();
    }
    return true;
};

Player.prototype.checkReady = function() {
    this.isFinished = this.end.checkFull();
    return this.isFinished;
};