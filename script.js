// Future JavaScript code goes here 

// Interactive Banner Functionality
document.addEventListener('DOMContentLoaded', function() {
    const bannerWrapper = document.querySelector('.banner-image-wrapper');
    const images = document.querySelectorAll('.banner-image');
    const labels = document.querySelectorAll('.role-label');
    const slider = document.getElementById('slider');
    
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let isHovering = false;
    let hoverTimeout;
    
    // Initialize
    updateDisplay();
    
    // Hover functionality
    bannerWrapper.addEventListener('mouseenter', function() {
        if (!isDragging) {
            isHovering = true;
            hoverTimeout = setTimeout(() => {
                if (isHovering && currentIndex === 0) {
                    currentIndex = 1; // Switch to Data Analyst on hover
                    updateDisplay();
                }
            }, 300); // Short delay before transition
        }
    });
    
    bannerWrapper.addEventListener('mouseleave', function() {
        isHovering = false;
        clearTimeout(hoverTimeout);
        if (!isDragging && currentIndex === 1) {
            currentIndex = 0; // Back to Accounting Professional
            updateDisplay();
        }
    });
    
    // Mouse drag functionality
    bannerWrapper.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        bannerWrapper.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const threshold = 50;
        
        if (deltaX > threshold && currentIndex < 2) {
            currentIndex++;
            updateDisplay();
            startX = e.clientX;
        } else if (deltaX < -threshold && currentIndex > 0) {
            currentIndex--;
            updateDisplay();
            startX = e.clientX;
        }
        
        // Update slider position during drag
        const progress = Math.max(0, Math.min(1, (e.clientX - bannerWrapper.getBoundingClientRect().left) / bannerWrapper.offsetWidth));
        updateSliderPosition(progress);
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            bannerWrapper.style.cursor = 'grab';
            // Reset slider to proper position
            updateSliderPosition(currentIndex / 2);
        }
    });
    
    // Touch events for mobile
    let startTouch = 0;
    
    bannerWrapper.addEventListener('touchstart', function(e) {
        isDragging = true;
        startTouch = e.touches[0].clientX;
        e.preventDefault();
    });
    
    bannerWrapper.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const deltaX = e.touches[0].clientX - startTouch;
        const threshold = 30;
        
        if (deltaX > threshold && currentIndex < 2) {
            currentIndex++;
            updateDisplay();
            startTouch = e.touches[0].clientX;
        } else if (deltaX < -threshold && currentIndex > 0) {
            currentIndex--;
            updateDisplay();
            startTouch = e.touches[0].clientX;
        }
        
        e.preventDefault();
    });
    
    bannerWrapper.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    // Label click functionality
    labels.forEach((label, index) => {
        label.addEventListener('click', function() {
            currentIndex = index;
            updateDisplay();
        });
    });
    
    // Update display function
    function updateDisplay() {
        // Update images
        images.forEach((img, index) => {
            img.classList.toggle('active', index === currentIndex);
        });
        
        // Update labels
        labels.forEach((label, index) => {
            label.classList.toggle('active', index === currentIndex);
        });
        
        // Update slider position
        updateSliderPosition(currentIndex / 2);
    }
    
    // Update slider position
    function updateSliderPosition(progress) {
        const maxLeft = bannerWrapper.offsetWidth - 4; // 4px is slider width
        slider.style.left = (progress * maxLeft) + 'px';
    }
    
    // Auto-cycle functionality disabled per user request
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.target.closest('#interactive-banner')) {
            if (e.key === 'ArrowRight' && currentIndex < 2) {
                currentIndex++;
                updateDisplay();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                currentIndex--;
                updateDisplay();
            }
        }
    });
    
    // Resize handler
    window.addEventListener('resize', function() {
        updateSliderPosition(currentIndex / 2);
    });
}); 