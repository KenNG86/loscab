/**
 * LOS CAB SPORTS CLUB — CMS Loader
 * Connects HTML elements to JSON data sources via specific attributes.
 * Attributes: 
 * - data-cms-id: The key in the JSON
 * - data-cms-file: The JSON file name (e.g. settings, index, tennis)
 * - data-cms-type: bg, bg-css, etc.
 */

const CMS = {
    cache: {},

    async init() {
        console.log('CMS: Core initializing...');
        const elements = document.querySelectorAll('[data-cms-id]');
        
        // 1. Group elements by file to minimize fetch calls
        const filesToLoad = new Set();
        elements.forEach(el => {
            const fileName = el.getAttribute('data-cms-file') || this.getCurrentPageName();
            filesToLoad.add(fileName);
        });

        // 2. Fetch all required data files
        for (const file of filesToLoad) {
            if (file === 'settings') {
                this.cache[file] = await this.fetchJSON(`data/${file}.json`);
            } else {
                this.cache[file] = await this.fetchJSON(`data/pages/${file}.json`) || 
                                   await this.fetchJSON(`data/${file}.json`);
            }
        }

        // 3. Apply data to elements
        elements.forEach(el => this.applyElementData(el));

        // 4. Handle dynamic lists (News, etc.)
        const lists = document.querySelectorAll('[data-cms-list]');
        lists.forEach(list => this.renderList(list));

        console.log('CMS: Initialization complete.');
    },

    getCurrentPageName() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path.replace('.html', '');
    },

    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            return await response.json();
        } catch (e) {
            return null;
        }
    },

    applyElementData(el) {
        const id = el.getAttribute('data-cms-id');
        const file = el.getAttribute('data-cms-file') || this.getCurrentPageName();
        const type = el.getAttribute('data-cms-type');
        
        const data = this.cache[file];
        if (!data || !data[id]) return;

        const value = data[id];

        // Handle specific types
        if (type === 'bg') {
            el.style.backgroundImage = `url('${value}')`;
            return;
        }

        if (type === 'bg-css') {
            // Some pages use a <style> tag for the hero background
            el.textContent = `.hero-bg { background-image: url('${value}'); }`;
            return;
        }

        // Handle standard HTML tags
        const tagName = el.tagName.toLowerCase();

        if (tagName === 'meta') {
            el.content = value;
        } else if (tagName === 'img') {
            el.src = value;
        } else if (tagName === 'a') {
            el.href = value;
        } else {
            // For other elements, check if it contains HTML tags
            if (value.includes('<') && value.includes('>')) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        }
    },

    renderList(container, contextData = null) {
        const fileName = container.getAttribute('data-cms-list');
        const listProperty = container.getAttribute('data-cms-property');
        
        let items = [];
        if (fileName) {
            const fileData = this.cache[fileName];
            items = (fileData && fileData[listProperty]) ? fileData[listProperty] : [];
        } else if (contextData && listProperty) {
            items = contextData[listProperty] || [];
        }

        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            if (!Array.isArray(items)) {
                console.warn(`CMS: List data not found or not an array for ${fileName || 'context'}.${listProperty}`);
            }
            return;
        } else {
            container.style.display = '';
        }

        // 1. Get template
        let template = container.querySelector('template');
        let templateContent;

        if (template) {
            templateContent = template.content;
        } else {
            const firstChild = container.firstElementChild;
            if (!firstChild) return;
            templateContent = firstChild.cloneNode(true);
            container.innerHTML = ''; 
        }

        // 2. Render items
        items.forEach((item, index) => {
            const clone = templateContent.cloneNode(true);
            const fragment = template ? clone : document.createDocumentFragment();
            if (!template) fragment.appendChild(clone);

            // Handle alternating layouts by adding index-based classes if needed 
            // Any element with data-cms-index-class="even:class1;odd:class2" 
            const indexEls = (template ? clone : fragment).querySelectorAll('[data-cms-index-class]');
            indexEls.forEach(el => {
                const config = el.getAttribute('data-cms-index-class');
                const classes = config.split(';');
                classes.forEach(c => {
                    const [type, className] = c.split(':');
                    if ((type === 'even' && index % 2 === 0) || (type === 'odd' && index % 2 !== 0)) {
                        el.classList.add(className);
                    }
                });
            });

            this.bindData(template ? clone : fragment, item, fileName);
            container.appendChild(template ? clone : fragment);
        });
    },

    bindData(root, item, fileName) {
        // 1. Handle simple bindings
        const bindables = root.querySelectorAll('[data-cms-bind]');
        bindables.forEach(el => {
            const fullBinding = el.getAttribute('data-cms-bind');
            const bindings = fullBinding.split(/[;|]/); // Support both ; and | separators

            bindings.forEach(binding => {
                if (!binding.trim()) return;
                let [target, prop] = binding.includes(':') ? binding.split(':') : [null, binding];
                
                // Handle nested properties (e.g. style:background:color)
                let subTarget = null;
                const parts = binding.split(':');
                if (parts.length > 2) {
                    target = parts[0];
                    subTarget = parts[1];
                    prop = parts[2];
                }

                const value = item[prop];
                if (value === undefined) return;

                if (target === 'style' && subTarget) {
                    el.style[subTarget] = value;
                } else if (target === 'bg') {
                    el.style.backgroundImage = `url('${value}')`;
                } else if (target === 'className') {
                    el.classList.add(value);
                } else if (target) {
                    el.setAttribute(target, value);
                } else {
                    const tagName = el.tagName.toLowerCase();
                    if (tagName === 'img') el.src = value;
                    else if (tagName === 'a') el.href = value;
                    else if (typeof value === 'string' && value.includes('<') && value.includes('>')) {
                        el.innerHTML = value;
                    } else {
                        el.textContent = value;
                    }
                }
            });
        });

        // 2. Handle nested lists
        const nestedLists = root.querySelectorAll('[data-cms-list=""]');
        nestedLists.forEach(list => this.renderList(list, item));
    }
};

document.addEventListener('DOMContentLoaded', () => CMS.init());
