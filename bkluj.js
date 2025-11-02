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
        window.addEventListener('DOMContentLoaded', () => {
            const footer = document.getElementById('footer');
            const homePage = document.getElementById('home');
            homePage.appendChild(footer);
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

        // -------- IMAGE ZOOM LOGIC --------
        const modal = document.getElementById('imgModal');
        const modalImg = document.getElementById('imgModalContent');
        const modalClose = document.getElementById('imgModalClose');

        // dla każdego obrazka z klasą .img-zoom ustaw klik
        document.querySelectorAll('.img-zoom').forEach(img => {
            img.addEventListener('click', () => {
                const fullSrc = img.getAttribute('data-full') || img.src;
                modalImg.src = fullSrc;
                modal.style.display = 'flex'; // bo .image-modal jest flexboxem
            });
        });

        // zamykanie modala po kliknięciu w X
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // zamykanie modala po kliknięciu w tło / obraz
        modal.addEventListener('click', (e) => {
            // jeśli klik nie był wewnątrz obrazka (żeby nie zamykało przy każdym kliknięciu w sam obraz)
            if (e.target === modal || e.target === modalImg) {
                modal.style.display = 'none';
            }
        });
