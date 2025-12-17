/**
 * Resumely - Main Application Controller
 */
const App = (function () {
    function init() {
        // Initialize modules
        ResumeData.init({
            onChange: handleDataChange,
            onAutoSave: handleAutoSave
        });
        FormBuilder.init({ onUpdate: handleFormUpdate });
        Preview.init();
        Features.init();
        Export.init();

        // Initialize interstitial ad system (shows ad on app open)
        if (typeof InterstitialAd !== 'undefined') {
            InterstitialAd.init();
        }

        // Setup UI event listeners
        setupNavigation();
        setupHeaderButtons();
        setupModals();
        setupKeyboardShortcuts();

        // Initial render
        FormBuilder.setSection('personal');
        Preview.render();
        Preview.updateATSScore();

        console.log('Resumely initialized successfully!');
    }

    function handleDataChange(data) {
        Preview.render();
        Preview.updateATSScore();
    }

    function handleFormUpdate() {
        Preview.render();
        Preview.updateATSScore();
    }

    function handleAutoSave() {
        const indicator = document.getElementById('autosaveIndicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 2000);
        }
    }

    function setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const section = e.currentTarget.dataset.section;
                FormBuilder.setSection(section);
            });
        });
    }

    function setupHeaderButtons() {
        // Undo/Redo
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            if (ResumeData.undo()) {
                FormBuilder.renderForm(FormBuilder.getCurrentSection());
                Export.showToast('Undo successful');
            }
        });
        document.getElementById('redoBtn')?.addEventListener('click', () => {
            if (ResumeData.redo()) {
                FormBuilder.renderForm(FormBuilder.getCurrentSection());
                Export.showToast('Redo successful');
            }
        });

        // Save/Load
        document.getElementById('saveBtn')?.addEventListener('click', () => {
            ResumeData.saveToStorage();
            // Save to history
            if (typeof History !== 'undefined') {
                History.saveToHistory(ResumeData.getData());
            }
            Export.showToast('Resume saved locally');
        });
        document.getElementById('loadBtn')?.addEventListener('click', () => {
            Export.importFromJSON();
        });

        // Export dropdown is handled by Export.init()

        // Templates button
        document.getElementById('templatesBtn')?.addEventListener('click', () => {
            openModal('templatesModal');
        });

        // Customize button
        document.getElementById('customizeBtn')?.addEventListener('click', () => {
            openModal('customizeModal');
        });

        // Tips button
        document.getElementById('tipsBtn')?.addEventListener('click', () => {
            showTips();
            openModal('tipsModal');
        });

        // Account button (authentication)
        document.getElementById('accountBtn')?.addEventListener('click', () => {
            if (typeof AuthUI !== 'undefined') {
                AuthUI.open();
            }
        });
    }

    function setupModals() {
        // Close modals on backdrop click or close button
        document.querySelectorAll('.modal').forEach(modal => {
            modal.querySelector('.modal-backdrop')?.addEventListener('click', () => closeModal(modal.id));
            modal.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(modal.id)));
        });

        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const template = e.currentTarget.dataset.template;
                ResumeData.updateSettings({ template });
                Preview.render();
            });
        });

        // Accent color
        document.getElementById('accentColor')?.addEventListener('input', (e) => {
            ResumeData.updateSettings({ accentColor: e.target.value });
            Preview.render();
        });

        // Preset colors
        document.querySelectorAll('.preset-color').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                document.getElementById('accentColor').value = color;
                ResumeData.updateSettings({ accentColor: color });
                Preview.render();
            });
        });

        // Font style
        document.querySelectorAll('input[name="fontStyle"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                ResumeData.updateSettings({ fontStyle: e.target.value });
                Preview.render();
            });
        });

        // Font size slider
        document.getElementById('fontSizeSlider')?.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            document.getElementById('fontSizeValue').textContent = size + 'px';
            ResumeData.updateSettings({ fontSize: size });
            Preview.render();
        });

        // Spacing slider
        document.getElementById('spacingSlider')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const labels = { 1: 'Compact', 1.5: 'Tight', 2: 'Normal', 2.5: 'Relaxed', 3: 'Spacious' };
            document.getElementById('spacingValue').textContent = labels[val] || 'Normal';
            ResumeData.updateSettings({ spacing: val });
            Preview.render();
        });
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) { if (ResumeData.redo()) { FormBuilder.renderForm(FormBuilder.getCurrentSection()); } }
                        else { if (ResumeData.undo()) { FormBuilder.renderForm(FormBuilder.getCurrentSection()); } }
                        break;
                    case 'y':
                        e.preventDefault();
                        if (ResumeData.redo()) { FormBuilder.renderForm(FormBuilder.getCurrentSection()); }
                        break;
                    case 's':
                        e.preventDefault();
                        ResumeData.saveToStorage();
                        // Save to history
                        if (typeof History !== 'undefined') {
                            History.saveToHistory(ResumeData.getData());
                        }
                        Export.showToast('Resume saved');
                        break;
                    case 'p':
                        e.preventDefault();
                        Export.exportToPDF();
                        break;
                }
            }
        });
    }

    function openModal(id) {
        document.getElementById(id)?.classList.add('active');
    }

    function closeModal(id) {
        document.getElementById(id)?.classList.remove('active');
    }

    function showTips() {
        const tips = ResumeData.getResumeTips();
        const container = document.getElementById('tipsList');
        if (!container) return;

        if (tips.length === 0) {
            container.innerHTML = '<div class="tip-item success"><svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span class="tip-text">Your resume looks great! All sections are well-filled.</span></div>';
            return;
        }

        container.innerHTML = tips.map(tip => `
            <div class="tip-item ${tip.type}">
                <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${tip.type === 'warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
                tip.type === 'success' ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' :
                    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
                </svg>
                <span class="tip-text">${tip.message}</span>
            </div>
        `).join('');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init, openModal, closeModal };
})();
