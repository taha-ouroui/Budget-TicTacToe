
// GAME SETTINGS
const DEBUG_MODE = false;
const WINSTREAK_KEY = "tictactoe-winstreak";
const DIFFICULTY_KEY = "tictactoe-difficulty";
const ARCADE_KEY = "tictactoe-arcade";

const GRID = document.getElementById("grid-container");
const sfx = 
{
    turn: new Audio("assets/sfx/turn.wav"),
    win: new Audio("assets/sfx/win.wav"),
    lose: new Audio("assets/sfx/lose.wav"),
}
const TOTAL_CELLS = 9;
import { t3brain } from "./t3bot.js";

// INFO BOARD
const difficultySelection = document.getElementById("difficulty");
const refreshButton = document.getElementById("refresh-btn");
const turnIndicator = document.getElementById("turn-indicator");
const winStreakLabel = document.getElementById("winstreak");
const arcadeModeCheck = document.getElementById("arcade-mode");

// VARS
let GameGrid = [];
let playerTurn = true;
let winner = "";

let isArcade = false;
let playedCellsX = [];
let playedCellsO = [];

function OnStart()
{
    // LOADING THE GAME
    LoadDifficulty();
    LoadArcadeMode();
    LoadTicTacToe();

    let winstreak = localStorage.getItem(WINSTREAK_KEY);

    if (winstreak)
        winStreakLabel.textContent = winstreak;
    else
        winStreakLabel.textContent = "0";

    difficultySelection.addEventListener("change", (event) => 
    {
        const selectedDifficulty = event.target.value;
        localStorage.setItem(DIFFICULTY_KEY, selectedDifficulty);
        window.location.reload();
    });

    arcadeModeCheck.addEventListener("change", (event) =>
    {
        const selectedArcadeChoice = event.target.value;
        localStorage.setItem(ARCADE_KEY, selectedArcadeChoice);
        window.location.reload();
    });

    // STARTING GAME
    if (t3brain.difficulty === "1v1")
    {
        turnIndicator.textContent = "X's Turn";
    }
    else
    {
        let playerGetsToStart = Math.random() > 0.4;

        if (playerGetsToStart)
            turnIndicator.textContent = "Your Turn";
        else
        {
            turnIndicator.textContent = "Bot's Turn";
            ContinueGame();
        }

        playerTurn = playerGetsToStart;
    }
}

function LoadDifficulty()
{
    let currDifficulty = localStorage.getItem(DIFFICULTY_KEY);

    if (!currDifficulty) 
        currDifficulty = "easy";

    difficultySelection.value = currDifficulty;

    t3brain.difficulty = difficulty.value;
}

function LoadArcadeMode()
{
    let currArcadeModeChoice = localStorage.getItem(ARCADE_KEY);

    if (!currArcadeModeChoice) 
        currArcadeModeChoice = false;

    arcadeModeCheck.value = currArcadeModeChoice;

    isArcade = currArcadeModeChoice;
}

function LoadTicTacToe()
{
    for (let i = 0; i < TOTAL_CELLS; i++) 
    {
        let cell = document.createElement("div");
        GRID.appendChild(cell);

        cell.classList.add("grid-cell");

        GameGrid[i] = 
        {
            id: i,
            cell: cell,
            clickEvent: cell.addEventListener("click", () => TriggerCellByPlayer(GameGrid[i])),
            is_x: false,
            is_o: false,
            is_revealed: false,
        }
    }
}

function TriggerCellByPlayer(cellInfo)
{
    if (playerTurn || t3brain.difficulty === "1v1")
    {
        TriggerCell(cellInfo);
    }
}

function TriggerCell(cellInfo)
{
    if (cellInfo.is_revealed && !cellInfo.cell.classList.contains("aboutToBeReverted")) return;

    PlaySFX("turn");

    HandleArcade(cellInfo);

    cellInfo.is_revealed = true;
    cellInfo.cell.removeEventListener("click", cellInfo.clickEvent);
    cellInfo.cell.classList.add("revealed");

    if (playerTurn)
    {
        cellInfo.cell.classList.add("cell-x");
        cellInfo.is_x = true;
    }
    else
    {
        cellInfo.cell.classList.add("cell-o");
        cellInfo.is_o = true;
    }

    ContinueGame();
}

function HandleArcade(cellInfo)
{
    if (isArcade)
    {
        if (playerTurn) 
        {
            if (playedCellsX.length === 3)
            {
                RevertOldestPlayedCell(playedCellsX);
            }
    
            if (playedCellsO.length === 3)
            {
                MarkOldestCellAboutToReset(playedCellsO);
            }
    
            playedCellsX.push(cellInfo);
        }
        else
        {
            if (playedCellsO.length === 3)
            {
                RevertOldestPlayedCell(playedCellsO);
            }
    
            if (playedCellsX.length === 3)
            {
                MarkOldestCellAboutToReset(playedCellsX);
            }
    
            playedCellsO.push(cellInfo);
        }
    }
}

function MarkOldestCellAboutToReset(cellsArray) 
{
    GameGrid.forEach(cellInfo => cellInfo.cell.classList.remove("aboutToBeReverted"));

    if (cellsArray.length > 0) 
    {
        const oldestCell = cellsArray[0];
        oldestCell.cell.classList.add("aboutToBeReverted");
    }
}

function RevertOldestPlayedCell(cellsArray)
{
    const oldestCell = cellsArray.shift();

    oldestCell.cell.classList.remove("revealed", "cell-x", "cell-o", "aboutToBeReverted");
    oldestCell.is_x = false;
    oldestCell.is_o = false;
    oldestCell.is_revealed = false;

    oldestCell.clickEvent = oldestCell.cell.addEventListener("click", () => TriggerCellByPlayer(oldestCell));
}

function FlashWinningCells(pattern)
{
    let suffix = winner === "Player" ? "-x" : "-o";
    GameGrid.forEach(cellInfo => cellInfo.cell.classList.remove("aboutToBeReverted"));
    pattern.forEach(i => GameGrid[i].cell.classList.add("winning-cell" + suffix));
}

function CheckWinCondition()
{
    let [state, pattern] = t3brain.CheckWin(GameGrid);

    switch(state)
    {
        case "x":
            winner = "Player";
            Log("The player won!");
            FlashWinningCells(pattern);
            return true;

        case "o":
            winner = "Bot";
            Log("The bot won...");
            FlashWinningCells(pattern);
            return true;

        case "draw":
            winner = "draw";
            Log("Nobody won...");
            return true;

        default:
            return false;
    }
}

function ContinueGame()
{
    let isGameOver = CheckWinCondition();
    
    if (isGameOver)
    {
        playerTurn = false;

        if (winner === "draw")
        {
            setTimeout(() => 
            {
                alert("Game Over! 🤝 The game ended in a draw!");
                window.location.reload();
            }, 100);
        }
        else
        {
            if (t3brain.difficulty === "1v1")
            {
                PlaySFX("win");

                if (winner === "Player")
                {
                    setTimeout(() => alert("Player X Won! 🎉"), 100);
                }
                else
                if (winner === "Bot")
                {
                    setTimeout(() => alert("Player O Won! 🎉"), 100);
                }
            }
            else
            {
                if (winner === "Player")
                {
                    PlaySFX("win");
                    const currentStreak = parseInt(localStorage.getItem(WINSTREAK_KEY)) || 0;
                    localStorage.setItem(WINSTREAK_KEY, currentStreak + 1);
                    winStreakLabel.textContent = (currentStreak + 1).toString();
                    setTimeout(() => alert("You Win! 🎉"), 100);
                }
                else
                if (winner === "Bot")
                {
                    PlaySFX("lose");
                    GRID.classList.add("shake");
                    localStorage.setItem(WINSTREAK_KEY, 0);
                    winStreakLabel.textContent = "0";
        
                    setTimeout(() => 
                    {
                        alert("Game Over! ❌ You lose!");
                        window.location.reload();
                    }, 100);
                }
            }
        }
    }
    else
    {
        if (t3brain.difficulty === "1v1")
        {
            playerTurn = !playerTurn;

            if (playerTurn)
            {
                turnIndicator.textContent = "X's Turn";
            }
            else
            {
                turnIndicator.textContent = "O's Turn";
            }
        }
        else
        {
            playerTurn = !playerTurn;

            if (playerTurn)
            {
                turnIndicator.textContent = "Your Turn";
            }
            else
            {
                turnIndicator.textContent = "Bot's Turn";

                let cellToPlay = t3brain.Play(GameGrid, isArcade, playedCellsX, playedCellsO);
                if (!cellToPlay)
                {
                    Log("ERROR: BOT DID NOT FIND A CELL TO PLAY???");
                }
                else
                {
                    Log("BOT: Playing " + cellToPlay.id);
                    setTimeout(() => 
                    {
                        TriggerCell(cellToPlay);
                    }, 2000);
                }
            }
        }
    }
}

function Log(message)
{
    if (DEBUG_MODE)
        console.log(message);
}

function PlaySFX(name, volume = 0.5)
{
    if (!sfx[name])
    {
        Log("ERROR: NO SFX OF NAME " + name + "EXISTS!");
        return;
    }

    sfx[name].volume = volume;
    sfx[name].play();
}

document.addEventListener("DOMContentLoaded", () => OnStart());
refreshButton.addEventListener("click", () => window.location.reload());
