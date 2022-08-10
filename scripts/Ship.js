/**
 * Ship object represented as an array of col,row spots
 * Simplifies interval computations used in validation.
 */

/* A spot on the board */
class Spot {
    constructor(col, row) {
        // Converts user entered 1 indexed to 0 index
        this.col = col-1;
        this.row = row-1;
    }

    equals(other) {
        return this.col === other.col &&
               this.row === other.row;
    }

    toString() {
        return `[${this.col}:${this.row}]`;
    }
}

class Ship {
    /* Take an interval of the form letnum-letnum*/
    constructor(interval) {
        // Break up the interval into its parts and convert letters to numbers
        let parts = getIntervalParts(interval);
        let c0 = parseInt(letterToNumber[parts[0]]);
        let r0 = parseInt(parts[1]);
        let c1 = parseInt(letterToNumber[parts[2]]);
        let r1 = parseInt(parts[3]);

        this.spots = []
        let isVertical = (c0 === c1);

        // Expand the interval and fill as spots
        this.spots.push(new Spot(c0, r0)); // first spot
        if (isVertical) {
            // Col stays constant
            let currRow = r0 + 1;
            while (currRow < r1) {
                this.spots.push(new Spot(c0, currRow));
                currRow++;
            }
        } else {
            // Row stays constant
            let currCol = c0 + 1;
            while (currCol < c1) {
                this.spots.push(new Spot(currCol, r0));
                currCol++;
            }
        }
        this.spots.push(new Spot(c1, r1)); // last spot
        this.firstSpot = this.spots[0];
        this.lastSpot  = this.spots[this.length-1];
    }

    /* Class methods */
    isHorizontalOrVertical() {
        // Starts + ends in same column or same row (not same start/end)
        return (this.firstSpot.col === this.lastSpot.col || 
                this.firstSpot.row === this.lastSpot.row);
    }

    /* Returns true if this ship overlaps another ship */
    overlaps(other) {
        // Check if any board spots equal
        for (let s of this.spots) {
            if (other.contains(s)) {
                return true; 
            }
        }
        return false; 
    }

    /* Returns true if this ship contains the spot (semantically) */
    contains(spot) {
        for (let s of this.spots) {
            if (s.equals(spot)) {
                return true;
            }
        }
        return false;
    }

    toString() {
        let s = '';
        for (let spot of this.spots) {
            s += spot.toString();
            s += ' ';
        }
        return s;
    }

    get length() {      
        return this.spots.length;
    }
}
    /* Utilities for the constructor */
    let letterToNumber = new Map();
    let count = 1;
    for (let letter of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
        letterToNumber[letter] = count++;
    }

    const getIntervalParts = (interval) => {
        let split = interval.split('-');
        let a = split[0];
        let b = split[1];
        return [a.charAt(0), a.substring(1), b.charAt(0), b.substring(1)];
    }
