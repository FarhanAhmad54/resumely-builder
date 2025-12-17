/**
 * Resumely - Resume Data Management
 */
const ResumeData = (function () {
    const defaultData = {
        personal: { firstName: '', lastName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', photo: null, summary: '' },
        experience: [], education: [], skills: [], projects: [], certifications: [], languages: [], awards: [], references: [], customSections: [],
        settings: {
            template: 'modern', accentColor: '#10B981', fontStyle: 'professional', fontSize: 12, spacing: 2, showPhoto: true,
            sectionsOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'awards', 'references']
        }
    };

    let currentData = JSON.parse(JSON.stringify(defaultData));
    let history = [], historyIndex = -1;
    const maxHistoryLength = 50;
    let autoSaveTimer = null;
    let onChangeCallback = null, onAutoSaveCallback = null;

    function init(options = {}) {
        if (options.onChange) onChangeCallback = options.onChange;
        if (options.onAutoSave) onAutoSaveCallback = options.onAutoSave;
        const saved = loadFromStorage();
        if (saved) currentData = mergeWithDefaults(saved, defaultData);
        saveToHistory();
    }

    function mergeWithDefaults(saved, defaults) {
        const result = JSON.parse(JSON.stringify(defaults));
        for (const key in saved) {
            if (saved.hasOwnProperty(key)) {
                if (typeof saved[key] === 'object' && !Array.isArray(saved[key]) && saved[key] !== null) {
                    result[key] = mergeWithDefaults(saved[key], defaults[key] || {});
                } else { result[key] = saved[key]; }
            }
        }
        return result;
    }

    function getData() { return JSON.parse(JSON.stringify(currentData)); }
    function getSection(section) { return JSON.parse(JSON.stringify(currentData[section] || null)); }

    function updateSection(section, data) { currentData[section] = JSON.parse(JSON.stringify(data)); triggerChange(); }
    function updateField(section, field, value) {
        if (typeof currentData[section] === 'object' && !Array.isArray(currentData[section])) currentData[section][field] = value;
        triggerChange();
    }

    function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

    function addEntry(section, entry) {
        if (!Array.isArray(currentData[section])) currentData[section] = [];
        const newEntry = { id: generateId(), ...entry };
        currentData[section].push(newEntry);
        triggerChange();
        return newEntry.id;
    }

    function updateEntry(section, id, data) {
        if (!Array.isArray(currentData[section])) return;
        const index = currentData[section].findIndex(e => e.id === id);
        if (index !== -1) { currentData[section][index] = { ...currentData[section][index], ...data }; triggerChange(); }
    }

    function removeEntry(section, id) {
        if (!Array.isArray(currentData[section])) return;
        currentData[section] = currentData[section].filter(e => e.id !== id);
        triggerChange();
    }

    function reorderEntries(section, fromIndex, toIndex) {
        if (!Array.isArray(currentData[section])) return;
        const [removed] = currentData[section].splice(fromIndex, 1);
        currentData[section].splice(toIndex, 0, removed);
        triggerChange();
    }

    function updateSettings(settings) { currentData.settings = { ...currentData.settings, ...settings }; triggerChange(false); }

    function triggerChange(addToHistory = true) {
        if (addToHistory) saveToHistory();
        if (onChangeCallback) onChangeCallback(getData());
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => { saveToStorage(); if (onAutoSaveCallback) onAutoSaveCallback(); }, 2000);
    }

    function saveToHistory() {
        if (historyIndex < history.length - 1) history = history.slice(0, historyIndex + 1);
        history.push(JSON.stringify(currentData));
        if (history.length > maxHistoryLength) history.shift();
        historyIndex = history.length - 1;
    }

    function undo() {
        if (historyIndex > 0) { historyIndex--; currentData = JSON.parse(history[historyIndex]); if (onChangeCallback) onChangeCallback(getData()); return true; }
        return false;
    }

    function redo() {
        if (historyIndex < history.length - 1) { historyIndex++; currentData = JSON.parse(history[historyIndex]); if (onChangeCallback) onChangeCallback(getData()); return true; }
        return false;
    }

    function canUndo() { return historyIndex > 0; }
    function canRedo() { return historyIndex < history.length - 1; }

    function saveToStorage() { try { localStorage.setItem('resumely_data', JSON.stringify(currentData)); return true; } catch (e) { return false; } }
    function loadFromStorage() { try { const data = localStorage.getItem('resumely_data'); return data ? JSON.parse(data) : null; } catch (e) { return null; } }

    function exportToJSON() {
        const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'resume_backup.json'; a.click();
    }

    function importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => { try { currentData = mergeWithDefaults(JSON.parse(e.target.result), defaultData); triggerChange(); resolve(true); } catch (err) { reject(err); } };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    function reset() { currentData = JSON.parse(JSON.stringify(defaultData)); history = []; historyIndex = -1; saveToHistory(); triggerChange(); }

    function getDefaultEntries() {
        return {
            experience: { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', highlights: [] },
            education: { institution: '', degree: '', field: '', location: '', startDate: '', endDate: '', current: false, gpa: '', achievements: '' },
            skill: { name: '', level: 3, category: '' },
            project: { name: '', description: '', technologies: '', link: '', startDate: '', endDate: '' },
            certification: { name: '', issuer: '', date: '', expiryDate: '', credentialId: '', credentialUrl: '' },
            language: { name: '', proficiency: 'Intermediate' },
            award: { title: '', issuer: '', date: '', description: '' },
            reference: { name: '', position: '', company: '', email: '', phone: '', relationship: '' },
            customSection: { title: '', content: '' }
        };
    }

    function calculateATSScore() {
        let score = 0;
        const personal = currentData.personal;
        if (personal.firstName && personal.lastName) score += 4;
        if (personal.email) score += 4;
        if (personal.phone) score += 4;
        if (personal.location) score += 4;
        if (personal.summary && personal.summary.length > 50) score += 4;
        if (currentData.experience.length > 0) { score += 10; if (currentData.experience.every(e => e.description?.length > 20)) score += 10; if (currentData.experience.every(e => e.startDate)) score += 10; }
        if (currentData.education.length > 0) { score += 10; if (currentData.education.every(e => e.degree && e.institution)) score += 10; }
        if (currentData.skills.length >= 5) score += 15; else if (currentData.skills.length >= 3) score += 10; else if (currentData.skills.length > 0) score += 5;
        if (currentData.projects.length > 0) score += 5;
        if (currentData.certifications.length > 0) score += 5;
        if (currentData.languages.length > 0) score += 5;
        return Math.min(score, 100);
    }

    function getResumeTips() {
        const tips = [];
        const p = currentData.personal;
        if (!p.summary || p.summary.length < 50) tips.push({ type: 'warning', section: 'personal', message: 'Add a professional summary (50+ chars) to make a strong first impression.' });
        if (p.summary && p.summary.length > 300) tips.push({ type: 'warning', section: 'personal', message: 'Consider keeping your summary under 300 characters.' });
        if (!p.linkedin) tips.push({ type: 'info', section: 'personal', message: 'Add your LinkedIn profile to increase credibility.' });
        if (currentData.experience.length === 0) tips.push({ type: 'warning', section: 'experience', message: 'Add work experience to strengthen your resume.' });
        if (currentData.skills.length < 5) tips.push({ type: 'info', section: 'skills', message: 'Add more skills (aim for 5-10) to highlight your capabilities.' });
        if (currentData.education.length === 0) tips.push({ type: 'info', section: 'education', message: 'Add your educational background.' });
        if (currentData.projects.length === 0) tips.push({ type: 'success', section: 'projects', message: 'Add projects to showcase practical skills.' });
        return tips;
    }

    return { init, getData, getSection, updateSection, updateField, addEntry, updateEntry, removeEntry, reorderEntries, updateSettings, undo, redo, canUndo, canRedo, saveToStorage, loadFromStorage, exportToJSON, importFromJSON, reset, getDefaultEntries, calculateATSScore, getResumeTips };
})();
