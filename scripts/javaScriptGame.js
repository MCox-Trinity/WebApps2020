"use strict"

const Player = {
    P1: 'A',
    P2: 'B'
}
const boardSpaces = ["A1", "A2", "A3", "A4", "A5", "A6", "AS", "B1", "B2", "B3", "B4", "B5", "B6", "BS"]
let currentGame = []

function loadAndSetupGame() {
    let game = []
    game["Turn"] = Player.P1
    let board = []
    for (var space in boardSpaces) {
        if (!boardSpaces[space].includes("S")) {
            //If the space isn't one of the score spaces
            board[boardSpaces[space]] = 4
        }
        else {
            //Set the number of stones in the score spaces to 0
            board[boardSpaces[space]] = 0
        }
    }
    game["Board"] = board
    game["GameOver"] = false
    return game
}

function getGameTitle() {
    if (currentGame["GameOver"] === true) {
        let p1Score = currentGame["Board"]["AS"]
        let p2Score = currentGame["Board"]["BS"]
        if (p1Score === p2Score) return "It's a Tie!"
        let winner = (p1Score > p2Score) ? "Player 1" : "Player 2"
        return winner + " wins!"
    }
    else return (getPlayerString(currentGame["Turn"])) + "'s Turn"
}
function setMessage(msg) {
    let gameMessageArea = document.getElementById("gameMessageArea")
    gameMessageArea.innerHTML = ""
    let message = document.createElement("h4")
    gameArea.appendChild(message)
    message.appendChild(document.createTextNode(msg))
    gameMessageArea.appendChild(message)
}

function updateGameDisplayTemp() {
    let gameArea = document.getElementById("gameArea")
    gameArea.innerHTML = ""
    let turn = document.createElement("h3")
    turn.appendChild(document.createTextNode(getGameTitle()))
    gameArea.appendChild(turn)
    let table = document.createElement("table")
    let body = document.createElement("tbody")
    table.appendChild(body)
    let top = document.createElement("tr")
    body.appendChild(top)
    for (let i = boardSpaces.length - 1; i >= 6; i--) {
        let space = document.createElement("td")
        let data = (i != 6) ? boardSpaces[i] + ": " + currentGame["Board"][boardSpaces[i]] : ""
        space.appendChild(document.createTextNode(data))
        space.onclick = e => (i != 6) ? tryMovePieces(boardSpaces[i]) : null
        top.appendChild(space)
    }
    let bot = document.createElement("tr")
    body.appendChild(bot)
    for (let i = -1; i <= 6; i++) {
        let space = document.createElement("td")
        let data = (i != -1) ? boardSpaces[i] + ": " + currentGame["Board"][boardSpaces[i]] : ""
        space.appendChild(document.createTextNode((data)))
        space.onclick = e => (i != -1) ? tryMovePieces(boardSpaces[i]) : null
        bot.appendChild(space)
    }
    gameArea.appendChild(table)
}

function tryMovePieces(space) {
    if (!isValid(space)) {
        setMessage("Invalid Move")
    }
    else {
        setMessage("")
        movePieces(space)
    }
}

function movePieces(space) {
    let numPieces = currentGame["Board"][space]
    currentGame["Board"][space] = 0
    updateGameDisplayTemp()
    let spc = space
    for (var i = numPieces; i > 0; i--) {
        let nxt = getNextSpace(spc)
        currentGame["Board"][nxt]++
        updateGameDisplayTemp()
        spc = nxt
    }
    tryCapture(spc)
    currentGame["Turn"] = tryTurnChange(spc)
    if (currentGame["GameOver"] === true) {
        collectRemainingPebbles(currentGame["Turn"])
    }
    updateGameDisplayTemp()
}

function tryCapture(space) {
    if (isCapture(space)) {
        let oppositeSpace = getOppositeSpace(space)
        let score = (currentGame["Turn"] === Player.P1) ? "AS" : "BS"
        let captured = currentGame["Board"][oppositeSpace]
        currentGame["Board"][score] += captured
        currentGame["Board"][oppositeSpace] = 0
        let player = getPlayerString(currentGame["Turn"])
        if(captured !== 0){
            setMessage(player + " captured " + captured + " pebbles!")
        }
    }
}

function isCapture(space) {
    let oppositeSpace = getOppositeSpace(space)
    if (oppositeSpace !== null && !oppositeSpace.includes(currentGame["Turn"])) {
        if (currentGame["Board"][space] === 1) return true
    }
    return false
}

function getOppositeSpace(space) {
    switch (space) {
        case "A1":
            return "B6";
        case "A2":
            return "B5";
        case "A3":
            return "B4";
        case "A4":
            return "B3";
        case "A5":
            return "B2";
        case "A6":
            return "B1";
        case "B1":
            return "A6";
        case "B2":
            return "A5";
        case "B3":
            return "A4";
        case "B4":
            return "A3";
        case "B5":
            return "A2";
        case "B6":
            return "A1";
        default:
            return null
    }
}

function collectRemainingPebbles(player) {
    let numPebbles = 0
    for (var space in boardSpaces) {
        if (!boardSpaces[space].includes("S") && boardSpaces[space].includes(player)) {
            numPebbles += currentGame["Board"][boardSpaces[space]]
            currentGame["Board"][boardSpaces[space]] = 0
        }
    }
    if (player === Player.P1) {
        currentGame["Board"]["AS"] += numPebbles
    }
    else {
        currentGame["Board"]["BS"] += numPebbles
    }
}

function tryTurnChange(lastSpace) {
    if (!(isGameOver() === null)) {
        currentGame["GameOver"] = true
        setMessage("Game Over!")
        return isGameOver()
    }
    if (lastSpace.includes("S")) {
        //if the player's last pebble landed in their score space, they get a second turn
        let player = getPlayerString(currentGame["Turn"])
        setMessage(player + " gets another turn!")
        return currentGame["Turn"]
    }
    else if (!otherPlayerHasMoves(currentGame["Turn"])) {
        //if there are no moves that the other player can make, it's this players turn again
        return currentGame["Turn"]
    }
    else {
        //otherwise switch turns
        return currentGame["Turn"] === Player.P1 ? Player.P2 : Player.P1
    }
}

function getNextSpace(currentSpace) {
    if (currentSpace === "A6") {
        if (currentGame["Turn"] == Player.P1) return "AS"
        else return "B1"
    }
    if (currentSpace === "B6") {
        if (currentGame["Turn"] == Player.P2) return "BS"
        else return "A1"
    }
    if (currentSpace === "BS") return "A1"
    else {
        let idx = boardSpaces.indexOf(currentSpace) + 1
        return boardSpaces[idx]
    }
}

function isValid(space) {
    //not trying to turn on a Score space & on your side of the board
    return !space.includes("S") && space.includes(currentGame["Turn"]) && currentGame["Board"][space] != 0
}

function otherPlayerHasMoves(player) {
    for (var space in boardSpaces) {
        if (!boardSpaces[space].includes("S")) {
            if (!boardSpaces[space].includes(player)) {
                //only care about the other player's spaces
                if (currentGame["Board"][boardSpaces[space]] != 0) return true
            }
        }
    }
    return false
}

function isGameOver() {
    //if the game is over, return the players whose side needs to be cleared
    if (!otherPlayerHasMoves(Player.P1)) {
        //if p2 doesn't have moves
        return Player.P1
    }
    else if (!otherPlayerHasMoves(Player.P2)) {
        //player 1 doesn't have moves
        return Player.P2
    }
    else {
        return null
    }
}

function getPlayerString(player){
    return (player === Player.P1) ? "Player 1" : "Player 2"
}

window.onload = () => {
    currentGame = loadAndSetupGame()
    updateGameDisplayTemp()
}