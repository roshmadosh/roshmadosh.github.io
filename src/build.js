const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

const POSTS_DIR = path.join(__dirname, '../posts');
const SRC_DIR = path.join(__dirname, '../src');
const PUBLIC_DIR = path.join(__dirname, '../docs');

const CLOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const TAG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;

// Setup public directory
fs.emptyDirSync(PUBLIC_DIR);

// Copy assets (images and css) from src to public
const assetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.css'];
fs.copySync(SRC_DIR, PUBLIC_DIR, {
  filter: (src) => {
    if (fs.statSync(src).isDirectory()) return true;
    return assetExtensions.includes(path.extname(src).toLowerCase());
  }
});

const RAINING_CATS_AND_DOGS_IMG = `
    <!-- Imported from: docs/raining-cats-and-dogs.jpg -->
    <img src="raining-cats-and-dogs.jpg" alt="Raining cats and dogs" style="width: 100%; height: auto; margin-bottom: 20px; border-radius: 8px;">
    <!-- End of import from: docs/raining-cats-and-dogs.jpg -->
`;

marked.use({
  renderer: {
    codespan({ text }) {
      return `<code style="background-color: var(--ts-surface); color: var(--ts-highlight); padding: 2px 4px; border-radius: 4px; font-family: 'Space Grotesk', monospace;">${text}</code>`;
    },
    image({ href, title, text }) {
      const isPhoneShot = path.basename(href, path.extname(href)).endsWith('phoneshot');
      const className = isPhoneShot ? ' class="phone-shot"' : '';
      const style = isPhoneShot ? '' : ' style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;"';
      return `
        <a href="${href}" target="_blank">
          <img src="${href}" alt="${text}" title="${title || ''}"${className}${style}>
        </a>`;
    }
  }
});

const posts = [];

function getPreview(markdown, length = 140) {
  // Remove markdown headers, images, and links
  let text = markdown
    .replace(/^#+.*$/gm, '') // Headers
    .replace(/!\[.*?\]\(.*?\)/g, '') // Images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links (keep text)
    .replace(/[*_~`]/g, '') // Simple formatting
    .replace(/\s+/g, ' ') // Whitespace normalization
    .trim();
  
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

function generateHTML(title, content, meta = {}) {
  const tagsHtml = meta.tags ? String(meta.tags).split(',').map(tag => `<a href="blog.html#${tag.trim()}" class="tag">${tag.trim()}</a>`).join('') : '';
  const formattedDate = meta.date ? new Date(meta.date).toISOString().split('T')[0] : '';
  const dateHtml = formattedDate ? `<div class="post-meta">
    <span class="meta-item">${CLOCK_ICON} ${formattedDate}</span>
    ${tagsHtml ? `<span class="meta-item">${TAG_ICON} ${tagsHtml}</span>` : ''}
  </div>` : '';

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
        <nav>
            <a href="blog.html">Posts</a>
        </nav>
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
      tags: meta.tags ? String(meta.tags).split(',').map(t => t.trim()) : [],
      preview: getPreview(markdown)
    });
  }
});

// Generate blog page
const postListHtml = posts
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(post => `
    <li class="post-item" data-tags="${post.tags.join(',')}">
      <a href="${post.url}" class="post-title">${post.title}</a>
      <div class="post-meta">
        <span class="meta-item">${CLOCK_ICON} ${post.date}</span>
        <span class="meta-item">
          ${TAG_ICON}
          ${post.tags.map(tag => `<a href="#${tag}" class="tag">${tag}</a>`).join('')}
        </span>
      </div>
      <p class="post-preview">${post.preview}</p>
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
        <nav>
            <a href="blog.html">posts</a>
        </nav>
    </header>
    <main>
        <h2>Blog Posts</h2>
        <ul class="post-list" id="post-list">
            ${postListHtml}
        </ul>
    </main>
    <script>
        const postItems = document.querySelectorAll('.post-item');

        function filterByTag(tag) {
            postItems.forEach(item => {
                const tags = item.dataset.tags.split(',');
                if (tags.includes(tag)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            document.querySelectorAll('.tag').forEach(t => {
                if (t.textContent === tag) {
                    t.classList.add('active');
                } else {
                    t.classList.remove('active');
                }
            });
        }

        function clearFilter() {
            postItems.forEach(item => item.style.display = 'block');
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) {
                const tag = e.target.textContent;
                const currentHash = decodeURIComponent(window.location.hash.slice(1));
                if (tag === currentHash) {
                    e.preventDefault();
                    clearFilter();
                }
            }
        });

        const handleHash = () => {
            const hash = decodeURIComponent(window.location.hash.slice(1));
            if (hash) {
                filterByTag(hash);
            } else {
                clearFilter();
            }
        };

        window.addEventListener('load', handleHash);
        window.addEventListener('hashchange', handleHash);
    </script>
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
        <h1><a href="index.html">Hiroshi's Blog</a></h1>
        <nav>
            <a href="blog.html">posts</a>
        </nav>
    </header>
    <main>
        <section class="intro">
            <p>An ode to ye ol' personal blog site. No socials, just random crap I feel like writing about.</p>
        </section>
        
	<section class="content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2em;">
	    ${RAINING_CATS_AND_DOGS_IMG}
	    <div class="actions">
		<a href="blog.html" class="stuff-i-wrote-btn">
		    <span>Stuff I Wrote</span>
		    <svg class="pencil-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
		    </svg>
		</a>
	    </div>
	</section>
    </main>
</body>
</html>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), indexHtml);

