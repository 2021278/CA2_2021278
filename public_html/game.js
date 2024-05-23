// game.js
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');

    // Create the board cells
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        board.appendChild(cell);
    }

    // Add event listeners or game logic here
    board.addEventListener('click', (e) => {
        if (e.target.classList.contains('cell')) {
            const cellIndex = e.target.dataset.index;
            console.log('Cell clicked:', cellIndex);
            // Add game logic here
        }
    });
});