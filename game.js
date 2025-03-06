const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 60; // Bigger tiles for visibility
let gridSize, player, movesLeft, exits, blobs, traps, obstacles, score, coins;

const difficulties = {
    easy: { grid: 3, moves: 3 },
    medium: { grid: 5, moves: 3 },
    hard: { grid: 7, moves: 3 },
    ultra: { grid: 9, moves: 3 }
};

function startGame(difficulty) {
    gridSize = difficulties[difficulty].grid;
    canvas.width = gridSize * tileSize;
    canvas.height = gridSize * tileSize;
    movesLeft = difficulties[difficulty].moves;
    score = 0;
    coins = 0;
    document.getElementById('moves').textContent = movesLeft;
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coins;
    initLevel({ x: 0, y: 0 });
}

function initLevel(lastExit) {
    player = { x: lastExit.x, y: lastExit.y, size: 1.0, color: '#00ff00' }; // Default green
    exits = [];
    blobs = [];
    traps = [];
    obstacles = [];
    let coinCount = Math.floor(Math.random() * (gridSize - 1)) + 1; // 1-3 coins based on grid size

    // Generate exits (1-2)
    let exitCount = Math.min(2, Math.floor(gridSize / 3) + 1);
    while (exits.length < exitCount) {
        let ex = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        if (ex.x !== player.x || ex.y !== player.y) exits.push(ex);
    }

    // Generate blobs (free moves)
    for (let i = 0; i < Math.floor(gridSize / 2); i++) {
        blobs.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
    }

    // Generate traps
    for (let i = 0; i < Math.floor(gridSize / 2); i++) {
        traps.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
    }

    // Generate obstacles
    for (let i = 0; i < Math.floor(gridSize / 2); i++) {
        obstacles.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
    }

    // Generate coins
    for (let i = 0; i < coinCount; i++) {
        obstacles.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize), coin: true });
    }

    draw();
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            ctx.strokeStyle = '#444';
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Draw obstacles (boxes) and coins
    obstacles.forEach(o => {
        if (o.coin) {
            ctx.fillStyle = '#ffdd00';
            ctx.beginPath();
            ctx.arc(o.x * tileSize + tileSize / 2, o.y * tileSize + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#666';
            ctx.fillRect(o.x * tileSize + 5, o.y * tileSize + 5, tileSize - 10, tileSize - 10);
        }
    });

    // Draw traps (lava)
    traps.forEach(t => {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(t.x * tileSize + 5, t.y * tileSize + 5, tileSize - 10, tileSize - 10);
    });

    // Draw blobs
    blobs.forEach(b => {
        ctx.fillStyle = '#88ff88';
        ctx.beginPath();
        ctx.arc(b.x * tileSize + tileSize / 2, b.y * tileSize + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw exits
    exits.forEach(e => {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(e.x * tileSize + 10, e.y * tileSize + 10, tileSize - 20, tileSize - 20);
    });

    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2, tileSize / 2 * player.size, 0, Math.PI * 2);
    ctx.fill();
}

function movePlayer(dx, dy) {
    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;
    if (obstacles.some(o => o.x === newX && o.y === newY && !o.coin)) return;

    player.x = newX;
    player.y = newY;
    movesLeft--;
    player.size -= 0.25;
    document.getElementById('moves').textContent = movesLeft;

    // Check traps
    if (traps.some(t => t.x === player.x && t.y === player.y)) {
        gameOver();
        return;
    }

    // Check blobs
    let blobIndex = blobs.findIndex(b => b.x === player.x && b.y === player.y);
    if (blobIndex !== -1) {
        movesLeft++;
        blobs.splice(blobIndex, 1);
        document.getElementById('moves').textContent = movesLeft;
    }

    // Check coins
    let coinIndex = obstacles.findIndex(o => o.x === player.x && o.y === player.y && o.coin);
    if (coinIndex !== -1) {
        coins++;
        obstacles.splice(coinIndex, 1);
        document.getElementById('coins').textContent = coins;
    }

    // Check exits
    let exit = exits.find(e => e.x === player.x && e.y === player.y);
    if (exit) {
        score++;
        document.getElementById('score').textContent = score;
        initLevel(exit);
    }

    if (movesLeft <= 0 || player.size <= 0) {
        gameOver();
        return;
    }

    draw();
}

function gameOver() {
    alert(`Eternal Slime Fades! Rooms: ${score} | Coins: ${coins}\nSpend your coins on cosmetics next time!`);
    startGame(Object.keys(difficulties)[0]);
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
});
