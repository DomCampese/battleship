/**
 * A dynamic gameboard that maintains its state, handles firing, and can display itself on
 * the DOM in a friendly or enemy way (friendly sees boats, enemy does not)
 * 
 */

// Ship sizes
const A_SIZE = 5;
const B_SIZE = 4;
const S_SIZE = 3;

class GameBoard {

    /**
     * @param ships  - ship object array of the form [A, B, S]
     * @param player - a boolean representing which player's board this is
     */
    constructor (ships, isPlayerOne) {
        // Empty 10 by 10 string grid representing game state
        this.board = new Array(10);
        for (let i = 0; i < 10; i++) {
            this.board[i] = new Array(10);
            for (let j = 0; j < 10; j++) {
                /* Simple object keeping track of board data */
                this.board[i][j] = {
                    type : '', 
                    isHit : false, 
                    isMiss : false
                };
            }
        }

        this.ships = ships;
        for (let ship of ships) {
            this.add(ship);
        }
        this.gameBoardContainer = document.getElementById("gameboard-container");
        this.isPlayerOne = isPlayerOne;
        /* Help determine when a ship is sunk */
        this.aHits = 0;
        this.bHits = 0;
        this.sHits = 0;
    }

    /**
     * Adds the ship to the board
     * @param ship a ship object
     */
    add(ship) {
        let type;
        if (ship.length == A_SIZE) {
            type = 'A';
        } else if (ship.length == B_SIZE) {
            type = 'B';
        } else {
            type = 'S';
        }

        for (let spot of ship.spots) {
            this.board[spot.row][spot.col].type = type; // spots are 0-indexed
        }
    }

    /**
     * Shows hits and ship location (sits on the left of the page)
     */
    displayFriendly() {
        let friendlyBoard = document.createElement('div');
        friendlyBoard.className = 'gameboard';

        let boardTitle = document.createElement('div');
        boardTitle.className = 'board-title';
        boardTitle.textContent = `${this.isPlayerOne ? playerOneName : playerTwoName}'s Board`;
        friendlyBoard.appendChild(boardTitle);


        // Row at the top for row labels
        let labelRow = document.createElement('div');
        labelRow.className = 'gameboard-row';
        let letters = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        for (let letter of letters) {
            let labelSpot = document.createElement('div');
            labelSpot.className = 'gameboard-label-spot';
            labelSpot.textContent = letter;
            labelRow.appendChild(labelSpot);
        }
        friendlyBoard.appendChild(labelRow);

        // Append 100 spots with value equal to its spot
        for (let i = 0; i < 10; i++) {
            let gameboardRow = document.createElement('div');
            gameboardRow.className = 'gameboard-row';

            // Add row label first in each row
            let rowLabel = document.createElement('div');
            rowLabel.className = 'gameboard-label-spot';
            rowLabel.textContent = `${i+1}`;
            gameboardRow.appendChild(rowLabel);

            for (let j = 0; j < 10; j++) {
                let currSpot = document.createElement('div');
                currSpot.className = 'friendly-gameboard-spot';
                currSpot.id = `${this.isPlayerOne ? 'p1' : 'p2'}-${i}-${j}` // p<1|2>-row-col format for ease of array access later, p1 to keep id's unique
                currSpot.textContent = this.board[i][j].type;
                currSpot.addEventListener('click', this.handleFire);

                // Color based on state of board
                if (this.board[i][j].isHit) {
                    currSpot.style.backgroundColor = 'red';
                } else if (this.board[i][j].isMiss) {
                    currSpot.style.backgroundColor = 'white';
                } else {
                    currSpot.style.backgroundColor = 'lightblue';
                }

                gameboardRow.appendChild(currSpot);
            }
            friendlyBoard.appendChild(gameboardRow);
        }
        this.gameBoardContainer.appendChild(friendlyBoard);
    }

    /**
     * Shows only hits + miss info (sits on the right of the page)
     */
    displayEnemy() {
        let enemyBoard = document.createElement('div');
        enemyBoard.className = 'gameboard';

        let boardTitle = document.createElement('div');
        boardTitle.className = 'board-title';
        boardTitle.textContent = `Target: ${this.isPlayerOne ? playerOneName : playerTwoName}'s Board`;
        enemyBoard.appendChild(boardTitle);

        // Row at the top for row labels
        let labelRow = document.createElement('div');
        labelRow.className = 'gameboard-row';
        let letters = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        for (let letter of letters) {
            let labelSpot = document.createElement('div');
            labelSpot.className = 'gameboard-label-spot';
            labelSpot.textContent = letter;
            labelRow.appendChild(labelSpot);
        }
        enemyBoard.appendChild(labelRow);

        // Append 100 spots with value equal to its spot
        for (let i = 0; i < 10; i++) {
            let gameboardRow = document.createElement('div');
            gameboardRow.className = 'gameboard-row';

            // Add row label first in each row
            let rowLabel = document.createElement('div');
            rowLabel.className = 'gameboard-label-spot';
            rowLabel.textContent = `${i+1}`;
            gameboardRow.appendChild(rowLabel);

            for (let j = 0; j < 10; j++) {
                let currSpot = document.createElement('div');
                currSpot.className = 'enemy-gameboard-spot';
                currSpot.id = `${this.isPlayerOne ? 'p1' : 'p2'}-${i}-${j}` // row-col format for ease of array access later
                currSpot.addEventListener(
                    'click',
                     // The opposite player of this board is doing the firing
                    (this.isPlayerOne) ? handlePlayerTwoFire : handlePlayerOneFire
                );

                // Color based on state of board
                if (this.board[i][j].isHit) {
                    currSpot.style.backgroundColor = 'red';
                } else if (this.board[i][j].isMiss) {
                    currSpot.style.backgroundColor = 'white';
                } else {
                    currSpot.style.backgroundColor = 'lightblue';
                }

                gameboardRow.appendChild(currSpot);
            }
            enemyBoard.appendChild(gameboardRow);
        }
        this.gameBoardContainer.appendChild(enemyBoard);
    }

    /**
    * Deal with a shot fired and tell caller what happened.
    * 
    * @return 'H' for hit, 'M' for miss, 'D' for double fire, or a ship type <'A'|'B'|'S'>
    *          when a ship is sunk.
    * 
    */
    fire(boardSpaceId) {
        let parts = boardSpaceId.split('-');
        let row = parseInt(parts[1]);
        let col = parseInt(parts[2]);

        if (this.board[row][col].isMiss || this.board[row][col].isHit) {
            return 'D'; // double fire
        }

        let type = this.board[row][col].type;
        if (type) {
            // Change board space state to hit
            this.board[row][col].isHit = true;

            // See if a ship was just sunken
            if (type === 'A') {
                this.aHits++;
                if (this.aHits === A_SIZE) {
                    return type;
                }
            } else if (type === 'B') {
                this.bHits++;
                if (this.bHits === B_SIZE) {
                    return type;
                }
            } else {
                this.sHits++;
                if (this.sHits === S_SIZE) {
                    return type;
                }
            }

            // Regular hit, did not sink ship
            return 'H';
        } else { // Space is empty, was a miss
            this.board[row][col].isMiss = true;
            return 'M'; // miss
        }
    }

    allShipsSunk() {
        return this.aHits === A_SIZE &&
               this.bHits === B_SIZE &&
               this.sHits === S_SIZE;
    }

    /* Computes the score associated with this board */
    score() {
        let score = 24; 
        // -2 for each hit against them
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.board[i][j].isHit) {
                    score -= 2;
                }
            }
        }
        return score;
    }

    /* Remove all gameboards from the DOM */
    static hideAll() {
        for (let board of (document.querySelectorAll('.gameboard'))) {
            document.getElementById('gameboard-container').removeChild(board);
        }
    }
}
