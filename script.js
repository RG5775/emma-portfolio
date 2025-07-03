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
        // Reset all faces to their default CSS transforms (cube structure maintained by CSS)
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(face => {
            const faceElement = cube.querySelector(`.cube-face.${face}`);
            if (faceElement) {
                // Clear any inline transform to restore CSS defaults
                faceElement.style.transform = '';
            }
        });
        
        // Only apply extra forward effect when cube is positioned to show a single face clearly
        if (isSingleFaceView()) {
            const frontFace = getCurrentFrontFace();
            if (frontFace) {
                applyExtraForwardEffect(frontFace);
            }
        }
        
        // Apply the overall cube rotation
        cube.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
        console.log(`Cube rotated to: X=${currentRotationX}, Y=${currentRotationY}${isSingleFaceView() ? ', Front face: ' + getCurrentFrontFace() : ', Multi-face view'}`);
    }
    
    function isSingleFaceView() {
        // Check if the cube is positioned to show primarily a single face
        // This happens when rotations are close to multiples of 90 degrees
        const threshold = 30; // degrees - within 30° of a cardinal direction
        
        // Check Y rotation (for front/back/left/right faces)
        const normalizedY = ((currentRotationY % 360) + 360) % 360;
        const yCloseToCardinal = [0, 90, 180, 270].some(cardinal => {
            const diff = Math.min(Math.abs(normalizedY - cardinal), Math.abs(normalizedY - cardinal + 360), Math.abs(normalizedY - cardinal - 360));
            return diff <= threshold;
        });
        
        // Check X rotation (for top/bottom faces or normal side views)
        const xCloseToNormal = Math.abs(currentRotationX) <= threshold; // Close to 0°
        const xCloseToCardinal = Math.abs(Math.abs(currentRotationX) - 90) <= threshold; // Close to ±90°
        
        return (yCloseToCardinal && xCloseToNormal) || xCloseToCardinal;
    }

    function isFaceVisibleAndFacing(faceName) {
        // Check if a face is visible and facing the viewer enough for hover effects
        // Allow hover effects when X rotation is minimal and face is reasonably facing viewer
        
        // Don't allow hover effects when looking up/down significantly
        if (Math.abs(currentRotationX) > 45) {
            return ['top', 'bottom'].includes(faceName) && Math.abs(currentRotationX) > 60;
        }
        
        // For Y-axis faces, check if they're facing the viewer within reasonable range
        const normalizedY = ((currentRotationY % 360) + 360) % 360;
        
        switch(faceName) {
            case 'front':
                // Front face is hoverable when rotation is roughly -60° to +60°
                return normalizedY >= 300 || normalizedY <= 60;
            case 'right': 
                // Right face is hoverable when rotation is roughly -150° to -30° (210° to 330°)
                return normalizedY >= 210 && normalizedY <= 330;
            case 'back':
                // Back face is hoverable when rotation is roughly 120° to 240°
                return normalizedY >= 120 && normalizedY <= 240;
            case 'left':
                // Left face is hoverable when rotation is roughly 30° to 150°
                return normalizedY >= 30 && normalizedY <= 150;
            case 'top':
                return currentRotationX < -60;
            case 'bottom':
                return currentRotationX > 60;
            default:
                return false;
        }
    }

    function getCurrentFrontFace() {
        // Determine which face is most directly facing the viewer
        const normalizedY = ((currentRotationY % 360) + 360) % 360;
        const normalizedX = ((currentRotationX % 360) + 360) % 360;
        
        // Only consider top/bottom faces when X rotation is significant (more than 60 degrees)
        if (Math.abs(currentRotationX) > 60) {
            if (currentRotationX > 60) {
                return 'bottom'; // When looking down significantly
            } else if (currentRotationX < -60) {
                return 'top'; // When looking up significantly
            }
        }
        
        // For normal Y-axis rotation, determine front face based on Y rotation
        // Note: Cube rotation works opposite to face visibility
        if (normalizedY >= 315 || normalizedY <= 45) {
            return 'front';     // 0° rotation shows front face
        } else if (normalizedY >= 45 && normalizedY <= 135) {
            return 'left';      // 90° rotation shows left face  
        } else if (normalizedY >= 135 && normalizedY <= 225) {
            return 'back';      // 180° rotation shows back face
        } else if (normalizedY >= 225 && normalizedY <= 315) {
            return 'right';     // 270° rotation (-90°) shows right face
        }
        
        return 'front'; // Default fallback
    }
    
    function applyExtraForwardEffect(faceName) {
        const cubeElement = document.querySelector('.cube-face');
        const cubeSize = cubeElement ? parseFloat(getComputedStyle(cubeElement).width) : 546;
        const halfSize = cubeSize / 2;
        const extraDistance = cubeSize / 12; // Subtle extra forward distance for front face effect
        
        const faceElement = cube.querySelector(`.cube-face.${faceName}`);
        if (faceElement) {
            let enhancedTransform = '';
            
            switch(faceName) {
                case 'front':
                    enhancedTransform = `translateZ(${halfSize + extraDistance}px)`;
                    break;
                case 'back':
                    enhancedTransform = `rotateY(180deg) translateZ(${halfSize + extraDistance}px)`;
                    break;
                case 'right':
                    enhancedTransform = `rotateY(90deg) translateZ(${halfSize + extraDistance}px)`;
                    break;
                case 'left':
                    enhancedTransform = `rotateY(-90deg) translateZ(${halfSize + extraDistance}px)`;
                    break;
                case 'top':
                    enhancedTransform = `rotateX(90deg) translateZ(${halfSize + extraDistance}px)`;
                    break;
                case 'bottom':
                    enhancedTransform = `rotateX(-90deg) translateZ(${halfSize + extraDistance}px)`;
                    break;
            }
            
            faceElement.style.transform = enhancedTransform;
        }
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
        // Apply hover effect to any visible face that's facing forward enough
        if (!isFaceVisibleAndFacing(faceName)) {
            return; // Don't apply hover effect for faces that are facing away
        }
        
        const cubeElement = document.querySelector('.cube-face');
        const cubeSize = cubeElement ? parseFloat(getComputedStyle(cubeElement).width) : 546;
        const halfSize = cubeSize / 2;
        const hoverDistance = cubeSize / 4; // Additional forward movement on hover
        
        const faceElement = cube.querySelector(`.cube-face.${faceName}`);
        if (faceElement) {
            let hoverTransform = '';
            
            switch(faceName) {
                case 'front':
                    hoverTransform = `translateZ(${halfSize + hoverDistance}px)`;
                    break;
                case 'back':
                    hoverTransform = `rotateY(180deg) translateZ(${halfSize + hoverDistance}px)`;
                    break;
                case 'right':
                    hoverTransform = `rotateY(90deg) translateZ(${halfSize + hoverDistance}px)`;
                    break;
                case 'left':
                    hoverTransform = `rotateY(-90deg) translateZ(${halfSize + hoverDistance}px)`;
                    break;
                case 'top':
                    hoverTransform = `rotateX(90deg) translateZ(${halfSize + hoverDistance}px)`;
                    break;
                case 'bottom':
                    hoverTransform = `rotateX(-90deg) translateZ(${halfSize + hoverDistance}px)`;
                    break;
            }
            
            faceElement.style.transform = hoverTransform;
        }
    }
    
    function resetFacePosition(faceName) {
        // Simply refresh the display to restore proper face positioning
        updateDisplay();
    }
    
    function resetAllFaces() {
        // Simply refresh the display to restore all faces to proper positions
        updateDisplay();
    }
    

}); 