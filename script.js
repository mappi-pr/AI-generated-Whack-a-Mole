const holes = document.querySelectorAll('.hole');
const scoreBoard = document.getElementById('score');
const timeBoard = document.getElementById('time');
const timeContainer = document.querySelector('.time-board');
const startButton = document.querySelector('.start-button');
const gameOverScreen = document.querySelector('.game-over');
const finalScore = document.getElementById('final-score');
const rankingList = document.getElementById('ranking');
const restartButton = document.querySelector('.restart-button');
let score = 0;
let lastHole;
let timeUp = false;
let countdown;
let rankings = [];

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) {
        return randomHole(holes);
    }
    lastHole = hole;
    return hole;
}

function peep() {
    const time = 1000; // モグラの表示時間を固定
    const hole = randomHole(holes);
    const img = document.createElement('img');
    img.src = 'mole.png'; // モグラの画像
    img.style.pointerEvents = 'auto'; // クリック可能にする
    img.draggable = false; // ドラッグを無効にする
    img.addEventListener('mousedown', bonk, { once: true });
    img.addEventListener('touchstart', bonk, { once: true });
    hole.appendChild(img);
    img.style.display = 'block';
    setTimeout(() => {
        img.classList.add('up');
        setTimeout(() => {
            img.classList.remove('up');
            img.style.display = 'none';
            img.removeEventListener('mousedown', bonk); // クリックイベントを削除
            img.removeEventListener('touchstart', bonk); // タッチイベントを削除
            if (hole.contains(img)) {
                hole.removeChild(img);
            }
            if (!timeUp) setTimeout(peep, randomTime(200, 800)); // ランダムなインターバルで次のモグラを出現
        }, time);
    }, 10); // 少し遅延させてアニメーションを開始
}

function peepMultiple(numMoles) {
    for (let i = 0; i < numMoles; i++) {
        setTimeout(peep, i * 200); // 少し遅延させて複数のモグラを出現
    }
}

function startGame() {
    scoreBoard.textContent = 0;
    timeBoard.textContent = 10;
    timeUp = false;
    score = 0;
    startButton.style.display = 'none';
    timeContainer.style.display = 'block';
    gameOverScreen.style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
    peepMultiple(1); // 最初は1匹のモグラを出現
    countdown = setInterval(() => {
        let timeLeft = parseInt(timeBoard.textContent);
        if (timeLeft > 0) {
            timeBoard.textContent = timeLeft - 1;
            const numMoles = Math.floor((10 - timeLeft) / 2) + 1; // 時間が経つほどにモグラの数を増やす
            peepMultiple(numMoles);
        } else {
            clearInterval(countdown);
            timeUp = true;
            endGame();
        }
    }, 1000);
    setTimeout(() => timeUp = true, 10000);
}

function endGame() {
    finalScore.textContent = score;
    rankings.push(score);
    rankings.sort((a, b) => b - a);
    rankingList.innerHTML = rankings.map((rank, index) => `<li>${index + 1}位: ${rank}点</li>`).join('');
    gameOverScreen.style.display = 'block';
    document.querySelector('.game-container').style.display = 'none';
}

function bonk(e) {
    if (!e.isTrusted) return; // チート防止
    score++;
    scoreBoard.textContent = score;
    e.target.style.display = 'none'; // 画像だけを削除
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    scoreBoard.style.display = 'block';
    timeContainer.style.display = 'block';
    startGame();
});
