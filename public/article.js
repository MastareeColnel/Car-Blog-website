
 // Get the article ID from the current URL
const articleId = window.location.pathname.split('/').pop();

// Fetch and display the requested article
async function loadArticle() {
    try {
        // Request the article from our API
        const response = await fetch(`/api/articles/${articleId}`);
        const article = await response.json();

        // Handle API errors
        if (!response.ok) {
            throw new Error(article.error || 'Article not found.');
        }

        // Display the article title
        document.getElementById('article-title').textContent = article.title;

        // Display the article image when available
        const articleImage = document.getElementById('article-image');

        if (article.image_url) {
            articleImage.src = article.image_url;
            articleImage.alt = article.title;
            articleImage.style.display = 'block';
        }

        // Display the article category
        document.getElementById('article-category').textContent =
            article.category || 'Uncategorized';

        // Build and display the article metadata
        const publishedDate = `Published ${article.date} by ${article.author}`;

        document.getElementById('article-meta').textContent = publishedDate;

        // Display the article content
        document.getElementById('article-content').textContent = article.content;

        // Add the last updated date when available
        if (article.updatedAt) {
            const updatedDate = new Date(article.updatedAt)
                .toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

            document.getElementById('article-meta').textContent +=
                ` Â· Last updated ${updatedDate}`;
        }

        // Update the browser tab title
        document.title = `${article.title} - Motor Gazette`;

    } catch (error) {
        // Log the error for debugging
        console.error('Error loading article:', error);

        // Display a friendly error message
        document.getElementById('article-title').textContent =
            'Article not found.';

        document.getElementById('article-meta').textContent = '';

        document.getElementById('article-content').textContent =
            'Unable to load this article. Please return to the stories page.';
    }
}

// Load the article when the page opens
loadArticle();
