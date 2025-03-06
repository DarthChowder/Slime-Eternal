const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const tileSize = 60;
let gridSize, player, movesLeft, exits, blobs, traps, obstacles, score, coins, startPos;

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
    showHelp(); // Show help on first start
}

function initLevel(lastExit) {
    startPos = { x: lastExit.x, y: lastExit.y };
    player = { x: lastExit.x, y: lastExit.y, size: 1.0, color: '#00ff00' };
    exits = [];
    blobs = [];
    traps = [];
    obstacles = [];
    let coinCount = Math.floor(Math.random() * (gridSize - 1)) + 1;

    let exitCount = Math.min(2, Math.floor(gridSize / 3) + 1);
    while (exits.length < exitCount) {
        let ex = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
        if (ex.x !== player.x || ex.y !== player.y) exits.push(ex);
    }

    for (let i = 0; i < Math.floor(gridSize / 2); i++) {
        blobs.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
    }

    for (let i = 0; i < Math.floor(gridSize / 2); i++) {
        traps.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
    }

    for (let i = 0; i < Math.floor(gridSize / 2); i++) {
        obstacles.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
    }

    for (let i = 0; i < coinCount; i++) {
        obstacles.push({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize), coin: true });
    }

    draw();
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            ctx.strokeStyle = '#444';
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Draw start label
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('Start', startPos.x * tileSize + tileSize / 2, startPos.y * tileSize + tileSize - 5);

    // Draw obstacles and coins
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

    traps.forEach(t => {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(t.x * tileSize + 5, t.y * tileSize + 5, tileSize - 10, tileSize - 10);
    });

    blobs.forEach(b => {
        ctx.fillStyle = '#88ff88';
        ctx.beginPath();
        ctx.arc(b.x * tileSize + tileSize / 2, b.y * tileSize + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw exits with labels
    exits.forEach((e, i) => {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(e.x * tileSize + 10, e.y * tileSize + 10, tileSize - 20, tileSize - 20);
        ctx.fillStyle = '#000';
        ctx.font = '12px Courier New';
        ctx.fillText('Exit', e.x * tileSize + tileSize / 2, e.y * tileSize + tileSize / 2 + 4);
    });

    // Draw player with white outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2, tileSize / 2 * player.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = player.color;
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

    if (traps.some(t => t.x === player.x && t.y === player.y)) {
        gameOver();
        return;
    }

    let blobIndex = blobs.findIndex(b => b.x === player.x && b.y === player.y);
    if (blobIndex !== -1) {
        movesLeft++;
        blobs.splice(blobIndex, 1);
        document.getElementById('moves').textContent = movesLeft;
    }

    let coinIndex = obstacles.findIndex(o => o.x === player.x && o.y === player.y && o.coin);
    if (coinIndex !== -1) {
        coins++;
        obstacles.splice(coinIndex, 1);
        document.getElementById('coins').textContent = coins;
    }

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

// Click-to-move
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    const dx = x - player.x;
    const dy = y - player.y;

    // Only allow movement one tile at a time (up, down, left, right)
    if (Math.abs(dx) + Math.abs(dy) === 1) {
        movePlayer(dx, dy);
    }
});

// Keyboard controls (Arrows + WASD)
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w': movePlayer(0, -1); break;
        case 'ArrowDown':
        case 's': movePlayer(0, 1); break;
        case 'ArrowLeft':
        case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight':
        case 'd': movePlayer(1, 0); break;
    }
});

function gameOver() {
    alert(`Eternal Slime Fades! Rooms: ${score} | Coins: ${coins}\nSpend your coins on cosmetics next time!`);
    startGame(Object.keys(difficulties)[0]);
}

function showHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

function hideHelp() {
    document.getElementById('helpModal').style.display = 'none';
}
