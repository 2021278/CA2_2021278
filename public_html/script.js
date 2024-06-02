/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
document.addEventListener('DOMContentLoaded', (event) => {
    // Get references to DOM elements
    const boardElement = document.getElementById('board');
    const playerSelect = document.getElementById('player-select');
    const playerSymbolSelect = document.getElementById('player-symbol');
    const BOARD_SIZE = 10; // Board size
    let gameActive = true; // Flag to check if the game is active
    let selectedCell = null; // Currently selected cell

    // Define players with their symbols and colors
    const players = {
        1: { symbol: 'G', color: 'red' },
        2: { symbol: 'G', color: 'blue' },
        3: { symbol: 'G', color: 'green' },
        4: { symbol: 'G', color: 'yellow' }
    };

    // Event listener for player selection change
    playerSelect.addEventListener('change', (event) => {
        const currentPlayer = event.target.value;
        players[currentPlayer].symbol = playerSymbolSelect.value;
    });

    // Event listener for player symbol change
    playerSymbolSelect.addEventListener('change', (event) => {
        const currentPlayer = playerSelect.value;
        players[currentPlayer].symbol = event.target.value;
    });

    // Generate the game board
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = 'cell-' + i;
        cell.addEventListener('click', () => handleCellClick(cell, i));
        boardElement.appendChild(cell);
    }

    // Function to handle cell click events
    function handleCellClick(cell, index) {
        const currentPlayer = playerSelect.value;
        const currentSymbol = players[currentPlayer].symbol;
        const currentColor = players[currentPlayer].color;

        if (!gameActive) return;

        if (selectedCell) {
            const selectedIndex = parseInt(selectedCell.id.split('-')[1]);
            const adjacentIndexes = getAdjacentIndexes(selectedIndex);

            if (adjacentIndexes.includes(index) && (cell.textContent === '' || cell.classList.contains(players[currentPlayer === '1' ? '2' : currentPlayer === '2' ? '1' : currentPlayer === '3' ? '4' : '3'].color))) {
                movePiece(selectedCell, cell, index, currentPlayer, currentSymbol, currentColor);
                selectedCell.classList.remove('selected');
                selectedCell = null;
            } else {
                selectedCell.classList.remove('selected');
                selectedCell = cell;
                cell.classList.add('selected');
            }
        } else if (cell.textContent === '' || cell.classList.contains(players[currentPlayer === '1' ? '2' : currentPlayer === '2' ? '1' : currentPlayer === '3' ? '4' : '3'].color)) {
            cell.textContent = currentSymbol;
            cell.classList.add(currentColor);

            // Check if the new move causes piece removal
            checkPieceRemoval(index, currentSymbol);

            socket.emit('move', { index: index, player: currentPlayer, symbol: currentSymbol, color: currentColor });
            if (checkWin(currentSymbol)) {
                gameActive = false;
                setTimeout(() => alert(`${currentSymbol} venceu!`), 100);
            }
        } else {
            selectedCell = cell;
            cell.classList.add('selected');
        }
    }

    // Function to move a piece from one cell to another
    function movePiece(fromCell, toCell, toIndex, player, symbol, color) {
        fromCell.textContent = '';
        fromCell.classList.remove('red', 'blue', 'green', 'yellow');
        toCell.textContent = symbol;
        toCell.classList.add(color);
        checkPieceRemoval(toIndex, symbol); // Check for removal after moving the piece
        socket.emit('move', { index: toIndex, player: player, symbol: symbol, color: color, from: fromCell.id });
    }

    // Function to check if any pieces should be removed
    function checkPieceRemoval(index, symbol) {
        const adjacentIndexes = getAdjacentIndexes(index);
        const currentCell = document.getElementById('cell-' + index);
        const currentColor = ['red', 'blue', 'green', 'yellow'].find(color => currentCell.classList.contains(color));

        adjacentIndexes.forEach(adjacentIndex => {
            const adjacentCell = document.getElementById('cell-' + adjacentIndex);
            const adjacentSymbol = adjacentCell.textContent;
            const adjacentColor = ['red', 'blue', 'green', 'yellow'].find(color => adjacentCell.classList.contains(color));

            if (adjacentSymbol !== '' && adjacentColor !== currentColor) {
                if ((symbol === 'V' && adjacentSymbol === 'W') ||
                    (symbol === 'W' && adjacentSymbol === 'G') ||
                    (symbol === 'G' && adjacentSymbol === 'V') ||
                    (symbol === adjacentSymbol)) {
                    currentCell.textContent = '';
                    currentCell.classList.remove('red', 'blue', 'green', 'yellow');
                    adjacentCell.textContent = '';
                    adjacentCell.classList.remove('red', 'blue', 'green', 'yellow');
                }
            }
        });
    }

    // Function to get adjacent cell indexes
    function getAdjacentIndexes(index) {
        const size = Math.sqrt(document.getElementsByClassName('cell').length);
        const adjacentIndexes = [];
        const row = Math.floor(index / size);
        const col = index % size;

        if (col > 0) adjacentIndexes.push(index - 1); // Left
        if (col < size - 1) adjacentIndexes.push(index + 1); // Right
        if (row > 0) adjacentIndexes.push(index - size); // Up
        if (row < size - 1) adjacentIndexes.push(index + size); // Down

        return adjacentIndexes;
    }

    // Function to check for a win condition
    function checkWin(symbol) {
        const cells = Array.from(document.getElementsByClassName('cell'));
        const winningPatterns = getWinningPatterns(BOARD_SIZE);

        return winningPatterns.some(pattern => 
            pattern.every(index => cells[index].textContent === symbol)
        );
    }

    // Function to get winning patterns based on board size
    function getWinningPatterns(size) {
        const patterns = [];

        // Rows
        for (let row = 0; row < size; row++) {
            for (let col = 0; col <= size - 4; col++) {
                const pattern = [];
                for (let k = 0; k < 4; k++) {
                    pattern.push(row * size + col + k);
                }
                patterns.push(pattern);
            }
        }

        // Columns
        for (let col = 0; col < size; col++) {
            for (let row = 0; row <= size - 4; row++) {
                const pattern = [];
                for (let k = 0; k < 4; k++) {
                    pattern.push((row + k) * size + col);
                }
                patterns.push(pattern);
            }
        }

        // Diagonals
        for (let row = 0; row <= size - 4; row++) {
            for (let col = 0; col <= size - 4; col++) {
                const pattern1 = [];
                const pattern2 = [];
                for (let k = 0; k < 4; k++) {
                    pattern1.push((row + k) * size + col + k);
                    pattern2.push((row + k) * size + col + 3 - k);
                }
                patterns.push(pattern1);
                patterns.push(pattern2);
            }
        }

        return patterns;
    }

    // Function to reset the game
    function resetGame() {
        const cells = Array.from(document.getElementsByClassName('cell'));
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('red', 'blue', 'green', 'yellow', 'selected');
        });
        selectedCell = null;
        gameActive = true;
        socket.emit('reset');
    }

    // Event listener for the reset button
    document.getElementById('reset-button').addEventListener('click', resetGame);

    // Connect to the server via Socket.io
    const socket = io();

    // Handle move events from the server
    socket.on('move', (data) => {
        const cell = document.getElementById('cell-' + data.index);
        const fromCell = data.from ? document.getElementById(data.from) : null;
        if (fromCell) {
            fromCell.textContent = '';
            fromCell.classList.remove('red', 'blue', 'green', 'yellow');
        }
        cell.textContent = data.symbol;
        cell.classList.add(data.color);
        checkPieceRemoval(data.index, data.symbol); // Check for removal after moving piece via socket
    });

    // Handle reset events from the server
    socket.on('reset', resetGame);
});








