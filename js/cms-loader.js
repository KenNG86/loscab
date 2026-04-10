/**
 * CMS Loader for Los Cab Website
 * Fetches dynamic content from JSON files managed by Decap CMS.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Handle Netlify Identity Redirect
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }

  // 2. Load Dynamic Content
  const cmsElements = document.querySelectorAll('[data-cms-id]');
  const cmsLists = document.querySelectorAll('[data-cms-list]');
  
  // Combine unique file names to fetch
  const filesToFetch = new Set();
  cmsElements.forEach(el => filesToFetch.add(el.getAttribute('data-cms-file')));
  cmsLists.forEach(el => filesToFetch.add(el.getAttribute('data-cms-list')));

  filesToFetch.forEach(async (fileName) => {
    if (!fileName) return;
    try {
      const response = await fetch(`/data/${fileName}.json`);
      if (!response.ok) return;
      const data = await response.json();

      // Handle individual elements
      cmsElements.forEach(el => {
        if (el.getAttribute('data-cms-file') === fileName) {
          const key = el.getAttribute('data-cms-id');
          if (data[key]) {
            if (key.includes('image')) {
              el.src = data[key];
            } else if (key.includes('welcome') || key.includes('body')) {
              el.innerHTML = data[key];
            } else {
              el.textContent = data[key];
            }
          }
        }
      });

      // Handle lists (e.g., news articles)
      cmsLists.forEach(listEl => {
        if (listEl.getAttribute('data-cms-list') === fileName) {
          const property = listEl.getAttribute('data-cms-property') || 'articles';
          const items = data[property];
          if (Array.isArray(items)) {
            listEl.innerHTML = ''; // Clear static items
            items.forEach(item => {
              const card = document.createElement('div');
              card.className = 'blog-card';
              card.innerHTML = `
                <div class="blog-card-img-wrap">
                  <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="blog-card-body">
                  <div class="blog-date">${item.date}</div>
                  <div class="blog-title">${item.title}</div>
                  <p class="blog-excerpt">${item.summary}</p>
                  <a href="${item.link}" class="card-link">Read More →</a>
                </div>
              `;
              listEl.appendChild(card);
            });
          }
        }
      });
    } catch (error) {
      console.error(`Error loading CMS content for ${fileName}:`, error);
    }
  });
});
