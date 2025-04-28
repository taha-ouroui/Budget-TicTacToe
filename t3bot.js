export { t3brain };

class t3brain
{
    static difficulty;

    static Play(grid)
    {
        let cellToPlay;

        switch(this.difficulty)
        {
            case "easy":
                cellToPlay = this.MakeMove_Easy(grid);
                break;

            case "normal":
                cellToPlay = this.MakeMove_Normal(grid);
                break;

            case "hard":
                cellToPlay = this.MakeMove_Hard(grid);
                break;
        }

        return cellToPlay;
    }

    static MakeMove_Easy(grid)
    {
        let emptyCells = grid.filter(cellInfo => !cellInfo.is_revealed);

        if (emptyCells.length > 0)
        {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }

    static MakeMove_Normal(grid)
    {
        let emptyCells = grid.filter(cellInfo => !cellInfo.is_revealed);

        // 1. check if the bot is able to win
        for (const cell of emptyCells)
        {
            const simulatedGrid = grid.map(c => ({ ...c }));
            simulatedGrid[cell.id].is_o = true;
            simulatedGrid[cell.id].is_revealed = true;
    
            if (this.CheckWin(simulatedGrid)[0] === "o")
            {
                if (Math.random() > 0.1) 
                {
                    return cell;
                }
            }
        }

        // 2. Try to block opponent
        for (const cell of emptyCells)
        {
            const simulatedGrid = grid.map(c => ({ ...c }));
            simulatedGrid[cell.id].is_x = true;
            simulatedGrid[cell.id].is_revealed = true;
    
            if (this.CheckWin(simulatedGrid)[0] === "x")
            {
                if (Math.random() > 0.1) 
                {
                    return cell;
                }
            }
        }
    
        // 3. Take center
        const center = grid[4];
        if (!center.is_revealed)
        {
            return center;
        }

        // 4. randomly pick corners or sides
        if (Math.random() < 0.5) 
        {
            const corners = this.shuffle([0, 2, 6, 8]);
            for (let i of corners)
            {
                if (!grid[i].is_revealed) return grid[i];
            }
        } 
        else 
        {
            const sides = this.shuffle([1, 3, 5, 7]);
            for (let i of sides)
            {
                if (!grid[i].is_revealed) return grid[i];
            }
        }
    
        // fallback
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    static Minimax(grid, isAITurn)
    {
        const result = this.CheckWin(grid)[0];
        if (result !== null)
        {
            if (result === "o") return 1;   // AI win
            if (result === "x") return -1;  // Player win
            if (result === "draw") return 0;
        }

        const emptyCells = grid.filter(cell => !cell.is_revealed);
        const scores = [];

        for (const cell of emptyCells)
        {
            const simulatedGrid = grid.map(c => ({ ...c }));

            if (isAITurn)
            {
                simulatedGrid[cell.id].is_o = true;
            }
            else
            {
                simulatedGrid[cell.id].is_x = true;
            }

            simulatedGrid[cell.id].is_revealed = true;

            const score = this.Minimax(simulatedGrid, !isAITurn);
            scores.push(score);
        }

        return isAITurn ? Math.max(...scores) : Math.min(...scores);
    }

    static MakeMove_Hard(grid)
    {
        const emptyCells = grid.filter(cell => !cell.is_revealed);
        let bestScore = -Infinity;
        let bestMove = null;

        for (const cell of emptyCells)
        {
            const simulatedGrid = grid.map(c => ({ ...c }));
            simulatedGrid[cell.id].is_o = true;
            simulatedGrid[cell.id].is_revealed = true;

            const score = this.Minimax(simulatedGrid, false);

            if (score > bestScore)
            {
                bestScore = score;
                bestMove = cell;
            }
        }

        return bestMove;
    }

    // Fisher-Yates shuffle algorithm
    static shuffle(array) 
    {
        for (let i = array.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    static CheckWin(GameGrid)
    {
        const winPatterns = 
        [
            [0, 1, 2], // ROWS
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6], // COLUMNS
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8], // DIAGONAL
            [2, 4, 6],
        ];

        for (const pattern of winPatterns) 
        {
            const [a, b, c] = pattern;
            const cellA = GameGrid[a];
            const cellB = GameGrid[b];
            const cellC = GameGrid[c];

            if (cellA.is_x && cellB.is_x && cellC.is_x)
            {
                return ["x", pattern];
            }

            if (cellA.is_o && cellB.is_o && cellC.is_o)
            {
                return ["o", pattern];
            }
        }

        const allRevealed = GameGrid.every(cell => cell.is_revealed);
        if (allRevealed) 
        {
            return ["draw", null];
        }

        return [null, null];
    }
    
}
