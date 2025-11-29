// ===========================
// EARTH MOTION - ULTRA SMOOTH & PROFESSIONAL
// ===========================

console.log('🚀 Script loaded!');

// ===========================
// PAGE LOADER
// ===========================
window.addEventListener('load', () => {
    console.log('✅ Page loaded');
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 800);
    }
});

// ===========================
// ANIMATION ENHANCEMENTS (Reveal, Tilt-3D, Magnetic, Cursor Glow)
// ===========================
(function(){
  try {
    // 1) Reveal on scroll (IntersectionObserver)
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if ('IntersectionObserver' in window && revealEls.length) {
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      revealEls.forEach(el=>io.observe(el));
    } else {
      revealEls.forEach(el=>el.classList.add('is-visible'));
    }

    // 2) 3D Tilt on hover for cards
    const tiltEls = Array.from(document.querySelectorAll('.tilt-3d'));
    tiltEls.forEach(el => {
      let rect;
      const onMove = (ev) => {
        rect = rect || el.getBoundingClientRect();
        const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
        const rx = ((y/rect.height) - 0.5) * -10;
        const ry = ((x/rect.width) - 0.5) * 10;
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const onLeave = () => { el.style.transform = 'perspective(700px) rotateX(0) rotateY(0)'; rect = null; };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });

    // 3) Magnetic buttons (attract inner content to cursor)
    const magnets = Array.from(document.querySelectorAll('.magnetic'));
    magnets.forEach(m => {
      const inner = m.querySelector('.magnet-inner') || m.firstElementChild || m;
      m.addEventListener('mousemove', (e)=>{
        const r = m.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
        const dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
        inner.style.transform = `translate(${dx*6}px, ${dy*6}px)`;
      });
      m.addEventListener('mouseleave', ()=>{
        inner.style.transform = 'translate(0,0)';
      });
    });

    // 4) Cursor glow (follow cursor with requestAnimationFrame)
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let targetX = -9999, targetY = -9999, curX = targetX, curY = targetY;
    const raf = () => {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      glow.style.transform = `translate(calc(${curX}px - 50%), calc(${curY}px - 50%))`;
      requestAnimationFrame(raf);
    };
    window.addEventListener('mousemove', (e)=>{ targetX = e.clientX; targetY = e.clientY; });
    raf();
  } catch (e) { console.warn('Animation enhancements error:', e); }
})();

// ===========================
// PARTICLE CANVAS ANIMATION
// ===========================
function initCityLightsCanvas() {
  try {
    // Respect reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('citylights-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * DPR);
      canvas.height = Math.floor(rect.height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Elliptical mask centered (simulate visible hemisphere)
    function drawMask(cb) {
      const { width, height } = canvas;
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      const rx = width * 0.42;
      const ry = height * 0.38;
      const cx = width * 0.5;
      const cy = height * 0.45;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();
      cb();
      ctx.restore();
    }

    const dots = Array.from({ length: 180 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.4,
      base: Math.random() * 0.6 + 0.25,
      phase: Math.random() * Math.PI * 2,
      tw: 0.4 + Math.random() * 0.8,
      driftX: (Math.random() - 0.5) * 0.02,
      driftY: (Math.random() - 0.5) * 0.02,
    }));

    let last = performance.now();
    function tick(now) {
      const dt = (now - last) / 1000; last = now;
      drawMask(() => {
        // subtle vignette over the globe
        const { width: w, height: h } = canvas;
        const gradient = ctx.createRadialGradient(w*0.5, h*0.45, Math.min(w,h)*0.05, w*0.5, h*0.45, Math.max(w,h)*0.5);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.25)');
        ctx.fillStyle = 'rgba(0,0,0,0.0)';
        ctx.fillRect(0,0,w,h);

        dots.forEach(d => {
          d.x = (d.x + d.driftX * dt + 1) % 1;
          d.y = (d.y + d.driftY * dt + 1) % 1;
          d.phase += d.tw * dt;
          const opacity = d.base * (0.6 + 0.4 * Math.sin(d.phase));
          const px = w * (0.5 + (d.x - 0.5) * 0.82); // constrain within ellipse
          const py = h * (0.45 + (d.y - 0.5) * 0.76);
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(255, 200, 120, ${opacity})`;
          ctx.fillStyle = `rgba(255, 200, 120, ${opacity})`;
          ctx.beginPath();
          ctx.arc(px, py, d.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  } catch (e) { console.warn('City lights canvas error:', e); }
}

// ===========================
// PARTICLE CANVAS ANIMATION
// ===========================
function initParticles() {
    try {
        // Respect reduced motion
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('⚠️ Reduced motion: particles disabled');
            const canvasEl = document.getElementById('particle-canvas');
            if (canvasEl) canvasEl.remove();
            return;
        }
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) {
            console.warn('⚠️ Canvas not found');
            return;
        }

        console.log('✨ Initializing particles...');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 120; // more tiny lights

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.6 + 0.4; // tiny dots
                this.baseOpacity = Math.random() * 0.5 + 0.2;
                this.phase = Math.random() * Math.PI * 2;
                this.twinkleSpeed = 0.6 + Math.random() * 0.8; // twinkle frequency
                // very subtle drift
                this.speedX = (Math.random() - 0.5) * 0.05;
                this.speedY = (Math.random() - 0.5) * 0.05;
            }

            update(dt) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;

                this.phase += this.twinkleSpeed * dt;
            }

            draw() {
                const opacity = this.baseOpacity * (0.6 + 0.4 * Math.sin(this.phase));
                ctx.shadowBlur = 8;
                ctx.shadowColor = `rgba(255, 210, 120, ${opacity})`;
                ctx.fillStyle = `rgba(255, 210, 120, ${opacity})`; // warm city-light color
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let last = performance.now();
        function animate(now) {
            const dt = (now - last) / 1000;
            last = now;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update(dt);
                particle.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();
        console.log('✅ Particles initialized');

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    } catch (error) {
        console.error('❌ Particle init error:', error);
    }
}

// ===========================
// PARALLAX EFFECT
// ===========================
function initParallax() {
    try {
        const parallaxElements = document.querySelectorAll('.parallax');
        console.log(`✨ Found ${parallaxElements.length} parallax elements`);

        if (parallaxElements.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach((el, index) => {
                const speed = (index + 1) * 0.5;
                const yPos = -(scrolled * speed / 10);
                el.style.transform = `translateY(${yPos}px)`;
            });
        }, { passive: true });

        console.log('✅ Parallax initialized');
    } catch (error) {
        console.error('❌ Parallax init error:', error);
    }
}

// ===========================
// MAGNETIC BUTTONS
// ===========================
function initMagneticButtons() {
    try {
        const buttons = document.querySelectorAll('.animated-btn, .btn-outline-premium');
        console.log(`✨ Found ${buttons.length} magnetic buttons`);

        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });

        console.log('✅ Magnetic buttons initialized');
    } catch (error) {
        console.error('❌ Magnetic buttons init error:', error);
    }
}

// ===========================
// 3D TILT EFFECT FOR CARDS
// ===========================
function init3DTilt() {
    try {
        const cards = document.querySelectorAll('.hover-card');
        console.log(`✨ Found ${cards.length} tilt cards`);

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });

        console.log('✅ 3D Tilt initialized');
    } catch (error) {
        console.error('❌ 3D Tilt init error:', error);
    }
}

// ===========================
// SCROLL REVEAL ANIMATIONS
// ===========================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================
let lastScroll = 0;
const navbar = document.querySelector('.site-navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
}, { passive: true });

// ===========================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// INFINITE CAROUSEL - Seamless, full-width, JS-driven
// ===========================
function initSeamlessCarousel() {
  try {
    const container = document.querySelector('.infinite-carousel');
    const track = container?.querySelector('.carousel-track');
    if (!container || !track) return;

    // Avoid double init
    if (track.dataset.seamlessInit === '1') return;
    track.dataset.seamlessInit = '1';

    // Remove any previous clones (safety if hot-reload)
    Array.from(track.children).forEach(el => {
      if (el.dataset && el.dataset.clone === 'true') el.remove();
    });

    // Capture the current children as the base segment (whatever is in HTML)
    const baseItems = Array.from(track.children);
    const baseChildCount = baseItems.length;
    const baseHTML = baseItems.map(el => el.outerHTML).join('');

    // Build track from exact base segments duplicated at least twice
    track.innerHTML = baseHTML + baseHTML; // two full copies back-to-back

    // Measure base (one segment) width using half of the current total width
    let wrapWidth = Math.round(track.scrollWidth / 2);

    // Ensure the track is long enough for smooth wrap by appending more full segments
    const ensureWidth = () => {
      const minWidth = Math.max(container.clientWidth * 2, wrapWidth * 2);
      let safety = 0;
      while (track.scrollWidth < minWidth && safety < 10) {
        track.insertAdjacentHTML('beforeend', baseHTML);
        safety++;
      }
    };
    ensureWidth();

    // Helper to recompute wrapWidth on resize without destroying DOM
    const recomputeWrapWidth = () => {
      const totalChildren = track.children.length;
      const segmentCount = Math.max(1, Math.round(totalChildren / baseChildCount));
      // Avoid fractional errors by measuring total width and dividing
      return Math.round(track.scrollWidth / segmentCount);
    };

    let x = 0;
    let rafId = null;
    let lastT = null;
    let paused = false;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Speed in px/s (can override via data-speed on container) and direction
    const baseSpeed = parseFloat(container.getAttribute('data-speed')) || 60;
    const dirAttr = (container.getAttribute('data-direction') || 'left').toLowerCase();
    const dir = dirAttr === 'right' ? 1 : -1;

    const step = (t) => {
      if (paused || prefersReduced) {
        lastT = t;
        rafId = requestAnimationFrame(step);
        return;
      }
      if (lastT == null) lastT = t;
      const dt = (t - lastT) / 1000;
      lastT = t;

      x += dir * baseSpeed * dt;
      // Snap x to integers to avoid subpixel seams on some browsers
      x = Math.round(x);
      if (x <= -wrapWidth) {
        x += wrapWidth;
      } else if (x >= 0) {
        x -= wrapWidth;
      }
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      rafId = requestAnimationFrame(step);
    };

    container.addEventListener('mouseenter', () => { paused = true; });
    container.addEventListener('mouseleave', () => { paused = false; });

    // Pause when tab is inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        paused = true;
      } else {
        paused = false;
      }
    });

    // Keep position stable on resize
    let resizeTO;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        // Recompute wrap width from current DOM structure
        wrapWidth = recomputeWrapWidth();
        ensureWidth();
        // Normalize x to new wrap width and snap to integers
        while (x <= -wrapWidth) x += wrapWidth;
        while (x > 0) x -= wrapWidth;
        x = Math.round(x);
        track.style.transform = `translate3d(${x}px, 0, 0)`;
      }, 100);
    });

    if (!prefersReduced) requestAnimationFrame(step);
    console.log('✅ Seamless carousel initialized');
  } catch (e) {
    console.warn('Carousel init error:', e);
  }
}

// ===========================
// TESTIMONIAL SLIDER
// ===========================
const sliderItems = document.querySelectorAll('.slider .item');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

if (sliderItems.length > 0) {
    let activeIndex = Math.floor(sliderItems.length / 2);

    function updateSlider() {
        sliderItems.forEach((el, i) => {
            el.style.transition = 'opacity 0.3s ease';
            el.style.display = (i === activeIndex) ? 'block' : 'none';
            el.style.opacity = (i === activeIndex) ? '1' : '0';
        });
    }

    updateSlider();

    sliderItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index !== activeIndex) {
                activeIndex = index;
                updateSlider();
            }
        });
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (activeIndex + 1 < sliderItems.length) activeIndex++;
            else activeIndex = 0;
            updateSlider();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (activeIndex - 1 >= 0) activeIndex--;
            else activeIndex = sliderItems.length - 1;
            updateSlider();
        });
    }
}

// ===========================
// INITIALIZE ALL ON DOM READY
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Initializing all animations...');

    // Observe reveal elements
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    console.log(`✨ Found ${revealElements.length} reveal elements`);
    revealElements.forEach(el => observer.observe(el));

    // Initialize all animations
    initParticles();
    initParallax();
    initMagneticButtons();
    init3DTilt();
    initSeamlessCarousel();
    initCityLightsCanvas();

    // Add floating shapes to hero
    const hero = document.querySelector('.hero-section');
    if (hero) {
        for (let i = 1; i <= 3; i++) {
            const shape = document.createElement('div');
            shape.className = `floating-shape shape-${i}`;
            hero.appendChild(shape);
        }
        console.log('✅ Floating shapes added');
    }

    console.log('🎉 All animations initialized successfully!');
});
