const express = require('express');
const path = require('path');
const fs = require('fs'); // Node.js File System module to save data
const app = express();

const PORT = process.env.PORT || 3000;

// 1. Middleware to parse incoming form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Serve static assets (CSS, client-side JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Path to a local JSON file where we will store submitted articles
const dataFilePath = path.join(__dirname, 'data', 'articles.json');

// Helper function to read saved articles
const getStoredArticles = () => {
  if (!fs.existsSync(dataFilePath)) {
    return [];
  }
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(fileData || '[]');
};

// 3. Route to serve your main index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 4. API Route to GET all stored articles (so client-side JS can load them dynamically)
app.get('/api/articles', (req, res) => {
  const articles = getStoredArticles();
  res.json(articles);
});

// 5. API Route to POST (save) new content submitted from the website
app.post('/api/articles', (req, res) => {
  const { title, author, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required!' });
  }

  const newArticle = {
    id: Date.now(),
    title,
    author: author || 'Anonymous Curator',
    content,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  };

  //6. Add a route to handle deletion from the JSON file
  app.delete('/api/articles/:id', (req, res) => {
  const articleId = Number(req.params.id);
  let articles = getStoredArticles();
  articles = articles.filter(art => art.id !== articleId);
  fs.writeFileSync(dataFilePath, JSON.stringify(articles, null, 2));
  res.json({ success: true });
});

  // Read existing data, push new article, and write back to file
  const articles = getStoredArticles();
  articles.unshift(newArticle); // Add to the beginning of the list

  // Ensure the 'data' directory exists
  const dataDir = path.dirname(dataFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(dataFilePath, JSON.stringify(articles, null, 2));

  // Redirect back to home or send JSON success response
  res.redirect('/');
});

// 6. Start the server
app.listen(PORT, () => {
  console.log(`Server is running smoothly at http://localhost:${PORT}`);
});