document.addEventListener('DOMContentLoaded', function () {
  
  if (window.AOS) AOS.init({ once: true, duration: 1000, offset: 50 });
  if (window.Typed) {
    new Typed('#typed-words', {
      strings: ['Emotions.', 'Stories.', 'Moments.', 'Love.'],
      typeSpeed: 80, backSpeed: 50, backDelay: 2000, loop: true, showCursor: false
    });
  }
  if (window.Swiper) {
    new Swiper('.testimonial-slider', {
      loop: true,
      autoplay: { delay: 4000 },
      pagination: { el: '.swiper-pagination', clickable: true },
    });
  }
  try {
    if (typeof GLightbox === 'function') GLightbox({ selector: '.glightbox' });
  } catch (e) {}

  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  
  window.addEventListener('mousemove', function(e) {
    const posX = e.clientX;
    const posY = e.clientY;
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
  });

  const triggers = document.querySelectorAll('.hover-trigger, a, button, input, textarea');
  triggers.forEach(link => {
    link.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    link.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      let service = document.getElementById('service').value;
      const notes = document.getElementById('notes').value.trim();

      if (!name || !service) {
        alert('Please fill in your name and service.');
        return;
      }

      let message = `*New Booking Request*\n\nName: ${name}\nService: ${service}`;
      if (notes) message += `\nNotes: ${notes}`;

      const whatsappNumber = "21624073598";
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  }
});

window.addEventListener('load', function () {
  const loader = document.getElementById('preloader');
  if (loader) {
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }, 500);
  }
});