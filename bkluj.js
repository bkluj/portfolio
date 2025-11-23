let currentPage = 'home';

        function showPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Update navigation
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('onclick') === `showPage('${pageId}')`) {
                    link.classList.add('active');
                }
            });
            
            currentPage = pageId;
            
            // Move footer to the active page
            const footer = document.getElementById('footer');
            const activePage = document.getElementById(pageId);
            activePage.appendChild(footer);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Initialize footer position
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.bg-shapes');

            const maxOffset = 120;     // max przesunięcie w px
            const speed = -0.15;       // ujemny = ruch przeciwny do scrolla

            let offset = scrolled * speed;

            // przy dużym scrollu offset przestaje rosnąć (clamp)
            if (offset >  maxOffset)  offset =  maxOffset;
            if (offset < -maxOffset)  offset = -maxOffset;

            parallax.style.transform = `translateY(${offset}px)`;
        });


// Add interactive parallax effect to background shapes
        document.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.5;
                const xPos = (x - 0.5) * speed * 20;
                const yPos = (y - 0.5) * speed * 20;
                shape.style.transform = `translate(${xPos}px, ${yPos}px)`;
            });
        });

        // Add scroll-based animations
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.bg-shapes');
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        });

        // Add click ripple effect to glass elements
        document.querySelectorAll('.glass').forEach(element => {
            element.addEventListener('click', function(e) {
                const ripple = document.createElement('div');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    z-index: 1000;
                `;
                
                this.style.position = 'relative';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Form submission handling
                // Form submission handling (mailto version)
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const name    = document.getElementById('name').value;
            const email   = document.getElementById('email').value;
            const subject = document.getElementById('subject').value || '(no subject)';
            const message = document.getElementById('message').value;

            const bodyLines = [
                `Name: ${name}`,
                `Email: ${email}`,
                ``,
                `Message:`,
                message
            ].join('\n');

            // 1. mailto -> to korzysta z domyślnego klienta użytkownika
            const mailtoUrl =
                'mailto:bartoszkluj@gmail.com' +
                '?subject=' + encodeURIComponent(subject) +
                '&body='    + encodeURIComponent(bodyLines);

            // 2. Gmail fallback
            const gmailUrl =
                'https://mail.google.com/mail/?view=cm&fs=1' +
                '&to='   + encodeURIComponent('bartoszkluj@gmail.com') +
                '&su='   + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(bodyLines);

            // Spróbuj najpierw mailto
            // (to nie jest popup, tylko zwykłe przekierowanie, więc przeglądarka zwykle tego nie blokuje)
            window.location.href = mailtoUrl;

            // pokaż userowi info + zapasowy link do Gmaila
            showStatus(gmailUrl);

            this.reset();
        });

        function showStatus(gmailUrl) {
            const box = document.createElement('div');
            box.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(46, 204, 113, 0.9);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                backdrop-filter: blur(20px);
                z-index: 10000;
                max-width: 90%;
                text-align: center;
                font-size: 0.9rem;
                line-height: 1.4rem;
                animation: fadeIn 0.3s ease;
            `;

            box.innerHTML = `
                Trying to open your email app...<br/>
                If nothing opened, <a id="gmailLink" style="color:white; text-decoration:underline; font-weight:600; cursor:pointer;">click here to use Gmail</a>.
            `;

            document.body.appendChild(box);

            document.getElementById('gmailLink').addEventListener('click', () => {
                window.open(gmailUrl, '_blank');
            });

            setTimeout(() => {
                box.remove();
            }, 7000);
        }





// Add fade in animation
        const fadeStyle = document.createElement('style');
        fadeStyle.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(fadeStyle);

        // -------- IMAGE ZOOM + NAVIGATION LOGIC --------
        const modal = document.getElementById('imgModal');
        const modalImg = document.getElementById('imgModalContent');
        const modalClose = document.getElementById('imgModalClose');

        let lightboxImages = [];
        let lightboxIndex = 0;

        // direction: 0 = bez kierunku (np. pierwsze otwarcie), 1 = w prawo, -1 = w lewo
        function showLightboxImage(direction = 0) {
            if (!lightboxImages.length) return;
            const img = lightboxImages[lightboxIndex];
            const fullSrc = img.getAttribute('data-full') || img.src;

            // usuń poprzednią klasę animacji
            modalImg.classList.remove('lb-slide-left', 'lb-slide-right');
            // wymuś reflow, żeby animacja mogła się ponownie odpalić
            void modalImg.offsetWidth;

            if (direction === 1) {
                modalImg.classList.add('lb-slide-right');
            } else if (direction === -1) {
                modalImg.classList.add('lb-slide-left');
            }

            modalImg.src = fullSrc;
        }

        function changeLightbox(delta) {
            if (!lightboxImages.length) return;

            const last = lightboxImages.length - 1;
            const oldIndex = lightboxIndex;

            // oblicz nowy indeks
            const newIndex = Math.min(last, Math.max(0, lightboxIndex + delta));

            // jeśli indeks się nie zmienił — nie animujemy, nie aktualizujemy
            if (newIndex === oldIndex) return;

            // ustaw nowy indeks
            lightboxIndex = newIndex;

            // kierunek animacji
            const dir = delta > 0 ? 1 : -1;

            showLightboxImage(dir);
        }



        function openLightboxFrom(img) {
            const galleryRoot = img.closest('[data-gallery]');
            const group = img.dataset.group;

            if (group) {
                // wszystkie obrazki z tym samym data-group (np. certyfikaty)
                lightboxImages = Array.from(
                    document.querySelectorAll(`.img-zoom[data-group="${group}"]`)
                );
            } else if (galleryRoot) {
                // klasyczna galeria projektów
                lightboxImages = Array.from(galleryRoot.querySelectorAll('.img-zoom'));
            } else {
                // pojedynczy obrazek (np. w About)
                lightboxImages = [img];
            }

            lightboxIndex = Math.max(0, lightboxImages.indexOf(img));
            showLightboxImage(0);
            modal.style.display = 'flex';
        }



// klik na miniaturę .img-zoom otwiera podgląd
        document.querySelectorAll('.img-zoom').forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation(); // żeby np. strzałki z galerii nie reagowały
                openLightboxFrom(img);
            });
        });

        let modalImages = [];
        let modalIndex = 0;

        document.querySelectorAll('.img-zoom').forEach(img => {
            img.addEventListener('click', (e) => {
                const gallery = img.closest('[data-gallery]');
                if (!gallery) return;

                modalImages = [...gallery.querySelectorAll('.img-zoom')];
                modalIndex = modalImages.indexOf(img);

                openModalAt(modalIndex);
            });
        });

        function openModalAt(index) {
            const fullSrc =
                modalImages[index].getAttribute('data-full') ||
                modalImages[index].src;

            modalImg.src = fullSrc;
            modal.style.display = 'flex';
        }

        function modalNextImage() {
            if (modalIndex < modalImages.length - 1) {
                modalIndex++;
                modalImg.classList.remove('modal-slide-right', 'modal-slide-left');
                void modalImg.offsetWidth; // reset animacji
                modalImg.classList.add('modal-slide-right');
                openModalAt(modalIndex);
            }
        }

        function modalPrevImage() {
            if (modalIndex > 0) {
                modalIndex--;
                modalImg.classList.remove('modal-slide-right', 'modal-slide-left');
                void modalImg.offsetWidth; // reset animacji
                modalImg.classList.add('modal-slide-left');
                openModalAt(modalIndex);
            }
        }

        document.getElementById('modalNext').addEventListener('click', modalNextImage);
        document.getElementById('modalPrev').addEventListener('click', modalPrevImage);

        // klawiatura
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'flex') {
                if (e.key === 'ArrowRight') modalNextImage();
                if (e.key === 'ArrowLeft') modalPrevImage();
            }
        });

// zamykanie modala po kliknięciu w X
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // zamykanie modala po kliknięciu w tło / obraz
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === modalImg) {
                modal.style.display = 'none';
            }
        });

        // nawigacja w podglądzie klawiaturą: ← → oraz Esc
        document.addEventListener('keydown', (e) => {
            if (modal.style.display !== 'flex') return; // podgląd zamknięty – ignoruj

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                changeLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                changeLightbox(1);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                modal.style.display = 'none';
            }
        });



        // === Simple gallery init ===

        // ostatnia aktywna galeria (kliknięta / najechana)
        let __activeGallery = null;

        // GLOBALNA obsługa strzałek na klawiaturze
        document.addEventListener('keydown', (e) => {
            if (!__activeGallery) return;
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

            e.preventDefault();
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            __activeGallery.__goTo(__activeGallery.__index + dir);
        });

        document.addEventListener('DOMContentLoaded', () => {
            const galleries = document.querySelectorAll('[data-gallery]');
            galleries.forEach(initGallery);
            // przy przełączaniu stron możesz wołać reInitGalleries();
        });

        function initGallery(root) {
            if (root.__inited) return; // uniknij podwójnej inicjalizacji
            root.__inited = true;

            const track = root.querySelector('[data-track]');
            const slides = Array.from(track.querySelectorAll('.slide'));
            const prevBtn = root.querySelector('[data-prev]');
            const nextBtn = root.querySelector('[data-next]');
            const dotsWrap = root.querySelector('[data-dots]');
            let index = 0;

            // po wejściu myszką / kliknięciu / dot – ta galeria staje się „aktywna” do klawiatury
            ['mouseenter','pointerdown','click','touchstart'].forEach(evt => {
                root.addEventListener(evt, () => {
                    __activeGallery = root;
                }, { passive: true });
            });

            // Dots
            const dots = slides.map((_, i) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('aria-label', `Go to slide ${i+1}`);
                b.addEventListener('click', () => goTo(i));
                dotsWrap.appendChild(b);
                return b;
            });

            function goTo(i) {
                index = Math.max(0, Math.min(i, slides.length - 1));
                track.style.transform = `translateX(${-index * 100}%)`;
                prevBtn.disabled = index === 0;
                nextBtn.disabled = index === slides.length - 1;
                dots.forEach((d, di) => d.setAttribute('aria-current', di === index ? 'true' : 'false'));
                root.__index = index;   // zapisujemy stan dla klawiatury
            }

            // udostępniamy goTo i index dla globalnego handlera
            root.__goTo = goTo;
            root.__index = index;

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goTo(index - 1);
            });
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goTo(index + 1);
            });

            // Focusable dla dostępności (fallback)
            root.tabIndex = 0;
            root.addEventListener('focusin', () => {
                __activeGallery = root;
            });

            // Swipe (touch)
            let startX = 0, isDown = false;
            track.addEventListener('touchstart', (e) => {
                if (!e.touches[0]) return;
                isDown = true; startX = e.touches[0].clientX;
                __activeGallery = root;
            }, { passive: true });

            track.addEventListener('touchend', (e) => {
                if (!isDown) return;
                isDown = false;
                const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
                const delta = endX - startX;
                const threshold = 40; // px
                if (delta > threshold) goTo(index - 1);
                if (delta < -threshold) goTo(index + 1);
            });

            goTo(0);
        }

        // Jeżeli masz przełączanie stron przez JS (showPage), odpal ponownie dla nowych/ukrytych sekcji:
        function reInitGalleries() {
            document.querySelectorAll('[data-gallery]').forEach(initGallery);
        }


