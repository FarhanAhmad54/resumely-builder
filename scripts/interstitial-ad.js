/**
 * Resumely - Interstitial Ad System
 * Fullscreen ad with 10-second timer, shows on app open and before download/print
 */
const InterstitialAd = (function () {
    const AD_DURATION = 10; // seconds
    let timerInterval = null;
    let currentCallback = null;

    function init() {
        setupCloseButton();
        // Show ad on app load
        showAd();
    }

    function setupCloseButton() {
        const closeBtn = document.getElementById('interstitialCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                hideAd();
                if (currentCallback && typeof currentCallback === 'function') {
                    currentCallback();
                    currentCallback = null;
                }
            });
        }
    }

    function showAd(callback) {
        currentCallback = callback || null;

        const overlay = document.getElementById('interstitialAd');
        const timerEl = document.getElementById('interstitialTimer');
        const closeBtn = document.getElementById('interstitialCloseBtn');

        if (!overlay || !timerEl || !closeBtn) {
            // If elements don't exist, just run callback
            if (currentCallback) {
                currentCallback();
                currentCallback = null;
            }
            return;
        }

        // Reset state
        let timeLeft = AD_DURATION;
        timerEl.textContent = timeLeft;
        timerEl.classList.remove('complete');
        closeBtn.classList.remove('visible');

        // Show overlay
        overlay.classList.add('active');

        // Try to load Google AdSense ad
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.log('AdSense not available, showing fallback');
        }

        // Start countdown
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerEl.textContent = '✓';
                timerEl.classList.add('complete');
                closeBtn.classList.add('visible');
            }
        }, 1000);
    }

    function hideAd() {
        const overlay = document.getElementById('interstitialAd');
        if (overlay) {
            overlay.classList.remove('active');
        }

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    /**
     * Show ad and execute callback after user closes the ad
     * @param {Function} callback - Function to execute after ad is closed
     */
    function showAdThen(callback) {
        showAd(callback);
    }

    return {
        init,
        showAd,
        hideAd,
        showAdThen
    };
})();
