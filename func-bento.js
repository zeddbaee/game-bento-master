// --- DATA ---
// Emoji map for display logic
const foodEmojis = {
    'nasi': '🍚',
    'telur': '🥚',
    'sosis': '🐙',
    'ayam': '🍗',
    'brokoli': '🥦',
    'tomat': '🍅',
    'sushi': '🍣',
    'apel': '🍎'
};

const recipes = {
    "Menu Sehat": {
        items: ["nasi", "ayam", "brokoli", "tomat"],
        desc: "Nasi + Ayam + Sayur + Tomat"
    },
    "Paket Jepang": {
        items: ["sushi", "sushi", "telur", "sosis"],
        desc: "2 Sushi + Telur + Sosis"
    },
    "Bekal Kenyang": {
        items: ["nasi", "nasi", "ayam", "telur"],
        desc: "2 Nasi + Ayam + Telur"
    },
    "Serba Merah": {
        items: ["sosis", "apel", "tomat", "sosis"],
        desc: "2 Sosis + Apel + Tomat"
    },
    "Diet Ringan": {
        items: ["apel", "brokoli", "telur", "tomat"],
        desc: "Apel + Sayur + Telur + Tomat"
    },
    "Nasi Goreng Spesial": {
        items: ["nasi", "sosis", "telur", "ayam"],
        desc: "Nasi + Sosis + Telur + Ayam"
    }
};

// --- STATE ---
let currentScore = 0;
let timeLeft = 60;
let timerInterval;
let currentRecipeKey = "";
let bentoSlots = [null, null, null, null]; // 4 Slots
let isPlaying = false;

// --- DOM ---
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const orderText = document.getElementById('order-text');
const bentoContainer = document.getElementById('bento-container');
const feedbackPopup = document.getElementById('feedback-popup');
const feedbackText = document.getElementById('feedback-text');

// --- INIT ---
function initRecipeList() {
    const list = document.getElementById('recipe-list-content');
    let html = '';
    for (const [name, data] of Object.entries(recipes)) {
        // Generate mini icons for recipe items
        const icons = data.items.map(i => foodEmojis[i]).join(' ');
        html += `
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:bg-orange-50 transition">
                <div class="font-bold text-gray-800">${name}</div>
                <div class="text-lg mt-1 tracking-widest">${icons}</div>
                <div class="text-xs text-gray-400 mt-1">${data.desc}</div>
            </div>
        `;
    }
    list.innerHTML = html;
}

// Initialize recipe list when DOM is ready
document.addEventListener('DOMContentLoaded', initRecipeList);

// --- GAME LOGIC ---

function startGame() {
    currentScore = 0;
    timeLeft = 60;
    isPlaying = true;
    scoreDisplay.innerText = currentScore;
    timerDisplay.innerText = timeLeft;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 10) timerDisplay.classList.add('text-red-500');
        else timerDisplay.classList.remove('text-red-500');

        if (timeLeft <= 0) endGame();
    }, 1000);

    nextOrder();
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);
    document.getElementById('final-score').innerText = currentScore;
    gameContainer.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

function nextOrder() {
    resetBento();

    // Random Recipe
    const keys = Object.keys(recipes);
    currentRecipeKey = keys[Math.floor(Math.random() * keys.length)];

    // Animate Text Change
    orderText.style.opacity = 0;
    setTimeout(() => {
        orderText.innerText = currentRecipeKey;
        orderText.style.opacity = 1;
    }, 200);
}

function addFood(foodType) {
    if (!isPlaying) return;

    // Find first empty slot
    const emptyIndex = bentoSlots.findIndex(slot => slot === null);

    if (emptyIndex !== -1) {
        bentoSlots[emptyIndex] = foodType;
        renderSlots(emptyIndex); // Pass index to animate specific slot
    } else {
        // Box Full feedback
        bentoContainer.classList.add('shake-box');
        setTimeout(() => bentoContainer.classList.remove('shake-box'), 500);
    }
}

function removeFood(index) {
    if (!isPlaying || bentoSlots[index] === null) return;
    bentoSlots[index] = null;
    renderSlots();
}

function resetBento() {
    bentoSlots = [null, null, null, null];
    renderSlots();
}

function renderSlots(animateIndex = -1) {
    for (let i = 0; i < 4; i++) {
        const el = document.getElementById(`slot-${i}`);
        const food = bentoSlots[i];

        if (food) {
            el.innerText = foodEmojis[food];
            el.classList.remove('bg-gray-800'); // Remove empty style if needed
            if (i === animateIndex) {
                el.classList.remove('slot-item');
                void el.offsetWidth; // Trigger reflow
                el.classList.add('slot-item');
            }
        } else {
            el.innerText = '';
        }
    }
}

function checkOrder() {
    if (!isPlaying) return;

    // Prepare Arrays for Comparison
    // 1. Filter out nulls from player slots
    const playerItems = bentoSlots.filter(item => item !== null);

    // 2. Get Target Items
    const targetItems = recipes[currentRecipeKey].items;

    // 3. SORT both arrays to ignore order
    playerItems.sort();
    const targetSorted = [...targetItems].sort(); // Copy before sort to keep original clean if needed

    // 4. Compare JSON strings
    const isCorrect = JSON.stringify(playerItems) === JSON.stringify(targetSorted);

    if (isCorrect) {
        // WIN
        showFeedback("BENAR! 😋", "text-green-600");
        currentScore += 100;
        scoreDisplay.innerText = currentScore;
        timeLeft += 3; // Bonus time
        timerDisplay.innerText = timeLeft;
        setTimeout(nextOrder, 1000);
    } else {
        // LOSE
        showFeedback("SALAH! 😭", "text-red-600");
        bentoContainer.classList.add('shake-box');
        setTimeout(() => bentoContainer.classList.remove('shake-box'), 500);
        timeLeft = Math.max(0, timeLeft - 5);
        timerDisplay.innerText = timeLeft;
    }
}

function showFeedback(msg, colorClass) {
    feedbackText.innerText = msg;
    feedbackText.className = `text-4xl font-bold ${colorClass}`;
    feedbackPopup.classList.remove('opacity-0');
    setTimeout(() => {
        feedbackPopup.classList.add('opacity-0');
    }, 800);
}

function toggleRecipe() {
    const modal = document.getElementById('recipe-modal');
    modal.classList.toggle('hidden');
}