# The Classic Motor & Tech Gazette

A full-stack automotive blog application built with Node.js, Express, JavaScript, HTML, CSS, and Bootstrap.

The application allows users to publish and manage automotive stories through a complete CRUD system. Articles are stored locally in a JSON file and dynamically displayed on the website.

## Features

* Create and publish new articles
* Read full articles in a Bootstrap modal
* Edit and update existing articles
* Delete articles with a confirmation prompt
* Dynamically load articles from a JSON data file
* Display reusable notification messages with automatic dismissal
* Track article publication and update dates
* Basic HTML escaping for safer content rendering

## Technologies Used

* Node.js
* Express.js
* JavaScript
* HTML5
* CSS3
* Bootstrap 5
* JSON
* Git and GitHub

## Project Structure

```text
my-express-project/
│
├── data/
│   └── articles.json
│
├── public/
│   ├── script.js
│   └── style.css
│
├── views/
│   └── index.html
│
├── server.js
├── package.json
└── README.md
```

### Folder and File Overview

* `server.js` - Configures the Express server and handles API routes.
* `data/articles.json` - Stores article data locally in JSON format.
* `public/script.js` - Handles frontend logic, API requests, CRUD operations, and user notifications.
* `public/style.css` - Contains the custom styling for the website.
* `views/index.html` - Contains the main structure and layout of the website.
* `package.json` - Contains project dependencies and configuration.
* `README.md` - Provides documentation for the project.

## Installation

To run this project locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/MastareeColnel/Car-Blog-website.git
```

### 2. Navigate to the project directory

```bash
cd Car-Blog-website
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the application

```bash
node server.js
```

The application will start on:

```text
http://localhost:3000
```

Open the address in your browser to use the application.

## How the Application Works

The frontend communicates with the Express backend through API requests.

```text
User Interface
      |
      v
JavaScript (script.js)
      |
      v
Express API (server.js)
      |
      v
articles.json
```

The application uses the following CRUD operations:

* `POST /api/articles` - Create a new article
* `GET /api/articles` - Retrieve all articles
* `GET /api/articles/:id` - Retrieve a single article
* `PUT /api/articles/:id` - Update an article
* `DELETE /api/articles/:id` - Delete an article


