/**
 * Resumely - Advanced Features
 */
const Features = (function () {
    // Skill suggestions database
    const skillSuggestions = {
        'software': ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'REST APIs', 'GraphQL', 'MongoDB'],
        'design': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research', 'Sketch'],
        'marketing': ['SEO', 'Google Analytics', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'PPC', 'Marketing Automation', 'Copywriting', 'Brand Strategy'],
        'data': ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Data Analysis', 'Statistical Modeling', 'Excel', 'TensorFlow', 'Pandas'],
        'management': ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Team Building', 'Strategic Planning', 'Budgeting', 'Risk Management', 'Stakeholder Management'],
        'general': ['Communication', 'Problem Solving', 'Critical Thinking', 'Time Management', 'Teamwork', 'Adaptability', 'Attention to Detail', 'Organization']
    };

    function init() {
        setupDragAndDrop();
    }

    function setupDragAndDrop() {
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragend', handleDragEnd);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);
    }

    let draggedElement = null;
    let draggedSection = null;

    function handleDragStart(e) {
        if (!e.target.classList.contains('entry-card')) return;
        draggedElement = e.target;
        draggedSection = FormBuilder.getCurrentSection();
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        if (draggedElement) draggedElement.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        draggedElement = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        const target = e.target.closest('.entry-card');
        if (target && target !== draggedElement) {
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            target.classList.add('drag-over');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('.entry-card');
        if (!target || !draggedElement || target === draggedElement) return;
        const fromIndex = parseInt(draggedElement.dataset.index);
        const toIndex = parseInt(target.dataset.index);
        if (!isNaN(fromIndex) && !isNaN(toIndex)) {
            ResumeData.reorderEntries(draggedSection, fromIndex, toIndex);
            FormBuilder.renderForm(draggedSection);
            Preview.render();
        }
    }

    function getSuggestedSkills(jobTitle) {
        const title = (jobTitle || '').toLowerCase();
        let suggestions = [...skillSuggestions.general];
        if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
            suggestions = [...skillSuggestions.software, ...suggestions];
        } else if (title.includes('design') || title.includes('ux') || title.includes('ui')) {
            suggestions = [...skillSuggestions.design, ...suggestions];
        } else if (title.includes('market') || title.includes('seo') || title.includes('growth')) {
            suggestions = [...skillSuggestions.marketing, ...suggestions];
        } else if (title.includes('data') || title.includes('analyst') || title.includes('scientist')) {
            suggestions = [...skillSuggestions.data, ...suggestions];
        } else if (title.includes('manager') || title.includes('director') || title.includes('lead')) {
            suggestions = [...skillSuggestions.management, ...suggestions];
        }
        return [...new Set(suggestions)].slice(0, 15);
    }

    function calculateReadability(text) {
        if (!text) return { score: 0, level: 'N/A' };
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (words.length === 0 || sentences.length === 0) return { score: 0, level: 'N/A' };
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0) / words.length;
        const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllables);
        let level = 'Very Difficult';
        if (score >= 90) level = 'Very Easy';
        else if (score >= 80) level = 'Easy';
        else if (score >= 70) level = 'Fairly Easy';
        else if (score >= 60) level = 'Standard';
        else if (score >= 50) level = 'Fairly Difficult';
        else if (score >= 30) level = 'Difficult';
        return { score: Math.max(0, Math.min(100, Math.round(score))), level };
    }

    function countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    function getWordCount() {
        const data = ResumeData.getData();
        let totalWords = 0;
        const countWords = (text) => text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        totalWords += countWords(data.personal.summary);
        data.experience.forEach(e => { totalWords += countWords(e.description); });
        data.education.forEach(e => { totalWords += countWords(e.achievements); });
        data.projects.forEach(p => { totalWords += countWords(p.description); });
        return totalWords;
    }

    return { init, getSuggestedSkills, calculateReadability, getWordCount };
})();
