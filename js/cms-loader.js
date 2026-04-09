/**
 * CMS Loader for Los Cab Website
 * Dynamically loads content from JSON files managed by Decap CMS.
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

  // 2. Load Global Settings (Footer, Contact, etc.)
  loadCMSFile('settings');

  // 3. Load Page-Specific Content
  // Get current page name (e.g., "tennis" from "tennis.html")
  let path = window.location.pathname.split("/").pop();
  if (path === "" || path === "index.html") path = "index";
  else path = path.replace(".html", "");
  
  loadCMSFile(`pages/${path}`);

  /**
   * Helper to fetch and apply a CMS JSON file
   */
  async function loadCMSFile(fileName) {
    try {
      const response = await fetch(`/data/${fileName}.json`);
      if (!response.ok) return;
      const data = await response.json();

      // Apply individual elements
      document.querySelectorAll(`[data-cms-file="${fileName.split('/').pop()}"]`).forEach(el => {
        const id = el.getAttribute('data-cms-id');
        if (data[id]) {
          applyContent(el, data[id]);
        }
      });
      
      // Also check for elements without data-cms-file (fallback for global settings or nested files)
      document.querySelectorAll(`[data-cms-id]`).forEach(el => {
        const fileAttr = el.getAttribute('data-cms-file');
        const id = el.getAttribute('data-cms-id');
        if (!fileAttr || fileAttr === fileName.split('/').pop()) {
           if (data[id]) applyContent(el, data[id]);
        }
      });

    } catch (error) {
      console.warn(`CMS: Could not load data for ${fileName}`);
    }
  }

  /**
   * Apply content based on element type
   */
  function applyContent(el, content) {
    if (!content) return;

    // Handle Background Images
    if (el.getAttribute('data-cms-type') === 'bg') {
      el.style.backgroundImage = `url('${content}')`;
      return;
    }

    // Handle Meta Tags
    if (el.tagName === 'META') {
      if (el.getAttribute('name') === 'description') el.content = content;
      return;
    }
    if (el.tagName === 'TITLE') {
      document.title = content;
      return;
    }

    // Handle Images
    if (el.tagName === 'IMG') {
      el.src = content;
      return;
    }

    // Handle Inputs
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = content;
      return;
    }

    // Handle HTML/Markdown vs Plain Text
    if (el.classList.contains('cms-rich-text') || el.innerHTML.includes('<p>') || el.getAttribute('data-cms-type') === 'html') {
      el.innerHTML = content;
    } else {
      el.textContent = content;
    }
  }
});
