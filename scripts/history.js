/**
 * Resumely - Resume History Management
 * Tracks and manages snapshots of previously saved resumes
 */

const History = (function () {
    const STORAGE_KEY = 'resumely_history';
    const MAX_ENTRIES = 10;

    // ==========================================
    // STORAGE HELPERS
    // ==========================================

    function getHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load history:', e);
            return [];
        }
    }

    function saveHistory(entries) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            return true;
        } catch (e) {
            console.error('Failed to save history:', e);
            return false;
        }
    }

    // ==========================================
    // HISTORY OPERATIONS
    // ==========================================

    function saveToHistory(resumeData, title = null) {
        const entries = getHistory();

        // Generate title from personal info or use default
        const personal = resumeData.personal || {};
        const resumeTitle = title ||
            (personal.firstName && personal.lastName
                ? `${personal.firstName} ${personal.lastName}'s Resume`
                : personal.firstName || personal.lastName || 'Untitled Resume');

        const newEntry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            title: resumeTitle,
            timestamp: new Date().toISOString(),
            template: resumeData.settings?.template || 'modern',
            resumeData: JSON.parse(JSON.stringify(resumeData))
        };

        // Add to beginning of array
        entries.unshift(newEntry);

        // Limit to max entries
        if (entries.length > MAX_ENTRIES) {
            entries.splice(MAX_ENTRIES);
        }

        saveHistory(entries);
        renderHistoryList();

        return newEntry.id;
    }

    function loadFromHistory(id) {
        const entries = getHistory();
        const entry = entries.find(e => e.id === id);

        if (entry && entry.resumeData) {
            return entry.resumeData;
        }
        return null;
    }

    function deleteFromHistory(id) {
        let entries = getHistory();
        entries = entries.filter(e => e.id !== id);
        saveHistory(entries);
        renderHistoryList();
    }

    function clearHistory() {
        saveHistory([]);
        renderHistoryList();
    }

    // ==========================================
    // UI RENDERING
    // ==========================================

    function formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        // Less than a minute
        if (diff < 60000) {
            return 'Just now';
        }
        // Less than an hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins} minute${mins > 1 ? 's' : ''} ago`;
        }
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        // Less than a week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }

        // Format as date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    function renderHistoryList() {
        const container = document.getElementById('historyList');
        if (!container) return;

        const entries = getHistory();

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="history-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <h4>No History Yet</h4>
                    <p>Your saved resumes will appear here. Click "Save" to create your first entry.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = entries.map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                </div>
                <div class="history-item-info">
                    <h4 class="history-item-title">${escapeHtml(entry.title)}</h4>
                    <span class="history-item-meta">
                        <span class="history-item-date">${formatDate(entry.timestamp)}</span>
                        <span class="history-item-template">${entry.template || 'modern'}</span>
                    </span>
                </div>
                <div class="history-item-actions">
                    <button class="btn btn-sm btn-primary history-load-btn" data-id="${entry.id}" title="Load this resume">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Load
                    </button>
                    <button class="btn btn-sm btn-ghost history-delete-btn" data-id="${entry.id}" title="Delete this entry">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        // Bind event listeners
        bindHistoryEvents();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function bindHistoryEvents() {
        // Load buttons
        document.querySelectorAll('.history-load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const data = loadFromHistory(id);

                if (data && window.ResumeData) {
                    // Reset current data and load history entry
                    window.ResumeData.reset();

                    // Update each section
                    Object.keys(data).forEach(section => {
                        if (section !== 'settings') {
                            window.ResumeData.updateSection(section, data[section]);
                        } else {
                            window.ResumeData.updateSettings(data.settings);
                        }
                    });

                    // Close modal and show toast
                    History.closeModal();
                    showToast('Resume loaded from history!', 'success');

                    // Trigger form rebuild
                    if (window.FormBuilder) {
                        window.FormBuilder.buildCurrentSection();
                    }
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.history-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;

                if (confirm('Are you sure you want to delete this history entry?')) {
                    deleteFromHistory(id);
                    showToast('History entry deleted', 'info');
                }
            });
        });
    }

    // ==========================================
    // MODAL CONTROL
    // ==========================================

    function openModal() {
        const modal = document.getElementById('historyModal');
        if (modal) {
            renderHistoryList();
            modal.classList.add('active');
        }
    }

    function closeModal() {
        const modal = document.getElementById('historyModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.querySelector('.toast-message').textContent = message;
            toast.className = `toast toast-${type} show`;
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        // Bind history button click
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', openModal);
        }

        // Bind modal close
        const modal = document.getElementById('historyModal');
        if (modal) {
            modal.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
            modal.querySelector('[data-close]')?.addEventListener('click', closeModal);
        }

        // Clear history button
        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                    clearHistory();
                    showToast('History cleared', 'info');
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return {
        getHistory,
        saveToHistory,
        loadFromHistory,
        deleteFromHistory,
        clearHistory,
        openModal,
        closeModal,
        init
    };
})();

// Make available globally
window.History = History;
