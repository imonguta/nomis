document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const board = document.getElementById('board');
    const cells = [];
    const statusDisplay = document.getElementById('status');
    const resetButton = document.getElementById('reset-btn');
    const newGameButton = document.getElementById('new-game-btn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalButton = document.getElementById('modal-btn');
    const playerX = document.getElementById('player-x');
    const playerO = document.getElementById('player-o');
    const scoreX = document.querySelector('#player-x .score');
    const scoreO = document.querySelector('#player-o .score');
    const difficultySelect = document.getElementById('difficulty');

    // Game state
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { X: 0, O: 0 };
    let isAgainstAI = true;
    let aiDifficulty = 'medium';

    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize the game
    function initGame() {
        // Create cells
        board.innerHTML = '';
        cells.length = 0;
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
            cells.push(cell);
        }
        
        // Reset game state
        gameState = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        // Update UI
        updateStatus();
        updatePlayerTurn();
    }

    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell already used or game not active, ignore
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;
        
        // Process the move
        processMove(clickedCell, clickedCellIndex);
        
        // If playing against AI and game is still active, make AI move
        if (isAgainstAI && gameActive && currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }

    // Process a move
    function processMove(cell, index) {
        // Update game state and UI
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Check for win or draw
        const roundWon = checkWin();
        const roundDraw = checkDraw();
        
        if (roundWon) {
            handleWin(roundWon);
            return;
        }
        
        if (roundDraw) {
            handleDraw();
            return;
        }
        
        // Switch player
        switchPlayer();
    }

    // Check for win
    function checkWin() {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                return winningConditions[i]; // Return winning combination
            }
        }
        return null;
    }

    // Check for draw
    function checkDraw() {
        return !gameState.includes('');
    }

    // Handle win
    function handleWin(winningCombination) {
        gameActive = false;
        
        // Highlight winning cells
        winningCombination.forEach(index => {
            cells[index].classList.add('winner');
        });
        
        // Update scores
        scores[currentPlayer]++;
        updateScores();
        
        // Show win modal
        showModal(`${currentPlayer} Wins!`, `Player ${currentPlayer} has won the game!`);
    }

    // Handle draw
    function handleDraw() {
        gameActive = false;
        showModal('Game Draw!', 'The game ended in a draw!');
    }

    // Switch player
    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
        updatePlayerTurn();
    }

    // Update game status
    function updateStatus() {
        statusDisplay.textContent = `${currentPlayer}'s turn`;
    }

    // Update player turn indicators
    function updatePlayerTurn() {
        if (currentPlayer === 'X') {
            playerX.classList.add('active');
            playerO.classList.remove('active');
        } else {
            playerX.classList.remove('active');
            playerO.classList.add('active');
        }
    }

    // Update scores display
    function updateScores() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
    }

    // Show modal
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }

    // Hide modal
    function hideModal() {
        modal.style.display = 'none';
    }

    // Reset game (keep scores)
    function resetGame() {
        initGame();
        // Remove winner classes from cells
        cells.forEach(cell => {
            cell.classList.remove('winner');
        });
    }

    // New game (reset scores)
    function newGame() {
        scores = { X: 0, O: 0 };
        updateScores();
        resetGame();
    }

    // AI move logic
    function makeAIMove() {
        if (!gameActive) return;
        
        let move;
        
        switch (aiDifficulty) {
            case 'easy':
                move = getRandomMove();
                break;
            case 'medium':
                // 50% chance to make best move, 50% random
                move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
                break;
            case 'hard':
                move = getBestMove();
                break;
            default:
                move = getRandomMove();
        }
        
        if (move !== -1) {
            const cell = cells[move];
            processMove(cell, move);
        }
    }

    // Get random available move
    function getRandomMove() {
        const availableMoves = gameState
            .map((cell, index) => cell === '' ? index : -1)
            .filter(index => index !== -1);
        
        if (availableMoves.length === 0) return -1;
        
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    // Get best move using minimax algorithm
    function getBestMove() {
        // Check for immediate win
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'O';
                if (checkWin()) {
                    gameState[i] = '';
                    return i;
                }
                gameState[i] = '';
            }
        }
        
        // Block opponent's immediate win
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                gameState[i] = 'X';
                if (checkWin()) {
                    gameState[i] = '';
                    return i;
                }
                gameState[i] = '';
            }
        }
        
        // Try to take center
        if (gameState[4] === '') return 4;
        
        // Try to take a corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => gameState[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(index => gameState[index] === '');
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        return -1; // No moves left
    }

    // Event listeners
    resetButton.addEventListener('click', resetGame);
    newGameButton.addEventListener('click', newGame);
    modalButton.addEventListener('click', () => {
        hideModal();
        resetGame();
    });
    
    difficultySelect.addEventListener('change', (e) => {
        aiDifficulty = e.target.value;
    });

    // Initialize the game
    initGame();
});