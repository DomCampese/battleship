/**
 * This file contains utility functions for validating a user's name and ship placement 
 * as well as displaying any validation error messages to the user.
 */


/**
 * Main validation function. Checks both the name the user entered
 * and the string they entered for battleship placement and 
 * displays a message to the user if they fail.
 * 
 * @returns true when both strings are valid, false otherwise
 * 
 */
const checkNameAndPlacement = (playerName, playerPlacement, isPlayerOne) => {
    clearErrorMsgs();
    let isNameValid = validateName(playerName);
    let isPlacementValid = validatePlacementAndInitializeShips(playerPlacement, isPlayerOne);
    

    if (!isNameValid || !isPlacementValid) {
        if (!isNameValid) {
            showNameError();
        }
        if (!isPlacementValid) {
            showPlacementError();
        }
        return false;
    }
    return true; 
}

/*
 *  Utility for checkNameAndPlacement().
 *  Validates a player's name:
 *  1. Not undefined, empty, null, or NaN
 *  2. Contains only letters/spaces
 *  3. Max of 35 characters
 */
const validateName = (playerName) => {
    if (!playerName || playerName.length > 35) {
        return false;
    }
    let regex = /^[a-zA-Z\s]*$/;
    return regex.test(playerName);
}

/*
 * Validates a player's placement:
 * 1. Not undefined, empty, null, or NaN
 * 2. Proper formatting
 * 3. Proper length ships
 * 4. No overlap
 * 
 * User Can place one of each piece (in this order)
 * A -> aircraft carrier    (5 spaces)
 * B -> battleship          (4 spaces)
 * S -> submarine           (3 spaces) 
 * 
 * Populates global player ships on successful validation
 */
const validatePlacementAndInitializeShips = (playerPlacement, isPlayerOne) => {
    if (!playerPlacement) {
        return false;
    }

    // Formatting and bounds check - must be of the form: A(A1-A5);B(B6-E6);S(H3-J3);
    let regex = /[A]\([A-J](10|[1-9])-[A-J](10|[1-9])\);[B]\([A-J](10|[1-9])-[A-J](10|[1-9])\);[S]\([A-J](10|[1-9])-[A-J](10|[1-9])\);/
    if (!regex.test(playerPlacement)) {
        return false; 
    }

    let split = playerPlacement.split(';');
    let ships = [];
    for (let i = 0; i < 3; i++) {
        let formatted = split[i];
        // Cuts off the first letter leaving only (letternum-letternum)
        formatted = split[i].substring(1);
        // Removes the parentheses
        formatted = formatted.replace('(', '');
        formatted = formatted.replace(')', '');
        ships.push(new Ship(formatted));
    }

    // a - aircraft carrier, b - battleship, s - submarine
    let a = ships[0];
    let b = ships[1];
    let s = ships[2];

    // Make sure all ships are either horizontal or vertical (not diagonal)
    if (!a.isHorizontalOrVertical() || !b.isHorizontalOrVertical() || !s.isHorizontalOrVertical()) {
        return false;
    }

    // Lengths have to match the type of ship
    if (a.length !== 5 || b.length !== 4 || s.length !== 3) {
        return false; 
    }

    // Ships do not overlap
    if (a.overlaps(b) || a.overlaps(s) || b.overlaps(s)) {
        return false; 
    }

    /* Populate the player array in BattleShip.js now that they are valid */
    if (isPlayerOne) {
        playerOneShips.push(a);
        playerOneShips.push(b);
        playerOneShips.push(s);
    } else {
        playerTwoShips.push(a);
        playerTwoShips.push(b);
        playerTwoShips.push(s);
    }

    return true;
}

const showNameError = () => {
    // Displays a single line error box
    let infoPrompt = document.getElementById('player-info-prompt');
    let div = document.createElement('div');
    div.className = 'error-message';
    infoPrompt.appendChild(div);
    let p = document.createElement('p');
    p.textContent = 'Invalid name, please only use letters or spaces and limit name to 35 characters or less.';
    p.className = 'error-message';
    div.appendChild(p);
}

const showPlacementError = () => {
    // Displays an error box containing a title and an ul of rules
    let infoPrompt = document.getElementById('player-info-prompt');
    let div = document.createElement('div');
    div.className = 'error-message';
    let p = document.createElement('p');
    p.textContent = 'Invalid placement, please follow the format A([cell range]);B([cell range]);S([cell range]); and make sure:';
    infoPrompt.appendChild(div);
    div.appendChild(p);
    let ul  = document.createElement('ul');
    let li1 = document.createElement('li');
    ul.appendChild(li1);
    li1.textContent = 'The length of your ships are correct (5 for A, 4 for B, and 3 for S)';
    let li2 = document.createElement('li');
    li2.textContent = 'Your ships are not overlapping';
    ul.appendChild(li2);
    let li3 = document.createElement('li');
    li3.textContent = 'Your ships are horizonal or vertical (not diagonal)';
    ul.appendChild(li3);
    div.appendChild(ul);
}

const clearErrorMsgs = () => {
    document.querySelectorAll('.error-message').forEach((ele) => {
        ele.remove();
    })
}
