document.addEventListener('DOMContentLoaded', function() {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    const wordInput = document.getElementById('wordInput');
    const resultDiv = document.getElementById('result');
    
    // Segments of the wheel
    const segments = [
        "FATE", "DESTINY", "LUCK", "FORTUNE", 
        "CHANCE", "FATE", "DESTINY", "LUCK"
    ];
    
    // Colors for the segments
    const colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
        "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"
    ];
    
    // Create segments dynamically
    function createWheelSegments() {
        wheel.innerHTML = '';
        const segmentAngle = 360 / segments.length;
        
        segments.forEach((segment, index) => {
            const segmentElement = document.createElement('div');
            segmentElement.className = 'segment';
            segmentElement.style.transform = `rotate(${index * segmentAngle}deg)`;
            segmentElement.style.backgroundColor = colors[index];
            segmentElement.textContent = segment;
            wheel.appendChild(segmentElement);
        });
    }
    
    // Initialize the wheel
    createWheelSegments();
    
    // Spin the wheel
    spinButton.addEventListener('click', function() {
        // Get the input word
        const word = wordInput.value.trim();
        
        // Validate input
        if (!word) {
            alert('Please enter a word first!');
            return;
        }
        
        // Disable the button during spinning
        spinButton.disabled = true;
        spinButton.classList.add('disabled');
        
        // Clear previous result
        resultDiv.textContent = '';
        
        // Calculate a random rotation (multiple of 360 + random segment angle)
        const segmentAngle = 360 / segments.length;
        const randomSegment = Math.floor(Math.random() * segments.length);
        const extraRotations = 5; // Number of extra full rotations
        const totalRotation = (360 * extraRotations) + (360 - (randomSegment * segmentAngle));
        
        // Apply the rotation with transition
        wheel.style.transform = `rotate(${totalRotation}deg)`;
        
        // After spinning is done, show the result
        setTimeout(() => {
            const result = segments[randomSegment];
            resultDiv.innerHTML = `Your word "<strong>${word}</strong>" meets <strong>${result}</strong>!`;
            
            // Re-enable the button
            spinButton.disabled = false;
            spinButton.classList.remove('disabled');
        }, 4000); // Match the CSS transition duration
    });
    
    // Allow pressing Enter to spin the wheel
    wordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            spinButton.click();
        }
    });
});