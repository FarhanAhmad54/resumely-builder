/**
 * Resumely - Preview Renderer
 */
const Preview = (function () {
    let zoomLevel = 100;
    const minZoom = 50;
    const maxZoom = 150;
    let livePreviewEnabled = true;

    function init() {
        setupZoomControls();
        setupLiveToggle();
    }

    function render() {
        if (!livePreviewEnabled) return;
        const data = ResumeData.getData();
        const resumePaper = document.getElementById('resumePaper');
        if (!resumePaper) return;
        resumePaper.innerHTML = Templates.render(data, data.settings);
        applyZoom();
    }

    function forceRender() {
        const data = ResumeData.getData();
        const resumePaper = document.getElementById('resumePaper');
        if (!resumePaper) return;
        resumePaper.innerHTML = Templates.render(data, data.settings);
        applyZoom();
    }

    function setupZoomControls() {
        const zoomIn = document.getElementById('zoomInBtn');
        const zoomOut = document.getElementById('zoomOutBtn');
        if (zoomIn) zoomIn.addEventListener('click', () => setZoom(zoomLevel + 10));
        if (zoomOut) zoomOut.addEventListener('click', () => setZoom(zoomLevel - 10));
    }

    function setupLiveToggle() {
        const toggleBtn = document.getElementById('livePreviewToggle');
        const previewPanel = document.querySelector('.preview-panel');
        const mainContainer = document.querySelector('.main-container');

        if (toggleBtn && previewPanel && mainContainer) {
            toggleBtn.addEventListener('click', () => {
                livePreviewEnabled = !livePreviewEnabled;
                toggleBtn.classList.toggle('active', livePreviewEnabled);
                toggleBtn.querySelector('span').textContent = livePreviewEnabled ? 'Preview' : 'Show Preview';

                if (livePreviewEnabled) {
                    // Show preview panel
                    previewPanel.style.display = 'flex';
                    mainContainer.classList.remove('preview-hidden');
                    forceRender();
                    updateATSScore();
                } else {
                    // Hide preview panel
                    previewPanel.style.display = 'none';
                    mainContainer.classList.add('preview-hidden');
                }
            });
        }
    }

    function setZoom(level) {
        zoomLevel = Math.max(minZoom, Math.min(maxZoom, level));
        const zoomDisplay = document.getElementById('zoomLevel');
        if (zoomDisplay) zoomDisplay.textContent = zoomLevel + '%';
        applyZoom();
    }

    function applyZoom() {
        const resumePaper = document.getElementById('resumePaper');
        if (resumePaper) resumePaper.style.transform = `scale(${zoomLevel / 100})`;
    }

    function updateATSScore() {
        if (!livePreviewEnabled) return;
        const score = ResumeData.calculateATSScore();
        const scoreValue = document.querySelector('.ats-score-value');
        const scoreFill = document.querySelector('.ats-score-fill');
        if (scoreValue) scoreValue.textContent = score + '%';
        if (scoreFill) scoreFill.style.width = score + '%';
    }

    function isEnabled() {
        return livePreviewEnabled;
    }

    function toggle() {
        const toggleBtn = document.getElementById('livePreviewToggle');
        if (toggleBtn) toggleBtn.click();
    }

    return { init, render, forceRender, setZoom, updateATSScore, isEnabled, toggle };
})();
