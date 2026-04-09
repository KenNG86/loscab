import os
import re

directory = "/Users/ken/Library/CloudStorage/OneDrive-KeystoneDCS/AntiGravity/Loscab.com - Redesign/"

nav_old1 = r'<ul class="nav-links">.*?</ul>'
nav_old2 = r'<ul class="nav-links" role="list">.*?</ul>'
nav_new = '''<ul class="nav-links" data-cms-list="settings" data-cms-property="nav_links">
        <li class="nav-item has-dropdown">
          <a href="" class="nav-link" data-cms-bind="href:url|textContent:label"></a>
          <ul class="dropdown" data-cms-list="" data-cms-property="dropdown">
            <li><a href="" data-cms-bind="href:url|textContent:label"></a></li>
          </ul>
        </li>
      </ul>'''

footer_sports_old = r'<div class="footer-col"><h4>Sports</h4>\s*<ul class="footer-links">.*?</ul>\s*</div>'
footer_sports_new = '''<div class="footer-col"><h4>Sports</h4><ul class="footer-links" data-cms-list="settings" data-cms-property="footer_sports_links"><li><a href="" data-cms-bind="href:url|textContent:label"></a></li></ul></div>'''

footer_club_old = r'<div class="footer-col"><h4>Club</h4>\s*<ul class="footer-links">.*?</ul>\s*</div>'
footer_club_new = '''<div class="footer-col"><h4>Club</h4><ul class="footer-links" data-cms-list="settings" data-cms-property="footer_club_links"><li><a href="" data-cms-bind="href:url|textContent:label"></a></li></ul></div>'''

hours_html = '''
  <section class="section section--gray">
    <div class="container">
      <div class="section-head section-head--center">
        <span class="section-label fade-in">We're Open</span>
        <h2 class="section-title section-title fade-in fade-in-delay-1">Hours</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:2rem;" class="fade-in">
        <div>
          <h3 style="font-weight:700;color:var(--navy);margin-bottom:1rem;font-size:1.1rem;">🏛️ Club Hours</h3>
          <table class="hours-table">
            <thead><tr><th>Day</th><th>Open</th><th>Last Entry</th></tr></thead>
            <tbody data-cms-list="settings" data-cms-property="club_hours">
              <tr>
                <td data-cms-bind="day"></td>
                <td data-cms-bind="open"></td>
                <td data-cms-bind="textContent:last"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 style="font-weight:700;color:var(--navy);margin-bottom:1rem;font-size:1.1rem;">🎾 Court Hours</h3>
          <table class="hours-table">
            <thead><tr><th>Day</th><th>Open</th><th>Last Entry</th></tr></thead>
            <tbody data-cms-list="settings" data-cms-property="court_hours">
              <tr>
                <td data-cms-bind="day"></td>
                <td data-cms-bind="open"></td>
                <td data-cms-bind="textContent:last"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
'''

# Delete the old hours segment from index.html specifically
index_hours_old = r'<!-- Hours -->.*?</section>'

html_files = [f for f in os.listdir(directory) if f.endswith('.html')]

for f in html_files:
    filepath = os.path.join(directory, f)
    with open(filepath, 'r') as file:
        content = file.read()

    # 1. Nav replacement
    content = re.sub(nav_old1, nav_new, content, flags=re.DOTALL)
    content = re.sub(nav_old2, nav_new, content, flags=re.DOTALL)

    # 2. Footer replacement
    content = re.sub(footer_sports_old, footer_sports_new, content, flags=re.DOTALL)
    content = re.sub(footer_club_old, footer_club_new, content, flags=re.DOTALL)

    # 3. Hours processing
    # If index.html, remove old hours block
    if f == 'index.html':
        content = re.sub(index_hours_old, '', content, flags=re.DOTALL)
    
    # Check if we already injected it (to be safe if run multiple times)
    if 'data-cms-property="club_hours"' not in content:
        # Inject before <footer class="footer">
        content = content.replace('<footer class="footer">', hours_html + '\n  <footer class="footer">')

    # Optionally, we should make sure dropdown also uses class role="list" or similar, 
    # but the replacement strings handle that correctly without it.

    with open(filepath, 'w') as file:
        file.write(content)

print(f"Processed {len(html_files)} files perfectly.")
