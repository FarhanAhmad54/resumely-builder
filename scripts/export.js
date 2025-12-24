/**
 * Resumely - Export Functions
 */
const Export = (function () {
    function init() {
        setupExportDropdown();
    }

    function setupExportDropdown() {
        const exportBtn = document.getElementById('exportBtn');
        const exportDropdown = document.querySelector('.export-dropdown');
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        const printBtn = document.getElementById('printBtn');

        if (exportBtn && exportDropdown) {
            // Toggle dropdown on button click
            exportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                exportDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!exportDropdown.contains(e.target)) {
                    exportDropdown.classList.remove('active');
                }
            });
        }

        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => {
                document.querySelector('.export-dropdown')?.classList.remove('active');
                doExportToPDF();
            });
        }

        if (printBtn) {
            printBtn.addEventListener('click', () => {
                document.querySelector('.export-dropdown')?.classList.remove('active');
                doPrintResume();
            });
        }
    }

    function doExportToPDF() {
        // Use html2pdf library to generate and download PDF
        const resumePaper = document.getElementById('resumePaper');
        if (!resumePaper) { showToast('No resume to export'); return; }

        showToast('Generating PDF...');

        const data = ResumeData.getData();
        const fileName = `${data.personal.firstName || 'My'}_${data.personal.lastName || 'Resume'}_Resume.pdf`;

        // Configure pdf options
        const options = {
            margin: 10,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        // Generate and download PDF
        html2pdf()
            .set(options)
            .from(resumePaper)
            .save()
            .then(() => {
                showToast('PDF downloaded successfully!');
            })
            .catch((err) => {
                console.error('PDF generation error:', err);
                showToast('Error generating PDF. Please try again.');
            });
    }

    function doPrintResume() {
        // Direct print without PDF save dialog
        const resumePaper = document.getElementById('resumePaper');
        if (!resumePaper) { showToast('No resume to print'); return; }

        const data = ResumeData.getData();
        const content = Templates.render(data, data.settings);

        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${data.personal.firstName} ${data.personal.lastName} - Resume</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Raleway:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;600;700&family=Nunito:wght@300;400;600;700&family=Quicksand:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=PT+Serif:wght@400;700&family=Crimson+Text:wght@400;600;700&family=Libre+Baskerville:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Merriweather', Georgia, serif; }
                    .resume-content { padding: 40px; max-width: 210mm; margin: 0 auto; }
                    .resume-header { text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid ${data.settings.accentColor}; }
                    .resume-photo { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 16px; border: 3px solid ${data.settings.accentColor}; }
                    .resume-name { font-size: 24pt; font-weight: 700; color: #111; margin-bottom: 4px; }
                    .resume-title { font-size: 12pt; color: ${data.settings.accentColor}; font-weight: 500; margin-bottom: 12px; }
                    .resume-contact { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px; font-size: 10pt; color: #666; }
                    .resume-section { margin-bottom: 20px; }
                    .resume-section-title { font-size: 12pt; font-weight: 700; color: ${data.settings.accentColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
                    .resume-summary { font-size: 10.5pt; color: #374151; line-height: 1.6; }
                    .resume-entry { margin-bottom: 16px; }
                    .resume-entry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
                    .resume-entry-title { font-weight: 600; color: #111; }
                    .resume-entry-subtitle { color: #666; font-style: italic; }
                    .resume-entry-date { font-size: 10pt; color: #9ca3af; }
                    .resume-entry-description { font-size: 10.5pt; color: #374151; margin-top: 8px; white-space: pre-wrap; }
                    .resume-skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
                    .resume-skill-tag { padding: 4px 12px; background: ${data.settings.accentColor}15; color: ${data.settings.accentColor}; border-radius: 20px; font-size: 10pt; }
                    @media print { @page { margin: 0.5in; size: A4; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>${content}<script>window.onload = function() { window.print(); window.close(); }</script></body>
            </html>
        `);
        printWindow.document.close();
        showToast('Opening print dialog...');
    }

    function exportToJSON() {
        ResumeData.exportToJSON();
        showToast('Resume exported as JSON');
    }

    function importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await ResumeData.importFromJSON(file);
                FormBuilder.renderForm(FormBuilder.getCurrentSection());
                Preview.render();
                Preview.updateATSScore();
                showToast('Resume imported successfully');
            } catch (err) {
                showToast('Failed to import: ' + err.message);
            }
        };
        input.click();
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Public wrapper functions that show ad first
    function exportToPDF() {
        if (typeof InterstitialAd !== 'undefined') {
            InterstitialAd.showAdThen(() => doExportToPDF());
        } else {
            doExportToPDF();
        }
    }

    function printResume() {
        if (typeof InterstitialAd !== 'undefined') {
            InterstitialAd.showAdThen(() => doPrintResume());
        } else {
            doPrintResume();
        }
    }

    return { init, exportToPDF, printResume, exportToJSON, importFromJSON, showToast };
})();
