const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

const POSTS_DIR = path.join(__dirname, '../posts');
const SRC_DIR = path.join(__dirname, '../src');
const PUBLIC_DIR = path.join(__dirname, '../docs');

// Setup public directory
fs.emptyDirSync(PUBLIC_DIR);
fs.copySync(path.join(SRC_DIR, 'style.css'), path.join(PUBLIC_DIR, 'style.css'));

const posts = [];

function generateHTML(title, content, meta = {}) {
  const tagsHtml = meta.tags ? String(meta.tags).split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('') : '';
  const formattedDate = meta.date ? new Date(meta.date).toISOString().split('T')[0] : '';
  const dateHtml = formattedDate ? `<div class="post-meta">${formattedDate} ${tagsHtml}</div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1><a href="index.html">Hiroshi's Blog</a></h1>
    </header>
    <main>
        <article>
            <h1>${title}</h1>
            ${dateHtml}
            <div class="content">${content}</div>
        </article>
    </main>
</body>
</html>`;
}

// Process posts
const files = fs.readdirSync(POSTS_DIR);
files.forEach(file => {
  if (path.extname(file) === '.md') {
    const filePath = path.join(POSTS_DIR, file);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    
    // Simple frontmatter parsing
    const parts = rawContent.split('---');
    let meta = {};
    let markdown = rawContent;
    
    if (parts.length >= 3) {
      meta = yaml.load(parts[1]);
      markdown = parts.slice(2).join('---').trim();
    }
    
    const htmlContent = marked(markdown);
    const finalHtml = generateHTML(meta.title || file, htmlContent, meta);
    
    const outputFileName = file.replace('.md', '.html');
    fs.writeFileSync(path.join(PUBLIC_DIR, outputFileName), finalHtml);
    
    posts.push({
      title: meta.title || file,
      date: meta.date ? new Date(meta.date).toISOString().split('T')[0] : 'No date',
      url: outputFileName,
      tags: meta.tags ? String(meta.tags).split(',').map(t => t.trim()) : []
    });
  }
});

// Generate blog page
const postListHtml = posts
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(post => `
    <li class="post-item">
      <a href="${post.url}">${post.title}</a>
      <span class="post-date">${post.date}</span>
      <div style="margin-top: 5px;">
        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </li>`)
  .join('');

const blogHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - Hiroshi's Blog</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1><a href="index.html">Hiroshi's Blog</a></h1>
        <p>This is where I write about stuff.</p>
    </header>
    <main>
        <h2>Blog Posts</h2>
        <ul class="post-list">
            ${postListHtml}
        </ul>
    </main>
</body>
</html>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'blog.html'), blogHtml);

// Generate home page
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hiroshi's Blog</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Hiroshi's Blog</h1>
    </header>
    <main>
        <section class="intro">
            <p>Welcome to my personal corner of the web. I write about stuff I learned on random topics, but mostly related to CS and Turkish language. </p>
        </section>
        
        <a href="blog.html" class="stuff-i-wrote-btn">
            <span>Stuff I Wrote</span>
            <svg class="pencil-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
        </a>
    </main>
</body>
</html>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), indexHtml);

