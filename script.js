// Future JavaScript code goes here 

// Interactive 3D Cube Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing 3D Cube');
    
    const cubeContainer = document.querySelector('.cube-container');
    const cube = document.getElementById('cube');
    const timelineButtons = document.querySelectorAll('.timeline-btn');
    const interactionHint = document.getElementById('interactionHint');
    
    console.log('Elements found:', {
        cubeContainer: !!cubeContainer,
        cube: !!cube,
        timelineButtons: timelineButtons.length,
        interactionHint: !!interactionHint
    });
    
    // Check if elements exist before proceeding
    if (!cube || !cubeContainer) {
        console.error('3D cube elements not found');
        return;
    }
    
    let currentRotationY = -45; // Start showing both accountant and data analyst faces
    let currentRotationX = 0; // Current X rotation
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startRotationY = 0;
    let startRotationX = 0;
    
    // Initialize cube faces and display
    updateDisplay();
    console.log('3D Cube initialized successfully');
    
    // Add hover effects to individual faces
    addFaceHoverEffects();
    
    // Timeline button functionality
    timelineButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetRotation = parseInt(this.dataset.rotation);
            currentRotationY = targetRotation;
            currentRotationX = 0; // Reset X rotation when using buttons
            console.log('Timeline button clicked:', targetRotation);
            updateDisplay();
            updateActiveButton();
        });
    });
    
    // Mouse drag functionality
    cube.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startRotationY = currentRotationY;
        startRotationX = currentRotationX;
        cube.style.cursor = 'grabbing';
        hideInteractionHint();
        resetAllFaces(); // Reset faces when dragging starts
        console.log('Drag started');
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const rotationSpeed = 0.8; // More responsive
        const deadzone = 2;
        if (Math.abs(deltaX) < deadzone && Math.abs(deltaY) < deadzone) return;
        
        currentRotationY = startRotationY + (deltaX * rotationSpeed);
        currentRotationX = Math.max(-90, Math.min(90, startRotationX - (deltaY * rotationSpeed)));
        
        updateDisplay();
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            cube.style.cursor = 'grab';
            updateActiveButton();
            showInteractionHint();
            console.log('Drag ended');
        }
    });
    
    // Touch functionality for mobile
    let startTouchX = 0;
    let startTouchY = 0;
    
    cube.addEventListener('touchstart', function(e) {
        isDragging = true;
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
        startRotationY = currentRotationY;
        startRotationX = currentRotationX;
        hideInteractionHint();
        resetAllFaces(); // Reset faces when touch dragging starts
        console.log('Touch started');
        e.preventDefault();
    });
    
    cube.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.touches[0].clientX - startTouchX;
        const deltaY = e.touches[0].clientY - startTouchY;
        const rotationSpeed = 0.2; // More responsive on mobile
        const deadzone = 2;
        if (Math.abs(deltaX) < deadzone && Math.abs(deltaY) < deadzone) return;
        
        currentRotationY = startRotationY + (deltaX * rotationSpeed);
        currentRotationX = Math.max(-90, Math.min(90, startRotationX - (deltaY * rotationSpeed)));
        
        updateDisplay();
        
        e.preventDefault();
    });
    
    cube.addEventListener('touchend', function() {
        isDragging = false;
        updateActiveButton();
        showInteractionHint();
        console.log('Touch ended');
    });
    
    // Show/hide interaction hint
    cubeContainer.addEventListener('mouseenter', showInteractionHint);
    cubeContainer.addEventListener('mouseleave', hideInteractionHint);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.target.closest('#interactive-banner') || e.key.startsWith('Arrow')) {
            if (e.key === 'ArrowRight') {
                currentRotationY += 90;
                currentRotationX = 0;
                updateDisplay();
                updateActiveButton();
                console.log('Keyboard: Right arrow');
            } else if (e.key === 'ArrowLeft') {
                currentRotationY -= 90;
                currentRotationX = 0;
                updateDisplay();
                updateActiveButton();
                console.log('Keyboard: Left arrow');
            } else if (e.key === 'ArrowUp') {
                currentRotationX = Math.max(-90, currentRotationX - 90);
                updateDisplay();
                console.log('Keyboard: Up arrow');
            } else if (e.key === 'ArrowDown') {
                currentRotationX = Math.min(90, currentRotationX + 90);
                updateDisplay();
                console.log('Keyboard: Down arrow');
            }
            e.preventDefault();
        }
    });
    
    function updateDisplay() {
        // Get cube size for positioning
        const cubeElement = document.querySelector('.cube-face');
        const cubeSize = cubeElement ? parseFloat(getComputedStyle(cubeElement).width) : 364;
        const halfSize = cubeSize / 2;
        
        // Set all faces to their default attached positions
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(face => {
            const faceElement = cube.querySelector(`.cube-face.${face}`);
            if (faceElement) {
                let baseTransform = '';
                
                switch(face) {
                    case 'front':
                        baseTransform = `translateZ(${halfSize}px)`;
                        break;
                    case 'back':
                        baseTransform = `rotateY(180deg) translateZ(${halfSize}px)`;
                        break;
                    case 'right':
                        baseTransform = `rotateY(90deg) translateZ(${halfSize}px)`;
                        break;
                    case 'left':
                        baseTransform = `rotateY(-90deg) translateZ(${halfSize}px)`;
                        break;
                    case 'top':
                        baseTransform = `rotateX(90deg) translateZ(${halfSize}px)`;
                        break;
                    case 'bottom':
                        baseTransform = `rotateX(-90deg) translateZ(${halfSize}px)`;
                        break;
                }
                
                faceElement.style.transform = baseTransform;
            }
        });
        
        // Apply the overall cube rotation
        cube.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
        console.log(`Cube rotated to: X=${currentRotationX}, Y=${currentRotationY}`);
    }
    
    function updateActiveButton() {
        timelineButtons.forEach(button => {
            const buttonRotation = parseInt(button.dataset.rotation);
            button.classList.toggle('active', buttonRotation === currentRotationY);
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
    
    function addFaceHoverEffects() {
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        
        faces.forEach(faceName => {
            const faceElement = cube.querySelector(`.cube-face.${faceName}`);
            if (faceElement) {
                faceElement.addEventListener('mouseenter', function() {
                    if (!isDragging) {
                        moveFaceForward(faceName);
                    }
                });
                
                faceElement.addEventListener('mouseleave', function() {
                    if (!isDragging) {
                        resetFacePosition(faceName);
                    }
                });
            }
        });
    }
    
    function moveFaceForward(faceName) {
        const cubeElement = document.querySelector('.cube-face');
        const cubeSize = cubeElement ? parseFloat(getComputedStyle(cubeElement).width) : 364;
        const halfSize = cubeSize / 2;
        const moveDistance = cubeSize / 3; // Move 1/3 of cube length forward
        
        const faceElement = cube.querySelector(`.cube-face.${faceName}`);
        if (faceElement) {
            let hoverTransform = '';
            
            switch(faceName) {
                case 'front':
                    hoverTransform = `translateZ(${halfSize + moveDistance}px)`;
                    break;
                case 'back':
                    hoverTransform = `rotateY(180deg) translateZ(${halfSize + moveDistance}px)`;
                    break;
                case 'right':
                    hoverTransform = `rotateY(90deg) translateZ(${halfSize + moveDistance}px)`;
                    break;
                case 'left':
                    hoverTransform = `rotateY(-90deg) translateZ(${halfSize + moveDistance}px)`;
                    break;
                case 'top':
                    hoverTransform = `rotateX(90deg) translateZ(${halfSize + moveDistance}px)`;
                    break;
                case 'bottom':
                    hoverTransform = `rotateX(-90deg) translateZ(${halfSize + moveDistance}px)`;
                    break;
            }
            
            faceElement.style.transform = hoverTransform;
        }
    }
    
    function resetFacePosition(faceName) {
        const cubeElement = document.querySelector('.cube-face');
        const cubeSize = cubeElement ? parseFloat(getComputedStyle(cubeElement).width) : 364;
        const halfSize = cubeSize / 2;
        
        const faceElement = cube.querySelector(`.cube-face.${faceName}`);
        if (faceElement) {
            let baseTransform = '';
            
            switch(faceName) {
                case 'front':
                    baseTransform = `translateZ(${halfSize}px)`;
                    break;
                case 'back':
                    baseTransform = `rotateY(180deg) translateZ(${halfSize}px)`;
                    break;
                case 'right':
                    baseTransform = `rotateY(90deg) translateZ(${halfSize}px)`;
                    break;
                case 'left':
                    baseTransform = `rotateY(-90deg) translateZ(${halfSize}px)`;
                    break;
                case 'top':
                    baseTransform = `rotateX(90deg) translateZ(${halfSize}px)`;
                    break;
                case 'bottom':
                    baseTransform = `rotateX(-90deg) translateZ(${halfSize}px)`;
                    break;
            }
            
            faceElement.style.transform = baseTransform;
        }
    }
    
    function resetAllFaces() {
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(faceName => {
            resetFacePosition(faceName);
        });
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