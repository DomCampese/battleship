
/*
 * Main game logic and state
 */

let playerOneName;
let playerTwoName;
let doneBtn;
let playerOnePlacement;
let playerTwoPlacement;

/* Validation code will populate ships (saves some work) */
let playerOneShips = [];
let playerTwoShips = [];

let playerOneBoard;
let playerTwoBoard; 

let playerInfoDisplay;

const PLAYER_ONE = true;
const PLAYER_TWO = false; 


window.onload = () => {
    doneBtn = document.getElementById('player-done-button');
    playerInfoDisplay = document.getElementById('playerInfoDisplay');
    doneBtn.addEventListener("click", handlePlayerOneInput, false);
}

/* 
 * Responds to a player inputting name and placements. 
 * This is the default onclick of the player done button.
 */
const handlePlayerOneInput = () => {
    playerOneName       = document.getElementById("player-name-input").value;
    playerOnePlacement  = document.getElementById("player-ship-input").value;

    if (!checkNameAndPlacement(playerOneName, playerOnePlacement, PLAYER_ONE)) {
        return;
    }

    // Changes the prompts to address player 2 and switches button handler to
    // handlePlayerTwoInput()
    document.getElementById("input-title").textContent = "Enter Player 2 Info";
    document.getElementById("player-done-button").textContent = "Player 2 Done";
    document.getElementById("player-name-input").value = "";
    document.getElementById("player-ship-input").value = "";
    doneBtn.removeEventListener("click", handlePlayerOneInput);
    doneBtn.addEventListener("click", handlePlayerTwoInput);
}

const handlePlayerTwoInput = () => {
    playerTwoName       = document.getElementById("player-name-input").value;
    playerTwoPlacement  = document.getElementById("player-ship-input").value;

    if (!checkNameAndPlacement(playerTwoName, playerTwoPlacement, PLAYER_TWO)) {
        return;
    }

    // Removes the user prompt from the DOM
    document.getElementById('player-info-prompt').remove();

    playerOneBoard = new GameBoard(playerOneShips, PLAYER_ONE);
    playerTwoBoard = new GameBoard(playerTwoShips, PLAYER_TWO);

    nextTurn(PLAYER_ONE);
}

/* If not game over, displays turn start prompt. When isPlayerOne is true, show playerOne's prompt, else playerTwo's */
const nextTurn = (isPlayerOne) => {   

    /* Before showing next turn prompt, check for a gameover */
    if (playerOneBoard.allShipsSunk()) {
        gameOver(PLAYER_TWO);
        return; 
    }

    if (playerTwoBoard.allShipsSunk()) {
        gameOver(PLAYER_ONE);
        return; 
    }

    // Remove both gameboards from the DOM
    GameBoard.hideAll();
    document.getElementById('game-info-display').textContent = '';

    if (isPlayerOne) {
        let turnInfo = document.createElement('p');
        turnInfo.id = 'turn-info-text';
        turnInfo.textContent = `Click ready to start ${playerOneName}'s turn`;
        let readyBtn = document.createElement('button');
        readyBtn.textContent = "Ready";
        readyBtn.id = 'ready-button';
        readyBtn.addEventListener('click', handlePlayerOneTurn);
        let infoContainer = document.getElementById('turn-prompt');
        infoContainer.appendChild(turnInfo);
        infoContainer.appendChild(readyBtn);
    } else {
        let turnInfo = document.createElement('p');
        turnInfo.id = 'turn-info-text';
        turnInfo.textContent = `Click ready to start ${playerTwoName}'s turn`;
        let readyBtn = document.createElement('button');
        readyBtn.textContent = "Ready";
        readyBtn.id = 'ready-button';
        readyBtn.addEventListener('click', handlePlayerTwoTurn);
        let infoContainer = document.getElementById('turn-prompt');
        infoContainer.appendChild(turnInfo);
        infoContainer.appendChild(readyBtn);
    } 
    
}

const handlePlayerOneTurn = () => {
    GameBoard.hideAll();

    // Clear turn prompt
    document.getElementById('ready-button').remove();
    document.getElementById('turn-info-text').remove();

    document.getElementById('game-info-display').textContent = `Select a spot on ${playerTwoName}'s board to fire`;

    // Show boards for player one - once player fires, the fire handler will advance the game
    playerOneBoard.displayFriendly();
    playerTwoBoard.displayEnemy();    
}

const handlePlayerTwoTurn = () => {
    GameBoard.hideAll();

    // Clear turn prompt
    document.getElementById('ready-button').remove();
    document.getElementById('turn-info-text').remove();

    document.getElementById('game-info-display').textContent = `Select a spot on ${playerOneName}'s board to fire`;

    // Show boards for player two - once player fires, the fire handler will advance the game
    playerTwoBoard.displayFriendly();
    playerOneBoard.displayEnemy();
}

/**
 * Event handler for a gameboard shot fired. Changes the state of the opposing 
 * player's gameboard and tells player one the outcome with an overlay message.
 */
const handlePlayerOneFire = (e) => {

    clearErrorMsgs();

    let result = playerTwoBoard.fire(e.target.id); // Id tells us where shot was fired

    // Redisplay boards to reflect change
    GameBoard.hideAll();
    playerOneBoard.displayFriendly();
    playerTwoBoard.displayEnemy();

    if (result === 'D') {
        doubleFire(PLAYER_ONE);
        return;
    }

    // Player will advance the game on dismissal of overlay
    informFireResult(result, PLAYER_ONE);
}

const handlePlayerTwoFire = (e) => {

    clearErrorMsgs();

    let result = playerOneBoard.fire(e.target.id); // Id tells us where shot was fired

     // Redisplay boards to reflect change
     GameBoard.hideAll();
     playerTwoBoard.displayFriendly();
     playerOneBoard.displayEnemy();

    if (result === 'D') {
        doubleFire(PLAYER_TWO);
        return; 
    }

    // Player will advance the game on dismissal of overlay
    informFireResult(result, PLAYER_TWO);
}

/**
 * Called when a player fires at the same spot twice
 */
 const doubleFire = () => {
    clearErrorMsgs();
    let error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = 'You already fired there. Please select another space.';
    document.getElementById('game-info-display').appendChild(error);
}

/**
 * Tell the user what happened by displaying an overlay box
 * with an ok button that advances to next turn.
 */
const informFireResult = (result, isPlayerOne) => {
    let msg;
    if (result === 'H') {
        msg = 'Hit!'
    } else if (result === 'M') {
        msg = 'Miss!'
    } else if (result === 'A') {
        msg = 'You sunk an aircraft carrier!';
    } else if (result === 'B') {
        msg = 'You sunk a battleship!';
    } else if (result === 'S') {
        msg = 'You sunk a submarine!';
    }

    // Display the overlay
    let overlayContainer = document.createElement('div');
    overlayContainer.id = 'overlay-container';
    overlayContainer.style.position = 'absolute';
    let overlay = document.createElement('div');
    overlay.id = 'overlay-box'
    overlayContainer.appendChild(overlay);
    let overlayMsg = document.createElement('p');
    overlayMsg.textContent = msg;
    overlay.appendChild(overlayMsg);
    let btn = document.createElement('button');
    btn.textContent = 'Okay';
    if (isPlayerOne) {
        btn.addEventListener('click', handlePlayerOneOverlayDismiss);
    } else {
        btn.addEventListener('click', handlePlayerTwoOverlayDismiss);
    }
    
    overlay.appendChild(btn);
    /* Place overlay container (and children) in main content space */
    document.getElementById('body').appendChild(overlayContainer);
}

const handlePlayerOneOverlayDismiss = () => {
    document.getElementById('overlay-container').remove();
    // Start other player's turn
    nextTurn(PLAYER_TWO);
}

const handlePlayerTwoOverlayDismiss = () => {
    document.getElementById('overlay-container').remove();
    // Start other player's turn
    nextTurn(PLAYER_ONE);
}

/* Compute player scores, inform winner, and show both scores */
const gameOver = (isPlayerOne) => {

    GameBoard.hideAll();
    document.getElementById('game-info-display').textContent = '';

    let winner;
    let loser
    let winnerScore;
    let loserScore;

    if (isPlayerOne) {
        winner = playerOneName;
        loser = playerTwoName;
        winnerScore = playerOneBoard.score();
        loserScore = playerTwoBoard.score();
    } else {
        winner = playerTwoName;
        loser = playerOneName;
        winnerScore = playerTwoBoard.score();
        loserScore = playerOneBoard.score();
    }

    // Display info in gameover-container
    let winMessage = document.createElement('h2');
    winMessage.textContent = `${winner} wins!`;
    let winnerScoreMessage = document.createElement('p');
    winnerScoreMessage.textContent = `${winner}'s score: ${winnerScore}`;
    let loserScoreMessage = document.createElement('p');
    loserScoreMessage.textContent = `${loser}'s score: ${loserScore}`;
    let gameoverContainer = document.createElement('div');
    gameoverContainer.id = 'gameover-container';
    gameoverContainer.appendChild(winMessage);
    gameoverContainer.appendChild(winnerScoreMessage);
    gameoverContainer.appendChild(loserScoreMessage);
    document.getElementById('content').appendChild(gameoverContainer);
}

