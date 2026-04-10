/**
 * CMS Content Loader for Los Cab Website
 * Loads dynamic content from JSON data files managed by Decap CMS.
 * Each page declares its data source via <body data-cms-page="pageName">
 */
(function () {
  'use strict';

  // === Netlify Identity Handler ===
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', function (user) {
      if (!user) {
        window.netlifyIdentity.on('login', function () {
          document.location.href = '/admin/';
        });
      }
    });
  }

  // === Helpers ===
  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
  function raw(str) { return str || ''; }

  // === Determine page ===
  var page = document.body.getAttribute('data-cms-page');
  if (!page) return;

  fetch('/data/' + page + '.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { renderPage(page, d); })
    .catch(function (e) { console.warn('CMS load skipped for ' + page + ':', e); });

  function renderPage(page, d) {
    switch (page) {
      case 'home': renderHome(d); break;
      case 'tennis': renderTennis(d); break;
      case 'pickleball': renderPickleball(d); break;
      case 'fitness': renderFitness(d); break;
      case 'sports': renderSports(d); break;
      case 'membership': renderMembership(d); break;
      case 'services': renderServices(d); break;
      case 'events': renderEvents(d); break;
      case 'news': renderNews(d); break;
      case 'contact': renderContact(d); break;
    }
  }

  // ═══════════════════════════════════════════════════════
  // HOME PAGE
  // ═══════════════════════════════════════════════════════
  function renderHome(d) {
    bind('.hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('.hero-label', d.hero_label);
    bindHTML('.hero-title', d.hero_title);
    bindHTML('.hero-desc', d.hero_subtitle);

    // Stats
    var statsC = document.querySelector('.hero-stats');
    if (statsC && d.hero_stats) {
      statsC.innerHTML = d.hero_stats.map(function (s) {
        return '<div class="hero-stat"><div class="hero-stat-number" data-count="' + s.number + '">0</div><div class="hero-stat-label">' + esc(s.label) + '</div></div>';
      }).join('');
      reInitCounters(statsC);
    }

    // Amenities
    var amenC = document.querySelector('.amenities-strip-inner');
    if (amenC && d.amenities) {
      amenC.innerHTML = d.amenities.map(function (a) {
        return '<div class="amenity-item"><span class="icon">' + a.icon + '</span><span>' + esc(a.label) + '</span></div>';
      }).join('');
    }

    // Sports section head
    bindHTML('[data-cms="sports-label"]', d.sports_section_label);
    bindHTML('[data-cms="sports-title"]', d.sports_section_title);
    bindHTML('[data-cms="sports-subtitle"]', d.sports_section_subtitle);

    // Sports tiles
    var tilesC = document.querySelector('.sports-tiles');
    if (tilesC && d.sports_tiles) {
      tilesC.innerHTML = d.sports_tiles.map(function (t, i) {
        var delay = i > 0 ? ' fade-in-delay-' + Math.min(i, 2) : '';
        return '<a href="' + esc(t.link) + '" class="sport-tile fade-in' + delay + '">' +
          '<img src="' + esc(t.image) + '" alt="' + esc(t.title) + ' at Los Cab" loading="lazy">' +
          '<div class="sport-tile-overlay">' +
          '<div class="sport-tile-tag">' + esc(t.tag) + '</div>' +
          '<h3>' + esc(t.title) + '</h3>' +
          '<p>' + esc(t.desc) + '</p>' +
          '<div class="sport-tile-arrow">' + esc(t.arrow) + '</div>' +
          '</div></a>';
      }).join('');
      reInitFadeIn(tilesC);
    }

    // Facilities
    bindHTML('[data-cms="fac-label"]', d.facilities_label);
    bindHTML('[data-cms="fac-title"]', d.facilities_title);
    var facText = document.querySelector('[data-cms="fac-text"]');
    if (facText) facText.innerHTML = raw(d.facilities_text);
    bindImg('[data-cms="fac-img"]', d.facilities_image);

    var facList = document.querySelector('[data-cms="fac-features"]');
    if (facList && d.facilities_features) {
      facList.innerHTML = d.facilities_features.map(function (f) {
        return '<div class="feature-item"><div class="feature-dot"></div><div><strong>' + esc(f.title) + '</strong><p>' + esc(f.desc) + '</p></div></div>';
      }).join('');
    }

    // Hours
    renderHoursTable('[data-cms="hours-club"]', d.hours_club);
    renderHoursTable('[data-cms="hours-court"]', d.hours_court);

    // Membership plans
    bindHTML('[data-cms="mem-label"]', d.membership_label);
    bindHTML('[data-cms="mem-title"]', d.membership_title);
    bindHTML('[data-cms="mem-subtitle"]', d.membership_subtitle);
    var plansC = document.querySelector('[data-cms="mem-plans"]');
    if (plansC && d.membership_plans) {
      plansC.innerHTML = d.membership_plans.map(function (p) {
        return renderPricingCard(p, 'membership.html');
      }).join('');
    }

    // Testimonials
    bindHTML('[data-cms="test-label"]', d.testimonials_label);
    bindHTML('[data-cms="test-title"]', d.testimonials_title);
    var testC = document.querySelector('[data-cms="testimonials"]');
    if (testC && d.testimonials) {
      testC.innerHTML = d.testimonials.map(function (t) {
        return '<div class="testimonial-card">' +
          '<div class="testimonial-stars">★★★★★</div>' +
          '<p class="testimonial-text">"' + esc(t.text) + '"</p>' +
          '<div class="testimonial-author">' +
          '<div class="testimonial-avatar">' + esc(t.initials) + '</div>' +
          '<div><div class="testimonial-name">' + esc(t.name) + '</div>' +
          '<div class="testimonial-role">' + esc(t.role) + '</div></div></div></div>';
      }).join('');
    }

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // TENNIS PAGE
  // ═══════════════════════════════════════════════════════
  function renderTennis(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    // Programs
    bindHTML('[data-cms="prog-label"]', d.programs_label);
    bindHTML('[data-cms="prog-title"]', d.programs_title);
    bindHTML('[data-cms="prog-subtitle"]', d.programs_subtitle);
    var progC = document.querySelector('[data-cms="programs"]');
    if (progC && d.programs) {
      progC.innerHTML = d.programs.map(function (p) {
        return '<div class="icon-card">' +
          '<div class="icon-wrap">' + p.icon + '</div>' +
          '<h3 class="card-title">' + esc(p.title) + '</h3>' +
          '<p class="card-text">' + esc(p.text) + '</p>' +
          (p.link ? '<a href="' + esc(p.link) + '" class="card-link">' + esc(p.link_text) + '</a>' : '') +
          '</div>';
      }).join('');
    }

    // Courts
    bindHTML('[data-cms="courts-label"]', d.courts_label);
    bindHTML('[data-cms="courts-title"]', d.courts_title);
    bindHTML('[data-cms="courts-subtitle"]', d.courts_subtitle);
    bindImg('[data-cms="courts-img"]', d.courts_image);
    renderFeatureList('[data-cms="courts-features"]', d.courts_features);

    // Membership
    bindHTML('[data-cms="mem-label"]', d.membership_label);
    bindHTML('[data-cms="mem-price"]', d.membership_price + ' <span style="font-size:1.2rem;font-family:var(--font-sans);font-weight:400;color:var(--body-text);">' + esc(d.membership_period) + '</span>');
    bindHTML('[data-cms="mem-details"]', d.membership_details);
    bindHTML('[data-cms="mem-text"]', d.membership_text);

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // PICKLEBALL PAGE
  // ═══════════════════════════════════════════════════════
  function renderPickleball(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    // Programs
    bindHTML('[data-cms="prog-label"]', d.programs_label);
    bindHTML('[data-cms="prog-title"]', d.programs_title);
    bindHTML('[data-cms="prog-subtitle"]', d.programs_subtitle);
    var progC = document.querySelector('[data-cms="programs"]');
    if (progC && d.programs) {
      progC.innerHTML = d.programs.map(function (p) {
        var textColor = p.text_color || 'var(--white)';
        var headerStyle = 'background:' + (p.color || 'var(--teal)') + ';';
        if (p.text_color) headerStyle += 'color:' + p.text_color + ';';
        return '<div class="program-card">' +
          '<div class="program-card-header" style="' + headerStyle + '">' +
          '<div class="level"' + (p.text_color ? ' style="color:' + p.text_color + ';"' : '') + '>' + esc(p.level) + '</div>' +
          '<h3>' + esc(p.title) + '</h3></div>' +
          '<div class="program-card-body">' +
          '<p style="color:var(--body-text);font-size:0.95rem;line-height:1.7;">' + esc(p.text) + '</p>' +
          (p.link ? '<a href="' + esc(p.link) + '" class="card-link">' + esc(p.link_text) + '</a>' : '') +
          '</div></div>';
      }).join('');
    }

    // Courts
    bindHTML('[data-cms="courts-label"]', d.courts_label);
    bindHTML('[data-cms="courts-title"]', d.courts_title);
    bindHTML('[data-cms="courts-subtitle"]', d.courts_subtitle);
    bindImg('[data-cms="courts-img"]', d.courts_image);
    renderFeatureList('[data-cms="courts-features"]', d.courts_features);

    // Membership
    bindHTML('[data-cms="mem-label"]', d.membership_label);
    bindHTML('[data-cms="mem-price"]', d.membership_price + ' <span style="font-size:1.2rem;font-family:var(--font-sans);font-weight:400;color:var(--body-text);">' + esc(d.membership_period) + '</span>');
    bindHTML('[data-cms="mem-text"]', d.membership_text);

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // FITNESS PAGE
  // ═══════════════════════════════════════════════════════
  function renderFitness(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    // Gym
    bindHTML('[data-cms="gym-label"]', d.gym_label);
    bindHTML('[data-cms="gym-title"]', d.gym_title);
    bindHTML('[data-cms="gym-subtitle"]', d.gym_subtitle);
    bindImg('[data-cms="gym-img"]', d.gym_image);
    renderFeatureList('[data-cms="gym-features"]', d.gym_features);

    // Classes
    bindHTML('[data-cms="classes-label"]', d.classes_label);
    bindHTML('[data-cms="classes-title"]', d.classes_title);
    bindHTML('[data-cms="classes-subtitle"]', d.classes_subtitle);
    renderClassGrid('[data-cms="classes-cardio"]', d.classes_cardio);
    renderClassGrid('[data-cms="classes-mind"]', d.classes_mind);
    renderClassGrid('[data-cms="classes-dance"]', d.classes_dance);

    // Director
    bindHTML('[data-cms="dir-label"]', d.director_label);
    bindHTML('[data-cms="dir-title"]', d.director_title);
    bindHTML('[data-cms="dir-text"]', d.director_text);
    bindImg('[data-cms="dir-img"]', d.director_image);
    var dirEmail = document.querySelector('[data-cms="dir-email"]');
    if (dirEmail) {
      dirEmail.href = 'mailto:' + d.director_email;
      dirEmail.textContent = d.director_email;
    }

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // SPORTS PAGE
  // ═══════════════════════════════════════════════════════
  function renderSports(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    // Swimming
    bindHTML('[data-cms="swim-label"]', d.swimming_label);
    bindHTML('[data-cms="swim-title"]', d.swimming_title);
    bindHTML('[data-cms="swim-text"]', d.swimming_text);
    bindImg('[data-cms="swim-img"]', d.swimming_image);
    renderFeatureList('[data-cms="swim-features"]', d.swimming_features);

    // Basketball
    bindHTML('[data-cms="bball-label"]', d.basketball_label);
    bindHTML('[data-cms="bball-title"]', d.basketball_title);
    bindHTML('[data-cms="bball-text"]', d.basketball_text);
    bindImg('[data-cms="bball-img"]', d.basketball_image);
    renderFeatureList('[data-cms="bball-features"]', d.basketball_features);

    // Volleyball
    bindHTML('[data-cms="vball-label"]', d.volleyball_label);
    bindHTML('[data-cms="vball-title"]', d.volleyball_title);
    bindHTML('[data-cms="vball-text"]', d.volleyball_text);
    bindImg('[data-cms="vball-img"]', d.volleyball_image);
    renderFeatureList('[data-cms="vball-features"]', d.volleyball_features);

    // Court sports
    bindHTML('[data-cms="cs-label"]', d.court_sports_label);
    bindHTML('[data-cms="cs-title"]', d.court_sports_title);
    bindHTML('[data-cms="cs-subtitle"]', d.court_sports_subtitle);
    var csC = document.querySelector('[data-cms="court-sports"]');
    if (csC && d.court_sports) {
      csC.innerHTML = d.court_sports.map(function (s) {
        return '<div class="icon-card">' +
          '<div class="icon-wrap" style="font-size:1.8rem;">' + s.icon + '</div>' +
          '<h3 class="card-title">' + esc(s.title) + '</h3>' +
          '<p class="card-text">' + esc(s.text) + '</p>' +
          (s.contact ? '<p style="font-size:0.9rem;color:var(--teal);font-weight:600;margin-top:0.75rem;">' + esc(s.contact) + '</p>' : '') +
          (s.note ? '<p style="font-size:0.9rem;color:var(--gold);font-weight:600;margin-top:0.75rem;">' + esc(s.note) + '</p>' : '') +
          '<a href="' + esc(s.link) + '" class="card-link">' + esc(s.link_text) + '</a>' +
          '</div>';
      }).join('');
    }

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // MEMBERSHIP PAGE
  // ═══════════════════════════════════════════════════════
  function renderMembership(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    // Included
    bindHTML('[data-cms="inc-label"]', d.included_label);
    bindHTML('[data-cms="inc-title"]', d.included_title);
    var incC = document.querySelector('[data-cms="included"]');
    if (incC && d.included_items) {
      incC.innerHTML = d.included_items.map(function (it) {
        return '<div class="icon-card"><div class="icon-wrap">' + it.icon + '</div><h3 class="card-title">' + esc(it.title) + '</h3><p class="card-text">' + esc(it.text) + '</p></div>';
      }).join('');
    }

    // Plans
    bindHTML('[data-cms="plans-label"]', d.plans_label);
    bindHTML('[data-cms="plans-title"]', d.plans_title);
    bindHTML('[data-cms="plans-subtitle"]', d.plans_subtitle);
    var plansC = document.querySelector('[data-cms="plans"]');
    if (plansC && d.plans) {
      plansC.innerHTML = d.plans.map(function (p) {
        return renderPricingCard(p, 'contact.html');
      }).join('');
    }

    // Badminton note
    var badNote = document.querySelector('[data-cms="badminton-note"]');
    if (badNote) badNote.innerHTML = raw(d.badminton_note);

    // Family
    bindHTML('[data-cms="fam-label"]', d.family_label);
    bindHTML('[data-cms="fam-title"]', d.family_title);
    bindHTML('[data-cms="fam-subtitle"]', d.family_subtitle);
    bindImg('[data-cms="fam-img"]', d.family_image);
    renderFeatureList('[data-cms="fam-features"]', d.family_features, true);

    // FAQs
    var faqC = document.querySelector('[data-cms="faqs"]');
    if (faqC && d.faqs) {
      faqC.innerHTML = d.faqs.map(function (f) {
        return '<div class="faq-item">' +
          '<div class="faq-question" role="button" tabindex="0" onclick="toggleFaq(this)">' + esc(f.question) + ' <span class="faq-arrow">▾</span></div>' +
          '<div class="faq-answer">' + esc(f.answer) + '</div></div>';
      }).join('');
    }

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // SERVICES PAGE
  // ═══════════════════════════════════════════════════════
  function renderServices(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    bindHTML('[data-cms="svc-label"]', d.services_label);
    bindHTML('[data-cms="svc-title"]', d.services_title);
    var svcC = document.querySelector('[data-cms="services"]');
    if (svcC && d.services) {
      svcC.innerHTML = d.services.map(function (s) {
        var bullets = (s.bullets || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
        return '<div class="card">' +
          '<div class="card-img-wrap"><img class="card-img" src="' + esc(s.image) + '" alt="' + esc(s.title) + '" loading="lazy"></div>' +
          '<div class="card-body">' +
          '<div class="card-tag">' + esc(s.tag) + '</div>' +
          '<h2 class="card-title" style="font-size:1.5rem;">' + esc(s.title) + '</h2>' +
          '<p class="card-text">' + esc(s.text) + '</p>' +
          (bullets ? '<ul style="margin-top:1rem;color:var(--body-text);font-size:0.95rem;display:flex;flex-direction:column;gap:0.4rem;">' + bullets + '</ul>' : '') +
          (s.link ? '<a href="' + esc(s.link) + '" class="card-link">' + esc(s.link_text) + '</a>' : '') +
          (s.note ? '<p style="margin-top:1rem;font-size:0.85rem;color:var(--teal);font-weight:700;">' + esc(s.note) + '</p>' : '') +
          '</div></div>';
      }).join('');
    }

    // Amenities
    bindHTML('[data-cms="amen-label"]', d.amenities_label);
    bindHTML('[data-cms="amen-title"]', d.amenities_title);
    bindHTML('[data-cms="amen-subtitle"]', d.amenities_subtitle);
    var amenC = document.querySelector('[data-cms="amenities"]');
    if (amenC && d.amenities) {
      amenC.innerHTML = d.amenities.map(function (a) {
        return '<div class="icon-card"><div class="icon-wrap">' + a.icon + '</div><h3 class="card-title">' + esc(a.title) + '</h3><p class="card-text">' + esc(a.text) + '</p></div>';
      }).join('');
    }

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // EVENTS PAGE
  // ═══════════════════════════════════════════════════════
  function renderEvents(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    bindHTML('[data-cms="events-label"]', d.events_label);
    bindHTML('[data-cms="events-period"]', d.events_period);
    var evC = document.querySelector('[data-cms="events"]');
    if (evC && d.events) {
      evC.innerHTML = d.events.map(function (e) {
        var color = e.color || 'var(--teal)';
        var textColor = e.text_color || 'var(--white)';
        var dateStyle = 'background:' + color + ';';
        if (e.text_color) dateStyle += 'color:' + textColor + ';';
        return '<div class="event-card">' +
          '<div class="event-date-block" style="' + dateStyle + '">' +
          '<div class="event-month"' + (e.text_color ? ' style="color:' + textColor + ';"' : '') + '>' + esc(e.month) + '</div>' +
          '<div class="event-day"' + (e.text_color ? ' style="color:' + textColor + ';"' : '') + '>' + esc(e.day) + '</div>' +
          '<div class="event-year"' + (e.text_color ? ' style="color:' + textColor + ';opacity:1;"' : '') + '>' + esc(e.year) + '</div></div>' +
          '<div class="event-body">' +
          '<div class="event-type">' + esc(e.type) + '</div>' +
          '<div class="event-title">' + esc(e.title) + '</div>' +
          '<div class="event-desc">' + esc(e.desc) + '</div>' +
          '<div class="event-meta">' +
          '<span>' + esc(e.location) + '</span>' +
          '<span>' + esc(e.time) + '</span>' +
          '<span>' + esc(e.access) + '</span></div></div>' +
          '<div class="event-cta"><a href="contact.html" class="btn btn-' + (e.btn_style || 'primary') + '">' + esc(e.btn_text) + '</a></div></div>';
      }).join('');
    }

    // Venue
    bindHTML('[data-cms="venue-label"]', d.venue_label);
    bindHTML('[data-cms="venue-title"]', d.venue_title);
    bindHTML('[data-cms="venue-text"]', d.venue_text);
    bindImg('[data-cms="venue-img"]', d.venue_image);
    renderFeatureList('[data-cms="venue-features"]', d.venue_features);

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // NEWS PAGE
  // ═══════════════════════════════════════════════════════
  function renderNews(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);

    // Featured
    if (d.featured) {
      var f = d.featured;
      bindImg('[data-cms="feat-img"]', f.image);
      bindHTML('[data-cms="feat-date"]', f.date);
      bindHTML('[data-cms="feat-cat"]', f.category);
      bindHTML('[data-cms="feat-title"]', f.title);
      bindHTML('[data-cms="feat-text"]', f.text);
      var bullC = document.querySelector('[data-cms="feat-bullets"]');
      if (bullC && f.bullets) {
        bullC.innerHTML = f.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');
      }
    }

    // Articles
    bindHTML('[data-cms="art-label"]', d.articles_label);
    bindHTML('[data-cms="art-title"]', d.articles_title);
    var artC = document.querySelector('[data-cms="articles"]');
    if (artC && d.articles) {
      artC.innerHTML = d.articles.map(function (a) {
        return '<div class="blog-card">' +
          '<div class="blog-card-img-wrap"><img src="' + esc(a.image) + '" alt="' + esc(a.title) + '" loading="lazy"></div>' +
          '<div class="blog-card-body">' +
          '<div class="blog-date">' + esc(a.date) + '</div>' +
          '<div class="blog-cat">' + esc(a.category) + '</div>' +
          '<div class="blog-title">' + esc(a.title) + '</div>' +
          '<p class="blog-excerpt">' + esc(a.summary) + '</p>' +
          '<a href="' + esc(a.link) + '" class="card-link">Read More →</a>' +
          '</div></div>';
      }).join('');
    }

    // CTA
    bindHTML('[data-cms="cta-title"]', d.cta_title);
    bindHTML('[data-cms="cta-text"]', d.cta_text);
  }

  // ═══════════════════════════════════════════════════════
  // CONTACT PAGE
  // ═══════════════════════════════════════════════════════
  function renderContact(d) {
    bind('.page-hero-bg', 'backgroundImage', 'url(\'' + d.hero_image + '\')');
    bindHTML('[data-cms="hero-label"]', d.hero_label);
    bindHTML('[data-cms="hero-title"]', d.hero_title);
    bindHTML('[data-cms="hero-desc"]', d.hero_desc);
    bindHTML('[data-cms="form-label"]', d.form_label);
    bindHTML('[data-cms="form-title"]', d.form_title);

    // Contact info
    bindHTML('[data-cms="club-name"]', d.club_name);
    bindHTML('[data-cms="club-tagline"]', d.club_tagline);
    bindHTML('[data-cms="address"]', d.address);
    bindHTML('[data-cms="city"]', d.city);
    bindHTML('[data-cms="phone"]', d.phone);
    bindHTML('[data-cms="phone-sub"]', d.phone_sub);
    bindHTML('[data-cms="email"]', d.email);
    bindHTML('[data-cms="email-role"]', d.email_role);
    bindHTML('[data-cms="hours-club-wd"]', d.hours_club_weekday);
    bindHTML('[data-cms="hours-club-we"]', d.hours_club_weekend);
    bindHTML('[data-cms="hours-court-wd"]', d.hours_court_weekday);
    bindHTML('[data-cms="hours-court-we"]', d.hours_court_weekend);

    // Staff
    var staffC = document.querySelector('[data-cms="staff"]');
    if (staffC && d.staff) {
      staffC.innerHTML = d.staff.map(function (s) {
        var contactEl = '';
        if (s.contact_type === 'email') {
          contactEl = '<a href="mailto:' + esc(s.contact) + '" class="staff-email">' + esc(s.contact) + '</a>';
        } else if (s.contact_type === 'phone') {
          contactEl = '<a href="tel:+17145468560" class="staff-email">' + esc(s.contact) + '</a>';
        } else {
          contactEl = '<a href="contact.html" class="staff-email">' + esc(s.contact) + '</a>';
        }
        return '<div class="staff-mini">' +
          '<div class="staff-avatar">' + esc(s.initials) + '</div>' +
          '<div><div class="staff-name">' + esc(s.name) + '</div><div class="staff-role">' + esc(s.role) + '</div></div>' +
          contactEl + '</div>';
      }).join('');
    }

    // Map
    bindHTML('[data-cms="map-label"]', d.map_label);
    bindHTML('[data-cms="map-title"]', d.map_title);
    bindHTML('[data-cms="map-subtitle"]', d.map_subtitle);
  }

  // ═══════════════════════════════════════════════════════
  // SHARED HELPERS
  // ═══════════════════════════════════════════════════════
  function bind(sel, prop, val) {
    var el = document.querySelector(sel);
    if (el && val) el.style[prop] = val;
  }
  function bindHTML(sel, val) {
    var el = document.querySelector(sel);
    if (el && val !== undefined && val !== null) el.innerHTML = val;
  }
  function bindImg(sel, val) {
    var el = document.querySelector(sel);
    if (!el || !val) return;
    if (el.tagName === 'IMG') { el.src = val; }
    else { el.style.backgroundImage = 'url(\'' + val + '\')'; }
  }

  function renderFeatureList(sel, items, whiteText) {
    var c = document.querySelector(sel);
    if (!c || !items) return;
    c.innerHTML = items.map(function (f) {
      var strongStyle = whiteText ? ' style="color:white;"' : '';
      var pStyle = whiteText ? ' style="color:rgba(255,255,255,0.7);"' : '';
      return '<div class="feature-item"><div class="feature-dot"></div><div><strong' + strongStyle + '>' + esc(f.title) + '</strong><p' + pStyle + '>' + esc(f.desc) + '</p></div></div>';
    }).join('');
  }

  function renderClassGrid(sel, items) {
    var c = document.querySelector(sel);
    if (!c || !items) return;
    c.innerHTML = items.map(function (cl) {
      return '<div class="class-item">' +
        '<div class="class-name">' + esc(cl.name) + '</div>' +
        '<div class="class-badge badge-' + (cl.badge_type || 'cardio') + '">' + esc(cl.badge) + '</div>' +
        '<p class="card-text" style="margin-top:0.5rem;font-size:0.9rem;">' + esc(cl.desc) + '</p></div>';
    }).join('');
  }

  function renderPricingCard(p, linkHref) {
    var cx = p.featured ? ' featured' : '';
    return '<div class="pricing-card' + cx + '">' +
      '<div class="pricing-type">' + esc(p.type) + '</div>' +
      '<div class="pricing-name">' + esc(p.name) + '</div>' +
      '<div class="pricing-price"><span class="price-amount">' + esc(p.price) + '</span><span class="price-period">' + esc(p.period) + '</span></div>' +
      '<div class="pricing-initiation">' + esc(p.initiation) + '</div>' +
      '<ul class="pricing-features">' + (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
      '<a href="' + esc(linkHref) + '" class="btn btn-' + (p.btn_style || 'outline') + '" style="width:100%;text-align:center;">' + esc(p.btn_text) + '</a></div>';
  }

  function renderHoursTable(sel, rows) {
    var tbody = document.querySelector(sel);
    if (!tbody || !rows) return;
    tbody.innerHTML = rows.map(function (r) {
      return '<tr><td>' + esc(r.day) + '</td><td>' + esc(r.open) + '</td><td>' + esc(r.last_entry) + '</td></tr>';
    }).join('');
  }

  function reInitCounters(container) {
    var counters = container.querySelectorAll('[data-count]');
    if (!counters.length) return;
    counters.forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var duration = 1400;
      var start = performance.now();
      function update(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  function reInitFadeIn(container) {
    var targets = container.querySelectorAll('.fade-in');
    if (!targets.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { observer.observe(el); });
  }

})();
