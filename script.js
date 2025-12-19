const holes = document.querySelectorAll('.hole');
const scoreBoard = document.getElementById('score');
const timeBoard = document.getElementById('time');
const stageBoard = document.getElementById('stage');
const timeContainer = document.querySelector('.time-board');
const stageContainer = document.querySelector('.stage-board');
const startButton = document.querySelector('.start-button');
const gameOverScreen = document.querySelector('.game-over');
const finalScore = document.getElementById('final-score');
const rankingList = document.getElementById('ranking');
const restartButton = document.querySelector('.restart-button');
const modeSelection = document.querySelector('.mode-selection');
const modeButtons = document.querySelectorAll('.mode-button');
const storyScreen = document.querySelector('.story-screen');
const storyTitle = document.getElementById('story-title');
const storyText = document.getElementById('story-text');
const storyContinueButton = document.querySelector('.story-continue-button');
const storyComplete = document.querySelector('.story-complete');
const storyFinalScore = document.getElementById('story-final-score');
const storyGameOver = document.querySelector('.story-game-over');
const storyGameOverMessage = document.getElementById('story-game-over-message');
const storyGameOverScore = document.getElementById('story-game-over-score');
const failedStage = document.getElementById('failed-stage');
const restartStoryButton = document.querySelector('.restart-story-button');
const menuButtons = document.querySelectorAll('.menu-button');
let score = 0;
let lastHole;
let timeUp = false;
let countdown;
let rankings = [];
let gameMode = 'normal';
let currentStage = 1;
let totalScore = 0;

const storyStages = [
    {
        stage: 1,
        title: "ステージ 1: 平和な村",
        text: "ある平和な村に、突然モグラが現れ始めました。村の畑を守るため、モグラを退治してください！",
        duration: 15,
        difficulty: 1,
        minScore: 0
    },
    {
        stage: 2,
        title: "ステージ 2: モグラの逆襲",
        text: "モグラの数が増えてきました！さらに、村人に化けたモグラも現れました。村人を叩くとペナルティがあるので注意！",
        duration: 20,
        difficulty: 2,
        minScore: 3
    },
    {
        stage: 3,
        title: "ステージ 3: 最終決戦",
        text: "モグラの王様が現れました！大量のモグラと村人が同時に襲ってきます。畑を守り抜いてください！",
        duration: 25,
        difficulty: 3,
        minScore: 5
    }
];

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
    const citizenProbability = gameMode === 'story' ? 0.15 * currentStage : 0.1;
    const isCitizen = Math.random() < citizenProbability; // ストーリーモードではステージが進むほど村人の確率が上がる
    img.src = isCitizen ? 'citizen.png' : 'mole.png'; // モグラかcitizenの画像を設定
    img.dataset.type = isCitizen ? 'citizen' : 'mole'; // データ属性でタイプを設定
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

// ローカルストレージからスコアを読み込む関数
function loadScores() {
    const savedScores = localStorage.getItem('whackAMoleScores');
    if (savedScores) {
        rankings = JSON.parse(savedScores);
    }
}

// ローカルストレージにスコアを保存する関数
function saveScores() {
    localStorage.setItem('whackAMoleScores', JSON.stringify(rankings));
}

function startGame() {
    loadScores(); // ゲーム開始時にスコアを読み込む
    scoreBoard.textContent = 0;
    timeUp = false;
    score = 0;
    startButton.style.display = 'none';
    timeContainer.style.display = 'block';
    gameOverScreen.style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
    
    if (gameMode === 'story') {
        const stage = storyStages[currentStage - 1];
        timeBoard.textContent = stage.duration;
        stageBoard.textContent = currentStage;
        stageContainer.style.display = 'block';
        peepMultiple(stage.difficulty); // ステージの難易度に応じた数のモグラを出現
        countdown = setInterval(() => {
            let timeLeft = parseInt(timeBoard.textContent);
            if (timeLeft > 0) {
                timeBoard.textContent = timeLeft - 1;
                const numMoles = Math.floor((stage.duration - timeLeft) / 3) + stage.difficulty; // 時間が経つほどにモグラの数を増やす
                peepMultiple(numMoles);
            } else {
                clearInterval(countdown);
                timeUp = true;
                endGame();
            }
        }, 1000);
        setTimeout(() => timeUp = true, stage.duration * 1000);
    } else {
        timeBoard.textContent = 10;
        stageContainer.style.display = 'none';
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
}

function endGame() {
    if (gameMode === 'story') {
        const stage = storyStages[currentStage - 1];
        totalScore += score;
        
        // Check if player passed the stage
        if (score < stage.minScore) {
            // Game Over - failed the stage
            storyGameOverScore.textContent = totalScore;
            failedStage.textContent = currentStage;
            storyGameOver.style.display = 'block';
            document.querySelector('.game-container').style.display = 'none';
        } else if (currentStage < storyStages.length) {
            // 次のステージへ
            currentStage++;
            showStory();
        } else {
            // ストーリーモードクリア
            storyFinalScore.textContent = totalScore;
            storyComplete.style.display = 'block';
            document.querySelector('.game-container').style.display = 'none';
        }
    } else {
        finalScore.textContent = score;
        rankings.push(score);
        rankings.sort((a, b) => b - a);
        rankingList.innerHTML = rankings.map((rank, index) => `<li>${index + 1}位: ${rank}点</li>`).join('');
        saveScores(); // ゲーム終了時にスコアを保存する
        gameOverScreen.style.display = 'block';
        document.querySelector('.game-container').style.display = 'none';
    }
}

function bonk(e) {
    if (!e.isTrusted) return; // チート防止
    const type = e.target.dataset.type;
    if (type === 'citizen') {
        score -= 2; // citizenをクリックした場合はスコアを-2
    } else {
        score++;
    }
    scoreBoard.textContent = score;
    e.target.style.display = 'none'; // 画像だけを削除
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    scoreBoard.style.display = 'block';
    timeContainer.style.display = 'block';
    startGame();
});

// モード選択
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        gameMode = button.dataset.mode;
        modeSelection.style.display = 'none';
        if (gameMode === 'story') {
            currentStage = 1;
            totalScore = 0;
            showStory();
        } else {
            document.querySelector('.game-container').style.display = 'block';
            startButton.style.display = 'block';
        }
    });
});

// ストーリー画面を表示
function showStory() {
    const stage = storyStages[currentStage - 1];
    storyTitle.textContent = stage.title;
    storyText.textContent = stage.text;
    storyScreen.style.display = 'block';
    document.querySelector('.game-container').style.display = 'none';
}

// ストーリー続けるボタン
storyContinueButton.addEventListener('click', () => {
    storyScreen.style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
    startButton.style.display = 'block';
    startButton.textContent = 'ステージ ' + currentStage + ' 開始';
});

// メニューに戻るボタン
menuButtons.forEach(button => {
    button.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        storyComplete.style.display = 'none';
        storyGameOver.style.display = 'none';
        document.querySelector('.game-container').style.display = 'none';
        modeSelection.style.display = 'block';
        startButton.textContent = 'ゲーム開始';
        currentStage = 1;
        totalScore = 0;
    });
});

// ストーリーモード再挑戦ボタン
restartStoryButton.addEventListener('click', () => {
    storyGameOver.style.display = 'none';
    currentStage = 1;
    totalScore = 0;
    showStory();
});