// Future JavaScript code goes here 

// Interactive 3D Cube Functionality
document.addEventListener('DOMContentLoaded', function() {
    const cubeContainer = document.querySelector('.cube-container');
    const cube = document.getElementById('cube');
    const timelineButtons = document.querySelectorAll('.timeline-btn');
    const interactionHint = document.getElementById('interactionHint');
    
    // Check if elements exist before proceeding
    if (!cube || !cubeContainer) {
        console.log('3D cube elements not found');
        return;
    }
    
    let currentRotation = 0; // Current Y rotation
    let isDragging = false;
    let startX = 0;
    let startRotation = 0;
    
    // Initialize
    updateDisplay();
    
    // Timeline button functionality
    timelineButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetRotation = parseInt(this.dataset.rotation);
            currentRotation = targetRotation;
            updateDisplay();
            updateActiveButton();
        });
    });
    
    // Mouse drag functionality
    cube.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startRotation = currentRotation;
        cube.style.cursor = 'grabbing';
        hideInteractionHint();
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const rotationSpeed = 0.5; // Adjust sensitivity
        const newRotation = startRotation + (deltaX * rotationSpeed);
        
        // Snap to nearest face (0, 90, -90)
        let snappedRotation = newRotation;
        if (Math.abs(newRotation - 0) < 30) snappedRotation = 0;
        else if (Math.abs(newRotation - 90) < 30) snappedRotation = 90;
        else if (Math.abs(newRotation + 90) < 30) snappedRotation = -90;
        else if (newRotation > 60) snappedRotation = 90;
        else if (newRotation < -60) snappedRotation = -90;
        
        currentRotation = snappedRotation;
        updateDisplay();
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            cube.style.cursor = 'grab';
            updateActiveButton();
            showInteractionHint();
        }
    });
    
    // Touch functionality for mobile
    let startTouchX = 0;
    
    cube.addEventListener('touchstart', function(e) {
        isDragging = true;
        startTouchX = e.touches[0].clientX;
        startRotation = currentRotation;
        hideInteractionHint();
        e.preventDefault();
    });
    
    cube.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.touches[0].clientX - startTouchX;
        const rotationSpeed = 0.3; // Less sensitive on mobile
        const newRotation = startRotation + (deltaX * rotationSpeed);
        
        // Snap to nearest face
        let snappedRotation = newRotation;
        if (Math.abs(newRotation - 0) < 45) snappedRotation = 0;
        else if (Math.abs(newRotation - 90) < 45) snappedRotation = 90;
        else if (Math.abs(newRotation + 90) < 45) snappedRotation = -90;
        else if (newRotation > 45) snappedRotation = 90;
        else if (newRotation < -45) snappedRotation = -90;
        
        currentRotation = snappedRotation;
        updateDisplay();
        
        e.preventDefault();
    });
    
    cube.addEventListener('touchend', function() {
        isDragging = false;
        updateActiveButton();
        showInteractionHint();
    });
    
    // Show/hide interaction hint
    cubeContainer.addEventListener('mouseenter', showInteractionHint);
    cubeContainer.addEventListener('mouseleave', hideInteractionHint);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.target.closest('#interactive-banner')) {
            if (e.key === 'ArrowRight') {
                if (currentRotation === 0) currentRotation = 90;
                else if (currentRotation === -90) currentRotation = 0;
                updateDisplay();
                updateActiveButton();
            } else if (e.key === 'ArrowLeft') {
                if (currentRotation === 0) currentRotation = -90;
                else if (currentRotation === 90) currentRotation = 0;
                updateDisplay();
                updateActiveButton();
            }
        }
    });
    
    function updateDisplay() {
        cube.style.transform = `rotateY(${currentRotation}deg)`;
    }
    
    function updateActiveButton() {
        timelineButtons.forEach(button => {
            const buttonRotation = parseInt(button.dataset.rotation);
            button.classList.toggle('active', buttonRotation === currentRotation);
        });
    }
    
    function showInteractionHint() {
        if (!isDragging && interactionHint) {
            interactionHint.style.opacity = '0.8';
        }
    }
    
    function hideInteractionHint() {
        if (interactionHint) {
            interactionHint.style.opacity = '0';
        }
    }
    
    // Optional auto-rotate demo (disabled by default)
    let autoRotateTimeout;
    
    function startAutoRotateDemo() {
        autoRotateTimeout = setTimeout(() => {
            if (!isDragging) {
                // Cycle through positions for demo
                const rotations = [0, 90, -90];
                const currentIndex = rotations.indexOf(currentRotation);
                const nextIndex = (currentIndex + 1) % rotations.length;
                currentRotation = rotations[nextIndex];
                updateDisplay();
                updateActiveButton();
                startAutoRotateDemo();
            } else {
                startAutoRotateDemo();
            }
        }, 4000); // Change every 4 seconds
    }
    
    function stopAutoRotateDemo() {
        clearTimeout(autoRotateTimeout);
    }
    
    // Uncomment to enable auto-rotate demo
    // startAutoRotateDemo();
    
    // Stop auto-rotate on user interaction
    cubeContainer.addEventListener('mousedown', stopAutoRotateDemo);
    cubeContainer.addEventListener('touchstart', stopAutoRotateDemo);
}); 