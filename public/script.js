document.addEventListener('DOMContentLoaded', () => {
    fetchArticles();
});

async function fetchArticles() {
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();

        if (articles.length > 0) {
            const container = document.getElementById('dynamic-articles-list');
            container.innerHTML = ''; // Clear container

            articles.forEach(article => {
                const articleElement = document.createElement('article');
                articleElement.className = 'blog-post mb-5 p-4 bg-white border rounded shadow-sm';
                articleElement.innerHTML = `
                    <span class="badge bg-dark text-warning mb-2">Reader Submission</span>
                    <h2 class="blog-post-title mb-1 h3 text-dark">${escapeHtml(article.title)}</h2>
                    <p class="blog-post-meta text-muted small fst-italic">${article.date} by ${escapeHtml(article.author)}</p>
                    <p>${escapeHtml(article.content)}</p>
                    <button onclick="deleteArticle(${article.id})" class="btn btn-sm btn-outline-danger mt-2">Delete Story</button>
                    
                `;
                container.appendChild(articleElement);
            });
        }
    } catch (error) {
        console.error('Error loading stored articles:', error);
    }
}

// Simple helper to prevent HTML injection security issues
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}