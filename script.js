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

// Function to check input and enable/disable spin button accordingly
function checkInput() {
    const word = wordInput.value.trim();


    // Enable spin button if there are at least 2 words
    if (words.length >= 2) {
        spinBtn.disabled = false;
        spinBtn.classList.remove('disabled');
    } else {
        spinBtn.disabled = true;
        spinBtn.classList.add('disabled');
    }
}

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
        checkInput(); // Update input validation after adding word
    }
}

function spin() {
    if (words.length < 2) {
        alert('Please add at least two words to the wheel.');
        return;
    }

    if (!spinning) {
        spinning = true;

        // Disable the spin button during spinning
        spinBtn.disabled = true;
        spinBtn.classList.add('disabled');

        // Calculate random number of full rotations (3-8) plus a random final position
        const numSegments = words.length;
        const degreesPerSegment = 360 / numSegments;
        const minRotations = 3;
        const maxRotations = 8;
        const extraRotations = Math.random() * (maxRotations - minRotations) + minRotations;

        // Random final position within a segment to make it more realistic
        const randomFinalOffset = Math.random() * degreesPerSegment;

        // Calculate target rotation (number of full rotations + offset to winning segment)
        const winningSegmentIndex = Math.floor(Math.random() * numSegments);
        const winningOffset = winningSegmentIndex * degreesPerSegment;

        // Target rotation is the number of full rotations minus the offset to the winning segment
        // (subtracting because we want the winning segment to end up at the top)
        const targetRotation = rotation + (extraRotations * 360) + randomFinalOffset - winningOffset;

        // Store the winning word for later use
        const winner = words[winningSegmentIndex];

        // Apply the rotation with CSS transition for smooth animation
        rotation = targetRotation;
        wheel.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)'; // Custom easing for deceleration
        wheel.style.transform = `rotate(${rotation}deg)`;

        // After the animation completes, show the winner
        setTimeout(() => {
            showWinner(winner);
            spinning = false;

            // Re-enable the spin button
            spinBtn.disabled = words.length < 2;
            spinBtn.classList.remove('disabled');
        }, 4000); // Matches CSS transition duration
    }
}

function reset() {
    words = [];
    drawWheel();
    checkInput(); // Update button state after reset
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

// Add event listeners for input field
wordInput.addEventListener('input', checkInput);
wordInput.addEventListener('propertychange', checkInput); // For older browsers

window.addEventListener('resize', drawWheel);

// Initialize the input check
checkInput();

drawWheel();
