const SECTION_PARTIALS = [
    'navbar',
    'hero',
    'vehicles',
    'destinations',
    'booking',
    'why-us',
    'contact',
    'footer',
    'floating-whatsapp',
    'toast'
];

let currentStep = 1;
let carsData = [];

async function loadPartials() {
    const app = document.getElementById('app');
    if (!app) return false;

    const root = app.dataset.partialsRoot || './partials';
    const requests = SECTION_PARTIALS.map(async (name) => {
        const response = await fetch(`${root}/${name}.html`);
        if (!response.ok) {
            throw new Error(`Partial introuvable: ${name}.html`);
        }
        return response.text();
    });

    const htmlParts = await Promise.all(requests);
    app.innerHTML = htmlParts.join('\n\n');
    return true;
}

async function loadCarsData() {
    const response = await fetch('./data/cars.json');
    if (!response.ok) {
        throw new Error('Impossible de charger data/cars.json');
    }
    carsData = await response.json();
}

function renderVehicles() {
    const vehiclesGrid = document.getElementById('vehiclesGrid');
    if (!vehiclesGrid) return;

    vehiclesGrid.innerHTML = carsData
        .map((car, index) => {
            const delay = (index + 1) * 0.05;
            const badgeHtml = car.badge
                ? `<div class="absolute top-3 left-3 ${car.badge.icon ? 'badge text-xs py-1 px-3' : ''}" style="${car.badge.style || ''}">
                        ${car.badge.icon ? `<i class="${car.badge.icon} text-xs"></i> ` : ''}${car.badge.text}
                   </div>`
                : '';
            return `
            <div class="vehicle-card fade-up" style="transition-delay:${delay}s">
                <div class="relative h-52 overflow-hidden">
                    <img src="${car.imageUrl}" alt="${car.name}" class="card-img">
                    ${badgeHtml}
                    <div class="card-overlay">
                        <span class="text-xs text-gray-300 flex items-center gap-2">
                            <i class="${car.overlayIcon || 'fas fa-car'} text-gold-400"></i> ${car.overlayText || ''}
                        </span>
                    </div>
                </div>
                <div class="p-6 relative z-10">
                    <h3 class="font-serif text-xl font-bold mb-1">${car.name}</h3>
                    <p class="text-gray-500 text-xs mb-4">${car.subtitle}</p>
                    <div class="flex flex-wrap gap-3 text-xs text-gray-400 mb-5">
                        <span class="flex items-center gap-1.5"><i class="fas fa-users text-gold-400"></i> ${car.capacity} places</span>
                        <span class="flex items-center gap-1.5"><i class="fas fa-suitcase text-gold-400"></i> ${car.luggage} bagages</span>
                        <span class="flex items-center gap-1.5"><i class="fas fa-cog text-gold-400"></i> ${car.transmission}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div><span class="font-serif text-2xl font-bold gold-text">${car.pricePerDay} DH</span><span class="text-gray-600 text-xs">/jour</span></div>
                        <button onclick="selectCar('${car.name}');addRipple(this)" class="btn-gold px-4 py-2 rounded-full text-xs font-semibold relative overflow-hidden">
                            <i class="fab fa-whatsapp mr-1"></i> Réserver
                        </button>
                    </div>
                </div>
            </div>`;
        })
        .join('\n');
}

function renderBookingCars() {
    const carOptions = document.getElementById('carOptions');
    if (!carOptions) return;

    carOptions.innerHTML = carsData
        .map(
            (car) => `
            <label class="car-radio-label flex items-center gap-4 p-4 rounded-xl border border-white/8 cursor-pointer transition-all hover:border-gold-400/40" style="background:rgba(255,255,255,0.02)">
                <input type="radio" name="carSelect" value="${car.name}" class="hidden">
                <div class="radio-circle w-4 h-4 rounded-full border-2 border-white/20 transition-all flex-shrink-0"></div>
                <div class="flex-1">
                    <div class="font-semibold text-sm">${car.name}</div>
                    <div class="text-xs text-gray-500">${car.subtitle.split('-')[0].trim()} · ${car.capacity} places</div>
                </div>
                <div class="font-serif font-bold gold-text text-sm">${car.pricePerDay} DH/j</div>
            </label>`
        )
        .join('\n');
}

function updateProgress(step) {
    const progress = (step / 3) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('currentStepText').textContent = step;
    const labels = ['Vos informations', 'Votre trajet', 'Votre véhicule'];
    document.getElementById('stepLabel').textContent = labels[step - 1];

    ['dot1', 'dot2', 'dot3'].forEach((id, i) => {
        const dot = document.getElementById(id);
        dot.classList.remove('active', 'done');
        if (i + 1 === step) dot.classList.add('active');
        if (i + 1 < step) dot.classList.add('done');
    });
}

function shakeForm() {
    const form = document.querySelector('.glass-strong');
    if (!form) return;
    form.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
        form.style.animation = '';
    }, 400);
}

function nextStep(from) {
    if (from === 1) {
        const name = document.getElementById('userName').value.trim();
        const phone = document.getElementById('userPhone').value.trim();
        if (!name || !phone) {
            shakeForm();
            return;
        }
    }
    if (from === 2) {
        const pickup = document.getElementById('pickupLocation').value;
        const dropoff = document.getElementById('dropoffLocation').value;
        const date = document.getElementById('rentalDate').value;
        if (!pickup || !dropoff || !date) {
            shakeForm();
            return;
        }
    }
    document.getElementById(`step${from}`).classList.remove('active');
    currentStep = from + 1;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgress(currentStep);
    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function prevStep(from) {
    document.getElementById(`step${from}`).classList.remove('active');
    currentStep = from - 1;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateProgress(currentStep);
}

function showToast(carName) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = `${carName} sélectionné`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

function selectCar(carName) {
    document.querySelectorAll('input[name="carSelect"]').forEach((input) => {
        if (input.value === carName) {
            input.checked = true;
            input.closest('.car-radio-label').click();
        }
    });

    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
    showToast(carName);
}

function addRipple(btn) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    const size = Math.max(btn.offsetWidth, btn.offsetHeight) * 2;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${btn.offsetWidth / 2 - size / 2}px`;
    ripple.style.top = `${btn.offsetHeight / 2 - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
}

function initRIHCars() {
    const navbar = document.getElementById('navbar');
    window.addEventListener(
        'scroll',
        () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        },
        { passive: true }
    );

    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const lines = menuBtn.querySelectorAll('.hamburger-line');
    let menuOpen = false;

    menuBtn.addEventListener('click', () => {
        menuOpen = !menuOpen;
        mobileMenu.classList.toggle('open', menuOpen);
        if (menuOpen) {
            lines[0].style.transform = 'translateY(8px) rotate(45deg)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
            lines.forEach((line) => {
                line.style.transform = '';
                line.style.opacity = '';
            });
        }
    });

    mobileMenu.querySelectorAll('a').forEach((link) =>
        link.addEventListener('click', () => {
            menuOpen = false;
            mobileMenu.classList.remove('open');
            lines.forEach((line) => {
                line.style.transform = '';
                line.style.opacity = '';
            });
        })
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach((el) => observer.observe(el));

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                const suffix = el.dataset.suffix || '+';
                let start = 0;
                const duration = 1200;
                const step = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target) + (progress < 1 ? '' : suffix);
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                counterObserver.unobserve(el);
            });
        },
        { threshold: 0.5 }
    );
    document.querySelectorAll('.stat-number[data-target]').forEach((el) => counterObserver.observe(el));

    const style = document.createElement('style');
    style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}';
    document.head.appendChild(style);

    document.querySelectorAll('.car-radio-label').forEach((label) => {
        const circle = label.querySelector('.radio-circle');
        label.addEventListener('click', () => {
            document.querySelectorAll('.car-radio-label').forEach((radioLabel) => {
                radioLabel.style.borderColor = 'rgba(255,255,255,0.08)';
                radioLabel.style.background = 'rgba(255,255,255,0.02)';
                const radioCircle = radioLabel.querySelector('.radio-circle');
                radioCircle.style.borderColor = 'rgba(255,255,255,0.2)';
                radioCircle.style.background = 'transparent';
            });
            label.style.borderColor = 'rgba(212,175,55,0.5)';
            label.style.background = 'rgba(212,175,55,0.05)';
            circle.style.borderColor = '#d4af37';
            circle.style.background = '#d4af37';
            circle.style.boxShadow = '0 0 8px rgba(212,175,55,0.4)';
        });
    });

    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const phone = document.getElementById('userPhone').value.trim();
        const pickup = document.getElementById('pickupLocation').value;
        const dropoff = document.getElementById('dropoffLocation').value;
        const date = document.getElementById('rentalDate').value;
        const carInput = document.querySelector('input[name="carSelect"]:checked');

        if (!carInput) {
            shakeForm();
            return;
        }

        const car = carInput.value;
        const message = `Bonjour RIH Cars, je souhaite réserver un véhicule :

👤 Nom : ${name}
📞 Téléphone : ${phone}
📍 Prise en charge : ${pickup}
📍 Retour : ${dropoff}
📅 Date : ${date}
🚗 Véhicule : ${car}

Merci de confirmer la disponibilité.`;

        window.open(`https://wa.me/212600240556?text=${encodeURIComponent(message)}`, '_blank');
    });

    document.getElementById('rentalDate').min = new Date().toISOString().split('T')[0];
}

window.nextStep = nextStep;
window.prevStep = prevStep;
window.selectCar = selectCar;
window.addRipple = addRipple;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const loaded = await loadPartials();
        if (loaded) {
            await loadCarsData();
            renderVehicles();
            renderBookingCars();
            initRIHCars();
        }
    } catch (error) {
        console.error(error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = '<div style="padding:24px;text-align:center;color:#fff;">Erreur de chargement du site.</div>';
        }
    }
});
