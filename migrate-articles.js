// Load environment variables
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function migrateArticles() {
    try {
        // Read the existing JSON file
        const filePath = path.join(__dirname, 'data', 'articles.json');
        const articles = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Insert each article into PostgreSQL
        for (const article of articles) {
            await pool.query(
                `
                INSERT INTO articles
                    (id, title, author, content, date, updated_at)
                VALUES
                    ($1, $2, $3, $4, $5, $6)
                `,
                [
                    article.id,
                    article.title,
                    article.author,
                    article.content,
                    article.date,
                    article.updatedAt || null
                ]
            );
        }

        console.log(`${articles.length} articles migrated successfully!`);
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

migrateArticles();