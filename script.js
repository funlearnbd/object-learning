// FunLearnBD Learning Game - Main Script
// Comprehensive game logic with all features

// ===== State Management =====
const gameState = {
    currentLanguage: 'en',
    currentCategory: null,
    currentTab: 'learn',
    currentGameMode: null,
    score: 0,
    progress: {
        itemsLearned: new Set(),
        starsEarned: 0,
        gamesPlayed: 0
    },
    currentGameData: null
};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Wait for gameData to be available
    const checkDataAndInit = () => {
        if (typeof gameData !== 'undefined' && gameData.categories) {
            console.log('gameData loaded successfully');
            console.log('Categories count:', Object.keys(gameData.categories).length);
            initializeApp();
        } else {
            console.log('Waiting for gameData...');
            // Try again after a short delay
            setTimeout(checkDataAndInit, 50);
        }
    };

    checkDataAndInit();
});

function initializeApp() {
    console.log('Initializing app...');

    // Load saved progress
    loadProgress();

    // Show loading screen briefly
    setTimeout(() => {
        showScreen('startScreen');
    }, 1500);

    // Setup event listeners
    setupEventListeners();

    // Generate category cards
    generateCategoryCards();

    console.log('App initialized');
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Language selection
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', () => selectLanguage(btn.dataset.lang));
    });
    
    // Start button
    document.getElementById('startButton').addEventListener('click', () => {
        playSound('click');
        showScreen('categoryScreen');
        speakMascot(translations[gameState.currentLanguage].mascotWelcome);
    });
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        playSound('click');
        showLanguageSettings();
    });
    
    // Back to categories
    document.getElementById('backToCategoriesBtn').addEventListener('click', () => {
        playSound('click');
        showScreen('categoryScreen');
    });
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Game mode selection
    document.querySelectorAll('.game-mode-card').forEach(card => {
        card.addEventListener('click', () => startGameMode(card.dataset.mode));
    });
}

// ===== Screen Management =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ===== Language Selection =====
function selectLanguage(lang) {
    gameState.currentLanguage = lang;
    
    // Update UI
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.lang === lang);
    });
    
    // Enable start button
    document.getElementById('startButton').disabled = false;
    
    // Update translations
    updateUITranslations();
    
    playSound('click');
}

function updateUITranslations() {
    const t = translations[gameState.currentLanguage];
    
    // Start screen
    document.getElementById('welcomeText').textContent = t.welcome;
    document.getElementById('selectLanguageText').textContent = t.selectLanguage;
    document.getElementById('startButtonText').textContent = t.letsLearn;
    document.getElementById('welcomeSubtitle').textContent = t.mascotWelcome;
    
    // Category screen
    document.getElementById('categoryPrompt').textContent = t.selectCategory;
    
    // Tab labels
    document.getElementById('tabLearn').textContent = t.learn;
    document.getElementById('tabPlay').textContent = t.play;
    document.getElementById('tabProgress').textContent = t.progress;
    
    // Game modes
    document.getElementById('modeFindIt').textContent = t.findIt;
    document.getElementById('modeListenMatch').textContent = t.listenMatch;
    document.getElementById('modeMemoryMatch').textContent = t.memoryMatch;
}

// ===== Category Management =====
function generateCategoryCards() {
    const grid = document.getElementById('categoryGrid');

    // Debug: Check if gameData exists
    if (typeof gameData === 'undefined') {
        console.error('gameData is not defined! Check if data.js is loaded properly.');
        grid.innerHTML = '<p style="color: red; padding: 20px;">Error: Game data not loaded!</p>';
        return;
    }

    if (!gameData.categories) {
        console.error('gameData.categories is not defined!');
        grid.innerHTML = '<p style="color: red; padding: 20px;">Error: Categories not found!</p>';
        return;
    }

    console.log('Generating category cards...', Object.keys(gameData.categories).length, 'categories found');
    grid.innerHTML = '';

    Object.values(gameData.categories).forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <span class="category-icon">${category.icon}</span>
            <div class="category-name">${category.name}</div>
            <div class="category-count">${category.items.length} items</div>
        `;
        card.addEventListener('click', () => selectCategory(category.id));
        grid.appendChild(card);
    });

    console.log('Category cards generated successfully!');
}

function selectCategory(categoryId) {
    gameState.currentCategory = categoryId;
    const category = gameData.categories[categoryId];
    
    playSound('click');
    
    // Update header
    document.getElementById('currentCategoryName').textContent = category.name;
    
    // Show game screen
    showScreen('gameScreen');
    
    // Switch to learn tab
    switchTab('learn');
    
    // Mascot speaks
    const message = translations[gameState.currentLanguage].mascotCategory.replace('{category}', category.name);
    speakMascot(message);
    
    // Populate learn tab
    populateLearnTab(category);
}

// ===== Tab Management =====
function switchTab(tabName) {
    gameState.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Update content based on tab
    if (tabName === 'play') {
        showGameModeSelector();
    } else if (tabName === 'progress') {
        updateProgressTab();
    }
    
    playSound('click');
}

// ===== Learn Tab =====
function populateLearnTab(category) {
    const grid = document.getElementById('learnItemsGrid');
    grid.innerHTML = '';
    
    category.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <img src="assets/images/${category.id}/${item.filename}" 
                 alt="${item.name}" 
                 class="item-image"
                 onerror="this.onerror=null; this.src='assets/images/placeholder.png'">
            <div class="item-name">${item.name}</div>
        `;
        
        card.addEventListener('click', () => learnItem(item, card));
        grid.appendChild(card);
    });
    
    // Update instructions
    document.getElementById('learnInstructions').textContent = 
        translations[gameState.currentLanguage].mascotLearn.replace('{item}', 'any item');
}

function learnItem(item, cardElement) {
    // Visual feedback
    cardElement.classList.add('playing');
    setTimeout(() => cardElement.classList.remove('playing'), 600);
    
    // Play sound
    playItemAudio(item.name);
    
    // Mascot speaks
    const message = translations[gameState.currentLanguage].mascotLearn.replace('{item}', item.name);
    setTimeout(() => speakMascot(message, false), 1000);
    
    // Mark as learned
    gameState.progress.itemsLearned.add(item.id);
    saveProgress();
}

// ===== Play Tab - Game Modes =====
function showGameModeSelector() {
    document.getElementById('gameModeSelector').style.display = 'block';
    document.getElementById('gameArea').style.display = 'none';
}

function startGameMode(mode) {
    gameState.currentGameMode = mode;
    playSound('click');
    
    document.getElementById('gameModeSelector').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    
    const category = gameData.categories[gameState.currentCategory];
    
    switch(mode) {
        case 'findIt':
            startFindItGame(category);
            break;
        case 'listenMatch':
            startListenMatchGame(category);
            break;
        case 'memoryMatch':
            startMemoryMatchGame(category);
            break;
    }
    
    gameState.progress.gamesPlayed++;
    saveProgress();
}

// ===== Find It Game =====
function startFindItGame(category) {
    const gameArea = document.getElementById('gameArea');
    gameState.currentGameData = {
        questions: shuffleArray(category.items).slice(0, 10),
        currentQuestion: 0,
        score: 0
    };
    
    showFindItQuestion();
}

function showFindItQuestion() {
    const data = gameState.currentGameData;
    if (data.currentQuestion >= data.questions.length) {
        endGame();
        return;
    }
    
    const correctItem = data.questions[data.currentQuestion];
    const category = gameData.categories[gameState.currentCategory];
    
    // Get wrong options
    const wrongItems = category.items
        .filter(item => item.id !== correctItem.id);
    const options = shuffleArray([
        correctItem,
        ...shuffleArray(wrongItems).slice(0, 5)
    ]);
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="game-question">
            <h3>${translations[gameState.currentLanguage].findThe}</h3>
            <div class="item-name">${correctItem.name}</div>
            <button class="icon-btn" onclick="playItemAudio('${correctItem.name}')">🔊</button>
        </div>
        <div class="game-options" id="gameOptions"></div>
    `;
    
    const optionsContainer = document.getElementById('gameOptions');
    options.forEach(item => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `
            <img src="assets/images/${category.id}/${item.filename}" 
                 alt="${item.name}" 
                 class="option-image"
                 onerror="this.onerror=null; this.src='assets/images/placeholder.png'">
            <div class="item-name">${item.name}</div>
        `;
        
        card.addEventListener('click', () => checkFindItAnswer(item.id === correctItem.id, card));
        optionsContainer.appendChild(card);
    });
    
    // Speak the question
    setTimeout(() => {
        speakMascot(translations[gameState.currentLanguage].findThe + ' ' + correctItem.name);
        playItemAudio(correctItem.name);
    }, 500);
}

function checkFindItAnswer(isCorrect, cardElement) {
    if (isCorrect) {
        cardElement.classList.add('correct');
        gameState.currentGameData.score += 10;
        gameState.score += 10;
        updateScore();
        
        showCelebration();
        playSound('correct');
        
        const correctItem = gameState.currentGameData.questions[gameState.currentGameData.currentQuestion];
        speakMascot(translations[gameState.currentLanguage].mascotCorrect.replace('{item}', correctItem.name));
        
        setTimeout(() => {
            gameState.currentGameData.currentQuestion++;
            showFindItQuestion();
        }, 2000);
    } else {
        cardElement.classList.add('wrong');
        playSound('wrong');
        speakMascot(translations[gameState.currentLanguage].mascotWrong);
        
        setTimeout(() => {
            cardElement.classList.remove('wrong');
        }, 500);
    }
}

// ===== Listen & Match Game =====
function startListenMatchGame(category) {
    const gameArea = document.getElementById('gameArea');
    gameState.currentGameData = {
        questions: shuffleArray(category.items).slice(0, 10),
        currentQuestion: 0,
        score: 0
    };
    
    showListenMatchQuestion();
}

function showListenMatchQuestion() {
    const data = gameState.currentGameData;
    if (data.currentQuestion >= data.questions.length) {
        endGame();
        return;
    }
    
    const correctItem = data.questions[data.currentQuestion];
    const category = gameData.categories[gameState.currentCategory];
    
    const wrongItems = category.items.filter(item => item.id !== correctItem.id);
    const options = shuffleArray([
        correctItem,
        ...shuffleArray(wrongItems).slice(0, 3)
    ]);
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="game-question">
            <h3>${translations[gameState.currentLanguage].listenMatch}</h3>
            <button class="primary-btn" onclick="playItemAudio('${correctItem.name}')">
                🔊 ${translations[gameState.currentLanguage].hearAgain}
            </button>
        </div>
        <div class="game-options" id="gameOptions"></div>
    `;
    
    const optionsContainer = document.getElementById('gameOptions');
    options.forEach(item => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `
            <img src="assets/images/${category.id}/${item.filename}" 
                 alt="${item.name}" 
                 class="option-image"
                 onerror="this.onerror=null; this.src='assets/images/placeholder.png'">
        `;
        
        card.addEventListener('click', () => checkListenMatchAnswer(item.id === correctItem.id, card, item.name));
        optionsContainer.appendChild(card);
    });
    
    // Auto-play the word
    setTimeout(() => {
        playItemAudio(correctItem.name);
    }, 500);
}

function checkListenMatchAnswer(isCorrect, cardElement, itemName) {
    if (isCorrect) {
        cardElement.classList.add('correct');
        cardElement.innerHTML += `<div class="item-name">${itemName}</div>`;
        
        gameState.currentGameData.score += 10;
        gameState.score += 10;
        updateScore();
        
        showCelebration();
        playSound('correct');
        speakMascot(translations[gameState.currentLanguage].mascotCorrect.replace('{item}', itemName));
        
        setTimeout(() => {
            gameState.currentGameData.currentQuestion++;
            showListenMatchQuestion();
        }, 2000);
    } else {
        cardElement.classList.add('wrong');
        playSound('wrong');
        speakMascot(translations[gameState.currentLanguage].mascotWrong);
        
        setTimeout(() => {
            cardElement.classList.remove('wrong');
        }, 500);
    }
}

// ===== Memory Match Game =====
function startMemoryMatchGame(category) {
    const items = shuffleArray(category.items).slice(0, 6);
    const cards = shuffleArray([...items, ...items]);
    
    gameState.currentGameData = {
        cards: cards,
        flipped: [],
        matched: [],
        moves: 0
    };
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="mascot-helper">
            <div class="mascot-small">🦜</div>
            <p>${translations[gameState.currentLanguage].memoryMatch}</p>
        </div>
        <div class="memory-grid" id="memoryGrid"></div>
    `;
    
    const grid = document.getElementById('memoryGrid');
    cards.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.itemId = item.id;
        
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">?</div>
                <div class="memory-card-back">
                    <img src="assets/images/${category.id}/${item.filename}" 
                         alt="${item.name}"
                         onerror="this.onerror=null; this.src='assets/images/placeholder.png'">
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => flipMemoryCard(card, item));
        grid.appendChild(card);
    });
}

function flipMemoryCard(cardElement, item) {
    const data = gameState.currentGameData;
    
    if (cardElement.classList.contains('flipped') || 
        cardElement.classList.contains('matched') ||
        data.flipped.length >= 2) {
        return;
    }
    
    cardElement.classList.add('flipped');
    data.flipped.push({ element: cardElement, item: item });
    playSound('click');
    playItemAudio(item.name);
    
    if (data.flipped.length === 2) {
        data.moves++;
        setTimeout(() => checkMemoryMatch(), 800);
    }
}

function checkMemoryMatch() {
    const data = gameState.currentGameData;
    const [first, second] = data.flipped;
    
    if (first.item.id === second.item.id) {
        // Match!
        first.element.classList.add('matched');
        second.element.classList.add('matched');
        data.matched.push(first.item.id);
        
        playSound('correct');
        showCelebration();
        
        gameState.score += 20;
        updateScore();
        
        // Check if game complete
        if (data.matched.length === data.cards.length / 2) {
            setTimeout(() => {
                speakMascot(translations[gameState.currentLanguage].mascotEncourage);
                endGame();
            }, 1000);
        }
    } else {
        // No match
        playSound('wrong');
        setTimeout(() => {
            first.element.classList.remove('flipped');
            second.element.classList.remove('flipped');
        }, 500);
    }
    
    data.flipped = [];
}

// ===== Game End =====
function endGame() {
    const data = gameState.currentGameData;
    const stars = Math.floor(data.score / 20);
    
    gameState.progress.starsEarned += stars;
    saveProgress();
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="stats-card" style="text-align: center;">
            <h2>🎉 Game Complete! 🎉</h2>
            <div class="stat-row">
                <span class="stat-label">${translations[gameState.currentLanguage].score}:</span>
                <span class="stat-value">${data.score}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">${translations[gameState.currentLanguage].stars}:</span>
                <span class="stat-value">${stars} ⭐</span>
            </div>
            <button class="primary-btn large" onclick="showGameModeSelector()">
                ${translations[gameState.currentLanguage].next}
            </button>
        </div>
    `;
    
    showCelebration();
    speakMascot(translations[gameState.currentLanguage].mascotEncourage);
}

// ===== Progress Tab =====
function updateProgressTab() {
    document.getElementById('itemsLearned').textContent = gameState.progress.itemsLearned.size;
    document.getElementById('starsEarned').textContent = gameState.progress.starsEarned + ' ⭐';
    document.getElementById('gamesPlayed').textContent = gameState.progress.gamesPlayed;
    
    // Update achievements
    const achievementsGrid = document.getElementById('achievementsGrid');
    achievementsGrid.innerHTML = '';
    
    const achievements = [
        { icon: '🌟', name: 'First Star', unlocked: gameState.progress.starsEarned >= 1 },
        { icon: '📚', name: 'Learner', unlocked: gameState.progress.itemsLearned.size >= 10 },
        { icon: '🎮', name: 'Player', unlocked: gameState.progress.gamesPlayed >= 5 },
        { icon: '⭐', name: '10 Stars', unlocked: gameState.progress.starsEarned >= 10 },
        { icon: '🏆', name: 'Expert', unlocked: gameState.progress.itemsLearned.size >= 50 },
        { icon: '👑', name: 'Master', unlocked: gameState.progress.starsEarned >= 50 }
    ];
    
    achievements.forEach(achievement => {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge ' + (achievement.unlocked ? 'unlocked' : 'locked');
        badge.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
        `;
        achievementsGrid.appendChild(badge);
    });
}

// ===== Audio System =====
function playItemAudio(itemName) {
    // Try to play audio file first, fallback to Text-to-Speech
    const audioPath = `assets/audio/${gameState.currentLanguage}/${itemName.toLowerCase().replace(/\s+/g, '_')}.mp3`;
    const audio = document.getElementById('audioPlayer');
    
    audio.src = audioPath;
    audio.play().catch(() => {
        // Fallback to Text-to-Speech
        speakText(itemName);
    });
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any pending speech
        window.speechSynthesis.cancel();

        // Skip TTS for Bengali - not well supported in browsers
        if (gameState.currentLanguage === 'bn') {
            return;
        }

        // Remove excessive punctuation that gets read aloud
        const cleanText = text.replace(/[!?.،؟]+/g, ' ').trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = gameState.currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }
}

function speakMascot(message, showOverlay = true) {
    if (showOverlay) {
        const overlay = document.getElementById('mascotOverlay');
        overlay.querySelector('.mascot-message').textContent = message;
        overlay.classList.add('active');
        
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 1500);
    }
    
    speakText(message);
}

function playSound(type) {
    // Placeholder for sound effects
    const sounds = {
        click: 'assets/sounds/click.mp3',
        correct: 'assets/sounds/correct.mp3',
        wrong: 'assets/sounds/wrong.mp3',
        celebration: 'assets/sounds/celebration.mp3'
    };
    
    const audio = new Audio(sounds[type]);
    audio.play().catch(() => {}); // Ignore errors
}

// ===== Celebration =====
function showCelebration() {
    const overlay = document.getElementById('celebrationOverlay');
    overlay.classList.add('active');
    
    // Create confetti
    const container = overlay.querySelector('.confetti-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.backgroundColor = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#51CF66'][Math.floor(Math.random() * 4)];
        container.appendChild(confetti);
    }
    
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 2000);
}

// ===== Score Management =====
function updateScore() {
    document.getElementById('scoreValue').textContent = gameState.score;
}

// ===== Progress Persistence =====
function saveProgress() {
    localStorage.setItem('funlearnbd_progress', JSON.stringify({
        itemsLearned: Array.from(gameState.progress.itemsLearned),
        starsEarned: gameState.progress.starsEarned,
        gamesPlayed: gameState.progress.gamesPlayed,
        score: gameState.score
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('funlearnbd_progress');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.progress.itemsLearned = new Set(data.itemsLearned || []);
        gameState.progress.starsEarned = data.starsEarned || 0;
        gameState.progress.gamesPlayed = data.gamesPlayed || 0;
        gameState.score = data.score || 0;
    }
}

// ===== Utility Functions =====
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showLanguageSettings() {
    // Simple language switcher (can be expanded)
    const currentLang = gameState.currentLanguage;
    const languages = { en: 'English', bn: 'বাংলা', ar: 'العربية' };
    const nextLang = currentLang === 'en' ? 'bn' : currentLang === 'bn' ? 'ar' : 'en';
    
    if (confirm(`Switch to ${languages[nextLang]}?`)) {
        selectLanguage(nextLang);
        updateUITranslations();
    }
}

// ===== Export for global access =====
window.playItemAudio = playItemAudio;
window.showGameModeSelector = showGameModeSelector;
