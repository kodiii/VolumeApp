// Workout Data Structure
const workoutProgram = {
    1: {
        name: "Dia 1 – Peito + Costas",
        exercises: [
            { name: "Supino reto barra", sets: 4, reps: "6-8", type: "compound", link: "" },
            { name: "Remada barra", sets: 4, reps: "8-10", type: "compound", link: "" },
            { name: "Supino inclinado halteres", sets: 4, reps: "8-10", type: "compound", link: "" },
            { name: "Barra fixa", sets: 4, reps: "6-8", type: "compound", link: "" },
            { name: "Crucifixo máquina/cabos", sets: 4, reps: "10-12", type: "isolation", link: "" },
            { name: "Face pull", sets: 4, reps: "12-15", type: "isolation", link: "" }
        ]
    },
    2: {
        name: "Dia 2 – Pernas (Quadríceps)",
        exercises: [
            { name: "Agachamento livre", sets: 4, reps: "6-8", type: "compound", link: "" },
            { name: "Leg press", sets: 4, reps: "10", type: "compound", link: "" },
            { name: "Lunge", sets: 4, reps: "12", type: "compound", link: "" },
            { name: "Step-up", sets: 4, reps: "12", type: "isolation", link: "" },
            { name: "Gémeos em pé", sets: 4, reps: "12-15", type: "isolation", link: "" },
            { name: "Ab wheel", sets: 3, reps: "12-15", type: "isolation", link: "" }
        ]
    },
    3: {
        name: "Dia 3 – Ombros + Braços",
        exercises: [
            { name: "Desenvolvimento militar barra", sets: 4, reps: "6-8", type: "compound", link: "" },
            { name: "Elevação lateral halteres", sets: 4, reps: "12-15", type: "isolation", link: "" },
            { name: "Rosca direta barra", sets: 4, reps: "8-10", type: "isolation", link: "" },
            { name: "Tríceps testa (skullcrusher)", sets: 4, reps: "8-10", type: "isolation", link: "" },
            { name: "Rosca martelo", sets: 3, reps: "12-15", type: "isolation", link: "" },
            { name: "Tríceps corda polia", sets: 3, reps: "12-15", type: "isolation", link: "" },
            { name: "Face pull", sets: 3, reps: "12-15", type: "isolation", link: "" }
        ]
    },
    4: {
        name: "Dia 4 – Pernas (Posterior + Glúteos)",
        exercises: [
            { name: "Terra romeno", sets: 4, reps: "8", type: "compound", link: "" },
            { name: "Agachamento frontal", sets: 4, reps: "8-10", type: "compound", link: "" },
            { name: "Hip thrust", sets: 4, reps: "8-10", type: "compound", link: "" },
            { name: "Leg curl máquina", sets: 4, reps: "12", type: "isolation", link: "" },
            { name: "Peso morto sumo", sets: 3, reps: "8", type: "compound", link: "" },
            { name: "Gémeos sentado", sets: 4, reps: "15", type: "isolation", link: "" }
        ]
    },
    5: {
        name: "Dia 5 – Upper Mix + Core",
        exercises: [
            { name: "Supino inclinado barra", sets: 4, reps: "6-8", type: "compound", link: "" },
            { name: "Remada unilateral halter", sets: 4, reps: "8-10", type: "compound", link: "" },
            { name: "Arnold press", sets: 3, reps: "10-12", type: "compound", link: "" },
            { name: "Puxada polia aberta", sets: 4, reps: "10", type: "compound", link: "" },
            { name: "Rosca concentrada", sets: 3, reps: "12-15", type: "isolation", link: "" },
            { name: "Ab crunch polia", sets: 4, reps: "12-15", type: "isolation", link: "" },
            { name: "Prancha lateral", sets: 3, reps: "30s", type: "isolation", link: "" }
        ]
    }
};

// Week progression data
const weekProgression = {
    "1": { name: "Semana 1-2 (MEV)", percentage: "65-70%", rpe: 7, setsMultiplier: 1.0 },
    "2": { name: "Semana 1-2 (MEV)", percentage: "65-70%", rpe: 7, setsMultiplier: 1.0 },
    "3": { name: "Semana 3-4 (MAV)", percentage: "70-75%", rpe: 8, setsMultiplier: 1.2 },
    "4": { name: "Semana 3-4 (MAV)", percentage: "70-75%", rpe: 8, setsMultiplier: 1.2 },
    "5": { name: "Semana 5 (MAV Alto)", percentage: "75-78%", rpe: 8.5, setsMultiplier: 1.4 },
    "6": { name: "Semana 6 (MRV)", percentage: "78-80%", rpe: 9, setsMultiplier: 1.6 },
    "7": { name: "Semana 7 (Deload)", percentage: "60-65%", rpe: 6, setsMultiplier: 0.8 }
};

// Application State
let currentDay = 1;
let currentWeek = 1;
let workoutData = {};

// Performance optimization variables
let isUpdating = false;
let updateQueue = [];
let cachedElements = new Map();

// Performance utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function getCachedElement(selector) {
    if (!cachedElements.has(selector)) {
        cachedElements.set(selector, document.querySelector(selector));
    }
    return cachedElements.get(selector);
}

function clearElementCache() {
    cachedElements.clear();
}

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const weekSelect = document.getElementById('week-select');
const workoutTitle = document.getElementById('workout-title');
const rpeInfo = document.getElementById('rpe-info');
const exercisesContainer = document.getElementById('exercises-container');
const modal = document.getElementById('exercise-modal');
const modalExerciseName = document.getElementById('modal-exercise-name');
const exerciseVideo = document.getElementById('exercise-video');
const exerciseLink = document.getElementById('exercise-link');
const saveLinkBtn = document.getElementById('save-link');
const closeModalBtn = document.getElementById('close-modal');

// PWA Installation
let deferredPrompt;
let isInstalled = false;

// Theme Management
function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme, true); // Show notification when manually toggling

    // Add switching animation
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.classList.add('switching');
        setTimeout(() => {
            toggleBtn.classList.remove('switching');
        }, 600);
    }
}

function setTheme(theme, showNotification = false) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update toggle button icon
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = toggleBtn?.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            toggleBtn.title = 'Alternar para modo claro';
        } else {
            icon.className = 'fas fa-moon';
            toggleBtn.title = 'Alternar para modo escuro';
        }
    }

    // Show theme change notification only if requested and function exists
    if (showNotification && typeof showToast === 'function') {
        showToast(`Tema ${theme === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
    }
}

// Font Awesome CDN Fallback System
function initializeFontAwesome() {
    const primaryLink = document.getElementById('fontawesome-primary');
    const fallback1 = document.getElementById('fontawesome-fallback1');
    const fallback2 = document.getElementById('fontawesome-fallback2');

    // Test if Font Awesome loaded successfully
    function testFontAwesome() {
        const testElement = document.createElement('i');
        testElement.className = 'fas fa-heart';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);

        const computedStyle = window.getComputedStyle(testElement, ':before');
        const fontFamily = computedStyle.getPropertyValue('font-family');

        document.body.removeChild(testElement);

        return fontFamily.includes('Font Awesome') || fontFamily.includes('FontAwesome');
    }

    // Try fallbacks if primary fails
    function tryFallback(fallbackElement, nextFallback) {
        if (!fallbackElement) return;

        fallbackElement.disabled = false;

        setTimeout(() => {
            if (!testFontAwesome() && nextFallback) {
                console.warn('[FontAwesome] Trying next fallback...');
                tryFallback(nextFallback);
            } else if (!testFontAwesome()) {
                console.error('[FontAwesome] All CDNs failed, using CSS fallbacks');
                enableCSSFallbacks();
            }
        }, 2000);
    }

    // CSS fallbacks for icons
    function enableCSSFallbacks() {
        console.log('[FontAwesome] Enabling CSS fallbacks...');
        document.body.classList.add('icon-fallback');

        // Also add specific icon fallbacks for icons without data-fallback attributes
        const style = document.createElement('style');
        style.textContent = `
            .icon-fallback .fa-times:before { content: "✕"; }
            .icon-fallback .fa-check:before { content: "✓"; }
            .icon-fallback .fa-play:before { content: "▶"; }
            .icon-fallback .fa-pause:before { content: "⏸"; }
            .icon-fallback .fa-stop:before { content: "⏹"; }
            .icon-fallback .fa-flag-checkered:before { content: "🏁"; }
            .icon-fallback .fa-trash:before { content: "🗑"; }
            .icon-fallback .fa-edit:before { content: "✏"; }
            .icon-fallback .fa-save:before { content: "💾"; }
            .icon-fallback .fa-download:before { content: "⬇"; }
        `;
        document.head.appendChild(style);
    }

    // Check primary CDN after a delay
    setTimeout(() => {
        if (!testFontAwesome()) {
            console.warn('[FontAwesome] Primary CDN failed, trying fallback...');
            primaryLink.disabled = true;
            tryFallback(fallback1, fallback2);
        }
    }, 3000);
}

// Initialize App
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing app...');

    // Initialize Font Awesome fallback system
    initializeFontAwesome();

    // Initialize theme first
    initializeTheme();

    // Register service worker
    await registerServiceWorker();

    // Initialize PWA features
    initializePWA();

    // Initialize workout data first
    initializeWorkoutData();

    // Load saved data
    await loadWorkoutData();

    // Set up event listeners
    setupEventListeners();

    // Initialize touch gestures
    initializeTouchGestures();
    initializePullToRefresh();

    // Initialize touch feedback for interactive elements
    initializeTouchFeedback();

    // Update display
    updateWorkoutDisplay();
    updateProgressSummary();

    console.log('App initialization complete');
});

// Register Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('[PWA] Service Worker registered successfully:', registration);

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showProgressionToast('Nova versão disponível! Recarregue a página.');
                    }
                });
            });

        } catch (error) {
            console.error('[PWA] Service Worker registration failed:', error);
        }
    }
}

// Initialize PWA features
function initializePWA() {
    console.log('[PWA] Initializing PWA features...');

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        isInstalled = true;
        document.body.classList.add('pwa-installed');
        console.log('[PWA] App is running in standalone mode');
    }

    // Check PWA installability criteria
    checkPWAInstallability();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] Install prompt available');
        e.preventDefault();
        deferredPrompt = e;

        // Show install button after a short delay to ensure DOM is ready
        setTimeout(() => {
            showInstallButton();
        }, 1000);
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App installed successfully');
        isInstalled = true;
        hideInstallButton();
        showProgressionToast('VolumeApp instalado com sucesso!');
    });

    // For iOS Safari - check if can be added to home screen
    if (isIOSSafari() && !isInstalled) {
        console.log('[PWA] iOS Safari detected, showing iOS install instructions');
        setTimeout(() => {
            showIOSInstallInstructions();
        }, 2000);
    }

    // For browsers that don't support beforeinstallprompt
    if (!('beforeinstallprompt' in window) && !isInstalled) {
        console.log('[PWA] Browser does not support beforeinstallprompt');
        setTimeout(() => {
            showFallbackInstallButton();
        }, 2000);
    }

    // Listen for online/offline events
    window.addEventListener('online', () => {
        console.log('[PWA] Back online');
        showProgressionToast('Conexão restaurada - sincronizando dados...');
        // Trigger a data refresh
        setTimeout(() => {
            refreshWorkoutData();
        }, 1000);
    });

    window.addEventListener('offline', () => {
        console.log('[PWA] Gone offline');
        showProgressionToast('Modo offline - dados serão sincronizados quando voltar online');
    });
}

// Event Listeners
function setupEventListeners() {
    // Navigation tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            const day = parseInt(tab.dataset.day);
            if (day && day >= 1 && day <= 5) {
                await switchDay(day);
            }
        });
    });

    // Week selector
    weekSelect.addEventListener('change', async (e) => {
        const week = parseInt(e.target.value);
        if (week && week >= 1 && week <= 7) {
            currentWeek = week;
            await loadWorkoutData();
            updateWorkoutDisplay();
            updateProgressSummary();
        }
    });

    // Modal events
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (saveLinkBtn) {
        saveLinkBtn.addEventListener('click', saveExerciseLink);
    }
}

// API Functions for SQLite Backend
async function saveWorkoutData() {
    try {
        console.log(`[DEBUG] Saving workout data for week ${currentWeek}, day ${currentDay}`);
        console.log(`[DEBUG] Data to save:`, workoutData[currentWeek][currentDay]);
        
        const response = await fetch('/api/workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                week: currentWeek,
                day: currentDay,
                workoutData: workoutData[currentWeek][currentDay]
            })
        });
        
        console.log(`[DEBUG] Save response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] Save failed with status ${response.status}: ${response.statusText}`);
            console.error(`[ERROR] Response body:`, errorText);
            throw new Error(`Failed to save workout data: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`[DEBUG] Save successful:`, result);
        
    } catch (error) {
        console.error('[ERROR] Error saving workout data:', error);
        console.error('[ERROR] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            week: currentWeek,
            day: currentDay
        });
        showProgressionToast('Erro ao salvar dados. Verifique a conexão.');
        throw error; // Re-throw to let calling functions know save failed
    }
}

async function loadWorkoutData() {
    try {
        console.log(`[DEBUG] Loading workout data for week ${currentWeek}, day ${currentDay}`);
        
        // Initialize the structure first
        if (!workoutData[currentWeek]) {
            workoutData[currentWeek] = {};
        }
        if (!workoutData[currentWeek][currentDay]) {
            workoutData[currentWeek][currentDay] = {};
        }
        
        const response = await fetch(`/api/workout/${currentWeek}/${currentDay}`);
        console.log(`[DEBUG] API response status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`[DEBUG] Loaded workout data:`, data);

            // Check if this is an offline error response from service worker
            if (data.error === 'offline') {
                console.log(`[DEBUG] Offline mode detected, using existing data or initializing`);
                showProgressionToast(data.message || 'Modo offline - usando dados locais');

                // If we don't have existing data, initialize it
                if (!workoutData[currentWeek][currentDay] || Object.keys(workoutData[currentWeek][currentDay]).length === 0) {
                    initializeWorkoutDataForDay(currentWeek, currentDay);
                }
                // Otherwise keep existing data
            } else {
                // Valid workout data received
                workoutData[currentWeek][currentDay] = data;
            }
        } else if (response.status === 404) {
            console.log(`[DEBUG] No existing data found, initializing new workout data`);
            initializeWorkoutDataForDay(currentWeek, currentDay);
        } else {
            console.error(`[ERROR] API request failed with status ${response.status}: ${response.statusText}`);
            const errorText = await response.text();
            console.error(`[ERROR] Response body:`, errorText);
            showProgressionToast(`Erro ao carregar dados (${response.status}). Usando dados padrão.`);
            initializeWorkoutDataForDay(currentWeek, currentDay);
        }
    } catch (error) {
        console.error('[ERROR] Network or parsing error loading workout data:', error);
        console.error('[ERROR] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        showProgressionToast('Erro de conexão. Usando dados offline.');
        // Fallback to initialize if API fails
        initializeWorkoutDataForDay(currentWeek, currentDay);
    }
}

function initializeWorkoutDataForDay(week, day) {
    if (!workoutData[week]) {
        workoutData[week] = {};
    }
    if (!workoutData[week][day]) {
        workoutData[week][day] = {};
    }
    
    workoutProgram[day].exercises.forEach((exercise, exerciseIndex) => {
        const adjustedSets = Math.ceil(exercise.sets * weekProgression[week.toString()].setsMultiplier);
        workoutData[week][day][exerciseIndex] = {
            name: exercise.name,
            link: exercise.link,
            collapsed: true, // Default collapsed state
            sets: Array(adjustedSets).fill().map(() => ({
                weight: 0,
                reps: 0,
                rpe: weekProgression[week.toString()].rpe,
                completed: false
            }))
        };
    });
}

function initializeWorkoutData() {
    workoutData = {};
    for (let week = 1; week <= 7; week++) {
        workoutData[week] = {};
        for (let day = 1; day <= 5; day++) {
            initializeWorkoutDataForDay(week, day);
        }
    }
}

// UI Functions - Performance optimized
const debouncedUpdateDisplay = debounce(() => {
    updateWorkoutDisplay();
    updateProgressSummary();
}, 100);

async function switchDay(day) {
    // Prevent multiple simultaneous switches
    if (isUpdating || currentDay === day) return;

    isUpdating = true;
    currentDay = day;

    // Add haptic feedback
    triggerHapticFeedback('light');

    // Optimized tab switching with requestAnimationFrame
    requestAnimationFrame(() => {
        navTabs.forEach(tab => tab.classList.remove('active'));
        const activeTab = getCachedElement(`[data-day="${day}"]`) || document.querySelector(`[data-day="${day}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            // Add visual feedback
            activeTab.classList.add('haptic-feedback');
            setTimeout(() => {
                activeTab.classList.remove('haptic-feedback');
            }, 100);
        }
    });

    try {
        // Load data for new day
        await loadWorkoutData();

        // Use debounced update to prevent excessive redraws
        debouncedUpdateDisplay();
    } catch (error) {
        console.error('Error switching day:', error);
    } finally {
        isUpdating = false;
    }
}

// Performance optimized display update
function updateWorkoutDisplay() {
    const workout = workoutProgram[currentDay];
    const weekData = weekProgression[currentWeek.toString()];

    // Validate that workout and weekData exist
    if (!workout) {
        console.error(`Workout not found for day ${currentDay}`);
        return;
    }

    if (!weekData) {
        console.error(`Week data not found for week ${currentWeek}`);
        return;
    }

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
        // Update header
        workoutTitle.textContent = workout.name;
        rpeInfo.textContent = `RPE: ${weekData.rpe}`;
        rpeInfo.className = `rpe-info rpe-${Math.floor(weekData.rpe)}`;

        // Load saved workout link
        loadWorkoutLink();

        // Use document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();

        workout.exercises.forEach((exercise, exerciseIndex) => {
            const exerciseCard = createExerciseCard(exercise, exerciseIndex);
            fragment.appendChild(exerciseCard);
        });

        // Single DOM update
        exercisesContainer.innerHTML = '';
        exercisesContainer.appendChild(fragment);

        // Clear element cache after DOM changes
        clearElementCache();
    });
}

function createExerciseCard(exercise, exerciseIndex) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.setAttribute('data-exercise-index', exerciseIndex); // For performance optimization
    
    // Ensure exercise data exists and is valid
    if (!workoutData[currentWeek] ||
        !workoutData[currentWeek][currentDay] ||
        !workoutData[currentWeek][currentDay][exerciseIndex] ||
        workoutData[currentWeek][currentDay].error) {
        console.log(`[DEBUG] Initializing exercise data for exercise ${exerciseIndex}`);
        initializeWorkoutDataForDay(currentWeek, currentDay);
    }

    const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];

    // Additional safety check
    if (!exerciseData || !exerciseData.sets) {
        console.error(`[ERROR] Invalid exercise data for exercise ${exerciseIndex}`, exerciseData);
        initializeWorkoutDataForDay(currentWeek, currentDay);
        return document.createElement('div'); // Return empty div as fallback
    }
    const weekData = weekProgression[currentWeek.toString()];
    
    // Check if exercise is collapsed (default to collapsed)
    const isCollapsed = exerciseData && exerciseData.collapsed !== undefined ? exerciseData.collapsed : true;
    
    card.innerHTML = `
        <div class="exercise-header" onclick="toggleExerciseCollapse(${exerciseIndex})">
            <div>
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-target">${exerciseData.sets.length} séries × ${exercise.reps} reps (${weekData.percentage})</div>
            </div>
            <div class="exercise-actions">
                <button class="btn-icon collapse-btn" onclick="event.stopPropagation(); toggleExerciseCollapse(${exerciseIndex})">
                    <i class="fas fa-chevron-${isCollapsed ? 'down' : 'up'}" data-fallback="${isCollapsed ? '▼' : '▲'}"></i>
                </button>
                <button class="btn-icon" onclick="event.stopPropagation(); openExerciseModal('${exercise.name}', ${exerciseIndex})">
                    <i class="fas fa-info-circle" data-fallback="ℹ"></i>
                </button>
            </div>
        </div>
        <div class="sets-container ${isCollapsed ? 'collapsed' : ''}">
            ${createSetsTable(exerciseData.sets, exerciseIndex)}
        </div>
    `;
    
    return card;
}

// Create mobile-optimized input with increment/decrement buttons
function createMobileInput(type, value, placeholder, exerciseIndex, setIndex, isCompleted, step = 1) {
    const inputId = `${type}-${exerciseIndex}-${setIndex}`;
    const isMobile = window.innerWidth <= 768;

    if (isMobile && !isCompleted) {
        return `
            <div class="input-with-controls">
                <button class="input-control-btn" onclick="decrementValue('${inputId}', ${step}, ${exerciseIndex}, ${setIndex}, '${type}')" type="button">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number"
                       id="${inputId}"
                       class="mobile-input"
                       value="${value}"
                       placeholder="${placeholder}"
                       step="${step}"
                       min="0"
                       inputmode="decimal"
                       onchange="updateSet(${exerciseIndex}, ${setIndex}, '${type}', this.value)"
                       ${isCompleted ? 'readonly' : ''}>
                <button class="input-control-btn" onclick="incrementValue('${inputId}', ${step}, ${exerciseIndex}, ${setIndex}, '${type}')" type="button">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    } else {
        return `
            <input type="number"
                   id="${inputId}"
                   value="${value}"
                   placeholder="${placeholder}"
                   step="${step}"
                   min="0"
                   inputmode="decimal"
                   onchange="updateSet(${exerciseIndex}, ${setIndex}, '${type}', this.value)"
                   ${isCompleted ? 'readonly' : ''}>
        `;
    }
}

// Increment/Decrement functions for mobile inputs
function incrementValue(inputId, step, exerciseIndex, setIndex, type) {
    const input = document.getElementById(inputId);
    const currentValue = parseFloat(input.value) || 0;
    const newValue = currentValue + step;
    input.value = newValue;
    updateSet(exerciseIndex, setIndex, type, newValue);

    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function decrementValue(inputId, step, exerciseIndex, setIndex, type) {
    const input = document.getElementById(inputId);
    const currentValue = parseFloat(input.value) || 0;
    const newValue = Math.max(0, currentValue - step);
    input.value = newValue;
    updateSet(exerciseIndex, setIndex, type, newValue);

    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Create compact sets cards
function createSetsTable(sets, exerciseIndex) {
    return `
        <div class="sets-cards-container">
            ${sets.map((set, setIndex) => createCompactSetCard(set, setIndex, exerciseIndex)).join('')}
        </div>
    `;
}

function createCompactSetCard(set, setIndex, exerciseIndex) {
    const completedClass = set.completed ? 'completed' : '';
    const exercise = workoutProgram[currentDay].exercises[exerciseIndex];
    const progressionIndicator = getProgressionIndicator(exerciseIndex, setIndex, exercise);

    return `
        <div class="set-card ${completedClass}"
             data-exercise-index="${exerciseIndex}"
             data-set-index="${setIndex}"
             ontouchstart="handleSetTouchStart(event)"
             ontouchmove="handleSetTouchMove(event)"
             ontouchend="handleSetTouchEnd(event)">

            <div class="set-content">
                <div class="set-label">
                    <span class="set-number">SET ${setIndex + 1}</span>
                    ${progressionIndicator}
                </div>

                <div class="set-inputs">
                    <div class="input-field">
                        <input type="number"
                               class="set-input"
                               value="${set.weight || ''}"
                               placeholder="kg"
                               step="0.5"
                               min="0"
                               ${set.completed ? 'disabled' : ''}
                               onchange="updateSet(${exerciseIndex}, ${setIndex}, 'weight', this.value)"
                               onclick="this.select()">
                        <label>kg</label>
                    </div>

                    <div class="input-field">
                        <input type="number"
                               class="set-input"
                               value="${set.reps || ''}"
                               placeholder="reps"
                               step="1"
                               min="0"
                               ${set.completed ? 'disabled' : ''}
                               onchange="updateSet(${exerciseIndex}, ${setIndex}, 'reps', this.value)"
                               onclick="this.select()">
                        <label>reps</label>
                    </div>

                    <div class="input-field">
                        <select class="set-select"
                                onchange="updateSet(${exerciseIndex}, ${setIndex}, 'rpe', this.value)"
                                ${set.completed ? 'disabled' : ''}>
                            ${Array.from({length: 11}, (_, i) => i).map(rpe =>
                                `<option value="${rpe}" ${set.rpe == rpe ? 'selected' : ''}>${rpe}</option>`
                            ).join('')}
                        </select>
                        <label>RPE</label>
                    </div>
                </div>

                <button class="set-complete-btn touch-feedback ${set.completed ? 'completed' : ''}"
                        onclick="toggleSetComplete(${exerciseIndex}, ${setIndex})"
                        title="${set.completed ? 'Série completa' : 'Marcar como completa'}">
                    <i class="fas ${set.completed ? 'fa-check' : 'fa-circle'}"></i>
                </button>
            </div>

            <div class="set-delete-action">
                <button class="delete-btn" onclick="deleteSet(${exerciseIndex}, ${setIndex})">
                    <i class="fas fa-trash"></i>
                    <span>Deletar</span>
                </button>
            </div>
        </div>
    `;
}



// Function to get progression indicator for a set
function getProgressionIndicator(exerciseIndex, setIndex, exercise) {
    if (!workoutData[currentWeek] || !workoutData[currentWeek][currentDay] || 
        !workoutData[currentWeek][currentDay][exerciseIndex]) {
        return '';
    }
    
    const currentSet = workoutData[currentWeek][currentDay][exerciseIndex].sets[setIndex];
    if (!currentSet || !currentSet.completed) {
        return '';
    }
    
    // Get last week's performance for comparison
    const lastWeekData = getLastWeekPerformance(exerciseIndex, exercise.name);
    if (!lastWeekData) {
        return '<span class="progression-indicator new" title="Primeira vez fazendo este exercício">🆕</span>';
    }
    
    // Compare current performance with last week
    const improvement = calculateImprovement(currentSet, lastWeekData);
    
    if (improvement.type === 'volume') {
        return '<span class="progression-indicator improved" title="Volume melhorou vs semana passada">📈</span>';
    } else if (improvement.type === 'weight') {
        return '<span class="progression-indicator weight-up" title="Peso aumentou vs semana passada">💪</span>';
    } else if (improvement.type === 'reps') {
        return '<span class="progression-indicator reps-up" title="Repetições aumentaram vs semana passada">🔥</span>';
    } else {
        // Check if performance maintained or declined
        const currentVolume = (currentSet.weight || 0) * (currentSet.reps || 0);
        const lastVolume = (lastWeekData.weight || 0) * (lastWeekData.reps || 0);
        
        if (currentVolume >= lastVolume * 0.95) { // Within 5% is considered maintained
            return '<span class="progression-indicator maintained" title="Performance mantida vs semana passada">✅</span>';
        } else {
            return '<span class="progression-indicator declined" title="Performance diminuiu vs semana passada">⚠️</span>';
        }
    }
}

// Set Management Functions
async function updateSet(exerciseIndex, setIndex, field, value) {
    try {
        console.log(`[DEBUG] Updating set - Exercise: ${exerciseIndex}, Set: ${setIndex}, Field: ${field}, Value: ${value}`);
        
        // Validate inputs
        if (exerciseIndex < 0 || setIndex < 0) {
            throw new Error(`Invalid indices: exerciseIndex=${exerciseIndex}, setIndex=${setIndex}`);
        }
        
        if (!workoutData[currentWeek] || !workoutData[currentWeek][currentDay] || !workoutData[currentWeek][currentDay][exerciseIndex]) {
            console.error('[ERROR] Workout data structure is invalid');
            console.error('[ERROR] Current state:', { currentWeek, currentDay, exerciseIndex, workoutData });
            throw new Error('Workout data not properly initialized');
        }
        
        const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];
        if (!exerciseData.sets || !exerciseData.sets[setIndex]) {
            console.error('[ERROR] Set not found');
            console.error('[ERROR] Exercise structure:', exerciseData);
            throw new Error(`Set ${setIndex} not found for exercise ${exerciseIndex}`);
        }
        
        const exercise = workoutProgram[currentDay].exercises[exerciseIndex];
        const weekData = weekProgression[currentWeek.toString()];
        
        // RPE validation based on exercise type and week
        if (field === 'rpe') {
            const rpeValue = parseFloat(value);
            if (exercise.type === 'compound' && rpeValue >= 10) {
                alert('⚠️ Exercícios básicos (compostos) nunca devem chegar à falha (RPE 10)!\nMantenha RPE máximo de 9 para exercícios compostos.');
                return;
            }
            if (exercise.type === 'isolation' && rpeValue >= 10 && currentWeek < 5) {
                alert('⚠️ Falha (RPE 10) em isoladores apenas nas últimas semanas (5-6)!\nNas primeiras semanas, mantenha RPE máximo de 9.');
                return;
            }
        }
        
        // Validate and convert value based on field type
        let processedValue = value;
        if (field === 'weight' || field === 'reps') {
            processedValue = parseFloat(value);
            if (isNaN(processedValue) || processedValue < 0) {
                console.warn(`[WARN] Invalid ${field} value: ${value}, setting to 0`);
                processedValue = 0;
            }
        } else if (field === 'rpe') {
            processedValue = parseFloat(value);
        }
        
        console.log(`[DEBUG] Setting ${field} to ${processedValue} for exercise ${exerciseIndex}, set ${setIndex}`);
        exerciseData.sets[setIndex][field] = processedValue;
        
        // Data will only be saved when user clicks "completar" button
        updateProgressSummary();
        
        // Show progression suggestions after updating
        showProgressionSuggestion(exerciseIndex, setIndex, exercise);
        
        console.log(`[DEBUG] Set update completed successfully`);
        
    } catch (error) {
        console.error('[ERROR] Failed to update set:', error);
        console.error('[ERROR] Update context:', {
            exerciseIndex,
            setIndex,
            field,
            value,
            currentWeek,
            currentDay,
            workoutDataExists: !!workoutData[currentWeek]?.[currentDay]?.[exerciseIndex]
        });
        showProgressionToast(`Erro ao atualizar ${field}. Tente novamente.`);
    }
}

// Performance optimized exercise toggle
async function toggleExerciseCollapse(exerciseIndex) {
    const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];
    exerciseData.collapsed = !exerciseData.collapsed;

    // Immediate UI update for better responsiveness
    const exerciseCard = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
    if (exerciseCard) {
        const setsContainer = exerciseCard.querySelector('.sets-container');
        const collapseBtn = exerciseCard.querySelector('.collapse-btn i');

        if (setsContainer && collapseBtn) {
            // Use CSS transforms for hardware acceleration
            if (exerciseData.collapsed) {
                setsContainer.style.maxHeight = '0';
                setsContainer.style.opacity = '0';
                collapseBtn.className = 'fas fa-chevron-down';
            } else {
                setsContainer.style.maxHeight = 'none';
                setsContainer.style.opacity = '1';
                collapseBtn.className = 'fas fa-chevron-up';
            }
        }
    }

    // Save data asynchronously without blocking UI
    saveWorkoutData().catch(error => {
        console.error('Failed to save exercise collapse state:', error);
        // Revert UI change on error
        exerciseData.collapsed = !exerciseData.collapsed;
        if (exerciseCard) {
            const setsContainer = exerciseCard.querySelector('.sets-container');
            const collapseBtn = exerciseCard.querySelector('.collapse-btn i');
            if (setsContainer && collapseBtn) {
                if (exerciseData.collapsed) {
                    setsContainer.style.maxHeight = '0';
                    setsContainer.style.opacity = '0';
                    collapseBtn.className = 'fas fa-chevron-down';
                } else {
                    setsContainer.style.maxHeight = 'none';
                    setsContainer.style.opacity = '1';
                    collapseBtn.className = 'fas fa-chevron-up';
                }
            }
        }
    });
}

// Track if user has interacted with the page
let userHasInteracted = false;

// Listen for first user interaction
document.addEventListener('click', () => { userHasInteracted = true; }, { once: true });
document.addEventListener('touchstart', () => { userHasInteracted = true; }, { once: true });

// Haptic feedback helper
function triggerHapticFeedback(type = 'light') {
    // Only vibrate if user has interacted with the page
    if (navigator.vibrate && userHasInteracted) {
        switch (type) {
            case 'light':
                navigator.vibrate(50);
                break;
            case 'medium':
                navigator.vibrate(100);
                break;
            case 'heavy':
                navigator.vibrate([100, 50, 100]);
                break;
            case 'success':
                navigator.vibrate([50, 50, 50]);
                break;
            case 'error':
                navigator.vibrate([200, 100, 200]);
                break;
        }
    }
}

// Add visual feedback for touch interactions
function addTouchFeedback(element) {
    element.addEventListener('touchstart', function() {
        this.classList.add('haptic-feedback');
        setTimeout(() => {
            this.classList.remove('haptic-feedback');
        }, 100);
    });
}

async function toggleSetComplete(exerciseIndex, setIndex) {
    const set = workoutData[currentWeek][currentDay][exerciseIndex].sets[setIndex];
    const exercise = workoutData[currentWeek][currentDay][exerciseIndex];

    set.completed = !set.completed;

    // Add haptic feedback
    triggerHapticFeedback(set.completed ? 'success' : 'light');
    
    // Only save to database when set is marked as completed
    if (set.completed) {
        try {
            console.log(`[DEBUG] Saving completed set - Exercise: ${exerciseIndex}, Set: ${setIndex}`);
            
            const response = await fetch('/api/workout/set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    week: currentWeek,
                    day: currentDay,
                    exerciseIndex: exerciseIndex,
                    setIndex: setIndex,
                    setData: {
                        ...set,
                        exerciseName: exercise.name
                    }
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[ERROR] Failed to save set: ${response.status} ${response.statusText}`);
                console.error(`[ERROR] Response body:`, errorText);
                throw new Error(`Failed to save set: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`[DEBUG] Set saved successfully:`, result);
            showProgressionToast('Série salva com sucesso!');
            
        } catch (error) {
            console.error('[ERROR] Error saving set:', error);
            showProgressionToast('Erro ao salvar série. Verifique a conexão.');
            // Revert the completion status on error
            set.completed = false;
        }
    }
    
    updateWorkoutDisplay();
    updateProgressSummary();
}

// Progress Summary Functions
function updateProgressSummary() {
    const dayData = workoutData[currentWeek] && workoutData[currentWeek][currentDay];
    let totalVolume = 0;
    let completedSets = 0;
    let totalSets = 0;
    let totalRPE = 0;
    let rpeCount = 0;

    // Safety check: ensure dayData exists and is a valid object
    if (!dayData || typeof dayData !== 'object' || dayData.error) {
        console.log('[DEBUG] No valid workout data for progress summary, using defaults');
        document.getElementById('total-volume').textContent = '0 kg';
        document.getElementById('completed-sets').textContent = '0/0';
        document.getElementById('average-rpe').textContent = '-';
        return;
    }

    try {
        Object.values(dayData).forEach(exercise => {
            // Safety check: ensure exercise has sets array
            if (exercise && exercise.sets && Array.isArray(exercise.sets)) {
                exercise.sets.forEach(set => {
                    totalSets++;
                    if (set && set.completed) {
                        completedSets++;
                        totalVolume += (set.weight || 0) * (set.reps || 0);
                        if (set.rpe > 0) {
                            totalRPE += set.rpe;
                            rpeCount++;
                        }
                    }
                });
            }
        });
    } catch (error) {
        console.error('[ERROR] Error calculating progress summary:', error);
        console.log('[DEBUG] DayData structure:', dayData);
    }

    // Update UI elements safely
    const totalVolumeEl = document.getElementById('total-volume');
    const completedSetsEl = document.getElementById('completed-sets');
    const averageRpeEl = document.getElementById('average-rpe');

    if (totalVolumeEl) totalVolumeEl.textContent = `${totalVolume.toFixed(1)} kg`;
    if (completedSetsEl) completedSetsEl.textContent = `${completedSets}/${totalSets}`;
    if (averageRpeEl) averageRpeEl.textContent = rpeCount > 0 ? (totalRPE / rpeCount).toFixed(1) : '-';

    // Check if all sets are completed and show/hide finish button
    checkAndToggleFinishButton(completedSets, totalSets);
}

// Finish Workout Functions
function checkAndToggleFinishButton(completedSets, totalSets) {
    const finishBtn = document.getElementById('finish-workout-btn');
    if (!finishBtn) return;

    // Show button only if all sets are completed and there are sets to complete
    if (totalSets > 0 && completedSets === totalSets) {
        finishBtn.classList.remove('hidden');
    } else {
        finishBtn.classList.add('hidden');
    }
}

async function finishWorkout() {
    // Show confirmation dialog
    const confirmed = confirm('Tem certeza que deseja terminar o treino? Isso irá resetar todas as séries completadas para a próxima sessão.');

    if (!confirmed) return;

    try {
        // Reset all completion states
        const dayData = workoutData[currentWeek] && workoutData[currentWeek][currentDay];
        if (!dayData) return;

        // Reset completed status for all sets
        Object.values(dayData).forEach(exercise => {
            if (exercise && exercise.sets && Array.isArray(exercise.sets)) {
                exercise.sets.forEach(set => {
                    if (set) {
                        set.completed = false;
                    }
                });
            }
        });

        // Save the reset data
        await saveWorkoutData();

        // Update the display
        updateWorkoutDisplay();
        updateProgressSummary();

        // Add haptic feedback
        triggerHapticFeedback('success');

        // Show success message
        showProgressionToast('Treino finalizado! Todas as séries foram resetadas para a próxima sessão.');

        console.log('[DEBUG] Workout finished and reset successfully');

    } catch (error) {
        console.error('[ERROR] Failed to finish workout:', error);
        showProgressionToast('Erro ao finalizar treino. Tente novamente.');
    }
}

// Modal Functions
function openExerciseModal(exerciseName, exerciseIndex) {
    modalExerciseName.textContent = exerciseName;
    
    const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];
    exerciseLink.value = exerciseData.link || '';
    
    // Store current exercise for saving
    modal.dataset.exerciseIndex = exerciseIndex;
    
    // Display video if link exists
    displayExerciseVideo(exerciseData.link);
    
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    exerciseVideo.innerHTML = '';
}

async function saveExerciseLink() {
    const exerciseIndex = parseInt(modal.dataset.exerciseIndex);
    const link = exerciseLink.value.trim();
    
    workoutData[currentWeek][currentDay][exerciseIndex].link = link;
    await saveWorkoutData();
    
    displayExerciseVideo(link);
}

// Function to save workout instruction link
async function saveWorkoutLink() {
    const workoutLinkInput = document.getElementById('workout-link');
    const link = workoutLinkInput.value.trim();
    
    if (link) {
        // Validate URL format
        try {
            new URL(link);
            
            // Save to database via API
            const response = await fetch('/api/workout-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    day: currentDay,
                    link: link
                })
            });
            
            if (response.ok) {
                showProgressionToast('Link de instruções salvo com sucesso!');
                
                // Optional: Open link in new tab
                if (confirm('Deseja abrir o link agora?')) {
                    window.open(link, '_blank');
                }
            } else {
                showProgressionToast('Erro ao salvar link. Tente novamente.');
            }
        } catch (e) {
            showProgressionToast('Por favor, insira um link válido (ex: https://...)');
        }
    } else {
        showProgressionToast('Por favor, insira um link antes de salvar.');
    }
}

// Function to load saved workout link
async function loadWorkoutLink() {
    try {
        const response = await fetch(`/api/workout-link/${currentDay}`);
        
        if (response.ok) {
            const data = await response.json();
            const workoutLinkInput = document.getElementById('workout-link');
            
            if (workoutLinkInput && data.link) {
                workoutLinkInput.value = data.link;
            }
        }
    } catch (error) {
        console.error('Error loading workout link:', error);
    }
}

function displayExerciseVideo(link) {
    exerciseVideo.innerHTML = '';
    
    if (!link) {
        exerciseVideo.innerHTML = '<p style="color: #718096; text-align: center;">Nenhum link de instrução adicionado</p>';
        return;
    }
    
    // YouTube video handling
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
        let videoId = '';
        if (link.includes('youtube.com/watch?v=')) {
            videoId = link.split('v=')[1].split('&')[0];
        } else if (link.includes('youtu.be/')) {
            videoId = link.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
            exerciseVideo.innerHTML = `
                <iframe width="100%" height="315" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" allowfullscreen>
                </iframe>
            `;
            exerciseVideo.style.display = 'block';
            return;
        }
    }
    
    // Instagram video handling
    if (link.includes('instagram.com')) {
        exerciseVideo.innerHTML = `
            <blockquote class="instagram-media" data-instgrm-permalink="${link}" 
                        data-instgrm-version="14" style="width: 100%;">
            </blockquote>
        `;
        exerciseVideo.style.display = 'block';
        
        // Load Instagram embed script if not already loaded
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = '//www.instagram.com/embed.js';
            document.body.appendChild(script);
        }
        return;
    }
    
    // Generic video/link handling
    exerciseVideo.innerHTML = `<a href="${link}" target="_blank">Ver vídeo de instrução</a>`;
    exerciseVideo.style.display = 'block';
}

// Progression suggestion system
function showProgressionSuggestion(exerciseIndex, setIndex, exercise) {
    const currentSet = workoutData[currentWeek][currentDay][exerciseIndex].sets[setIndex];
    const weekData = weekProgression[currentWeek.toString()];
    
    // Only show suggestions if set is completed with good form (RPE < 9)
    if (!currentSet.completed || !currentSet.rpe || currentSet.rpe >= 9) return;
    
    let suggestion = '';
    
    // Get historical data for better progression suggestions
    const historicalData = getExerciseHistory(exerciseIndex, exercise.name);
    const lastWeekData = getLastWeekPerformance(exerciseIndex, exercise.name);
    
    if (exercise.type === 'compound') {
        // Compound exercises: focus on weight progression
        if (currentSet.rpe <= 7 && currentSet.reps >= getMinReps(exercise.reps)) {
            const weightIncrease = calculateWeightIncrease(currentSet.weight, exercise.type, historicalData);
            suggestion = `💪 Exercício composto: RPE ${currentSet.rpe} indica margem para progressão. Sugestão: ${weightIncrease}kg na próxima semana`;
        } else if (currentSet.rpe <= 8 && currentSet.reps > getMaxReps(exercise.reps)) {
            suggestion = `📈 Exercício composto: Muitas repetições (${currentSet.reps}). Considere aumentar peso e reduzir reps para ${exercise.reps}`;
        }
    } else {
        // Isolation exercises: reps first, then weight
        const maxReps = getMaxReps(exercise.reps);
        const minReps = getMinReps(exercise.reps);
        
        if (currentSet.rpe <= 8 && currentSet.reps < maxReps) {
            const targetReps = Math.min(maxReps, currentSet.reps + 1);
            suggestion = `📈 Exercício isolador: Tente ${targetReps} repetições na próxima série (atual: ${currentSet.reps}, máximo: ${maxReps})`;
        } else if (currentSet.reps >= maxReps && currentSet.rpe <= 8) {
            const weightIncrease = calculateWeightIncrease(currentSet.weight, exercise.type, historicalData);
            suggestion = `💪 Exercício isolador: Atingiu máximo de reps com RPE ${currentSet.rpe}. Sugestão: ${weightIncrease}kg e voltar para ${minReps} reps`;
        }
    }
    
    // Add weekly progression context
    if (suggestion && lastWeekData) {
        const improvement = calculateImprovement(currentSet, lastWeekData);
        if (improvement.type) {
            suggestion += `\n🎯 Progresso da semana passada: ${improvement.description}`;
        }
    }
    
    if (suggestion) {
        showProgressionToast(suggestion);
    }
}

// New helper functions for progression analysis
function getExerciseHistory(exerciseIndex, exerciseName) {
    const history = [];
    
    // Collect data from previous weeks
    for (let week = 1; week < currentWeek; week++) {
        if (workoutData[week] && workoutData[week][currentDay] && workoutData[week][currentDay][exerciseIndex]) {
            const weekExercise = workoutData[week][currentDay][exerciseIndex];
            if (weekExercise.name === exerciseName) {
                history.push({
                    week: week,
                    sets: weekExercise.sets.filter(set => set.completed)
                });
            }
        }
    }
    
    return history;
}

function getLastWeekPerformance(exerciseIndex, exerciseName) {
    const lastWeek = currentWeek - 1;
    if (lastWeek < 1 || !workoutData[lastWeek] || !workoutData[lastWeek][currentDay]) {
        return null;
    }
    
    const lastWeekExercise = workoutData[lastWeek][currentDay][exerciseIndex];
    if (!lastWeekExercise || lastWeekExercise.name !== exerciseName) {
        return null;
    }
    
    const completedSets = lastWeekExercise.sets.filter(set => set.completed);
    if (completedSets.length === 0) return null;
    
    // Get best set from last week
    return completedSets.reduce((best, set) => {
        const currentVolume = (set.weight || 0) * (set.reps || 0);
        const bestVolume = (best.weight || 0) * (best.reps || 0);
        return currentVolume > bestVolume ? set : best;
    });
}

function calculateWeightIncrease(currentWeight, exerciseType, historicalData) {
    if (!currentWeight) return 2.5;
    
    // Conservative increases based on exercise type
    const baseIncrease = exerciseType === 'compound' ? 2.5 : 1.25;
    
    // Adjust based on historical progression rate
    if (historicalData.length >= 2) {
        const recentProgress = historicalData.slice(-2);
        const progressRate = calculateProgressRate(recentProgress);
        
        if (progressRate > 1.1) {
            return baseIncrease * 1.5; // Faster progression if doing well
        } else if (progressRate < 0.9) {
            return baseIncrease * 0.5; // Slower progression if struggling
        }
    }
    
    return baseIncrease;
}

function calculateProgressRate(recentProgress) {
    if (recentProgress.length < 2) return 1;
    
    const older = recentProgress[0];
    const newer = recentProgress[1];
    
    const olderBest = getBestSetFromWeek(older.sets);
    const newerBest = getBestSetFromWeek(newer.sets);
    
    if (!olderBest || !newerBest) return 1;
    
    const olderVolume = (olderBest.weight || 0) * (olderBest.reps || 0);
    const newerVolume = (newerBest.weight || 0) * (newerBest.reps || 0);
    
    return olderVolume > 0 ? newerVolume / olderVolume : 1;
}

function getBestSetFromWeek(sets) {
    if (!sets || sets.length === 0) return null;
    
    return sets.reduce((best, set) => {
        if (!set.completed) return best;
        const currentVolume = (set.weight || 0) * (set.reps || 0);
        const bestVolume = best ? (best.weight || 0) * (best.reps || 0) : 0;
        return currentVolume > bestVolume ? set : best;
    }, null);
}

function calculateImprovement(currentSet, lastWeekSet) {
    if (!lastWeekSet) return { type: null };
    
    const currentVolume = (currentSet.weight || 0) * (currentSet.reps || 0);
    const lastVolume = (lastWeekSet.weight || 0) * (lastWeekSet.reps || 0);
    
    if (currentVolume > lastVolume) {
        const improvement = ((currentVolume - lastVolume) / lastVolume * 100).toFixed(1);
        return {
            type: 'volume',
            description: `+${improvement}% volume vs semana passada`
        };
    } else if (currentSet.weight > lastWeekSet.weight) {
        const weightIncrease = currentSet.weight - lastWeekSet.weight;
        return {
            type: 'weight',
            description: `+${weightIncrease}kg vs semana passada`
        };
    } else if (currentSet.reps > lastWeekSet.reps) {
        const repsIncrease = currentSet.reps - lastWeekSet.reps;
        return {
            type: 'reps',
            description: `+${repsIncrease} reps vs semana passada`
        };
    }
    
    return { type: null };
}

function getMinReps(repsRange) {
    if (typeof repsRange === 'string' && repsRange.includes('-')) {
        return parseInt(repsRange.split('-')[0]);
    }
    return parseInt(repsRange);
}

function getMaxReps(repsRange) {
    if (typeof repsRange === 'string' && repsRange.includes('-')) {
        return parseInt(repsRange.split('-')[1]);
    }
    return parseInt(repsRange);
}

function showProgressionToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.progression-toast');
    if (existingToast) existingToast.remove();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'progression-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 8000);
}

// Toggle glossary visibility
function toggleGlossary() {
    const glossarySection = document.getElementById('glossary-section');
    const exercisesContainer = document.getElementById('exercises-container');
    const progressSummary = document.querySelector('.progress-summary');
    
    // Safety check - ensure all elements exist
    if (!glossarySection) {
        console.error('Glossary section not found');
        return;
    }
    
    if (!exercisesContainer) {
        console.error('Exercises container not found');
        return;
    }
    
    if (glossarySection.classList.contains('hidden')) {
        // Show glossary, hide exercises
        glossarySection.classList.remove('hidden');
        exercisesContainer.style.display = 'none';
        if (progressSummary) {
            progressSummary.style.display = 'none';
        }
        
        // Update button text
        const glossaryBtn = document.querySelector('nav button[onclick="toggleGlossary()"]');
        if (glossaryBtn) {
            glossaryBtn.innerHTML = '🏋️ Treinos';
        }
    } else {
        // Hide glossary, show exercises
        glossarySection.classList.add('hidden');
        exercisesContainer.style.display = 'block';
        if (progressSummary) {
            progressSummary.style.display = 'block';
        }
        
        // Update button text
        const glossaryBtn = document.querySelector('nav button[onclick="toggleGlossary()"]');
        if (glossaryBtn) {
            glossaryBtn.innerHTML = '📖 Glossário';
        }
    }
}

// PWA Helper Functions
function checkPWAInstallability() {
    console.log('[PWA] Checking PWA installability criteria...');

    // Check HTTPS
    const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
    console.log('[PWA] HTTPS:', isHTTPS);

    // Check Service Worker
    const hasSW = 'serviceWorker' in navigator;
    console.log('[PWA] Service Worker support:', hasSW);

    // Check Manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('[PWA] Manifest link:', !!manifestLink);

    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    console.log('[PWA] Standalone mode:', isStandalone);

    return isHTTPS && hasSW && manifestLink;
}

function isIOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    return isIOS && isSafari;
}

function showIOSInstallInstructions() {
    if (sessionStorage.getItem('ios-install-shown') === 'true') {
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'ios-install-toast';
    toast.innerHTML = `
        <div class="ios-install-content">
            <h4>📱 Instalar VolumeApp</h4>
            <p>Para instalar no iOS:</p>
            <ol>
                <li>Toque no botão <strong>Compartilhar</strong> <i class="fas fa-share"></i></li>
                <li>Selecione <strong>"Adicionar à Tela de Início"</strong></li>
                <li>Toque em <strong>"Adicionar"</strong></li>
            </ol>
            <button onclick="this.parentElement.parentElement.remove()" class="ios-install-close">Entendi</button>
        </div>
    `;

    document.body.appendChild(toast);
    sessionStorage.setItem('ios-install-shown', 'true');

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 10000);
}

function showFallbackInstallButton() {
    if (isInstalled || document.getElementById('install-btn')) {
        return;
    }

    const headerContent = document.querySelector('.header-content');
    if (!headerContent) {
        setTimeout(showFallbackInstallButton, 500);
        return;
    }

    const installBtn = document.createElement('button');
    installBtn.id = 'install-btn';
    installBtn.className = 'install-btn touch-feedback';
    installBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Como Instalar';
    installBtn.onclick = showInstallInstructions;
    installBtn.title = 'Ver instruções de instalação';

    headerContent.appendChild(installBtn);
}

function showInstallInstructions() {
    const instructions = `
        <div class="install-instructions">
            <h3>📱 Como Instalar o VolumeApp</h3>

            <div class="browser-instructions">
                <h4>🌐 Chrome/Edge (Android):</h4>
                <ol>
                    <li>Toque no menu (⋮) do navegador</li>
                    <li>Selecione "Instalar app" ou "Adicionar à tela inicial"</li>
                    <li>Confirme a instalação</li>
                </ol>

                <h4>🍎 Safari (iOS):</h4>
                <ol>
                    <li>Toque no botão Compartilhar <i class="fas fa-share"></i></li>
                    <li>Selecione "Adicionar à Tela de Início"</li>
                    <li>Toque em "Adicionar"</li>
                </ol>

                <h4>🔧 Outros navegadores:</h4>
                <p>Procure por opções como "Instalar", "Adicionar à tela inicial" ou "Criar atalho" no menu do navegador.</p>
            </div>

            <button onclick="closeModal()" class="btn-primary">Entendi</button>
        </div>
    `;

    showProgressionToast('Verifique o menu do seu navegador para opções de instalação');
}

// PWA Installation Functions
function showInstallButton() {
    if (isInstalled) {
        console.log('[PWA] App already installed, not showing install button');
        return;
    }

    // Check if user dismissed the install prompt in this session
    if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
        console.log('[PWA] Install prompt was dismissed in this session');
        return;
    }

    // Check if button already exists
    if (document.getElementById('install-btn')) {
        console.log('[PWA] Install button already exists');
        return;
    }

    const headerContent = document.querySelector('.header-content');
    if (!headerContent) {
        console.error('[PWA] Header content not found, retrying in 500ms');
        setTimeout(showInstallButton, 500);
        return;
    }

    console.log('[PWA] Creating install button');
    const installBtn = document.createElement('button');
    installBtn.id = 'install-btn';
    installBtn.className = 'install-btn touch-feedback';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
    installBtn.onclick = installApp;
    installBtn.title = 'Instalar VolumeApp como aplicativo nativo';

    headerContent.appendChild(installBtn);

    console.log('[PWA] Install button added successfully');
}

function hideInstallButton() {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.remove();
    }
}

async function installApp() {
    if (!deferredPrompt) {
        console.log('[PWA] No deferred prompt available');
        showProgressionToast('Instalação não disponível neste momento');
        return;
    }

    try {
        console.log('[PWA] Showing install prompt');

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user's choice
        const { outcome } = await deferredPrompt.userChoice;

        console.log('[PWA] User choice:', outcome);

        if (outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
            showProgressionToast('Instalando VolumeApp...');
            triggerHapticFeedback('success');
        } else {
            console.log('[PWA] User dismissed the install prompt');
            showProgressionToast('Instalação cancelada');
            triggerHapticFeedback('light');

            // Mark as dismissed to prevent showing again immediately
            sessionStorage.setItem('pwa-install-dismissed', 'true');
        }

        // Clear the deferred prompt
        deferredPrompt = null;
        hideInstallButton();

    } catch (error) {
        console.error('[PWA] Install prompt failed:', error);
        showProgressionToast('Erro na instalação: ' + error.message);
        triggerHapticFeedback('error');
    }
}

// Touch Gesture Support
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isScrolling = false;

// Optimized touch gesture handling
const throttledTouchMove = throttle(handleTouchMove, 16); // ~60fps

function initializeTouchGestures() {
    const container = document.querySelector('.app-container');

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', throttledTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isScrolling = false;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;

    const diffX = Math.abs(touchCurrentX - touchStartX);
    const diffY = Math.abs(touchCurrentY - touchStartY);

    // Determine if user is scrolling vertically
    if (diffY > diffX) {
        isScrolling = true;
    }

    // Prevent horizontal swipe if scrolling vertically
    if (!isScrolling && diffX > 30) {
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (!touchStartX || !touchStartY || isScrolling) {
        resetTouch();
        return;
    }

    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    handleSwipeGesture();
    resetTouch();
}

function handleSwipeGesture() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipeDistance = 50;

    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
            // Swipe left - next day
            swipeToNextDay();
        } else {
            // Swipe right - previous day
            swipeToPreviousDay();
        }
    }
}

function swipeToNextDay() {
    const nextDay = currentDay < 5 ? currentDay + 1 : 1;
    switchDay(nextDay);
    showProgressionToast(`Dia ${nextDay} - ${workoutProgram[nextDay].name}`);
}

function swipeToPreviousDay() {
    const prevDay = currentDay > 1 ? currentDay - 1 : 5;
    switchDay(prevDay);
    showProgressionToast(`Dia ${prevDay} - ${workoutProgram[prevDay].name}`);
}

function resetTouch() {
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
    isScrolling = false;
}

// Pull to Refresh
let pullToRefreshEnabled = true;
let startY = 0;
let currentY = 0;
let pullDistance = 0;
const pullThreshold = 80;
let pullContainer = null; // Store container reference globally

function initializePullToRefresh() {
    // Skip pull-to-refresh on desktop browsers (no touch support)
    if (!('ontouchstart' in window)) {
        console.log('[Pull-to-Refresh] Skipping on desktop browser');
        return;
    }

    pullContainer = document.querySelector('.main-content');

    if (!pullContainer) {
        console.warn('[Pull-to-Refresh] Main content container not found');
        return;
    }

    pullContainer.addEventListener('touchstart', handlePullStart, { passive: true });
    pullContainer.addEventListener('touchmove', handlePullMove, { passive: false });
    pullContainer.addEventListener('touchend', handlePullEnd, { passive: true });

    console.log('[Pull-to-Refresh] Initialized successfully');
}

function handlePullStart(e) {
    if (!pullContainer || !e.touches || e.touches.length === 0) return;

    if (pullContainer.scrollTop === 0) {
        startY = e.touches[0].clientY;
        pullToRefreshEnabled = true;
    }
}

function handlePullMove(e) {
    if (!pullToRefreshEnabled || !pullContainer || !e.touches || e.touches.length === 0) return;

    currentY = e.touches[0].clientY;
    pullDistance = currentY - startY;

    if (pullDistance > 0 && pullContainer.scrollTop === 0) {
        e.preventDefault();

        // Visual feedback for pull to refresh
        const pullIndicator = document.getElementById('pull-indicator') || createPullIndicator();
        const progress = Math.min(pullDistance / pullThreshold, 1);

        pullIndicator.style.transform = `translateY(${pullDistance * 0.5}px)`;
        pullIndicator.style.opacity = progress;

        if (pullDistance > pullThreshold) {
            pullIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Solte para atualizar';
        } else {
            pullIndicator.innerHTML = '<i class="fas fa-arrow-down"></i> Puxe para atualizar';
        }
    }
}

function handlePullEnd(e) {
    if (!pullToRefreshEnabled) return;

    const pullIndicator = document.getElementById('pull-indicator');

    if (pullDistance > pullThreshold) {
        // Trigger refresh
        refreshWorkoutData();
    }

    // Reset pull indicator
    if (pullIndicator) {
        pullIndicator.style.transform = 'translateY(-100%)';
        pullIndicator.style.opacity = '0';
    }

    pullToRefreshEnabled = false;
    startY = 0;
    currentY = 0;
    pullDistance = 0;
}

function createPullIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'pull-indicator';
    indicator.className = 'pull-indicator';
    indicator.innerHTML = '<i class="fas fa-arrow-down"></i> Puxe para atualizar';

    document.querySelector('.main-content').prepend(indicator);
    return indicator;
}

async function refreshWorkoutData() {
    try {
        showProgressionToast('Atualizando dados...');
        await loadWorkoutData();
        updateWorkoutDisplay();
        updateProgressSummary();
        showProgressionToast('Dados atualizados com sucesso!');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showProgressionToast('Erro ao atualizar dados');
    }
}

// Initialize touch feedback for all interactive elements
function initializeTouchFeedback() {
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('button, .nav-tab, .complete-btn');
    buttons.forEach(button => {
        addTouchFeedback(button);
    });

    // Add touch feedback to inputs when they receive focus
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            triggerHapticFeedback('light');
        });
    });

    // Re-initialize when new elements are added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    const newButtons = node.querySelectorAll ? node.querySelectorAll('button, .nav-tab, .complete-btn') : [];
                    newButtons.forEach(button => {
                        addTouchFeedback(button);
                    });

                    const newInputs = node.querySelectorAll ? node.querySelectorAll('input, select') : [];
                    newInputs.forEach(input => {
                        input.addEventListener('focus', () => {
                            triggerHapticFeedback('light');
                        });
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Floating Action Button (FAB) functionality
let fabMenuOpen = false;

function toggleFabMenu() {
    const fabMenu = document.getElementById('fab-menu');
    const fabMain = document.getElementById('fab-main');

    fabMenuOpen = !fabMenuOpen;

    if (fabMenuOpen) {
        fabMenu.classList.add('open');
        fabMain.innerHTML = '<i class="fas fa-times"></i>';
        fabMain.style.transform = 'rotate(45deg)';
    } else {
        fabMenu.classList.remove('open');
        fabMain.innerHTML = '<i class="fas fa-plus"></i>';
        fabMain.style.transform = 'rotate(0deg)';
    }

    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Add a new set to a specific exercise
async function addSet(exerciseIndex) {
    try {
        // Ensure workout data exists
        if (!workoutData[currentWeek] || !workoutData[currentWeek][currentDay] || !workoutData[currentWeek][currentDay][exerciseIndex]) {
            initializeWorkoutDataForDay(currentWeek, currentDay);
        }

        const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];
        if (!exerciseData || !exerciseData.sets) {
            console.error('[ERROR] Invalid exercise data for adding set');
            return;
        }

        // Add new set with default values
        const newSet = {
            weight: 0,
            reps: 0,
            rpe: 0,
            completed: false
        };

        exerciseData.sets.push(newSet);

        // Save the updated data
        await saveWorkoutData();

        // Refresh the display
        updateWorkoutDisplay();
        updateProgressSummary();

        console.log(`[DEBUG] Added new set to exercise ${exerciseIndex}`);
    } catch (error) {
        console.error('[ERROR] Failed to add set:', error);
        showProgressionToast('Erro ao adicionar série');
    }
}

// Delete a specific set from an exercise
async function deleteSet(exerciseIndex, setIndex) {
    try {
        // Ensure workout data exists
        if (!workoutData[currentWeek] || !workoutData[currentWeek][currentDay] || !workoutData[currentWeek][currentDay][exerciseIndex]) {
            console.error('[ERROR] Invalid exercise data for deleting set');
            return;
        }

        const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];
        if (!exerciseData || !exerciseData.sets || setIndex >= exerciseData.sets.length) {
            console.error('[ERROR] Invalid set index for deletion');
            return;
        }

        // Don't allow deleting if it's the last set
        if (exerciseData.sets.length <= 1) {
            showProgressionToast('Não é possível deletar a última série');
            return;
        }

        // Confirm deletion
        if (!confirm(`Deletar SET ${setIndex + 1}?`)) {
            return;
        }

        // Remove the set
        exerciseData.sets.splice(setIndex, 1);

        // Save the updated data
        await saveWorkoutData();

        // Refresh the display
        updateWorkoutDisplay();
        updateProgressSummary();

        // Add haptic feedback
        triggerHapticFeedback('success');
        showProgressionToast('Série deletada!');

        console.log(`[DEBUG] Deleted set ${setIndex} from exercise ${exerciseIndex}`);
    } catch (error) {
        console.error('[ERROR] Failed to delete set:', error);
        showProgressionToast('Erro ao deletar série');
    }
}

function addSetToCurrentExercise() {
    // Find the first non-collapsed exercise and add a set
    const exerciseCards = document.querySelectorAll('.exercise-card');
    for (let i = 0; i < exerciseCards.length; i++) {
        const setsContainer = exerciseCards[i].querySelector('.sets-container');
        if (!setsContainer.classList.contains('collapsed')) {
            addSet(i);
            showProgressionToast('Nova série adicionada!');
            break;
        }
    }
    toggleFabMenu();
}

// Swipe-to-delete functionality for sets
let setTouchStartX = 0;
let setTouchStartY = 0;
let setTouchEndX = 0;
let setTouchEndY = 0;
let currentSwipeCard = null;

function handleSetTouchStart(e) {
    setTouchStartX = e.touches[0].clientX;
    setTouchStartY = e.touches[0].clientY;
    currentSwipeCard = e.currentTarget;

    // Reset any existing swipe state
    currentSwipeCard.classList.remove('swiping-left', 'delete-revealed');
}

function handleSetTouchMove(e) {
    if (!currentSwipeCard) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = setTouchStartX - touchX;
    const diffY = setTouchStartY - touchY;

    // Only handle horizontal swipes (left swipe to delete)
    if (Math.abs(diffX) > Math.abs(diffY) && diffX > 0) {
        e.preventDefault();

        const swipeDistance = Math.min(diffX, 100); // Max 100px swipe
        currentSwipeCard.style.transform = `translateX(-${swipeDistance}px)`;

        if (swipeDistance > 30) {
            currentSwipeCard.classList.add('swiping-left');
        }

        if (swipeDistance > 60) {
            currentSwipeCard.classList.add('delete-revealed');
        }
    }
}

function handleSetTouchEnd(e) {
    if (!currentSwipeCard) return;

    setTouchEndX = e.changedTouches[0].clientX;
    setTouchEndY = e.changedTouches[0].clientY;

    const diffX = setTouchStartX - setTouchEndX;
    const diffY = setTouchStartY - setTouchEndY;

    // Check if it's a left swipe
    if (Math.abs(diffX) > Math.abs(diffY) && diffX > 60) {
        // Reveal delete button
        if (currentSwipeCard) {
            currentSwipeCard.classList.add('delete-revealed');
            currentSwipeCard.style.transform = 'translateX(-80px)';
        }

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (currentSwipeCard) {
                resetSetSwipe();
            }
        }, 3000);
    } else {
        // Reset swipe
        resetSetSwipe();
    }

    // Final cleanup with null check
    if (currentSwipeCard) {
        currentSwipeCard.classList.remove('swiping-left');
    }
}

function resetSetSwipe() {
    if (currentSwipeCard) {
        currentSwipeCard.style.transform = 'translateX(0)';
        currentSwipeCard.classList.remove('swiping-left', 'delete-revealed');
    }
    currentSwipeCard = null;
}

// Enhanced Notes CRUD Operations
function openQuickNotes() {
    showNotesModal();
    toggleFabMenu();
}

function showNotesModal() {
    const modal = document.createElement('div');
    modal.className = 'notes-modal';
    modal.innerHTML = `
        <div class="notes-modal-content">
            <div class="notes-header">
                <h3>Notas - Semana ${currentWeek}, Dia ${currentDay}</h3>
                <button class="close-btn" onclick="closeNotesModal()">&times;</button>
            </div>
            <div class="notes-body">
                <div class="add-note-section">
                    <textarea id="new-note-input" placeholder="Adicionar nova nota..." rows="3"></textarea>
                    <button onclick="addNote()" class="add-note-btn">
                        <i class="fas fa-plus"></i> Adicionar Nota
                    </button>
                </div>
                <div class="notes-list" id="notes-list">
                    ${renderNotesList()}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('active');
}

function closeNotesModal() {
    const modal = document.querySelector('.notes-modal');
    if (modal) {
        modal.remove();
    }
}

function renderNotesList() {
    const notes = getNotes();
    const currentDayNotes = notes.filter(note =>
        note.week === currentWeek && note.day === currentDay
    );

    if (currentDayNotes.length === 0) {
        return '<p class="no-notes">Nenhuma nota para este dia</p>';
    }

    return currentDayNotes.map((note, index) => `
        <div class="note-item" data-note-id="${note.id}">
            <div class="note-content">
                <p>${note.note}</p>
                <small>${new Date(note.date).toLocaleString('pt-BR')}</small>
            </div>
            <div class="note-actions">
                <button onclick="editNote('${note.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteNote('${note.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addNote() {
    const input = document.getElementById('new-note-input');
    const noteText = input.value.trim();

    if (!noteText) {
        showProgressionToast('Digite uma nota primeiro');
        return;
    }

    const notes = getNotes();
    const newNote = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        week: currentWeek,
        day: currentDay,
        note: noteText
    };

    notes.push(newNote);
    saveNotes(notes);

    input.value = '';
    updateNotesDisplay();
    showProgressionToast('Nota adicionada!');
}

function editNote(noteId) {
    const notes = getNotes();
    const note = notes.find(n => n.id === noteId);

    if (!note) return;

    const newText = prompt('Editar nota:', note.note);
    if (newText !== null && newText.trim() !== '') {
        note.note = newText.trim();
        note.date = new Date().toISOString(); // Update timestamp
        saveNotes(notes);
        updateNotesDisplay();
        showProgressionToast('Nota atualizada!');
    }
}

function deleteNote(noteId) {
    if (!confirm('Deletar esta nota?')) return;

    const notes = getNotes();
    const filteredNotes = notes.filter(n => n.id !== noteId);
    saveNotes(filteredNotes);
    updateNotesDisplay();
    showProgressionToast('Nota deletada!');
}

function getNotes() {
    return JSON.parse(localStorage.getItem('quickNotes') || '[]');
}

function saveNotes(notes) {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
}

function updateNotesDisplay() {
    const notesList = document.getElementById('notes-list');
    if (notesList) {
        notesList.innerHTML = renderNotesList();
    }
}

// Rest Timer functionality
let restTimer = null;
let restTimeRemaining = 120; // 2 minutes default
let restTimerDuration = 120;
let restTimerRunning = false;

function startRestTimer() {
    document.getElementById('rest-timer-modal').classList.add('active');
    toggleFabMenu();
}

function closeRestTimer() {
    document.getElementById('rest-timer-modal').classList.remove('active');
    if (restTimer) {
        clearInterval(restTimer);
        restTimer = null;
        restTimerRunning = false;
    }
}

function setTimerDuration(seconds) {
    restTimerDuration = seconds;
    restTimeRemaining = seconds;
    updateTimerDisplay();

    // Update button states
    document.querySelectorAll('.timer-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function startTimer() {
    if (restTimerRunning) return;

    restTimerRunning = true;
    document.getElementById('start-timer-btn').style.display = 'none';
    document.getElementById('pause-timer-btn').style.display = 'inline-flex';

    restTimer = setInterval(() => {
        restTimeRemaining--;
        updateTimerDisplay();

        if (restTimeRemaining <= 0) {
            timerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    if (!restTimerRunning) return;

    restTimerRunning = false;
    clearInterval(restTimer);
    restTimer = null;

    document.getElementById('start-timer-btn').style.display = 'inline-flex';
    document.getElementById('pause-timer-btn').style.display = 'none';
}

function resetTimer() {
    pauseTimer();
    restTimeRemaining = restTimerDuration;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(restTimeRemaining / 60);
    const seconds = restTimeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer-display').textContent = display;
}

function timerComplete() {
    pauseTimer();

    // Show notification
    showProgressionToast('Tempo de descanso finalizado!');

    // Vibrate if supported
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Play sound if possible
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play().catch(() => {}); // Ignore errors
    } catch (e) {}

    // Auto-close after 3 seconds
    setTimeout(() => {
        closeRestTimer();
    }, 3000);
}

// Debug function to check workout data structure
function debugWorkoutData() {
    console.log('[DEBUG] Current workout data structure:');
    console.log('Current week:', currentWeek);
    console.log('Current day:', currentDay);
    console.log('Workout data:', workoutData);
    console.log('Current day data:', workoutData[currentWeek] && workoutData[currentWeek][currentDay]);

    if (workoutData[currentWeek] && workoutData[currentWeek][currentDay]) {
        const dayData = workoutData[currentWeek][currentDay];
        console.log('Day data type:', typeof dayData);
        console.log('Day data keys:', Object.keys(dayData));
        console.log('Is error object:', !!dayData.error);
    }
}

// Debug function to check PWA status
function debugPWAStatus() {
    console.log('[DEBUG] PWA Status:');
    console.log('Service Worker supported:', 'serviceWorker' in navigator);
    console.log('Is installed:', isInstalled);
    console.log('Deferred prompt available:', !!deferredPrompt);
    console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
    console.log('Install button exists:', !!document.getElementById('install-btn'));
    console.log('HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost');
    console.log('User Agent:', navigator.userAgent);
    console.log('Is iOS Safari:', isIOSSafari());
    console.log('beforeinstallprompt supported:', 'beforeinstallprompt' in window);

    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('Manifest link exists:', !!manifestLink);
    if (manifestLink) {
        console.log('Manifest href:', manifestLink.href);

        // Try to fetch manifest
        fetch(manifestLink.href)
            .then(response => response.json())
            .then(manifest => {
                console.log('Manifest loaded successfully:', manifest);
                console.log('Manifest icons count:', manifest.icons ? manifest.icons.length : 0);
            })
            .catch(error => {
                console.error('Failed to load manifest:', error);
            });
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            console.log('Service Worker registration:', registration);
            if (registration) {
                console.log('SW scope:', registration.scope);
                console.log('SW state:', registration.active ? registration.active.state : 'none');
            }
        });
    }

    // Show results in a toast for mobile debugging
    const debugInfo = `
        PWA Debug Info:
        • HTTPS: ${location.protocol === 'https:' || location.hostname === 'localhost'}
        • Service Worker: ${'serviceWorker' in navigator}
        • Manifest: ${!!manifestLink}
        • Install Prompt: ${!!deferredPrompt}
        • iOS Safari: ${isIOSSafari()}
        • Installed: ${isInstalled}
    `;

    showProgressionToast(debugInfo, 8000);
}

// Desktop-friendly refresh function for testing
function refreshWorkoutData() {
    console.log('[DEBUG] Refreshing workout data...');
    loadWorkoutData().then(() => {
        updateWorkoutDisplay();
        updateProgressSummary();
        showProgressionToast('Dados atualizados!');
    }).catch(error => {
        console.error('[ERROR] Failed to refresh data:', error);
        showProgressionToast('Erro ao atualizar dados');
    });
}

// Global functions for inline event handlers
window.updateSet = updateSet;
window.toggleSetComplete = toggleSetComplete;
window.toggleExerciseCollapse = toggleExerciseCollapse;
window.openExerciseModal = openExerciseModal;
window.toggleGlossary = toggleGlossary;
window.saveWorkoutLink = saveWorkoutLink;
window.installApp = installApp;
window.toggleFabMenu = toggleFabMenu;
window.addSetToCurrentExercise = addSetToCurrentExercise;
window.openQuickNotes = openQuickNotes;
window.startRestTimer = startRestTimer;
window.closeRestTimer = closeRestTimer;
window.setTimerDuration = setTimerDuration;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.deleteSet = deleteSet;
window.closeNotesModal = closeNotesModal;
window.addNote = addNote;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.toggleTheme = toggleTheme;
window.resetTimer = resetTimer;
window.incrementValue = incrementValue;
window.decrementValue = decrementValue;
window.debugWorkoutData = debugWorkoutData;
window.debugPWAStatus = debugPWAStatus;
window.refreshWorkoutData = refreshWorkoutData;
window.finishWorkout = finishWorkout;
window.showInstallInstructions = showInstallInstructions;
window.checkPWAInstallability = checkPWAInstallability;