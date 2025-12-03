const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const wordInput = document.getElementById('wordInput');
const addWordBtn = document.getElementById('addWordBtn');
const spinBtn = document.getElementById('spinBtn');
const resetBtn = document.getElementById('resetBtn');
const modal = document.getElementById('winnerModal');
const winnerEl = document.getElementById('winner');
const closeBtn = document.querySelector('.close-btn');

let words = [];
let spinning = false;
let rotation = 0;

function drawWheel() {
    const numSegments = words.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    // Set canvas size based on its container
    const container = document.querySelector('.container');
    wheel.width = container.clientWidth;
    wheel.height = container.clientHeight;
    const radius = wheel.width / 2 - 10;
    const center = wheel.width / 2;


    ctx.clearRect(0, 0, wheel.width, wheel.height);

    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * anglePerSegment;
        const endAngle = (i + 1) * anglePerSegment;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = `hsl(${(i * 360) / numSegments}, 70%, 80%)`;
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + anglePerSegment / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#333';
        ctx.font = `bold ${radius / 10}px sans-serif`;
        ctx.fillText(words[i], radius - 15, 10);
        ctx.restore();
    }
}

function addWord() {
    const word = wordInput.value.trim();
    if (word) {
        words.push(word);
        wordInput.value = '';
        drawWheel();
    }
}

function spin() {
    if (words.length < 2) {
        alert('Please add at least two words to the wheel.');
        return;
    }

    if (!spinning) {
        spinning = true;
        const spinAngle = Math.random() * 360 + 360 * 5; // Random spin angle
        rotation += spinAngle;
        wheel.style.transform = `rotate(${rotation}deg)`;

        setTimeout(() => {
            const numSegments = words.length;
            const degreesPerSegment = 360 / numSegments;
            const winningSegment = Math.floor((360 - (rotation % 360) + degreesPerSegment / 2) / degreesPerSegment) % numSegments;
            showWinner(words[winningSegment]);
            spinning = false;
        }, 4000); // Corresponds to the transition duration in CSS
    }
}

function reset() {
    words = [];
    drawWheel();
}

function showWinner(winner) {
    winnerEl.textContent = winner;
    modal.style.display = 'block';
}

function hideWinner() {
    modal.style.display = 'none';
}

addWordBtn.addEventListener('click', addWord);
spinBtn.addEventListener('click', spin);
resetBtn.addEventListener('click', reset);
closeBtn.addEventListener('click', hideWinner);
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        hideWinner();
    }
});

window.addEventListener('resize', drawWheel);


drawWheel();
