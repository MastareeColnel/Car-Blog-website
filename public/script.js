// Store the articles currently loaded from PostgreSQL
let allArticles = [];

// --------------------------------------------------
// Start the homepage functionality
// Loads articles and connects the search box.
// --------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

    // Load the articles
    fetchArticles();

    // Connect the search box
    const searchInput =
        document.getElementById('articleSearch');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchArticles(searchInput.value);
        });
    }

    // Connect the category filter
    const categoryFilter =
        document.getElementById('categoryFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            searchArticles(searchInput ? searchInput.value : '');
        });
    }
});


// --------------------------------------------------
// Search and filter articles
// Filters articles by text and category.
// --------------------------------------------------

function searchArticles(searchTerm) {

    // Convert the search term to lowercase
    const term = searchTerm.toLowerCase().trim();

    // Get the selected category
    const selectedCategory =
        document.getElementById('categoryFilter').value;

    // Filter the complete article list
    const matchingArticles = allArticles.filter(article => {

        // Prepare searchable article fields
        const title =
            String(article.title || '').toLowerCase();

        const author =
            String(article.author || '').toLowerCase();

        const content =
            String(article.content || '').toLowerCase();

        // Check whether the article matches the search
        const matchesSearch =
            !term ||
            title.includes(term) ||
            author.includes(term) ||
            content.includes(term);

        // Check whether the article matches the category
        const matchesCategory =
            !selectedCategory ||
            article.category === selectedCategory;

        // Article must pass both filters
        return matchesSearch && matchesCategory;
    });

    // Display the filtered articles
    displayArticles(matchingArticles);
}

// --------------------------------------------------
// Fetch and display all articles
// Loads articles from PostgreSQL.
// --------------------------------------------------

async function fetchArticles() {
    try {
        const response = await fetch('https://car-blog-website.onrender.com/api/articles');

        if (!response.ok) {
            throw new Error('Failed to fetch articles.');
        }

        const articles = await response.json();

        // Keep a copy of the articles for searching
        allArticles = articles;

        // Display the articles on the page
        displayArticles(articles);

    } catch (error) {
        console.error('Error loading stored articles:', error);

        const container =
            document.getElementById('dynamic-articles-list');

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
// Search and filter articles
// Filters articles by search term and category.
// --------------------------------------------------

function searchArticles(searchTerm) {

    // Convert the search term to lowercase
    const term = searchTerm.toLowerCase().trim();

    // Get the selected category
    const selectedCategory =
        document.getElementById('categoryFilter').value;

    // Find articles matching both filters
    const matchingArticles = allArticles.filter(article => {

        const title =
            String(article.title || '').toLowerCase();

        const author =
            String(article.author || '').toLowerCase();

        const content =
            String(article.content || '').toLowerCase();

        const category =
            String(article.category || '');

        // Check whether the article matches the search
        const matchesSearch =
            !term ||
            title.includes(term) ||
            author.includes(term) ||
            content.includes(term);

        // Check whether the article matches the category
        const matchesCategory =
            !selectedCategory ||
            category === selectedCategory;

        // Article must pass both filters
        return matchesSearch && matchesCategory;
    });

    // Display the filtered articles
    displayArticles(matchingArticles);
}

// --------------------------------------------------
// Display articles
// Creates the article cards shown on the homepage.
// --------------------------------------------------

function displayArticles(articles) {

    // Find the article container
    const container =
        document.getElementById('dynamic-articles-list');
        // Find the result count element
    const resultCount =
     document.getElementById('articleResultCount');

    if (!container) {
        console.error('Article container not found.');
        return;
    
    }

    // Update the number of displayed articles
    if (resultCount) {
        resultCount.textContent =
        `Showing ${articles.length} ${articles.length === 1 ? 'story' : 'stories'}`;
}

    // Clear the current article list
    container.innerHTML = '';

    // Show a message when there are no matching articles
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="alert alert-secondary">
                No matching articles found.
            </div>
        `;
        return;
    }

    // Create an article card for each article
    articles.forEach(article => {

        const articleElement =
            document.createElement('article');

        articleElement.className =
            'blog-post mb-5 p-4 bg-white border rounded shadow-sm';

        articleElement.innerHTML = `
            <span class="badge bg-dark text-warning mb-2">
                  Reader Submission
            </span>

    <!-- Article category -->
    <span class="badge bg-secondary mb-2 ms-1">
        ${escapeHtml(article.category || 'Uncategorized')}
    </span>

    <!-- Article image -->
   ${
    article.image_url
        ? `
            <img
                src="${escapeHtml(article.image_url)}"
                alt="${escapeHtml(article.title)}"
                class="img-fluid rounded mb-3 w-100"
                style="max-height: 320px; object-fit: cover;">
        `
        : ''
}

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
                     ${escapeHtml(
                    article.content.length > 220
                    ? article.content.substring(0, 220) + '...'
                    : article.content
                         )}
                    </p>

            <div class="mt-3">

                <a
                    href="/articles/${article.id}"
                    class="btn btn-sm btn-primary me-2">
                    Read Story
                </a>

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
            throw new Error(
                result.error || 'Failed to delete article.'
            );
        }

        // Display success message
        showMessage(
            'articlesMessage',
            'Article deleted successfully!'
        );

        // Refresh the article list
        fetchArticles();

    } catch (error) {
        console.error('Error deleting article:', error);

        showMessage(
            'articlesMessage',
            `Unable to delete article: ${error.message}`,
            'danger'
        );
    }
}

// --------------------------------------------------
// Edit an article
// --------------------------------------------------

async function editArticle(articleId) {

    try {
        const response =
            await fetch(`/api/articles/${articleId}`);

        const article = await response.json();

        if (!response.ok) {
            throw new Error(
                article.error || 'Article not found.'
            );
        }

        // Fill the edit form with the article data
document.getElementById('editArticleId').value =
    article.id;

document.getElementById('editTitle').value =
    article.title;

document.getElementById('editAuthor').value =
    article.author;

// Set the existing article category
document.getElementById('editCategory').value =
    article.category || '';

// Set the existing article image URL
document.getElementById('editImageUrl').value =
    article.image_url || '';

document.getElementById('editContent').value =
    article.content;

        // Open the edit modal
        const modalElement =
            document.getElementById('editArticleModal');

        const modal =
            new bootstrap.Modal(modalElement);

        modal.show();

    } catch (error) {
        console.error(
            'Error loading article for editing:',
            error
        );

        alert(
            `Unable to load article for editing: ${error.message}`
        );
    }
}

// --------------------------------------------------
// Save, update an article
// --------------------------------------------------

document
    .getElementById('editArticleForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        const articleId =
            document.getElementById('editArticleId').value;

        const title =
            document.getElementById('editTitle').value;

        const author =
            document.getElementById('editAuthor').value;

        const content =
            document.getElementById('editContent').value;

        const category =
            document.getElementById('editCategory').value;

        // Get the edited article image URL
        const image_url =
            document.getElementById('editImageUrl').value;

        try {
            const response =
                await fetch(`/api/articles/${articleId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        author,
                        content,
                        category,
                        image_url
                    })
                });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || 'Failed to update article.'
                );
            }

            // Display success message inside the edit modal
            showMessage(
                'editArticleMessage',
                'Article updated successfully!'
            );

            const modalElement =
                document.getElementById('editArticleModal');

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            // Wait briefly so the user can see the success message
            setTimeout(() => {
                modal.hide();
                fetchArticles();
            }, 1500);

        } catch (error) {
            console.error(
                'Error updating article:',
                error
            );

            showMessage(
                'editArticleMessage',
                `Unable to update article: ${error.message}`,
                'danger'
            );
        }
    });

// --------------------------------------------------
// Submit a new article
// Sends form data to the API without leaving the homepage.
// --------------------------------------------------

document
    .getElementById('articleForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        const title =
            document.getElementById('title').value;

        const author =
            document.getElementById('author').value;

        const content =
            document.getElementById('content').value;

        const category =
            document.getElementById('articleCategory').value;

        try {
            const response =
                await fetch('/api/articles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        author,
                        content,
                        category
                    })
                });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || 'Failed to publish article.'
                );
            }

            // Display success message on the page
            showMessage(
                'articleMessage',
                'Article published successfully!'
            );

            // Clear the form
            document
                .getElementById('articleForm')
                .reset();

            // Refresh the article list
            fetchArticles();

        } catch (error) {
            console.error(
                'Error publishing article:',
                error
            );

            alert(
                `Unable to publish article: ${error.message}`
            );
        }
    });

// --------------------------------------------------
// Display reusable notification messages
// Automatically removes messages after a few seconds.
// --------------------------------------------------

function showMessage(
    containerId,
    message,
    type = 'success'
) {

    const messageContainer =
        document.getElementById(containerId);

    messageContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close">
            </button>
        </div>
    `;

    // Automatically remove the message after 3 seconds
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

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