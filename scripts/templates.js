/**
 * Resumely - Resume Templates
 */
const Templates = (function () {
    const templates = {
        modern: {
            name: 'Modern',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-modern" style="--accent: ${settings.accentColor}; font-family: ${getFontFamily(settings.fontStyle)}; font-size: ${settings.fontSize}pt;">
                    ${renderHeader(data.personal, settings)}
                    ${data.personal.summary ? `<div class="resume-section"><div class="resume-section-title">Professional Summary</div><p class="resume-summary">${escapeHtml(data.personal.summary)}</p></div>` : ''}
                    ${renderExperience(data.experience)}
                    ${renderEducation(data.education)}
                    ${renderSkills(data.skills, 'tags')}
                    ${renderProjects(data.projects)}
                    ${renderCertifications(data.certifications)}
                    ${renderLanguages(data.languages)}
                    ${renderAwards(data.awards)}
                    ${renderReferences(data.references)}
                </div>`;
            }
        },
        classic: {
            name: 'Classic',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-classic" style="--accent: ${settings.accentColor}; font-family: Georgia, serif; font-size: ${settings.fontSize}pt;">
                    ${renderHeaderClassic(data.personal, settings)}
                    ${data.personal.summary ? `<div class="resume-section"><div class="resume-section-title" style="text-align:center;">Objective</div><p class="resume-summary" style="text-align:center;">${escapeHtml(data.personal.summary)}</p></div>` : ''}
                    ${renderExperience(data.experience)}
                    ${renderEducation(data.education)}
                    ${renderSkills(data.skills, 'list')}
                    ${renderProjects(data.projects)}
                    ${renderCertifications(data.certifications)}
                    ${renderLanguages(data.languages)}
                    ${renderAwards(data.awards)}
                    ${renderReferences(data.references)}
                </div>`;
            }
        },
        creative: {
            name: 'Creative',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-creative" style="--accent: ${settings.accentColor}; font-family: ${getFontFamily(settings.fontStyle)}; font-size: ${settings.fontSize}pt;">
                    <div class="creative-sidebar" style="background: linear-gradient(180deg, ${settings.accentColor} 0%, ${adjustColor(settings.accentColor, -30)} 100%); color: white; padding: 30px; width: 35%; float: left; min-height: 100%;">
                        ${data.personal.photo && settings.showPhoto ? `<img src="${data.personal.photo}" class="resume-photo" style="border-color: white; margin: 0 auto 20px; display: block;">` : ''}
                        <h2 style="text-align: center; margin-bottom: 20px;">${escapeHtml(data.personal.firstName)} ${escapeHtml(data.personal.lastName)}</h2>
                        ${renderContactSidebar(data.personal)}
                        ${data.skills.length > 0 ? `<div style="margin-top: 20px;"><h3 style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 8px; margin-bottom: 12px;">Skills</h3>${renderSkillsBars(data.skills)}</div>` : ''}
                        ${data.languages.length > 0 ? `<div style="margin-top: 20px;"><h3 style="border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 8px; margin-bottom: 12px;">Languages</h3>${data.languages.map(l => `<div style="margin-bottom: 8px;">${escapeHtml(l.name)} - ${l.proficiency}</div>`).join('')}</div>` : ''}
                    </div>
                    <div style="margin-left: 38%; padding: 30px;">
                        ${data.personal.title ? `<div style="font-size: 14pt; color: ${settings.accentColor}; margin-bottom: 8px;">${escapeHtml(data.personal.title)}</div>` : ''}
                        ${data.personal.summary ? `<div class="resume-section"><p class="resume-summary">${escapeHtml(data.personal.summary)}</p></div>` : ''}
                        ${renderExperience(data.experience)}
                        ${renderEducation(data.education)}
                        ${renderProjects(data.projects)}
                        ${renderCertifications(data.certifications)}
                        ${renderAwards(data.awards)}
                    </div>
                    <div style="clear: both;"></div>
                </div>`;
            }
        },
        minimal: {
            name: 'Minimal',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-minimal" style="--accent: ${settings.accentColor}; font-family: ${getFontFamily(settings.fontStyle)}; font-size: ${settings.fontSize}pt; border-left: 4px solid ${settings.accentColor}; padding-left: 30px; margin: 20px;">
                    <h1 style="font-size: 28pt; margin-bottom: 4px;">${escapeHtml(data.personal.firstName)} ${escapeHtml(data.personal.lastName)}</h1>
                    ${data.personal.title ? `<div style="font-size: 12pt; color: #666; margin-bottom: 16px;">${escapeHtml(data.personal.title)}</div>` : ''}
                    <div style="font-size: 10pt; color: #666; margin-bottom: 24px;">${[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(' • ')}</div>
                    ${data.personal.summary ? `<p style="margin-bottom: 24px; line-height: 1.6;">${escapeHtml(data.personal.summary)}</p>` : ''}
                    ${renderExperienceMinimal(data.experience, settings.accentColor)}
                    ${renderEducationMinimal(data.education)}
                    ${data.skills.length > 0 ? `<div class="resume-section"><div class="resume-section-title">Skills</div><p>${data.skills.map(s => escapeHtml(s.name)).join(' • ')}</p></div>` : ''}
                    ${renderProjects(data.projects)}
                </div>`;
            }
        },
        ats: {
            name: 'ATS-Friendly',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-ats" style="font-family: Arial, sans-serif; font-size: ${settings.fontSize}pt; padding: 40px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="font-size: 20pt; margin-bottom: 4px;">${escapeHtml(data.personal.firstName)} ${escapeHtml(data.personal.lastName)}</h1>
                        <div style="font-size: 10pt;">${[data.personal.email, data.personal.phone, data.personal.location, data.personal.linkedin].filter(Boolean).join(' | ')}</div>
                    </div>
                    ${data.personal.summary ? `<div class="resume-section"><div style="font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 8px;">SUMMARY</div><p>${escapeHtml(data.personal.summary)}</p></div>` : ''}
                    ${data.experience.length > 0 ? `<div class="resume-section"><div style="font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 8px;">EXPERIENCE</div>${data.experience.map(e => `<div style="margin-bottom: 12px;"><div style="display: flex; justify-content: space-between;"><strong>${escapeHtml(e.position)}</strong><span>${formatDateRange(e.startDate, e.endDate, e.current)}</span></div><div>${escapeHtml(e.company)}${e.location ? ', ' + escapeHtml(e.location) : ''}</div>${e.description ? `<p style="margin-top: 8px;">${escapeHtml(e.description)}</p>` : ''}</div>`).join('')}</div>` : ''}
                    ${data.education.length > 0 ? `<div class="resume-section"><div style="font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 8px;">EDUCATION</div>${data.education.map(e => `<div style="margin-bottom: 12px;"><div style="display: flex; justify-content: space-between;"><strong>${escapeHtml(e.degree)}${e.field ? ' in ' + escapeHtml(e.field) : ''}</strong><span>${formatDateRange(e.startDate, e.endDate, e.current)}</span></div><div>${escapeHtml(e.institution)}</div></div>`).join('')}</div>` : ''}
                    ${data.skills.length > 0 ? `<div class="resume-section"><div style="font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 8px;">SKILLS</div><p>${data.skills.map(s => escapeHtml(s.name)).join(', ')}</p></div>` : ''}
                    ${data.certifications.length > 0 ? `<div class="resume-section"><div style="font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 8px;">CERTIFICATIONS</div>${data.certifications.map(c => `<div>${escapeHtml(c.name)} - ${escapeHtml(c.issuer)} (${c.date})</div>`).join('')}</div>` : ''}
                </div>`;
            }
        },
        executive: {
            name: 'Executive',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-executive" style="--accent: ${settings.accentColor}; font-family: ${getFontFamily(settings.fontStyle)}; font-size: ${settings.fontSize}pt; padding: 50px;">
                    <div style="border-bottom: 3px solid ${settings.accentColor}; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="font-size: 32pt; font-weight: 300; letter-spacing: 2px; margin-bottom: 8px;">${escapeHtml(data.personal.firstName)} ${escapeHtml(data.personal.lastName)}</h1>
                        ${data.personal.title ? `<div style="font-size: 14pt; color: ${settings.accentColor}; font-weight: 500; letter-spacing: 1px;">${escapeHtml(data.personal.title)}</div>` : ''}
                        <div style="margin-top: 16px; font-size: 10pt; color: #666;">${[data.personal.email, data.personal.phone, data.personal.location, data.personal.linkedin].filter(Boolean).join(' | ')}</div>
                    </div>
                    ${data.personal.summary ? `<div style="margin-bottom: 30px; font-size: 11pt; line-height: 1.8; color: #444; border-left: 3px solid ${settings.accentColor}; padding-left: 20px;">${escapeHtml(data.personal.summary)}</div>` : ''}
                    ${renderExperience(data.experience)}
                    ${renderEducation(data.education)}
                    ${renderSkills(data.skills, 'tags')}
                    ${renderCertifications(data.certifications)}
                    ${renderAwards(data.awards)}
                </div>`;
            }
        },
        tech: {
            name: 'Tech',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-tech" style="--accent: ${settings.accentColor}; font-family: 'Roboto', sans-serif; font-size: ${settings.fontSize}pt; padding: 40px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #eee; min-height: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div>
                            <h1 style="font-size: 28pt; font-weight: 700; color: ${settings.accentColor}; margin-bottom: 8px;">${escapeHtml(data.personal.firstName)} ${escapeHtml(data.personal.lastName)}</h1>
                            ${data.personal.title ? `<div style="font-size: 12pt; color: #aaa;">${escapeHtml(data.personal.title)}</div>` : ''}
                        </div>
                        <div style="text-align: right; font-size: 9pt; color: #888;">
                            ${data.personal.email ? `<div style="margin-bottom: 4px;">📧 ${escapeHtml(data.personal.email)}</div>` : ''}
                            ${data.personal.phone ? `<div style="margin-bottom: 4px;">📱 ${escapeHtml(data.personal.phone)}</div>` : ''}
                            ${data.personal.github ? `<div style="margin-bottom: 4px;">⌨️ ${escapeHtml(data.personal.github)}</div>` : ''}
                            ${data.personal.linkedin ? `<div>💼 ${escapeHtml(data.personal.linkedin)}</div>` : ''}
                        </div>
                    </div>
                    ${data.personal.summary ? `<div style="margin-bottom: 25px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 10pt; line-height: 1.6;">${escapeHtml(data.personal.summary)}</div>` : ''}
                    ${data.skills.length > 0 ? `<div style="margin-bottom: 25px;"><div style="color: ${settings.accentColor}; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Tech Stack</div><div style="display: flex; flex-wrap: wrap; gap: 8px;">${data.skills.map(s => `<span style="padding: 6px 14px; background: rgba(16,185,129,0.2); color: ${settings.accentColor}; border-radius: 4px; font-size: 9pt; font-weight: 500;">${escapeHtml(s.name)}</span>`).join('')}</div></div>` : ''}
                    ${data.experience.length > 0 ? `<div style="margin-bottom: 25px;"><div style="color: ${settings.accentColor}; font-weight: 600; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">Experience</div>${data.experience.map(e => `<div style="margin-bottom: 16px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid ${settings.accentColor};"><div style="display: flex; justify-content: space-between;"><strong style="color: #fff;">${escapeHtml(e.position)}</strong><span style="color: #666; font-size: 9pt;">${formatDateRange(e.startDate, e.endDate, e.current)}</span></div><div style="color: #888; font-size: 10pt; margin-top: 4px;">${escapeHtml(e.company)}</div>${e.description ? `<div style="margin-top: 10px; font-size: 10pt; color: #aaa;">${escapeHtml(e.description)}</div>` : ''}</div>`).join('')}</div>` : ''}
                    ${renderProjects(data.projects)}
                    ${renderEducation(data.education)}
                </div>`;
            }
        },
        elegant: {
            name: 'Elegant',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-elegant" style="--accent: ${settings.accentColor}; font-family: 'Playfair Display', serif; font-size: ${settings.fontSize}pt; padding: 50px;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        ${data.personal.photo && settings.showPhoto ? `<img src="${data.personal.photo}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid ${settings.accentColor}; margin-bottom: 20px;">` : ''}
                        <h1 style="font-size: 36pt; font-weight: 400; letter-spacing: 3px; margin-bottom: 8px; font-style: italic;">${escapeHtml(data.personal.firstName)} ${escapeHtml(data.personal.lastName)}</h1>
                        ${data.personal.title ? `<div style="font-size: 12pt; color: ${settings.accentColor}; font-style: italic; letter-spacing: 2px;">${escapeHtml(data.personal.title)}</div>` : ''}
                        <div style="margin-top: 20px; font-size: 10pt; color: #666; font-family: 'Inter', sans-serif;">${[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(' ✦ ')}</div>
                    </div>
                    ${data.personal.summary ? `<div style="text-align: center; margin-bottom: 30px; padding: 20px 40px; font-style: italic; color: #555; line-height: 1.8; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">${escapeHtml(data.personal.summary)}</div>` : ''}
                    ${renderExperience(data.experience)}
                    ${renderEducation(data.education)}
                    ${renderSkills(data.skills, 'tags')}
                    ${renderCertifications(data.certifications)}
                </div>`;
            }
        },
        bold: {
            name: 'Bold',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-bold" style="--accent: ${settings.accentColor}; font-family: 'Montserrat', sans-serif; font-size: ${settings.fontSize}pt; padding: 40px;">
                    <div style="background: ${settings.accentColor}; color: white; padding: 30px; margin: -40px -40px 30px -40px;">
                        <h1 style="font-size: 32pt; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">${escapeHtml(data.personal.firstName)} ${escapeHtml(data.personal.lastName)}</h1>
                        ${data.personal.title ? `<div style="font-size: 14pt; font-weight: 300; opacity: 0.9;">${escapeHtml(data.personal.title)}</div>` : ''}
                        <div style="margin-top: 16px; font-size: 10pt; opacity: 0.8;">${[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(' | ')}</div>
                    </div>
                    ${data.personal.summary ? `<div style="margin-bottom: 30px; font-size: 11pt; line-height: 1.7; color: #444;">${escapeHtml(data.personal.summary)}</div>` : ''}
                    ${data.experience.length > 0 ? `<div style="margin-bottom: 25px;"><div style="font-size: 14pt; font-weight: 800; color: ${settings.accentColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 3px solid ${settings.accentColor};">Experience</div>${data.experience.map(e => `<div style="margin-bottom: 20px;"><div style="font-weight: 700; font-size: 12pt;">${escapeHtml(e.position)}</div><div style="color: #666; font-size: 10pt; margin: 4px 0;">${escapeHtml(e.company)} • ${formatDateRange(e.startDate, e.endDate, e.current)}</div>${e.description ? `<div style="margin-top: 8px; font-size: 10pt; color: #555;">${escapeHtml(e.description)}</div>` : ''}</div>`).join('')}</div>` : ''}
                    ${data.skills.length > 0 ? `<div style="margin-bottom: 25px;"><div style="font-size: 14pt; font-weight: 800; color: ${settings.accentColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 3px solid ${settings.accentColor};">Skills</div><div style="display: flex; flex-wrap: wrap; gap: 10px;">${data.skills.map(s => `<span style="padding: 8px 16px; background: ${settings.accentColor}; color: white; font-weight: 600; font-size: 9pt; text-transform: uppercase;">${escapeHtml(s.name)}</span>`).join('')}</div></div>` : ''}
                    ${renderEducation(data.education)}
                </div>`;
            }
        },
        timeline: {
            name: 'Timeline',
            render: function (data, settings) {
                return `
                <div class="resume-content resume-timeline" style="--accent: ${settings.accentColor}; font-family: ${getFontFamily(settings.fontStyle)}; font-size: ${settings.fontSize}pt; padding: 40px;">
                    ${renderHeader(data.personal, settings)}
                    ${data.personal.summary ? `<div class="resume-section"><div class="resume-section-title">About Me</div><p class="resume-summary">${escapeHtml(data.personal.summary)}</p></div>` : ''}
                    ${data.experience.length > 0 ? `<div style="margin-bottom: 25px;"><div style="font-size: 12pt; font-weight: 700; color: ${settings.accentColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Career Timeline</div><div style="position: relative; padding-left: 30px; border-left: 2px solid ${settings.accentColor};">${data.experience.map(e => `<div style="margin-bottom: 25px; position: relative;"><div style="position: absolute; left: -38px; top: 0; width: 16px; height: 16px; background: ${settings.accentColor}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px ${settings.accentColor};"></div><div style="font-size: 10pt; color: ${settings.accentColor}; font-weight: 600; margin-bottom: 4px;">${formatDateRange(e.startDate, e.endDate, e.current)}</div><div style="font-weight: 600; font-size: 12pt;">${escapeHtml(e.position)}</div><div style="color: #666; font-size: 10pt;">${escapeHtml(e.company)}${e.location ? ' • ' + escapeHtml(e.location) : ''}</div>${e.description ? `<div style="margin-top: 8px; font-size: 10pt; color: #555;">${escapeHtml(e.description)}</div>` : ''}</div>`).join('')}</div></div>` : ''}
                    ${data.education.length > 0 ? `<div style="margin-bottom: 25px;"><div style="font-size: 12pt; font-weight: 700; color: ${settings.accentColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Education Timeline</div><div style="position: relative; padding-left: 30px; border-left: 2px solid ${settings.accentColor};">${data.education.map(e => `<div style="margin-bottom: 20px; position: relative;"><div style="position: absolute; left: -38px; top: 0; width: 16px; height: 16px; background: ${settings.accentColor}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px ${settings.accentColor};"></div><div style="font-size: 10pt; color: ${settings.accentColor}; font-weight: 600; margin-bottom: 4px;">${formatDateRange(e.startDate, e.endDate, e.current)}</div><div style="font-weight: 600;">${escapeHtml(e.degree)}${e.field ? ' in ' + escapeHtml(e.field) : ''}</div><div style="color: #666; font-size: 10pt;">${escapeHtml(e.institution)}</div></div>`).join('')}</div></div>` : ''}
                    ${renderSkills(data.skills, 'tags')}
                    ${renderProjects(data.projects)}
                </div>`;
            }
        }
    };

    function getFontFamily(style) {
        const fonts = {
            professional: "'Merriweather', Georgia, serif",
            modern: "'Inter', sans-serif",
            classic: "Georgia, serif",
            roboto: "'Roboto', sans-serif",
            poppins: "'Poppins', sans-serif",
            lato: "'Lato', sans-serif",
            opensans: "'Open Sans', sans-serif",
            playfair: "'Playfair Display', serif",
            montserrat: "'Montserrat', sans-serif",
            raleway: "'Raleway', sans-serif",
            sourcesans: "'Source Sans 3', sans-serif"
        };
        return fonts[style] || fonts.professional;
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function adjustColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function formatDateRange(start, end, current) {
        if (!start) return '';
        const s = start;
        const e = current ? 'Present' : (end || '');
        return e ? `${s} - ${e}` : s;
    }

    function renderHeader(personal, settings) {
        return `<div class="resume-header">
            ${personal.photo && settings.showPhoto ? `<img src="${personal.photo}" class="resume-photo">` : ''}
            <h1 class="resume-name">${escapeHtml(personal.firstName)} ${escapeHtml(personal.lastName)}</h1>
            ${personal.title ? `<div class="resume-title">${escapeHtml(personal.title)}</div>` : ''}
            <div class="resume-contact">
                ${personal.email ? `<span class="resume-contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${escapeHtml(personal.email)}</span>` : ''}
                ${personal.phone ? `<span class="resume-contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>${escapeHtml(personal.phone)}</span>` : ''}
                ${personal.location ? `<span class="resume-contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(personal.location)}</span>` : ''}
                ${personal.linkedin ? `<span class="resume-contact-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>${escapeHtml(personal.linkedin)}</span>` : ''}
            </div>
        </div>`;
    }

    function renderHeaderClassic(personal, settings) {
        return `<div class="resume-header" style="border-bottom: 2px double #333;">
            <h1 class="resume-name" style="font-family: Georgia, serif;">${escapeHtml(personal.firstName)} ${escapeHtml(personal.lastName)}</h1>
            ${personal.title ? `<div class="resume-title" style="color: #333; font-style: italic;">${escapeHtml(personal.title)}</div>` : ''}
            <div class="resume-contact" style="margin-top: 12px;">${[personal.email, personal.phone, personal.location].filter(Boolean).map(escapeHtml).join(' | ')}</div>
        </div>`;
    }

    function renderContactSidebar(personal) {
        const items = [];
        if (personal.email) items.push(`<div style="margin-bottom: 8px; font-size: 9pt;">📧 ${escapeHtml(personal.email)}</div>`);
        if (personal.phone) items.push(`<div style="margin-bottom: 8px; font-size: 9pt;">📱 ${escapeHtml(personal.phone)}</div>`);
        if (personal.location) items.push(`<div style="margin-bottom: 8px; font-size: 9pt;">📍 ${escapeHtml(personal.location)}</div>`);
        if (personal.website) items.push(`<div style="margin-bottom: 8px; font-size: 9pt;">🌐 ${escapeHtml(personal.website)}</div>`);
        if (personal.linkedin) items.push(`<div style="margin-bottom: 8px; font-size: 9pt;">💼 ${escapeHtml(personal.linkedin)}</div>`);
        return items.join('');
    }

    function renderExperience(experience) {
        if (!experience || experience.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Experience</div>${experience.map(e => `
            <div class="resume-entry">
                <div class="resume-entry-header"><div><span class="resume-entry-title">${escapeHtml(e.position)}</span><span class="resume-entry-subtitle"> at ${escapeHtml(e.company)}</span></div><span class="resume-entry-date">${formatDateRange(e.startDate, e.endDate, e.current)}</span></div>
                ${e.location ? `<div style="font-size: 10pt; color: #666;">${escapeHtml(e.location)}</div>` : ''}
                ${e.description ? `<div class="resume-entry-description">${escapeHtml(e.description).replace(/\n/g, '<br>')}</div>` : ''}
            </div>`).join('')}</div>`;
    }

    function renderExperienceMinimal(experience, accentColor) {
        if (!experience || experience.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Experience</div>${experience.map(e => `
            <div style="margin-bottom: 16px; padding-left: 16px; border-left: 2px solid ${accentColor};">
                <div style="font-weight: 600;">${escapeHtml(e.position)}</div>
                <div style="color: #666; font-size: 10pt;">${escapeHtml(e.company)} • ${formatDateRange(e.startDate, e.endDate, e.current)}</div>
                ${e.description ? `<p style="margin-top: 8px; font-size: 10pt;">${escapeHtml(e.description)}</p>` : ''}
            </div>`).join('')}</div>`;
    }

    function renderEducation(education) {
        if (!education || education.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Education</div>${education.map(e => `
            <div class="resume-entry">
                <div class="resume-entry-header"><div><span class="resume-entry-title">${escapeHtml(e.degree)}</span>${e.field ? `<span class="resume-entry-subtitle"> in ${escapeHtml(e.field)}</span>` : ''}</div><span class="resume-entry-date">${formatDateRange(e.startDate, e.endDate, e.current)}</span></div>
                <div style="font-size: 10pt; color: #666;">${escapeHtml(e.institution)}${e.location ? ', ' + escapeHtml(e.location) : ''}</div>
                ${e.gpa ? `<div style="font-size: 10pt;">GPA: ${escapeHtml(e.gpa)}</div>` : ''}
            </div>`).join('')}</div>`;
    }

    function renderEducationMinimal(education) {
        if (!education || education.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Education</div>${education.map(e => `
            <div style="margin-bottom: 12px;"><strong>${escapeHtml(e.degree)}</strong>${e.field ? ' in ' + escapeHtml(e.field) : ''}<br><span style="color: #666; font-size: 10pt;">${escapeHtml(e.institution)} • ${formatDateRange(e.startDate, e.endDate, e.current)}</span></div>`).join('')}</div>`;
    }

    function renderSkills(skills, style) {
        if (!skills || skills.length === 0) return '';
        if (style === 'tags') {
            return `<div class="resume-section"><div class="resume-section-title">Skills</div><div class="resume-skills-grid">${skills.map(s => `<span class="resume-skill-tag">${escapeHtml(s.name)}</span>`).join('')}</div></div>`;
        } else {
            return `<div class="resume-section"><div class="resume-section-title">Skills</div><ul>${skills.map(s => `<li>${escapeHtml(s.name)}</li>`).join('')}</ul></div>`;
        }
    }

    function renderSkillsBars(skills) {
        return skills.map(s => `<div style="margin-bottom: 10px;"><div style="font-size: 9pt; margin-bottom: 4px;">${escapeHtml(s.name)}</div><div style="height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px;"><div style="height: 100%; width: ${(s.level || 3) * 20}%; background: white; border-radius: 2px;"></div></div></div>`).join('');
    }

    function renderProjects(projects) {
        if (!projects || projects.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Projects</div>${projects.map(p => `
            <div class="resume-entry">
                <div class="resume-entry-header"><span class="resume-entry-title">${escapeHtml(p.name)}</span><span class="resume-entry-date">${formatDateRange(p.startDate, p.endDate)}</span></div>
                ${p.description ? `<div class="resume-entry-description">${escapeHtml(p.description)}</div>` : ''}
                ${p.technologies ? `<div style="font-size: 9pt; color: #666; margin-top: 4px;">Technologies: ${escapeHtml(p.technologies)}</div>` : ''}
            </div>`).join('')}</div>`;
    }

    function renderCertifications(certs) {
        if (!certs || certs.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Certifications</div>${certs.map(c => `
            <div class="resume-entry"><div class="resume-entry-header"><span class="resume-entry-title">${escapeHtml(c.name)}</span><span class="resume-entry-date">${c.date || ''}</span></div><div style="font-size: 10pt; color: #666;">${escapeHtml(c.issuer)}</div></div>`).join('')}</div>`;
    }

    function renderLanguages(languages) {
        if (!languages || languages.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Languages</div><div style="display: flex; flex-wrap: wrap; gap: 16px;">${languages.map(l => `<span>${escapeHtml(l.name)} <em style="color: #666;">(${l.proficiency})</em></span>`).join('')}</div></div>`;
    }

    function renderAwards(awards) {
        if (!awards || awards.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">Awards & Achievements</div>${awards.map(a => `
            <div class="resume-entry"><div class="resume-entry-header"><span class="resume-entry-title">${escapeHtml(a.title)}</span><span class="resume-entry-date">${a.date || ''}</span></div>${a.issuer ? `<div style="font-size: 10pt; color: #666;">${escapeHtml(a.issuer)}</div>` : ''}${a.description ? `<div class="resume-entry-description">${escapeHtml(a.description)}</div>` : ''}</div>`).join('')}</div>`;
    }

    function renderReferences(refs) {
        if (!refs || refs.length === 0) return '';
        return `<div class="resume-section"><div class="resume-section-title">References</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">${refs.map(r => `
            <div style="padding: 12px; background: #f9f9f9; border-radius: 6px;"><div style="font-weight: 600;">${escapeHtml(r.name)}</div><div style="font-size: 10pt; color: #666;">${escapeHtml(r.position)}${r.company ? ' at ' + escapeHtml(r.company) : ''}</div><div style="font-size: 9pt; margin-top: 8px;">${[r.email, r.phone].filter(Boolean).map(escapeHtml).join(' • ')}</div></div>`).join('')}</div></div>`;
    }

    function getTemplate(name) { return templates[name] || templates.modern; }
    function getTemplateList() { return Object.keys(templates).map(key => ({ id: key, name: templates[key].name })); }
    function render(data, settings) { return getTemplate(settings.template).render(data, settings); }

    return { getTemplate, getTemplateList, render };
})();
