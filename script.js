// ==============================
// Game Configuration
// ==============================

const USD_TO_LKR = 315.61; // adjust rate if needed

const products = [
    { title: 'Airpods Pro', label: '$1.00', color: '#ea580c', image: 'https://png.pngtree.com/png-clipart/20230504/ourmid/pngtree-airpods-png-image_7081756.png', description: 'Airpods Pro Premium Quality Stock Wireless Earbuds With Wireless Earbuds for Android and IOS' },
    { title: 'Ladies Free Size Black Plazzo', label: '$0.50', color: '#ff7300', image: 'https://assets.digitalcontent.marksandspencer.app/image/upload/w_600,h_780,q_auto,f_auto,e_sharpen/SD_01_T57_8595_Y0_X_EC_94', description: 'Ladies Free Size Plain Black Plazzo Plaza Plazo Pants Plazzo Pants High Quality Material Plazo Black Navy Blue Plazzo Pants For Women Girls' },
    { title: 'T20ultra2 smart watch', label: '$1.00', color: '#ea580c', image: 'https://png.pngtree.com/png-clipart/20250104/original/pngtree-smart-watch-png-image_18709852.png', description: 'T20ultra2 smart watch big screen 2.2, 4-in-1 set Bluetooth call watch heart rate sports' },
    { title: 'Try Again', label: '', color: '#17272e', image: 'https://cdn.creativefabrica.com/2023/02/25/Typography-Sticker-Try-Again-Graphics-62455051-1.png', description: 'Better luck in next try!' },
    { title: 'Womens Sports Shoes', label: '$1.00', color: '#ea580c', image: 'https://png.pngtree.com/png-vector/20240309/ourmid/pngtree-white-running-sport-shoes-png-image_11898402.png', description: 'Fashionable Sports Shoes for Women, Thick and Breathable Soft Soled Mesh, Lightweight Casual', sizes: ['38', '39', '40'] },
    { title: 'Pink Shoulder Bag for Women', label: '$0.50', color: '#ff7300', image: 'https://png.pngtree.com/png-vector/20250124/ourmid/pngtree-pink-ladies-hand-bag-png-image_15321850.png', description: 'PU Leather Crossbody Bags Zipper New Fashion Shoulder Bag for Women Large Capacity Embroidery Thread Small Purse and Handbags' },
    { title: 'Hoodie White T-shirt', label: '$1.00', color: '#ea580c', image: 'https://static.vecteezy.com/system/resources/thumbnails/045/857/896/small/white-hoodie-isolated-on-transparent-background-free-png.png', description: '2025 Autumn Simple Solid Color Hoodie casual White Spring Polyester Long Sleeve T-shirt Base Clothing Fashion hoodie', sizes: ['S', 'M', 'L', 'XL', 'XXL']},
    { title: 'Black Puffer Coat', label: '$1.00', color: '#ff7300', image: 'https://png.pngtree.com/png-clipart/20250107/original/pngtree-matte-black-hooded-puffer-jacket-png-image_19961352.png', description: 'Black puffer Coat with Graphene Liner Graphene Thermal Puffer Jacket with Hood Stylish Black Color Block Coat for Warmth Style Mid-length Outwear for Cold Weather Black Inner Layer Cotton Coat' }
];

// ==============================
// State
// ==============================
let spinsLeft = localStorage.getItem('spinsLeft');
spinsLeft = spinsLeft === null ? 3 : parseInt(spinsLeft);
let currentRotation = 0;
let isSpinning = false;
let currentProduct = null;
let currentStep = localStorage.getItem('currentStep') || 'game';
// ==============================
// DOM Elements
// ==============================
document.addEventListener("DOMContentLoaded", () => {

    let currentSlide = 0;
    const slides = document.querySelector('.slides');
    const totalSlides = document.querySelectorAll('.slide').length;

    function moveSlide() {
        currentSlide++;

        // normal slide
        slides.style.transition = "transform 0.6s ease-in-out";
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;

        // if last slide reached → reset instantly
        if (currentSlide === totalSlides) {
            setTimeout(() => {
                slides.style.transition = "none"; // remove animation
                slides.style.transform = `translateX(0%)`;
                currentSlide = 0;
            }, 600); // same as transition duration
        }
    }

    setInterval(moveSlide, 5000);

});

const viewGame = document.getElementById('view-game');
const stepWin = document.getElementById('step-win');
const stepDelivery = document.getElementById('step-delivery');
const stepPayment = document.getElementById('step-payment');
const stepOtp = document.getElementById('step-otp');
const loading = document.getElementById('loading');

const continueBtn = document.getElementById('continue-btn');
const closeBtn = document.getElementById('close-btn');
const backToWin = document.getElementById('back-to-win');
const backToDelivery = document.getElementById('back-to-delivery');
const cancelOtp = document.getElementById('cancel-otp');

const deliveryForm = document.getElementById('delivery-form');
const paymentForm = document.getElementById('payment-form');
const otpForm = document.getElementById('otp-form');

const wheelElement = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const progressFill = document.getElementById('progress-fill');
const spinsText = document.getElementById('spins-text');

const resetBtn = document.getElementById('reset-btn');

// ==============================
// INIT UI
// ==============================
function updateUI() {
    spinsText.innerText = `${spinsLeft} / 3`;
    progressFill.style.width = `${(spinsLeft / 3) * 100}%`;

    if (spinsLeft <= 0) {
        spinBtn.disabled = true;
        spinBtn.innerText = "NO SPINS LEFT";
    } else {
        spinBtn.disabled = false;
        spinBtn.innerText = "SPIN NOW";
    }
}

function initWheel() {
    wheelElement.innerHTML = ""; // ✅ ADD THIS LINE

    let conicGradientString = [];
    const degreePerSegment = 360 / products.length;

    products.forEach((prod, index) => {
        const startDeg = index * degreePerSegment;
        const endDeg = startDeg + degreePerSegment;

        conicGradientString.push(`${prod.color} ${startDeg}deg ${endDeg}deg`);

        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'segment';
        segmentDiv.style.transform = `rotate(${startDeg + (degreePerSegment / 2)}deg)`;

        const img = document.createElement('img');
        img.src = prod.image;

        const textSpan = document.createElement('span');
        textSpan.innerText = prod.label;

        segmentDiv.appendChild(img);
        segmentDiv.appendChild(textSpan);

        wheelElement.appendChild(segmentDiv);
    });

    wheelElement.style.background = `conic-gradient(${conicGradientString.join(', ')})`;
}

// ==============================
// WIN LOGIC
// ==============================
function getWinningIndex() {
    const tryAgainIndex = 3;
    const prizeIndices = [0, 1, 2, 4, 5, 6, 7];

    if (spinsLeft === 3) {
        return tryAgainIndex; // first always try again
    }

    if (spinsLeft === 2) {
        // 50% chance try again
        return Math.random() < 0.5
            ? tryAgainIndex
            : prizeIndices[Math.floor(Math.random() * prizeIndices.length)];
    }

    // last spin always win
    return prizeIndices[Math.floor(Math.random() * prizeIndices.length)];
}

// ==============================
// SPIN ACTION
// ==============================
spinBtn.addEventListener('click', () => {
    if (isSpinning || spinsLeft <= 0) return;

    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.innerText = "SPINNING...";

// 🔥 RESET TRANSFORM (fix drift)
    wheelElement.style.transition = "none";
    wheelElement.style.transform = "rotate(0deg)";
    void wheelElement.offsetWidth; // force reflow
    wheelElement.style.transition = "transform 4s cubic-bezier(0.25, 1, 0.5, 1)";
    
    const winningIndex = getWinningIndex();
const degreePerSegment = 360 / products.length;

// 🎯 random extra spins (5 to 8 rounds)
const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));

// 🎯 small random offset inside segment (natural feel)
const randomOffset = (Math.random() - 0.5) * (degreePerSegment * 0.6);

const targetSegmentRotation =
    360 - (winningIndex * degreePerSegment) - (degreePerSegment / 2);

currentRotation = extraSpins + targetSegmentRotation + randomOffset;

wheelElement.style.transform = `rotate(${currentRotation}deg)`;

    spinsLeft--;
    localStorage.setItem('spinsLeft', spinsLeft);
    updateUI();

    wheelElement.ontransitionend = () => {
    wheelElement.ontransitionend = null; // prevent duplicate calls
    showResult(products[winningIndex]);
};
});
// ==============================
// NAVIGATION LOGIC
// ==============================
function showStep(step) {

    localStorage.setItem('currentStep', step);

    // Hide all
    viewGame.classList.add('hidden');
    stepWin.classList.add('hidden');
    stepDelivery.classList.add('hidden');
    stepPayment.classList.add('hidden');
    stepOtp.classList.add('hidden');

    // Show selected
    if (step === 'game') viewGame.classList.remove('hidden');
    if (step === 'win') stepWin.classList.remove('hidden');
    if (step === 'delivery') stepDelivery.classList.remove('hidden');
    if (step === 'payment') stepPayment.classList.remove('hidden');
    if (step === 'otp') stepOtp.classList.remove('hidden');

    window.scrollTo(0, 0);
}

function showResult(winningProduct) {
    currentProduct = winningProduct;

localStorage.setItem('lastProduct', JSON.stringify(winningProduct));

    const sizeContainer = document.getElementById('size-container');
    const sizeSelect = document.getElementById('size-select');

    // reset dropdown
    sizeContainer.classList.add('hidden');
    sizeSelect.innerHTML = '<option value="">Choose size</option>';

    // ✅ show sizes if product has it
    if (winningProduct.sizes) {
        sizeContainer.classList.remove('hidden');

        winningProduct.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
    }

    // ✅ Try Again logic (FIXED)
if (winningProduct.title === 'Try Again') {

    // ❌ no confetti
    document.getElementById('win-title').innerText = "Oh no!";
    document.getElementById('win-prize').innerText = "";

    continueBtn.classList.add('hidden');
    closeBtn.classList.remove('hidden');

} else {

    // 🎉 START CONFETTI HERE
    startConfetti();

    document.getElementById('win-title').innerText = "Congratulations!";
    document.getElementById('win-prize').innerText = winningProduct.label;

    continueBtn.classList.remove('hidden');
    closeBtn.classList.add('hidden');
}

    document.getElementById('win-image').src = winningProduct.image;
    document.getElementById('win-product-title').innerText = winningProduct.title;
    document.getElementById('win-description').innerText = winningProduct.description;

    showStep('win');
}
function resetFlow() {
    isSpinning = false;
    updateUI();
    deliveryForm.reset();
    paymentForm.reset();
    otpForm.reset();
    showStep('game');
}

continueBtn.addEventListener('click', () => {

    // ✅ check size if exists
    if (currentProduct.sizes) {
        const selectedSize = document.getElementById('size-select').value;

        if (!selectedSize) {
            alert("Please select a size");
            return;
        }

        currentProduct.selectedSize = selectedSize;
    }

    loading.classList.remove('hidden');

    setTimeout(() => {
        loading.classList.add('hidden');

        document.getElementById('delivery-image').src = currentProduct.image;
        document.getElementById('delivery-title').innerText = currentProduct.title;

        let usdPrice = currentProduct.label;

// extract numeric USD value
let usdValue = parseFloat(usdPrice.replace('$', ''));

// convert to LKR
let lkrValue = (usdValue * USD_TO_LKR).toFixed(2);

let priceText = `${usdPrice} (≈ Rs. ${lkrValue})`;

if (currentProduct.selectedSize) {
    priceText += " | Size: " + currentProduct.selectedSize;
}
        document.getElementById('delivery-price').innerText = priceText;

        showStep('delivery');
    }, 500);
});

closeBtn.addEventListener('click', resetFlow);
backToWin.addEventListener('click', () => showStep('win'));
backToDelivery.addEventListener('click', () => showStep('delivery'));
cancelOtp.addEventListener('click', resetFlow); // Cancel the whole flow

// ==============================
// INPUT FORMATTERS
// ==============================

// Card Number Formatting (1234-1234-1234-1234)
document.getElementById('card-number').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = value.replace(/(.{4})/g, '$1-').replace(/-$/, '');
});

// Expiry Date Formatting (MM/YY)
document.getElementById('card-expiry').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
        e.target.value = value;
    }
});

// CVV Formatting (3 digits only)
document.getElementById('card-cvv').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
});

// OTP Formatting (6 digits only)
document.getElementById('otp-input').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
});

// ==============================
// FORMS SUBMISSION
// ==============================
deliveryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loading.classList.remove('hidden');
    setTimeout(() => {
        loading.classList.add('hidden');
        showStep('payment');
    }, 800);
});

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loading.classList.remove('hidden');
    setTimeout(() => {
        loading.classList.add('hidden');
        showStep('otp');
    }, 1200);
});

otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loading.classList.remove('hidden');
    setTimeout(() => {
        loading.classList.add('hidden');
        alert("Payment verified and ordee submitted successfully!");
        resetFlow();
    }, 1500);
});

// ==============================
// RESET (TESTING ONLY)
// ==============================
resetBtn.addEventListener('click', () => {
    localStorage.clear(); // 🔥 clears everything
    spinsLeft = 3;
    updateUI();
    showStep('game');
});

// Start App
initWheel();
updateUI();
restoreProduct();

let savedStep = localStorage.getItem('currentStep') || 'game';

// 🔥 AUTO REDIRECT RULE
if (savedStep === 'delivery') {
    savedStep = 'win';
}

showStep(savedStep);

// 🎉 CONFETTI ANIMATION
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

let confetti = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createConfetti() {
    confetti = [];
    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 4,
            speed: Math.random() * 3 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            tilt: Math.random() * 10 - 5
        });
    }
}

function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confetti.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, c.size, c.size);

        c.y += c.speed;
        c.x += Math.sin(c.y * 0.05);

        if (c.y > canvas.height) {
            c.y = -10;
        }
    });

    requestAnimationFrame(drawConfetti);
}

function startConfetti() {
    createConfetti();
    drawConfetti();

    // auto stop after 4 sec
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti = [];
    }, 4000);
}


function restoreProduct() {
    const savedProduct = localStorage.getItem('lastProduct');
    if (!savedProduct) return;

    currentProduct = JSON.parse(savedProduct);

    document.getElementById('win-image').src = currentProduct.image;
    document.getElementById('win-product-title').innerText = currentProduct.title;
    document.getElementById('win-description').innerText = currentProduct.description;

    const sizeContainer = document.getElementById('size-container');
    const sizeSelect = document.getElementById('size-select');

    // reset dropdown
    sizeContainer.classList.add('hidden');
    sizeSelect.innerHTML = '<option value="">Choose size</option>';

    // restore sizes if exist
    if (currentProduct.sizes) {
        sizeContainer.classList.remove('hidden');

        currentProduct.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
    }

    if (currentProduct.title === 'Try Again') {
        document.getElementById('win-title').innerText = "Oh no!";
        document.getElementById('win-prize').innerText = "";

        continueBtn.classList.add('hidden');
        closeBtn.classList.remove('hidden');
    } else {
        document.getElementById('win-title').innerText = "Congratulations!";
        document.getElementById('win-prize').innerText = currentProduct.label;

        continueBtn.classList.remove('hidden');
        closeBtn.classList.add('hidden');
    }
}


