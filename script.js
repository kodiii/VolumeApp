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

// Initialize App
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing app...');
    
    // Initialize workout data first
    initializeWorkoutData();
    
    // Load saved data
    await loadWorkoutData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update display
    updateWorkoutDisplay();
    updateProgressSummary();
    
    console.log('App initialization complete');
});

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
            workoutData[currentWeek][currentDay] = data;
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

// UI Functions
async function switchDay(day) {
    currentDay = day;
    
    // Update active tab
    navTabs.forEach(tab => tab.classList.remove('active'));
    const activeTab = document.querySelector(`[data-day="${day}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Load data for new day
    await loadWorkoutData();
    
    updateWorkoutDisplay();
    updateProgressSummary();
}

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
    
    // Update header
    workoutTitle.textContent = workout.name;
    rpeInfo.textContent = `RPE: ${weekData.rpe}`;
    rpeInfo.className = `rpe-info rpe-${Math.floor(weekData.rpe)}`;
    
    // Load saved workout link
    loadWorkoutLink();
    
    // Clear and rebuild exercises
    exercisesContainer.innerHTML = '';
    
    workout.exercises.forEach((exercise, exerciseIndex) => {
        const exerciseCard = createExerciseCard(exercise, exerciseIndex);
        exercisesContainer.appendChild(exerciseCard);
    });
}

function createExerciseCard(exercise, exerciseIndex) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    
    // Ensure exercise data exists
    if (!workoutData[currentWeek] || !workoutData[currentWeek][currentDay] || !workoutData[currentWeek][currentDay][exerciseIndex]) {
        initializeWorkoutDataForDay(currentWeek, currentDay);
    }
    
    const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];
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
                    <i class="fas fa-chevron-${isCollapsed ? 'down' : 'up'}"></i>
                </button>
                <button class="btn-icon" onclick="event.stopPropagation(); openExerciseModal('${exercise.name}', ${exerciseIndex})">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
        </div>
        <div class="sets-container ${isCollapsed ? 'collapsed' : ''}">
            ${exerciseData.sets.map((set, setIndex) => createSetRow(set, setIndex, exerciseIndex)).join('')}
        </div>
    `;
    
    return card;
}

function createSetRow(set, setIndex, exerciseIndex) {
    const completedClass = set.completed ? 'completed' : '';
    const exercise = workoutProgram[currentDay].exercises[exerciseIndex];
    
    // Get progression indicator for this set
    const progressionIndicator = getProgressionIndicator(exerciseIndex, setIndex, exercise);
    
    return `
        <div class="set-row ${completedClass}">
            <div class="set-number">
                ${setIndex + 1}
                ${progressionIndicator}
            </div>
            <div class="input-group">
                <label>Peso (kg)</label>
                <input type="number" 
                       value="${set.weight || ''}" 
                       onchange="updateSet(${exerciseIndex}, ${setIndex}, 'weight', this.value)"
                       step="0.5" min="0">
            </div>
            <div class="input-group">
                <label>Reps</label>
                <input type="number" 
                       value="${set.reps || ''}" 
                       onchange="updateSet(${exerciseIndex}, ${setIndex}, 'reps', this.value)"
                       min="0">
            </div>
            <div class="input-group">
                <label>RPE</label>
                <select onchange="updateSet(${exerciseIndex}, ${setIndex}, 'rpe', this.value)" class="rpe-select">
                    ${Array.from({length: 11}, (_, i) => i).map(rpe => 
                        `<option value="${rpe}" ${set.rpe == rpe ? 'selected' : ''}>${rpe}</option>`
                    ).join('')}
                </select>
            </div>
            <button class="complete-btn ${set.completed ? 'completed' : ''}" 
                    onclick="toggleSetComplete(${exerciseIndex}, ${setIndex})">
                ${set.completed ? 'Completo' : 'Completar'}
            </button>
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

async function toggleExerciseCollapse(exerciseIndex) {
    const exerciseData = workoutData[currentWeek][currentDay][exerciseIndex];
    exerciseData.collapsed = !exerciseData.collapsed;
    await saveWorkoutData();
    updateWorkoutDisplay();
}

async function toggleSetComplete(exerciseIndex, setIndex) {
    const set = workoutData[currentWeek][currentDay][exerciseIndex].sets[setIndex];
    const exercise = workoutData[currentWeek][currentDay][exerciseIndex];
    
    set.completed = !set.completed;
    
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
    const dayData = workoutData[currentWeek][currentDay];
    let totalVolume = 0;
    let completedSets = 0;
    let totalSets = 0;
    let totalRPE = 0;
    let rpeCount = 0;
    
    Object.values(dayData).forEach(exercise => {
        exercise.sets.forEach(set => {
            totalSets++;
            if (set.completed) {
                completedSets++;
                totalVolume += (set.weight || 0) * (set.reps || 0);
                if (set.rpe > 0) {
                    totalRPE += set.rpe;
                    rpeCount++;
                }
            }
        });
    });
    
    document.getElementById('total-volume').textContent = `${totalVolume.toFixed(1)} kg`;
    document.getElementById('completed-sets').textContent = `${completedSets}/${totalSets}`;
    document.getElementById('average-rpe').textContent = rpeCount > 0 ? (totalRPE / rpeCount).toFixed(1) : '-';
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

// Global functions for inline event handlers
window.updateSet = updateSet;
window.toggleSetComplete = toggleSetComplete;
window.toggleExerciseCollapse = toggleExerciseCollapse;
window.openExerciseModal = openExerciseModal;
window.toggleGlossary = toggleGlossary;
window.saveWorkoutLink = saveWorkoutLink;