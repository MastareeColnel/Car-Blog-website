document.addEventListener('DOMContentLoaded', () => {
    fetchArticles();
});

// --------------------------------------------------
// Fetch and display all articles
// --------------------------------------------------

async function fetchArticles() {
    try {
        const response = await fetch('/api/articles');

        if (!response.ok) {
            throw new Error('Failed to fetch articles.');
        }

        const articles = await response.json();

        const container = document.getElementById('dynamic-articles-list');

        if (!container) {
            console.error('Article container not found.');
            return;
        }

        container.innerHTML = '';

        // No articles
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="alert alert-secondary">
                    No articles have been published yet.
                </div>
            `;
            return;
        }

        articles.forEach(article => {
            const articleElement = document.createElement('article');

            articleElement.className =
                'blog-post mb-5 p-4 bg-white border rounded shadow-sm';

            articleElement.innerHTML = `
                <span class="badge bg-dark text-warning mb-2">
                    Reader Submission
                </span>

                <h2 class="blog-post-title mb-1 h3 text-dark">
                    ${escapeHtml(article.title)}
                </h2>

                <p class="blog-post-meta text-muted small fst-italic">
    Published ${escapeHtml(article.date)} by ${escapeHtml(article.author)}
    ${
        article.updatedAt
            ? `<br>Last updated ${escapeHtml(
                new Date(article.updatedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                })
            )}`
            : ''
    }
</p>

                <p>
                    ${escapeHtml(article.content)}
                </p>

                <div class="mt-3">
                    <button
                        onclick="viewArticle(${article.id})"
                        class="btn btn-sm btn-primary me-2">
                        Read Story
                    </button>

                    <button
                        onclick="editArticle(${article.id})"
                        class="btn btn-sm btn-outline-secondary me-2">
                        Edit
                    </button>

                    <button
                        onclick="deleteArticle(${article.id})"
                        class="btn btn-sm btn-outline-danger">
                        Delete Story
                    </button>
                </div>
            `;

            container.appendChild(articleElement);
        });

    } catch (error) {
        console.error('Error loading stored articles:', error);

        const container = document.getElementById('dynamic-articles-list');

        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    Unable to load articles. Please try again later.
                </div>
            `;
        }
    }
}

// --------------------------------------------------
// Delete an article
// --------------------------------------------------

async function deleteArticle(articleId) {
    const confirmed = confirm(
        'Are you sure you want to delete this article? This action cannot be undone.'
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/articles/${articleId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete article.');
        }

        // Display success message on the page
const messageContainer = document.getElementById('articlesMessage');

messageContainer.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        Article deleted successfully!
        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close">
        </button>
    </div>
`;

        // Wait briefly so the user can see the success message
    setTimeout(() => {
        modal.hide();
        fetchArticles();
        }, 1500);

    } catch (error) {
        console.error('Error deleting article:', error);

        alert(`Unable to delete article: ${error.message}`);
    }
}

// --------------------------------------------------
// View a single article
// Loads the article and displays it in the view modal.
// --------------------------------------------------

async function viewArticle(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}`);

        const article = await response.json();

        if (!response.ok) {
            throw new Error(article.error || 'Article not found.');
        }

        // Put the article title into the article title area.
document.getElementById('viewArticleTitle').textContent =
    article.title;

        // Put the author and date into the modal.
        document.getElementById('viewArticleMeta').textContent =
            `${article.date} by ${article.author}`;

        // Put the article content into the modal.
        document.getElementById('viewArticleContent').textContent =
            article.content;

        // Create the Bootstrap modal.
        const modalElement =
            document.getElementById('viewArticleModal');

        const modal =
            bootstrap.Modal.getOrCreateInstance(modalElement);

        // Display the modal.
        modal.show();

    } catch (error) {
        console.error('Error loading article:', error);

        alert(`Unable to load article: ${error.message}`);
    }
}

// --------------------------------------------------
// Edit an article
// --------------------------------------------------

async function editArticle(articleId) {
    try {
        const response = await fetch(`/api/articles/${articleId}`);

        const article = await response.json();

        if (!response.ok) {
            throw new Error(article.error || 'Article not found.');
        }

        document.getElementById('editArticleId').value = article.id;
        document.getElementById('editTitle').value = article.title;
        document.getElementById('editAuthor').value = article.author;
        document.getElementById('editContent').value = article.content;

        const modalElement = document.getElementById('editArticleModal');

        const modal = new bootstrap.Modal(modalElement);

        modal.show();

    } catch (error) {
        console.error('Error loading article for editing:', error);

        alert(`Unable to load article for editing: ${error.message}`);
    }
}

// --------------------------------------------------
// Save, Update an article
// --------------------------------------------------
document.getElementById('editArticleForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const articleId = document.getElementById('editArticleId').value;

    const title = document.getElementById('editTitle').value;
    const author = document.getElementById('editAuthor').value;
    const content = document.getElementById('editContent').value;

    try {
        const response = await fetch(`/api/articles/${articleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                author,
                content
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to update article.');
        }

        // Display success message inside the edit modal
const messageContainer = document.getElementById('editArticleMessage');

messageContainer.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        Article updated successfully!
        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close">
        </button>
    </div>
`;

        const modalElement = document.getElementById('editArticleModal');

        const modal = bootstrap.Modal.getInstance(modalElement);

        //modal.hide();

        fetchArticles();

    } catch (error) {
        console.error('Error updating article:', error);

        alert(`Unable to update article: ${error.message}`);
    }
});

// --------------------------------------------------
// Submit a new article
// Sends form data to the API without leaving the homepage.
// --------------------------------------------------

document.getElementById('articleForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = document.getElementById('content').value;

    try {
        const response = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                author,
                content
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to publish article.');
        }

        // Display success message on the page
const messageContainer = document.getElementById('articleMessage');

messageContainer.innerHTML = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        Article published successfully!
        <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close">
        </button>
    </div>
`;

        // Clear the form
        document.getElementById('articleForm').reset();

        // Refresh the article list
        fetchArticles();

    } catch (error) {
        console.error('Error publishing article:', error);

        alert(`Unable to publish article: ${error.message}`);
    }
});

// --------------------------------------------------
// Simple helper to prevent HTML injection
// --------------------------------------------------

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}