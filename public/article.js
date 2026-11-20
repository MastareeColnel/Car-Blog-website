
 // Get the article ID from the current URL
const articleId = window.location.pathname.split('/').pop();


// Configure article sharing links
function setupArticleSharing(article) {
    const articleUrl = window.location.href;
    const articleTitle = article.title;

    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(articleTitle);

    // WhatsApp sharing
    document.getElementById('share-whatsapp').href =
        `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

    // Facebook sharing
    document.getElementById('share-facebook').href =
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    // LinkedIn sharing
    document.getElementById('share-linkedin').href =
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    // Telegram sharing
    document.getElementById('share-telegram').href =
        `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

    // Copy article link
    document.getElementById('copy-article-link')
        .addEventListener('click', async () => {
            const feedback = document.getElementById('copy-link-feedback');

            try {
                await navigator.clipboard.writeText(articleUrl);
                feedback.textContent = 'Article link copied successfully.';
            } catch (error) {
                feedback.textContent = 'Unable to copy the link. Please copy it from your browser address bar.';
            }
        });
}


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

// Display all article images in the gallery
const imageGallery = document.getElementById('article-image-gallery');

const imageUrls = article.image_urls?.length
    ? article.image_urls
    : (article.image_url ? [article.image_url] : []);

imageUrls.forEach((url, index) => {
    const image = document.createElement('img');

    image.src = url;
    image.alt = `${article.title} - Image ${index + 1}`;
    image.className = 'article-gallery-image rounded';

    imageGallery.appendChild(image);
});

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
        // Configure social sharing for this article
        setupArticleSharing(article);

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
