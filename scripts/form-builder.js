/**
 * Resumely - Form Builder
 */
const FormBuilder = (function () {
    let currentSection = 'personal';
    let onUpdateCallback = null;

    function init(options = {}) {
        if (options.onUpdate) onUpdateCallback = options.onUpdate;
    }

    function setSection(section) {
        currentSection = section;
        renderForm(section);
    }

    function renderForm(section) {
        const container = document.getElementById('editorContent');
        const titleEl = document.getElementById('editorTitle');
        if (!container) return;

        const data = ResumeData.getSection(section) || (section === 'personal' ? ResumeData.getSection('personal') : []);
        const titles = { personal: 'Personal Information', experience: 'Work Experience', education: 'Education', skills: 'Skills', projects: 'Projects', certifications: 'Certifications', languages: 'Languages', awards: 'Awards & Achievements', references: 'References', custom: 'Custom Sections' };
        if (titleEl) titleEl.textContent = titles[section] || section;

        const renderers = { personal: renderPersonalForm, experience: renderExperienceForm, education: renderEducationForm, skills: renderSkillsForm, projects: renderProjectsForm, certifications: renderCertificationsForm, languages: renderLanguagesForm, awards: renderAwardsForm, references: renderReferencesForm, custom: renderCustomForm };
        container.innerHTML = (renderers[section] || (() => '<p>Section not found</p>'))(data);
        attachFormListeners(section);
    }

    function renderPersonalForm(data) {
        const hasPhoto = data.photo && data.photo.length > 0;
        return `
        <div class="form-section"><div class="form-section-title">Photo</div>
            <div class="photo-container">
                ${hasPhoto ? `
                    <div class="photo-preview-wrapper">
                        <div class="photo-preview has-photo">
                            <img src="${data.photo}" alt="Profile Photo">
                        </div>
                        <div class="photo-actions">
                            <label class="btn btn-ghost btn-sm photo-change-btn">
                                <input type="file" accept="image/*" id="photoInput" style="display:none">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                                    <circle cx="12" cy="13" r="4"/>
                                </svg>
                                <span>Change</span>
                            </label>
                            <button class="btn btn-ghost btn-sm photo-delete-btn" id="deletePhotoBtn" type="button">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                ` : `
                    <label class="photo-upload" id="photoUpload">
                        <input type="file" accept="image/*" id="photoInput" style="display:none">
                        <div class="photo-preview">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                        </div>
                        <div class="photo-upload-text">
                            <h4>Upload Photo</h4>
                            <p>Click to upload. PNG, JPG up to 2MB</p>
                        </div>
                    </label>
                `}
            </div>
        </div>
        <div class="form-section"><div class="form-section-title">Basic Info</div>
            <div class="form-row"><div class="form-group"><label class="form-label">First Name</label><input type="text" class="form-input" data-field="firstName" value="${escapeAttr(data.firstName)}" placeholder="John"></div><div class="form-group"><label class="form-label">Last Name</label><input type="text" class="form-input" data-field="lastName" value="${escapeAttr(data.lastName)}" placeholder="Doe"></div></div>
            <div class="form-group"><label class="form-label">Professional Title</label><input type="text" class="form-input" data-field="title" value="${escapeAttr(data.title)}" placeholder="Senior Software Engineer"></div>
        </div>
        <div class="form-section"><div class="form-section-title">Contact</div>
            <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" data-field="email" value="${escapeAttr(data.email)}" placeholder="john@example.com"></div><div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" data-field="phone" value="${escapeAttr(data.phone)}" placeholder="+1 (555) 123-4567"></div></div>
            <div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" data-field="location" value="${escapeAttr(data.location)}" placeholder="New York, NY"></div>
        </div>
        <div class="form-section"><div class="form-section-title">Online Presence</div>
            <div class="form-group"><label class="form-label">Website</label><input type="url" class="form-input" data-field="website" value="${escapeAttr(data.website)}" placeholder="https://yourwebsite.com"></div>
            <div class="form-row"><div class="form-group"><label class="form-label">LinkedIn</label><input type="text" class="form-input" data-field="linkedin" value="${escapeAttr(data.linkedin)}" placeholder="linkedin.com/in/yourprofile"></div><div class="form-group"><label class="form-label">GitHub</label><input type="text" class="form-input" data-field="github" value="${escapeAttr(data.github)}" placeholder="github.com/yourusername"></div></div>
        </div>
        <div class="form-section"><div class="form-section-title">Professional Summary</div>
            <div class="form-group"><textarea class="form-textarea" data-field="summary" rows="5" placeholder="Write a compelling 2-3 sentence summary...">${escapeAttr(data.summary)}</textarea><p class="form-hint">Aim for 50-200 characters. This appears at the top of your resume.</p></div>
        </div>`;
    }

    function renderExperienceForm(data) {
        return `<div class="entry-cards" id="experienceEntries">
            ${data.map((entry, i) => renderExperienceEntry(entry, i)).join('')}
        </div>
        <button class="add-entry-btn" data-add="experience"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Experience</button>`;
    }

    function renderExperienceEntry(entry, index) {
        return `<div class="entry-card" data-id="${entry.id}" data-index="${index}">
            <div class="entry-card-header"><div class="entry-card-drag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg><span>${escapeAttr(entry.position) || 'New Position'}</span></div><div class="entry-card-actions"><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>
            <div class="entry-card-content">
                <div class="form-row"><div class="form-group"><label class="form-label">Job Title</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="position" value="${escapeAttr(entry.position)}" placeholder="Software Engineer"></div><div class="form-group"><label class="form-label">Company</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="company" value="${escapeAttr(entry.company)}" placeholder="Tech Corp"></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="location" value="${escapeAttr(entry.location)}" placeholder="San Francisco, CA"></div><div class="form-group checkbox-group" style="padding-top: 28px;"><input type="checkbox" id="current_${entry.id}" data-entry="${entry.id}" data-field="current" ${entry.current ? 'checked' : ''}><label for="current_${entry.id}">Currently working here</label></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Start Date</label><input type="month" class="form-input" data-entry="${entry.id}" data-field="startDate" value="${escapeAttr(entry.startDate)}"></div><div class="form-group"><label class="form-label">End Date</label><input type="month" class="form-input" data-entry="${entry.id}" data-field="endDate" value="${escapeAttr(entry.endDate)}" ${entry.current ? 'disabled' : ''}></div></div>
                <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" data-entry="${entry.id}" data-field="description" rows="4" placeholder="Describe your responsibilities and achievements...">${escapeAttr(entry.description)}</textarea></div>
            </div>
        </div>`;
    }

    function renderEducationForm(data) {
        return `<div class="entry-cards" id="educationEntries">${data.map((entry, i) => renderEducationEntry(entry, i)).join('')}</div>
        <button class="add-entry-btn" data-add="education"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Education</button>`;
    }

    function renderEducationEntry(entry, index) {
        return `<div class="entry-card" data-id="${entry.id}" data-index="${index}">
            <div class="entry-card-header"><div class="entry-card-drag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg><span>${escapeAttr(entry.institution) || 'New Education'}</span></div><div class="entry-card-actions"><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>
            <div class="entry-card-content">
                <div class="form-row"><div class="form-group"><label class="form-label">Institution</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="institution" value="${escapeAttr(entry.institution)}" placeholder="University Name"></div><div class="form-group"><label class="form-label">Degree</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="degree" value="${escapeAttr(entry.degree)}" placeholder="Bachelor's Degree"></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Field of Study</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="field" value="${escapeAttr(entry.field)}" placeholder="Computer Science"></div><div class="form-group"><label class="form-label">GPA</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="gpa" value="${escapeAttr(entry.gpa)}" placeholder="3.8/4.0"></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Start Date</label><input type="month" class="form-input" data-entry="${entry.id}" data-field="startDate" value="${escapeAttr(entry.startDate)}"></div><div class="form-group"><label class="form-label">End Date</label><input type="month" class="form-input" data-entry="${entry.id}" data-field="endDate" value="${escapeAttr(entry.endDate)}"></div></div>
            </div>
        </div>`;
    }

    function renderSkillsForm(data) {
        return `<div class="form-hint" style="margin-bottom: 16px;">Add your skills and rate your proficiency level (1-5 dots)</div>
        <div id="skillsEntries">${data.map((skill, i) => renderSkillEntry(skill, i)).join('')}</div>
        <button class="add-entry-btn" data-add="skills"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Skill</button>`;
    }

    function renderSkillEntry(skill, index) {
        const dots = [1, 2, 3, 4, 5].map(i => `<span class="skill-dot ${i <= (skill.level || 3) ? 'active' : ''}" data-skill="${skill.id}" data-level="${i}"></span>`).join('');
        return `<div class="skill-item" data-id="${skill.id}"><input type="text" class="skill-input" data-entry="${skill.id}" data-field="name" value="${escapeAttr(skill.name)}" placeholder="e.g., JavaScript"><div class="skill-level">${dots}</div><button class="btn btn-ghost btn-sm" data-delete="${skill.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`;
    }

    function renderProjectsForm(data) {
        return `<div class="entry-cards" id="projectsEntries">${data.map((entry, i) => renderProjectEntry(entry, i)).join('')}</div>
        <button class="add-entry-btn" data-add="projects"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Project</button>`;
    }

    function renderProjectEntry(entry, index) {
        return `<div class="entry-card" data-id="${entry.id}">
            <div class="entry-card-header"><div class="entry-card-drag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg><span>${escapeAttr(entry.name) || 'New Project'}</span></div><div class="entry-card-actions"><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>
            <div class="entry-card-content">
                <div class="form-group"><label class="form-label">Project Name</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="name" value="${escapeAttr(entry.name)}" placeholder="My Awesome Project"></div>
                <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" data-entry="${entry.id}" data-field="description" rows="3" placeholder="Brief description...">${escapeAttr(entry.description)}</textarea></div>
                <div class="form-group"><label class="form-label">Technologies Used</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="technologies" value="${escapeAttr(entry.technologies)}" placeholder="React, Node.js, MongoDB"></div>
                <div class="form-group"><label class="form-label">Project Link</label><input type="url" class="form-input" data-entry="${entry.id}" data-field="link" value="${escapeAttr(entry.link)}" placeholder="https://github.com/..."></div>
            </div>
        </div>`;
    }

    function renderCertificationsForm(data) {
        return `<div class="entry-cards" id="certEntries">${data.map((entry, i) => `<div class="entry-card" data-id="${entry.id}">
            <div class="entry-card-header"><div class="entry-card-drag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg><span>${escapeAttr(entry.name) || 'New Certification'}</span></div><div class="entry-card-actions"><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>
            <div class="entry-card-content">
                <div class="form-row"><div class="form-group"><label class="form-label">Certification Name</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="name" value="${escapeAttr(entry.name)}" placeholder="AWS Solutions Architect"></div><div class="form-group"><label class="form-label">Issuing Organization</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="issuer" value="${escapeAttr(entry.issuer)}" placeholder="Amazon Web Services"></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Issue Date</label><input type="month" class="form-input" data-entry="${entry.id}" data-field="date" value="${escapeAttr(entry.date)}"></div><div class="form-group"><label class="form-label">Credential ID</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="credentialId" value="${escapeAttr(entry.credentialId)}" placeholder="ABC123XYZ"></div></div>
            </div>
        </div>`).join('')}</div>
        <button class="add-entry-btn" data-add="certifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Certification</button>`;
    }

    function renderLanguagesForm(data) {
        const proficiencies = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];
        return `<div id="langEntries">${data.map(entry => `<div class="entry-card" data-id="${entry.id}" style="padding: 12px;">
            <div class="form-row" style="align-items: center; gap: 12px;"><div class="form-group" style="flex: 1; margin: 0;"><input type="text" class="form-input" data-entry="${entry.id}" data-field="name" value="${escapeAttr(entry.name)}" placeholder="Language"></div><div class="form-group" style="flex: 1; margin: 0;"><select class="form-select" data-entry="${entry.id}" data-field="proficiency">${proficiencies.map(p => `<option value="${p}" ${entry.proficiency === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
        </div>`).join('')}</div>
        <button class="add-entry-btn" data-add="languages"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Language</button>`;
    }

    function renderAwardsForm(data) {
        return `<div class="entry-cards" id="awardsEntries">${data.map(entry => `<div class="entry-card" data-id="${entry.id}">
            <div class="entry-card-header"><div class="entry-card-drag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg><span>${escapeAttr(entry.title) || 'New Award'}</span></div><div class="entry-card-actions"><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>
            <div class="entry-card-content">
                <div class="form-row"><div class="form-group"><label class="form-label">Award Title</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="title" value="${escapeAttr(entry.title)}" placeholder="Employee of the Year"></div><div class="form-group"><label class="form-label">Issuer</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="issuer" value="${escapeAttr(entry.issuer)}" placeholder="Company Name"></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Date</label><input type="month" class="form-input" data-entry="${entry.id}" data-field="date" value="${escapeAttr(entry.date)}"></div></div>
                <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" data-entry="${entry.id}" data-field="description" rows="2" placeholder="Brief description...">${escapeAttr(entry.description)}</textarea></div>
            </div>
        </div>`).join('')}</div>
        <button class="add-entry-btn" data-add="awards"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Award</button>`;
    }

    function renderReferencesForm(data) {
        return `<div class="form-hint" style="margin-bottom: 16px;">Add professional references. These are optional and can be hidden from the resume.</div>
        <div class="entry-cards" id="refsEntries">${data.map(entry => `<div class="entry-card" data-id="${entry.id}">
            <div class="entry-card-header"><div class="entry-card-drag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg><span>${escapeAttr(entry.name) || 'New Reference'}</span></div><div class="entry-card-actions"><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>
            <div class="entry-card-content">
                <div class="form-row"><div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="name" value="${escapeAttr(entry.name)}" placeholder="Jane Smith"></div><div class="form-group"><label class="form-label">Position</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="position" value="${escapeAttr(entry.position)}" placeholder="Senior Manager"></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Company</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="company" value="${escapeAttr(entry.company)}" placeholder="Company Name"></div><div class="form-group"><label class="form-label">Relationship</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="relationship" value="${escapeAttr(entry.relationship)}" placeholder="Direct Supervisor"></div></div>
                <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" data-entry="${entry.id}" data-field="email" value="${escapeAttr(entry.email)}" placeholder="jane@example.com"></div><div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" data-entry="${entry.id}" data-field="phone" value="${escapeAttr(entry.phone)}" placeholder="+1 555-0123"></div></div>
            </div>
        </div>`).join('')}</div>
        <button class="add-entry-btn" data-add="references"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Reference</button>`;
    }

    function renderCustomForm(data) {
        return `<div class="form-hint" style="margin-bottom: 16px;">Create custom sections for additional information like volunteering, publications, etc.</div>
        <div class="entry-cards" id="customEntries">${data.map(entry => `<div class="entry-card" data-id="${entry.id}">
            <div class="entry-card-header"><div class="entry-card-drag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg><span>${escapeAttr(entry.title) || 'New Section'}</span></div><div class="entry-card-actions"><button class="btn btn-ghost btn-sm" data-delete="${entry.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button></div></div>
            <div class="entry-card-content">
                <div class="form-group"><label class="form-label">Section Title</label><input type="text" class="form-input" data-entry="${entry.id}" data-field="title" value="${escapeAttr(entry.title)}" placeholder="Volunteering"></div>
                <div class="form-group"><label class="form-label">Content</label><textarea class="form-textarea" data-entry="${entry.id}" data-field="content" rows="4" placeholder="Enter your content...">${escapeAttr(entry.content)}</textarea></div>
            </div>
        </div>`).join('')}</div>
        <button class="add-entry-btn" data-add="customSections"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Custom Section</button>`;
    }

    function escapeAttr(str) { return str ? String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

    function attachFormListeners(section) {
        const container = document.getElementById('editorContent');
        if (!container) return;

        // Input changes
        container.querySelectorAll('.form-input, .form-textarea, .form-select, .skill-input').forEach(input => {
            input.addEventListener('input', handleInputChange);
            input.addEventListener('change', handleInputChange);
        });

        // Checkbox changes
        container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', handleCheckboxChange));

        // Add entry buttons
        container.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', handleAddEntry));

        // Delete entry buttons
        container.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', handleDeleteEntry));

        // Skill level dots
        container.querySelectorAll('.skill-dot').forEach(dot => dot.addEventListener('click', handleSkillLevel));

        // Photo upload
        const photoInput = document.getElementById('photoInput');
        if (photoInput) photoInput.addEventListener('change', handlePhotoUpload);

        // Photo delete button
        const deletePhotoBtn = document.getElementById('deletePhotoBtn');
        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', handlePhotoDelete);
        }
    }

    function handleInputChange(e) {
        const entry = e.target.dataset.entry;
        const field = e.target.dataset.field;
        const value = e.target.value;

        if (entry) {
            ResumeData.updateEntry(currentSection, entry, { [field]: value });
        } else if (field && currentSection === 'personal') {
            ResumeData.updateField('personal', field, value);
        }
        if (onUpdateCallback) onUpdateCallback();
    }

    function handleCheckboxChange(e) {
        const entry = e.target.dataset.entry;
        const field = e.target.dataset.field;
        if (entry && field) {
            ResumeData.updateEntry(currentSection, entry, { [field]: e.target.checked });
            if (field === 'current') {
                const endDateInput = document.querySelector(`[data-entry="${entry}"][data-field="endDate"]`);
                if (endDateInput) endDateInput.disabled = e.target.checked;
            }
            if (onUpdateCallback) onUpdateCallback();
        }
    }

    function handleAddEntry(e) {
        const section = e.currentTarget.dataset.add;
        const defaults = ResumeData.getDefaultEntries();
        const sectionMap = { experience: 'experience', education: 'education', skills: 'skill', projects: 'project', certifications: 'certification', languages: 'language', awards: 'award', references: 'reference', customSections: 'customSection' };
        const defaultEntry = defaults[sectionMap[section]] || {};
        ResumeData.addEntry(section, defaultEntry);
        renderForm(currentSection);
        if (onUpdateCallback) onUpdateCallback();
    }

    function handleDeleteEntry(e) {
        const id = e.currentTarget.dataset.delete;
        const sectionMap = { personal: 'personal', experience: 'experience', education: 'education', skills: 'skills', projects: 'projects', certifications: 'certifications', languages: 'languages', awards: 'awards', references: 'references', custom: 'customSections' };
        ResumeData.removeEntry(sectionMap[currentSection] || currentSection, id);
        renderForm(currentSection);
        if (onUpdateCallback) onUpdateCallback();
    }

    function handleSkillLevel(e) {
        const skillId = e.target.dataset.skill;
        const level = parseInt(e.target.dataset.level);
        ResumeData.updateEntry('skills', skillId, { level });
        renderForm(currentSection);
        if (onUpdateCallback) onUpdateCallback();
    }

    function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Photo must be less than 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            ResumeData.updateField('personal', 'photo', ev.target.result);
            // Re-render the form to show the photo with change/delete buttons
            renderForm(currentSection);
            if (onUpdateCallback) onUpdateCallback();
            // Show success toast
            if (typeof Export !== 'undefined' && Export.showToast) {
                Export.showToast('📷 Photo uploaded successfully!');
            }
        };
        reader.readAsDataURL(file);
    }

    function handlePhotoDelete(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to delete your photo?')) {
            ResumeData.updateField('personal', 'photo', '');
            renderForm(currentSection);
            if (onUpdateCallback) onUpdateCallback();
            // Show toast
            if (typeof Export !== 'undefined' && Export.showToast) {
                Export.showToast('🗑️ Photo deleted');
            }
        }
    }

    return { init, setSection, renderForm, getCurrentSection: () => currentSection };
})();
