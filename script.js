/**
 * FateSpinner - Minimalist Core Logic
 * Handles dynamic segments via conic-gradient and CSS transitions for rotation.
 */

const state = {
    items: [],
    isSpinning: false,
    currentRotation: 0
};

// UI Elements
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const wordInput = document.getElementById('wordInput');
const addWordBtn = document.getElementById('addWordBtn');
const itemsList = document.getElementById('itemsList');
const resetBtn = document.getElementById('resetBtn');
const resultOverlay = document.getElementById('resultOverlay');
const winnerName = document.getElementById('winnerName');
const closeResult = document.getElementById('closeResult');

/**
 * Update UI and Wheel segments
 */
function render() {
    // 1. Update Buttons
    spinBtn.disabled = state.items.length < 2 || state.isSpinning;

    // 2. Render List
    itemsList.innerHTML = '';
    state.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'item-chip';
        li.innerHTML = `
            <span>${item}</span>
            <button class="remove-btn" onclick="removeItem(${index})" aria-label="Remove ${item}">&times;</button>
        `;
        itemsList.appendChild(li);
    });

    // 3. Clear existing text labels and separators
    wheel.querySelectorAll('.wheel-text, .wheel-separator').forEach(el => el.remove());

    // 4. Update Wheel Gradient
    if (state.items.length === 0) {
        wheel.style.background = 'var(--accent)';
    } else if (state.items.length === 1) {
        wheel.style.background = 'var(--white)';
    } else {
        const step = 100 / state.items.length;
        // Use an alternating neutral palette for segments
        const colors = ['#FFFFFF', '#F0F0EE', '#E8E8E3', '#E0E0DB'];

        let gradientParts = state.items.map((_, i) => {
            const color = colors[i % colors.length];
            return `${color} ${i * step}% ${(i + 1) * step}%`;
        });

        wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;

        // Render Text Labels
        state.items.forEach((item, i) => {
            const label = document.createElement('div');
            label.className = 'wheel-text';
            label.textContent = item;

            // Calculate angle: Start of segment + half of segment size
            const segmentAngle = 360 / state.items.length;
            const angle = (i * segmentAngle) + (segmentAngle / 2);

            // Rotate to angle, then move out to radius
            // We rotate -90deg first because 0deg is usually 3 o'clock in CSS transform, but we want top.
            // Actually, for the text to radiate out:
            // Rotate to the angle.
            // Translate X (outward). 
            // Note: conic-gradient starts at 12 o'clock (0deg).
            // CSS transform rotate(0deg) points to 12 o'clock if we assume standard flow? 
            // Let's standardise: origin is center.
            // rotate(angle) turns it. translate(radius/2) pushes it out.

            // Adjust angle: our conic gradient starts at 0deg (top).
            // CSS rotation usually starts 0deg (top) if element is top-left aligned? No, standard 0 is usually right if using polar, but here we invoke transform.
            // Let's assume 0deg is TOP.

            label.style.transform = `rotate(${angle}deg) translateY(-50%) translateX(60px)`;
            // translateX moves it "right" relative to the rotation. 
            // If angle is 0 (top), "right" is... right. We want "up"?
            // Wait, transform order: rotate -> translate.
            // If items are at 0deg (top segment), we want text at top.
            // rotate(-90deg) would put "X" axis pointing up.

            // refined: rotate(angle - 90deg) makes X axis match the segment direction (assuming 0 is top)
            label.style.transform = `rotate(${angle - 90}deg) translateX(70px)`;
            // -90 so that 0deg segment (top) has text rotated to -90 (pointing up) -> translateX moves it up.

            wheel.appendChild(label);
        });

        // 6. Add separator lines between segments
        const segmentAngle = 360 / state.items.length;
        for (let i = 0; i < state.items.length; i++) {
            const line = document.createElement('div');
            line.className = 'wheel-separator';
            line.style.transform = `rotate(${i * segmentAngle - 90}deg)`;
            wheel.appendChild(line);
        }
    }
}

/**
 * Add item to list
 */
function addItem() {
    const value = wordInput.value.trim();
    if (value && !state.isSpinning) {
        state.items.push(value);
        wordInput.value = '';
        render();
    }
}

/**
 * Remove item from list
 */
window.removeItem = (index) => {
    if (!state.isSpinning) {
        state.items.splice(index, 1);
        render();
    }
};

/**
 * Perform spin
 */
function spin() {
    if (state.isSpinning || state.items.length < 2) return;

    state.isSpinning = true;
    spinBtn.disabled = true;

    // Randomize rotation: 5-8 full spins + random offset
    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const randomOffset = Math.random() * 360;
    state.currentRotation += (extraSpins * 360) + randomOffset;

    wheel.style.transform = `rotate(${state.currentRotation}deg)`;

    // Calculate result after transition
    setTimeout(() => {
        state.isSpinning = false;

        // Final angle normalization (relative to arrow at 0 deg / top center)
        // Wheel rotates clockwise, so the index at top is (360 - (currentRotation % 360)) / (360 / items.length)
        const totalItems = state.items.length;
        const normalizedAngle = (360 - (state.currentRotation % 360)) % 360;
        const winnerIndex = Math.floor(normalizedAngle / (360 / totalItems));

        showResult(state.items[winnerIndex]);
        render(); // Re-enable button
    }, 4000); // Matches CSS transition duration
}

function showResult(winner) {
    winnerName.textContent = winner;
    resultOverlay.classList.remove('hidden');
}

/**
 * Events
 */
addWordBtn.addEventListener('click', addItem);
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
});

spinBtn.addEventListener('click', spin);

resetBtn.addEventListener('click', () => {
    if (!state.isSpinning) {
        state.items = [];
        render();
    }
});

closeResult.addEventListener('click', () => {
    resultOverlay.classList.add('hidden');
});

// Initial Render
render();
