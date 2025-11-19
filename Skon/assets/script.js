// Initialize UI after DOM ready
document.addEventListener('DOMContentLoaded', function () {
  // Initialize AOS
  if (window.AOS) AOS.init({ once: true, duration: 900 });

  // Form submission -> WhatsApp
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = (document.getElementById('name') || {}).value?.trim() || '';
      const phone = (document.getElementById('phone') || {}).value?.trim() || '';
      let service = (document.getElementById('service') || {}).value || '';
      const serviceOther = (document.getElementById('serviceOther') || {}).value?.trim() || '';
      const notes = (document.getElementById('notes') || {}).value?.trim() || '';

      if (!name || !phone || !service) {
        alert('Please fill in all required fields!');
        return false;
      }
      if (service === 'Other') {
        if (!serviceOther) {
          alert('Please specify the event type when selecting "Other".');
          return false;
        }
        service = serviceOther;
      }

      let message = `Hello Skon Photography,\nMy name is ${name}. I would like to book a ${service} session.\nMy phone number is ${phone}.`;
      if (notes) message += `\nAdditional notes: ${notes}`;

      const whatsappNumber = "+216XXXXXXXX"; // Replace with actual number, digits only
      const digits = whatsappNumber.replace(/\D/g, '');
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${digits}?text=${encoded}`, '_blank');
      return false;
    });
  }

  // Ensure gallery images are visible and use lazy loading; provide inline SVG fallback if remote fails
  (function ensureGalleryImages() {
    const placeholder = "data:image/svg+xml;utf8," +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140">' +
        '<rect width="100%" height="100%" fill="#05101a"/>' +
        '<g fill="#06a9ff" opacity="0.95"><rect x="18" y="18" width="204" height="104" rx="12"/></g>' +
        '<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#00121a" font-family="Poppins, Arial, sans-serif" font-size="18">Image</text>' +
      '</svg>');

    const exts = ['jpg','jpeg','png','webp'];

    // build a set of candidate URLs from an input path (adds common folders and extensions)
    function buildCandidates(path) {
      const set = new Set();
      if (!path) return set;
      const clean = path.replace(/^\.\//,'').replace(/^\/+/,'')
      // push original variations
      set.add(path);
      set.add('./' + clean);
      set.add('/' + clean);

      // derive name and dir
      const parts = clean.split('/');
      const filename = parts.pop();
      const dir = parts.join('/');
      const m = filename.match(/^(.+?)(?:\.[a-z0-9]+)?$/i);
      const name = m ? m[1] : filename;

      exts.forEach(ext => {
        const candidate = (dir ? `${dir}/` : '') + `${name}.${ext}`;
        set.add(candidate);
        set.add('./' + candidate);
        set.add('/' + candidate);
        set.add('./assets/' + `${name}.${ext}`);
        set.add('./assets/images/' + `${name}.${ext}`);
        set.add('./assets/img/' + `${name}.${ext}`);
      });

      // also try lowercase filename variants
      set.forEach(s => set.add(s.toLowerCase()));
      return set;
    }

    document.querySelectorAll('.gallery').forEach(g => {
      g.querySelectorAll('a').forEach(a => {
        const img = a.querySelector('img');

        if (!img) {
          if (!a.getAttribute('href')) a.setAttribute('href', placeholder);
          return;
        }

        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.getAttribute('alt')) img.setAttribute('alt', 'Portfolio image');

        const origSrc = (img.getAttribute('src') || '').trim();
        const origHref = (a.getAttribute('href') || '').trim();

        // create ordered array of candidates: prefer original src/href first
        const ordered = [];
        const addSet = (s) => s.forEach(u => { if (!ordered.includes(u)) ordered.push(u); });

        if (origSrc) ordered.push(origSrc);
        if (origHref && !ordered.includes(origHref)) ordered.push(origHref);

        addSet(buildCandidates(origSrc));
        addSet(buildCandidates(origHref));

        // final fallback candidates: placeholder only after trying others
        const tried = [];
        let loaded = false;
        let idx = 0;

        function tryNext() {
          if (loaded || idx >= ordered.length) {
            if (!loaded) {
              img.src = placeholder;
              a.href = placeholder;
              console.warn('All gallery candidates failed for element; applied placeholder. Tried:', tried);
            }
            return;
          }

          const candidate = ordered[idx++];
          if (!candidate) return tryNext();
          tried.push(candidate);

          const tester = new Image();
          tester.onload = function () {
            if (loaded) return;
            loaded = true;
            // set image and anchor to the working file
            img.src = candidate;
            a.href = candidate;
            console.info('Gallery image loaded from candidate:', candidate);
          };
          tester.onerror = function () {
            // try next candidate
            setTimeout(tryNext, 0);
          };
          // start load attempt (browser will attempt to fetch)
          tester.src = candidate;
        }

        // start attempts (do not block UI)
        tryNext();

        // keep an onerror handler as last resort
        img.onerror = function () {
          if (this.src !== placeholder) {
            console.warn('Final <img> error for', this.src, '- applying placeholder.');
            this.src = placeholder;
            a.href = placeholder;
          }
        };
      });
    });
  })();

  // Verify local logo exists and refresh favicon + navbar logo to bypass cache if needed
  (async function verifyAndRefreshLogo() {
    const logoPath = './assets/logo.png';
    const logoImg = document.getElementById('siteLogo');
    const updateFavicon = (href) => {
      const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
      rels.forEach(r => {
        let link = document.querySelector(`link[rel="${r}"]`);
        if (!link) {
          link = document.createElement('link');
          link.rel = r;
          document.head.appendChild(link);
        }
        // set href (no cache-buster on file://)
        try {
          if (location && location.protocol && location.protocol.startsWith('http')) {
            link.href = `${href}?cb=${Date.now()}`;
          } else {
            link.href = href;
          }
        } catch (_) {
          link.href = href;
        }
      });
    };

    // Use Image() loader rather than fetch HEAD (safer for file:// and avoids CORS/HEAD issues)
    await new Promise(resolve => {
      try {
        const img = new Image();
        img.onload = function () {
          try {
            const href = (location && location.protocol && location.protocol.startsWith('http')) ? `${logoPath}` : logoPath;
            if (logoImg) {
              // update navbar logo if present
              if (location && location.protocol && location.protocol.startsWith('http')) {
                logoImg.src = `${logoPath}?cb=${Date.now()}`;
              } else {
                logoImg.src = logoPath;
              }
            }
            updateFavicon(logoPath);
            console.info('logo.png loaded and favicon updated.');
          } catch (e) { /* ignore */ }
          resolve();
        };
        img.onerror = function (err) {
          console.warn('Could not load ./assets/logo.png. Please ensure the file exists and is accessible.', err || '');
          resolve();
        };
        img.src = logoPath;
      } catch (err) {
        console.warn('Logo check failed with exception', err);
        resolve();
      }
    });

    // Finally initialize GLightbox now (after gallery images ensured)
    try {
      if (typeof GLightbox === 'function') window._glightbox = GLightbox({ selector: '.glightbox' });
    } catch (e) { /* ignore */ }

    // initialize Typed and Swiper if present (safe re-init)
    if (window.Typed) {
      try {
        new Typed('#typed-words', {
          strings: ['Skandar','Skon Photography','Skandar Wanan'],
          typeSpeed: 60, backSpeed: 40, backDelay: 2000, loop: true, showCursor: true, cursorChar: '|'
        });
      } catch (e) {}
    }
    if (window.Swiper) {
      try {
        new Swiper('.swiper', {
          loop: true,
          autoplay: { delay: 4500, disableOnInteraction: false },
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
          a11y: { enabled: true },
          slidesPerView: 1,
          spaceBetween: 10,
          speed: 700
        });
      } catch (e) {}
    }
  })();

});

// Preloader fade on window load
window.addEventListener('load', function () {
  const loader = document.getElementById('preloader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 500);
  }
});
