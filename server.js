const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Database connection with enhanced error handling
const db = new sqlite3.Database('./workout.db', (err) => {
    if (err) {
        console.error('[ERROR] Failed to connect to SQLite database:', err.message);
        process.exit(1);
    }
    console.log('[DEBUG] Connected to SQLite database successfully');
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
            console.error('[ERROR] Failed to enable foreign keys:', err.message);
        } else {
            console.log('[DEBUG] Foreign keys enabled');
        }
    });
    
    initializeDatabase();
});

// Initialize database tables
function initializeDatabase() {
    console.log('[DEBUG] Initializing database tables...');
    
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('[ERROR] Failed to create users table:', err.message);
        } else {
            console.log('[DEBUG] Users table ready');
        }
    });

    // Create workout_sessions table
    db.run(`CREATE TABLE IF NOT EXISTS workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week INTEGER NOT NULL,
        day INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(week, day)
    )`, (err) => {
        if (err) {
            console.error('[ERROR] Failed to create workout_sessions table:', err.message);
        } else {
            console.log('[DEBUG] Workout_sessions table ready');
        }
    });

    // Create exercises table
    db.run(`CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        exercise_index INTEGER NOT NULL,
        name TEXT NOT NULL,
        link TEXT,
        collapsed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error('[ERROR] Failed to create exercises table:', err.message);
        } else {
            console.log('[DEBUG] Exercises table ready');
        }
    });

    // Create sets table
    db.run(`CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        set_index INTEGER NOT NULL,
        weight REAL DEFAULT 0,
        reps INTEGER DEFAULT 0,
        rpe REAL DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error('[ERROR] Failed to create sets table:', err.message);
        } else {
            console.log('[DEBUG] Sets table ready');
            console.log('[DEBUG] Database initialization completed');
        }
    });
    
    // Add database health check
    db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"', (err, row) => {
        if (err) {
            console.error('[ERROR] Database health check failed:', err.message);
        } else {
            console.log(`[DEBUG] Database health check: ${row.count} tables found`);
        }
    });
}

// API Routes

// Get all workout data for a specific week and day
app.get('/api/workout/:week/:day', (req, res) => {
    const { week, day } = req.params;
    
    console.log(`[DEBUG] GET /api/workout/${week}/${day} - Request received`);
    
    // Input validation
    const weekNum = parseInt(week);
    const dayNum = parseInt(day);
    
    if (isNaN(weekNum) || isNaN(dayNum) || weekNum < 1 || weekNum > 7 || dayNum < 1 || dayNum > 5) {
        console.error(`[ERROR] Invalid parameters: week=${week}, day=${day}`);
        return res.status(400).json({ 
            error: 'Invalid parameters', 
            message: 'Week must be 1-7 and day must be 1-5',
            received: { week, day }
        });
    }
    
    const query = `
        SELECT 
            ws.id as session_id,
            ws.week,
            ws.day,
            e.id as exercise_id,
            e.exercise_index,
            e.name as exercise_name,
            e.link as exercise_link,
            e.collapsed,
            s.id as set_id,
            s.set_index,
            s.weight,
            s.reps,
            s.rpe,
            s.completed
        FROM workout_sessions ws
        LEFT JOIN exercises e ON ws.id = e.session_id
        LEFT JOIN sets s ON e.id = s.exercise_id
        WHERE ws.week = ? AND ws.day = ?
        ORDER BY e.exercise_index, s.set_index
    `;
    
    console.log(`[DEBUG] Executing query for week ${weekNum}, day ${dayNum}`);
    
    db.all(query, [weekNum, dayNum], (err, rows) => {
        if (err) {
            console.error(`[ERROR] Database query failed:`, err);
            console.error(`[ERROR] Query parameters:`, { week: weekNum, day: dayNum });
            return res.status(500).json({ 
                error: 'Database query failed', 
                message: err.message,
                sqlState: err.errno || 'unknown'
            });
        }
        
        console.log(`[DEBUG] Query returned ${rows.length} rows`);
        
        // Transform flat data into nested structure
        const workoutData = {};
        let exerciseCount = 0;
        let setCount = 0;
        
        rows.forEach(row => {
            if (!row.exercise_id) return; // Skip if no exercises
            
            const exerciseIndex = row.exercise_index;
            
            if (!workoutData[exerciseIndex]) {
                workoutData[exerciseIndex] = {
                    name: row.exercise_name,
                    link: row.exercise_link || '',
                    collapsed: Boolean(row.collapsed),
                    sets: []
                };
                exerciseCount++;
            }
            
            if (row.set_id) {
                workoutData[exerciseIndex].sets[row.set_index] = {
                    weight: parseFloat(row.weight) || 0,
                    reps: parseInt(row.reps) || 0,
                    rpe: parseFloat(row.rpe) || 0,
                    completed: Boolean(row.completed)
                };
                setCount++;
            }
        });
        
        console.log(`[DEBUG] Transformed data: ${exerciseCount} exercises, ${setCount} sets`);
        
        if (Object.keys(workoutData).length === 0) {
            console.log(`[DEBUG] No data found for week ${weekNum}, day ${dayNum}`);
            return res.status(404).json({ 
                message: 'No workout data found',
                week: weekNum,
                day: dayNum
            });
        }
        
        res.json(workoutData);
    });
});

// Save complete workout data
app.post('/api/workout', (req, res) => {
    const { week, day, workoutData } = req.body;
    
    console.log(`[DEBUG] POST /api/workout - Request received for week ${week}, day ${day}`);
    
    // Input validation
    if (!week || !day || !workoutData) {
        console.error(`[ERROR] Missing required fields:`, { week: !!week, day: !!day, workoutData: !!workoutData });
        return res.status(400).json({ 
            error: 'Missing required fields', 
            message: 'week, day, and workoutData are required',
            received: { week, day, hasWorkoutData: !!workoutData }
        });
    }
    
    const weekNum = parseInt(week);
    const dayNum = parseInt(day);
    
    if (isNaN(weekNum) || isNaN(dayNum) || weekNum < 1 || weekNum > 7 || dayNum < 1 || dayNum > 5) {
        console.error(`[ERROR] Invalid parameters: week=${week}, day=${day}`);
        return res.status(400).json({ 
            error: 'Invalid parameters', 
            message: 'Week must be 1-7 and day must be 1-5',
            received: { week, day }
        });
    }
    
    if (typeof workoutData !== 'object' || workoutData === null) {
        console.error(`[ERROR] Invalid workoutData type:`, typeof workoutData);
        return res.status(400).json({ 
            error: 'Invalid workoutData', 
            message: 'workoutData must be an object',
            received: typeof workoutData
        });
    }
    
    console.log(`[DEBUG] Validated input - exercises count: ${Object.keys(workoutData).length}`);
    
    db.serialize(() => {
        // Start transaction
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
                console.error(`[ERROR] Failed to begin transaction:`, err);
                return res.status(500).json({ 
                    error: 'Transaction failed', 
                    message: err.message 
                });
            }
            
            console.log(`[DEBUG] Transaction started`);
        });
        
        // Get or create workout session
        db.get(
            'SELECT id FROM workout_sessions WHERE week = ? AND day = ?',
            [weekNum, dayNum],
            (err, session) => {
                if (err) {
                    console.error(`[ERROR] Failed to query workout session:`, err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ 
                        error: 'Database query failed', 
                        message: err.message 
                    });
                }
                
                console.log(`[DEBUG] Session query result:`, session ? `Found session ${session.id}` : 'No existing session');
                
                const insertWorkoutData = (sessionId) => {
                    let exerciseCount = 0;
                    let setCount = 0;
                    let completedOperations = 0;
                    let responseSent = false; // Flag to prevent multiple responses
                    const totalExercises = Object.keys(workoutData).length;
                    
                    // Insert exercises and sets
                    Object.keys(workoutData).forEach(exerciseIndex => {
                        const exercise = workoutData[exerciseIndex];
                        
                        // Validate exercise data
                        if (!exercise || typeof exercise !== 'object') {
                            console.error(`[ERROR] Invalid exercise data at index ${exerciseIndex}:`, exercise);
                            return;
                        }
                        
                        if (!exercise.name || typeof exercise.name !== 'string') {
                            console.error(`[ERROR] Invalid exercise name at index ${exerciseIndex}:`, exercise.name);
                            return;
                        }
                        
                        exerciseCount++;
                        
                        db.run(
                            'INSERT INTO exercises (session_id, exercise_index, name, link, collapsed) VALUES (?, ?, ?, ?, ?)',
                            [sessionId, parseInt(exerciseIndex), exercise.name, exercise.link || '', exercise.collapsed ? 1 : 0],
                            function(err) {
                                if (err) {
                                    console.error(`[ERROR] Failed to insert exercise ${exerciseIndex}:`, err);
                                    db.run('ROLLBACK');
                                    if (!responseSent) {
                                        responseSent = true;
                                        return res.status(500).json({ 
                                            error: 'Failed to save exercise', 
                                            message: err.message,
                                            exerciseIndex 
                                        });
                                    }
                                    return;
                                }
                                
                                const exerciseId = this.lastID;
                                console.log(`[DEBUG] Inserted exercise ${exerciseIndex} with ID ${exerciseId}`);
                                
                                // Insert sets
                                if (exercise.sets && Array.isArray(exercise.sets)) {
                                    exercise.sets.forEach((set, setIndex) => {
                                        if (set && typeof set === 'object') {
                                            setCount++;
                                            db.run(
                                                'INSERT INTO sets (exercise_id, set_index, weight, reps, rpe, completed) VALUES (?, ?, ?, ?, ?, ?)',
                                                [
                                                    exerciseId, 
                                                    setIndex, 
                                                    parseFloat(set.weight) || 0, 
                                                    parseInt(set.reps) || 0, 
                                                    parseFloat(set.rpe) || 0, 
                                                    set.completed ? 1 : 0
                                                ],
                                                (err) => {
                                                    if (err) {
                                                        console.error(`[ERROR] Failed to insert set ${setIndex} for exercise ${exerciseIndex}:`, err);
                                                    } else {
                                                        console.log(`[DEBUG] Inserted set ${setIndex} for exercise ${exerciseIndex}`);
                                                    }
                                                }
                                            );
                                        }
                                    });
                                }
                                
                                completedOperations++;
                                if (completedOperations === totalExercises && !responseSent) {
                                    // Commit transaction
                                    db.run('COMMIT', (err) => {
                                        if (err) {
                                            console.error(`[ERROR] Failed to commit transaction:`, err);
                                            if (!responseSent) {
                                                responseSent = true;
                                                return res.status(500).json({ 
                                                    error: 'Failed to save data', 
                                                    message: err.message 
                                                });
                                            }
                                            return;
                                        }
                                        
                                        if (!responseSent) {
                                            responseSent = true;
                                            console.log(`[DEBUG] Transaction committed successfully - ${exerciseCount} exercises, ${setCount} sets`);
                                            res.json({ 
                                                success: true, 
                                                saved: { exercises: exerciseCount, sets: setCount }
                                            });
                                        }
                                    });
                                }
                            }
                        );
                    });
                    
                    if (totalExercises === 0 && !responseSent) {
                        // No exercises to save, just commit
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error(`[ERROR] Failed to commit empty transaction:`, err);
                                if (!responseSent) {
                                    responseSent = true;
                                    return res.status(500).json({ 
                                        error: 'Failed to save data', 
                                        message: err.message 
                                    });
                                }
                                return;
                            }
                            
                            if (!responseSent) {
                                responseSent = true;
                                console.log(`[DEBUG] Empty workout saved successfully`);
                                res.json({ 
                                    success: true, 
                                    saved: { exercises: 0, sets: 0 }
                                });
                            }
                        });
                    }
                };
                
                if (session) {
                    // Clear existing data for this session (in correct order due to foreign keys)
                    // First delete sets (child table), then exercises (parent table)
                    db.run('DELETE FROM sets WHERE exercise_id IN (SELECT id FROM exercises WHERE session_id = ?)', [session.id], (err) => {
                        if (err) {
                            console.error(`[ERROR] Failed to delete existing sets:`, err);
                            db.run('ROLLBACK');
                            return res.status(500).json({ 
                                error: 'Failed to clear existing data', 
                                message: err.message 
                            });
                        }
                        
                        console.log(`[DEBUG] Cleared existing sets for session ${session.id}`);
                        
                        db.run('DELETE FROM exercises WHERE session_id = ?', [session.id], (err) => {
                            if (err) {
                                console.error(`[ERROR] Failed to delete existing exercises:`, err);
                                db.run('ROLLBACK');
                                return res.status(500).json({ 
                                    error: 'Failed to clear existing data', 
                                    message: err.message 
                                });
                            }
                            
                            console.log(`[DEBUG] Cleared existing exercises for session ${session.id}`);
                            
                            // Update session timestamp
                            db.run(
                                'UPDATE workout_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                                [session.id],
                                (err) => {
                                    if (err) {
                                        console.error(`[ERROR] Failed to update session timestamp:`, err);
                                        db.run('ROLLBACK');
                                        return res.status(500).json({ 
                                            error: 'Failed to update session', 
                                            message: err.message 
                                        });
                                    }
                                    console.log(`[DEBUG] Updated session ${session.id} timestamp`);
                                    insertWorkoutData(session.id);
                                }
                            );
                        });
                    });
                } else {
                    // Create new session
                    db.run(
                        'INSERT INTO workout_sessions (week, day) VALUES (?, ?)',
                        [weekNum, dayNum],
                        function(err) {
                            if (err) {
                                console.error(`[ERROR] Failed to create new session:`, err);
                                db.run('ROLLBACK');
                                return res.status(500).json({ 
                                    error: 'Failed to create session', 
                                    message: err.message 
                                });
                            }
                            console.log(`[DEBUG] Created new session ${this.lastID}`);
                            insertWorkoutData(this.lastID);
                        }
                    );
                }
            }
        );
    });
});

// Save individual set data when completed
app.post('/api/workout/set', (req, res) => {
    const { week, day, exerciseIndex, setIndex, setData } = req.body;
    
    console.log(`[DEBUG] POST /api/workout/set - Request received for week ${week}, day ${day}, exercise ${exerciseIndex}, set ${setIndex}`);
    
    // Input validation
    if (!week || !day || exerciseIndex === undefined || setIndex === undefined || !setData) {
        console.error(`[ERROR] Missing required fields:`, { week: !!week, day: !!day, exerciseIndex, setIndex, setData: !!setData });
        return res.status(400).json({ 
            error: 'Missing required fields', 
            message: 'week, day, exerciseIndex, setIndex, and setData are required'
        });
    }
    
    const weekNum = parseInt(week);
    const dayNum = parseInt(day);
    const exIndex = parseInt(exerciseIndex);
    const sIndex = parseInt(setIndex);
    
    if (isNaN(weekNum) || isNaN(dayNum) || weekNum < 1 || weekNum > 7 || dayNum < 1 || dayNum > 5) {
        console.error(`[ERROR] Invalid parameters: week=${week}, day=${day}`);
        return res.status(400).json({ 
            error: 'Invalid parameters', 
            message: 'Week must be 1-7 and day must be 1-5'
        });
    }
    
    if (isNaN(exIndex) || isNaN(sIndex) || exIndex < 0 || sIndex < 0) {
        console.error(`[ERROR] Invalid indices: exerciseIndex=${exerciseIndex}, setIndex=${setIndex}`);
        return res.status(400).json({ 
            error: 'Invalid indices', 
            message: 'exerciseIndex and setIndex must be non-negative integers'
        });
    }
    
    db.serialize(() => {
        // Get or create workout session
        db.get(
            'SELECT id FROM workout_sessions WHERE week = ? AND day = ?',
            [weekNum, dayNum],
            (err, session) => {
                if (err) {
                    console.error(`[ERROR] Failed to query workout session:`, err);
                    return res.status(500).json({ 
                        error: 'Database query failed', 
                        message: err.message 
                    });
                }
                
                const saveSetData = (sessionId) => {
                    // Get or create exercise
                    db.get(
                        'SELECT id FROM exercises WHERE session_id = ? AND exercise_index = ?',
                        [sessionId, exIndex],
                        (err, exercise) => {
                            if (err) {
                                console.error(`[ERROR] Failed to query exercise:`, err);
                                return res.status(500).json({ 
                                    error: 'Database query failed', 
                                    message: err.message 
                                });
                            }
                            
                            const saveSet = (exerciseId) => {
                                // Update or insert set data
                                db.run(
                                    `INSERT OR REPLACE INTO sets (exercise_id, set_index, weight, reps, rpe, completed) 
                                     VALUES (?, ?, ?, ?, ?, ?)`,
                                    [
                                        exerciseId,
                                        sIndex,
                                        parseFloat(setData.weight) || 0,
                                        parseInt(setData.reps) || 0,
                                        parseFloat(setData.rpe) || 0,
                                        setData.completed ? 1 : 0
                                    ],
                                    function(err) {
                                        if (err) {
                                            console.error(`[ERROR] Failed to save set data:`, err);
                                            return res.status(500).json({ 
                                                error: 'Failed to save set', 
                                                message: err.message 
                                            });
                                        }
                                        
                                        console.log(`[DEBUG] Set saved successfully - exercise ${exIndex}, set ${sIndex}`);
                                        res.json({ 
                                            success: true, 
                                            message: 'Set saved successfully',
                                            setId: this.lastID
                                        });
                                    }
                                );
                            };
                            
                            if (exercise) {
                                saveSet(exercise.id);
                            } else {
                                // Create exercise if it doesn't exist
                                db.run(
                                    'INSERT INTO exercises (session_id, exercise_index, name, link, collapsed) VALUES (?, ?, ?, ?, ?)',
                                    [sessionId, exIndex, setData.exerciseName || `Exercise ${exIndex}`, '', 0],
                                    function(err) {
                                        if (err) {
                                            console.error(`[ERROR] Failed to create exercise:`, err);
                                            return res.status(500).json({ 
                                                error: 'Failed to create exercise', 
                                                message: err.message 
                                            });
                                        }
                                        
                                        console.log(`[DEBUG] Created exercise ${exIndex} with ID ${this.lastID}`);
                                        saveSet(this.lastID);
                                    }
                                );
                            }
                        }
                    );
                };
                
                if (session) {
                    saveSetData(session.id);
                } else {
                    // Create new session
                    db.run(
                        'INSERT INTO workout_sessions (week, day) VALUES (?, ?)',
                        [weekNum, dayNum],
                        function(err) {
                            if (err) {
                                console.error(`[ERROR] Failed to create new session:`, err);
                                return res.status(500).json({ 
                                    error: 'Failed to create session', 
                                    message: err.message 
                                });
                            }
                            console.log(`[DEBUG] Created new session ${this.lastID}`);
                            saveSetData(this.lastID);
                        }
                    );
                }
            }
        );
    });
});

// Get workout link for a specific day
app.get('/api/workout-link/:day', (req, res) => {
    const { day } = req.params;
    
    console.log(`[DEBUG] GET /api/workout-link/${day} - Request received`);
    
    // Input validation
    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 5) {
        console.error(`[ERROR] Invalid day parameter: ${day}`);
        return res.status(400).json({ 
            error: 'Invalid day parameter', 
            message: 'Day must be 1-5',
            received: day
        });
    }
    
    db.get(
        'SELECT link FROM workout_links WHERE day = ? ORDER BY created_at DESC LIMIT 1',
        [dayNum],
        (err, row) => {
            if (err) {
                console.error(`[ERROR] Failed to query workout link for day ${dayNum}:`, err);
                return res.status(500).json({ 
                    error: 'Database query failed', 
                    message: err.message 
                });
            }
            
            const link = row ? row.link : '';
            console.log(`[DEBUG] Workout link for day ${dayNum}:`, link || 'No link found');
            res.json({ link });
        }
    );
});

// Save workout link for a specific day
app.post('/api/workout-link', (req, res) => {
    const { day, link } = req.body;
    
    console.log(`[DEBUG] POST /api/workout-link - Request received for day ${day}`);
    
    // Input validation
    if (!day || link === undefined) {
        console.error(`[ERROR] Missing required fields:`, { day: !!day, link: link !== undefined });
        return res.status(400).json({ 
            error: 'Missing required fields', 
            message: 'day and link are required',
            received: { day, hasLink: link !== undefined }
        });
    }
    
    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 5) {
        console.error(`[ERROR] Invalid day parameter: ${day}`);
        return res.status(400).json({ 
            error: 'Invalid day parameter', 
            message: 'Day must be 1-5',
            received: day
        });
    }
    
    if (typeof link !== 'string') {
        console.error(`[ERROR] Invalid link type:`, typeof link);
        return res.status(400).json({ 
            error: 'Invalid link type', 
            message: 'Link must be a string',
            received: typeof link
        });
    }
    
    console.log(`[DEBUG] Saving workout link for day ${dayNum}: ${link}`);
    
    db.run(
        'INSERT OR REPLACE INTO workout_links (day, link) VALUES (?, ?)',
        [dayNum, link],
        (err) => {
            if (err) {
                console.error(`[ERROR] Failed to save workout link for day ${dayNum}:`, err);
                return res.status(500).json({ 
                    error: 'Failed to save workout link', 
                    message: err.message 
                });
            }
            
            console.log(`[DEBUG] Workout link saved successfully for day ${dayNum}`);
            res.json({ success: true });
        }
    );
});

// Serve the main HTML file
// Health check endpoint for Docker
app.get('/health', (req, res) => {
    // Check database connection
    db.get('SELECT 1', (err) => {
        if (err) {
            console.error('[ERROR] Health check failed - database error:', err.message);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Database connection failed',
                timestamp: new Date().toISOString()
            });
        }
        
        res.status(200).json({ 
            status: 'healthy', 
            message: 'Application is running normally',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server with enhanced error handling
app.listen(PORT, () => {
    console.log(`[DEBUG] Server running on http://localhost:${PORT}`);
    console.log(`[DEBUG] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[DEBUG] Process ID: ${process.pid}`);
});

// Enhanced graceful shutdown
process.on('SIGINT', () => {
    console.log('[DEBUG] Received SIGINT, shutting down gracefully...');
    
    db.close((err) => {
        if (err) {
            console.error('[ERROR] Error closing database:', err.message);
        } else {
            console.log('[DEBUG] Database connection closed successfully');
        }
        
        console.log('[DEBUG] Server shutdown complete');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('[ERROR] Uncaught Exception:', err);
    console.error('[ERROR] Stack trace:', err.stack);
    
    // Close database connection before exiting
    db.close(() => {
        process.exit(1);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Rejection at:', promise);
    console.error('[ERROR] Reason:', reason);
});