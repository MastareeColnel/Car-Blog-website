const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve CSS, JavaScript, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------------------
// Data file
// --------------------------------------------------

const dataDir = path.join(__dirname, 'data');
const dataFilePath = path.join(dataDir, 'articles.json');

// Make sure the data directory and JSON file exist
const ensureDataFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, '[]', 'utf8');
  }
};

// --------------------------------------------------
// Helper functions
// --------------------------------------------------

// Read all stored articles
const getStoredArticles = () => {
  ensureDataFile();

  try {
    const fileData = fs.readFileSync(dataFilePath, 'utf8');

    return JSON.parse(fileData || '[]');
  } catch (error) {
    console.error('Error reading articles.json:', error);

    return [];
  }
};

// Save articles to the JSON file
const saveArticles = (articles) => {
  ensureDataFile();

  fs.writeFileSync(
    dataFilePath,
    JSON.stringify(articles, null, 2),
    'utf8'
  );
};


// --------------------------------------------------
// Pages
// --------------------------------------------------

// Main homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// --------------------------------------------------
// API: GET all articles
// --------------------------------------------------

app.get('/api/articles', (req, res) => {
  try {
    // Get all articles from the JSON file
    const articles = getStoredArticles();

    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);

    res.status(500).json({
      error: 'Unable to load articles.'
    });
  }
});

// --------------------------------------------------
// API: GET a single article
// --------------------------------------------------

app.get('/api/articles/:id', (req, res) => {
  try {
    const articleId = Number(req.params.id);

    // Check that the ID is a valid number
    if (Number.isNaN(articleId)) {
      return res.status(400).json({
        error: 'Invalid article ID.'
      });
    }

    const articles = getStoredArticles();

    // Find the article with the requested ID
    const article = articles.find(
      article => article.id === articleId
    );

    // Article does not exist
    if (!article) {
      return res.status(404).json({
        error: 'Article not found.'
      });
    }

    // Return the requested article
    res.json(article);

  } catch (error) {
    console.error('Error fetching article:', error);

    res.status(500).json({
      error: 'Unable to load article.'
    });
  }
});

// --------------------------------------------------
// API: POST a new article
// --------------------------------------------------

app.post('/api/articles', (req, res) => {
  try {
    const { title, author, content } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required.'
      });
    }

    const newArticle = {
      id: Date.now(),
      title: title.trim(),
      author: author?.trim() || 'Anonymous Curator',
      content: content.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    };

    const articles = getStoredArticles();

    // Add newest article to the beginning
    articles.unshift(newArticle);

    saveArticles(articles);

    res.status(201).json({
      success: true,
      message: 'Article created successfully.',
      article: newArticle
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

app.put('/api/articles/:id', (req, res) => {
  try {
    const articleId = Number(req.params.id);

    // Validate the article ID
    if (Number.isNaN(articleId)) {
      return res.status(400).json({
        error: 'Invalid article ID.'
      });
    }

    const { title, author, content } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required.'
      });
    }

    const articles = getStoredArticles();

    // Find the article
    const articleIndex = articles.findIndex(
      article => article.id === articleId
    );

    // Article doesn't exist
    if (articleIndex === -1) {
      return res.status(404).json({
        error: 'Article not found.'
      });
    }

    // Update the article
    const updatedArticle = {
      ...articles[articleIndex],
      title: title.trim(),
      author: author?.trim() || 'Anonymous Curator',
      content: content.trim(),
      updatedAt: new Date().toISOString()
    };

    // Replace the old article
    articles[articleIndex] = updatedArticle;

    // Save changes
    saveArticles(articles);

    // Return updated article
    res.json({
      success: true,
      message: 'Article updated successfully.',
      article: updatedArticle
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

app.delete('/api/articles/:id', (req, res) => {
  try {
    const articleId = Number(req.params.id);

    // Make sure the ID is a valid number
    if (Number.isNaN(articleId)) {
      return res.status(400).json({
        error: 'Invalid article ID.'
      });
    }

    const articles = getStoredArticles();

    // Find the article first
    const articleExists = articles.some(
      article => article.id === articleId
    );

    if (!articleExists) {
      return res.status(404).json({
        error: 'Article not found.'
      });
    }

    // Remove the article
    const updatedArticles = articles.filter(
      article => article.id !== articleId
    );

    saveArticles(updatedArticles);

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