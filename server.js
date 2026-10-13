// Load password hashing
const bcrypt = require('bcrypt');

// Load session management
const session = require('express-session');

// Load required modules
const express = require('express');

// Enable cross-origin requests
const cors = require('cors');

const path = require('path');
const pool = require('./config/db');

// Create the Express application
const app = express();

// Allow requests from other origins
app.use(cors());

const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Parse JSON request bodies
app.use(express.json());

// Serve CSS, JavaScript, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------
// Pages
// --------------------------------------------------

// Configure sessions for authenticated users
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }
    })
);

// Main homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Admin login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Handle admin login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const result = await pool.query(
            'SELECT id, username, password_hash FROM users WHERE username = $1',
            [username]
        );

        // Reject unknown usernames
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid username or password.'
            });
        }

        const user = result.rows[0];

        // Compare the submitted password with the stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        // Reject an incorrect password
        if (!passwordMatches) {
            return res.status(401).json({
                error: 'Invalid username or password.'
            });
        }

        // Store the authenticated user in the session
        req.session.userId = user.id;
        req.session.username = user.username;

        // Confirm successful login
        res.json({
            message: 'Login successful.'
        });
    } catch (error) {
        console.error('Login error:', error.message);

        res.status(500).json({
            error: 'Unable to process login.'
        });
    }
});


// Protect routes that require an authenticated admin
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            error: 'Authentication required.'
        });
    }

    next();
}

// Check whether an admin session is active
app.get('/api/auth-status', (req, res) => {
    res.json({
        authenticated: Boolean(req.session.userId),
        username: req.session.username || null
    });
});


// Log out the current admin and destroy the session
app.post('/api/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error.message);
            return res.status(500).json({
                error: 'Unable to log out.'
            });
        }

        // Remove the session cookie from the browser
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful.' });
    });
});


// --------------------------------------------------
// Article page
// --------------------------------------------------

// Fetch one article by ID
app.get('/api/articles/:id', async (req, res) => {
    try {
        // Get the article ID from the URL
        const articleId = req.params.id;

        // Find the article in PostgreSQL
        const result = await pool.query(
            `
            SELECT
                id,
                title,
                author,
                content,
                date,
                updated_at,
                category,
                image_url
            FROM articles
            WHERE id = $1
            `,
            [articleId]
        );

        // Article does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Article not found.'
            });
        }

        // Convert database field name for the frontend
        const article = {
            ...result.rows[0],
            updatedAt: result.rows[0].updated_at,
            category: result.rows[0].category,
            image_url: result.rows[0].image_url
        };

        // Send the article to the frontend
        res.json(article);

    } catch (error) {
        console.error('Error fetching article:', error);

        res.status(500).json({
            error: 'Unable to load article.'
        });
    }
});

// Display the page for a single article
app.get('/articles/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'article.html'));
});

// --------------------------------------------------
// API: GET all articles
// --------------------------------------------------

app.get('/api/articles', async (req, res) => {
    try {
      
 // Fetch all articles including their categories and images
const result = await pool.query(`
    SELECT
        id,
        title,
        author,
        content,
        date,
        updated_at,
        category,
        image_url
    FROM articles
    ORDER BY date DESC
`);
        
// Convert database field names to the names used by the frontend
const articles = result.rows.map(article => ({
    ...article,
    updatedAt: article.updated_at,
    category: article.category,
    image_url: article.image_url
}));

    // Send articles to the frontend
    res.json(articles);

    } catch (error) {
        console.error('Error fetching articles:', error);

        res.status(500).json({
            error: 'Unable to load articles.'
        });
    }
});

// --------------------------------------------------
// API: POST a new article
// --------------------------------------------------

// Create a new article — admin access required
app.post('/api/articles', requireAuth, async (req, res) => {
    try {
        const { title, author, content, category, image_url } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                error: 'Title and content are required.'
            });
        }

        // Generate a large unique ID
        const articleId = Date.now().toString();

        // Insert the new article into PostgreSQL
const result = await pool.query(
    `
    INSERT INTO articles
        (id, title, author, content, date, category, image_url)
    VALUES
        ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6)
    RETURNING
        id,
        title,
        author,
        content,
        date,
        updated_at,
        category,
        image_url
    `,
    [
        articleId,
        title.trim(),
        author?.trim() || 'Anonymous Curator',
        content.trim(),
        category,
        image_url?.trim() || null
    ]
);

// Convert database field names for the frontend
const article = {
    ...result.rows[0],
    updatedAt: result.rows[0].updated_at,
    category: result.rows[0].category,
    image_url: result.rows[0].image_url
};

        // Return the newly created article
        res.status(201).json({
            success: true,
            message: 'Article created successfully.',
            article
        });

    } catch (error) {
        console.error('Error creating article:', error);

        res.status(500).json({
            error: 'Unable to create article.'
        });
    }
});

// --------------------------------------------------
// API: PUT (update) an existing article
// --------------------------------------------------

// Update an article — admin access required
app.put('/api/articles/:id', requireAuth, async (req, res) => {
    try {
        const articleId = req.params.id;
        const { title, author, content, category, image_url } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                error: 'Title and content are required.'
            });
        }

        // Update the article in PostgreSQL
        const result = await pool.query(
            `
            UPDATE articles
            SET
                title = $1,
                author = $2,
                content = $3,
                category = $4,
                image_url = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING
                id,
                title,
                author,
                content,
                date,
                updated_at,
                category,
                image_url
            `,
            [
                title.trim(),
                author?.trim() || 'Anonymous Curator',
                content.trim(),
                category,
                image_url?.trim() || null,
                articleId
            ]
        );

        // Article does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Article not found.'
            });
        }

        // Convert database field name for the frontend
        const article = {
            ...result.rows[0],
            updatedAt: result.rows[0].updated_at,
            category: result.rows[0].category,
            image_url: result.rows[0].image_url
        };

        // Return the updated article
        res.json({
            success: true,
            message: 'Article updated successfully.',
            article
        });

    } catch (error) {
        console.error('Error updating article:', error);

        res.status(500).json({
            error: 'Unable to update article.'
        });
    }
});

// --------------------------------------------------
// API: DELETE an article
// --------------------------------------------------

// Delete an article — admin access required
app.delete('/api/articles/:id', requireAuth, async (req, res) => {
    try {
        const articleId = req.params.id;

        // Delete the article from PostgreSQL
        const result = await pool.query(
            `
            DELETE FROM articles
            WHERE id = $1
            RETURNING id
            `,
            [articleId]
        );

        // Article does not exist
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Article not found.'
            });
        }

        // Confirm successful deletion
        res.json({
            success: true,
            message: 'Article deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting article:', error);

        res.status(500).json({
            error: 'Unable to delete article.'
        });
    }
});

// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found.'
    });
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, () => {
    console.log(
        `Server is running smoothly at http://localhost:${PORT}`
    );
});