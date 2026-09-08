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

