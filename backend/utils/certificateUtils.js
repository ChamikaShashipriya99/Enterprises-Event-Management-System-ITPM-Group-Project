const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates a PDF Certificate of Participation for a student.
 *
 * @param {Object} params
 * @param {string} params.studentName
 * @param {string} params.eventTitle
 * @param {string} params.eventDate
 * @param {string} params.eventLocation
 * @param {string} params.certificateId
 * @param {string} params.outputDir  - Directory to save the PDF
 * @returns {Promise<string>} filePath of the generated PDF
 */
const generateCertificatePDF = async ({
    studentName,
    eventTitle,
    eventDate,
    eventLocation,
    certificateId,
    outputDir,
}) => {
    return new Promise((resolve, reject) => {
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `certificate_${certificateId}.pdf`;
        const filePath = path.join(outputDir, fileName);

        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margins: { top: 50, bottom: 50, left: 72, right: 72 },
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // ─── Background ──────────────────────────────────────────────
        doc.rect(0, 0, pageWidth, pageHeight).fill('#F8F7FF');

        // ─── Decorative outer border ─────────────────────────────────
        doc
            .rect(20, 20, pageWidth - 40, pageHeight - 40)
            .lineWidth(3)
            .stroke('#4F46E5');

        doc
            .rect(28, 28, pageWidth - 56, pageHeight - 56)
            .lineWidth(1)
            .stroke('#A5B4FC');

        // ─── Header accent bar ────────────────────────────────────────
        doc.rect(20, 20, pageWidth - 40, 12).fill('#4F46E5');

        // ─── Footer accent bar ─────────────────────────────────────────
        doc.rect(20, pageHeight - 32, pageWidth - 40, 12).fill('#4F46E5');

        // ─── Title ────────────────────────────────────────────────────
        doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#4F46E5')
            .text('EVENT MANAGEMENT SYSTEM', 0, 70, { align: 'center' });

        doc
            .font('Helvetica-Bold')
            .fontSize(38)
            .fillColor('#1E1B4B')
            .text('Certificate of Participation', 0, 100, { align: 'center' });

        // ─── Divider ──────────────────────────────────────────────────
        const divY = 158;
        doc
            .moveTo(pageWidth * 0.25, divY)
            .lineTo(pageWidth * 0.75, divY)
            .lineWidth(1.5)
            .stroke('#A5B4FC');

        // ─── Body text ────────────────────────────────────────────────
        doc
            .font('Helvetica')
            .fontSize(14)
            .fillColor('#374151')
            .text('This is to certify that', 0, 175, { align: 'center' });

        doc
            .font('Helvetica-Bold')
            .fontSize(30)
            .fillColor('#4F46E5')
            .text(studentName, 0, 202, { align: 'center' });

        doc
            .font('Helvetica')
            .fontSize(14)
            .fillColor('#374151')
            .text('has successfully participated in', 0, 248, { align: 'center' });

        doc
            .font('Helvetica-Bold')
            .fontSize(22)
            .fillColor('#1E1B4B')
            .text(`"${eventTitle}"`, 0, 272, { align: 'center' });

        const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        doc
            .font('Helvetica')
            .fontSize(13)
            .fillColor('#6B7280')
            .text(`held on ${formattedDate} at ${eventLocation}`, 0, 310, { align: 'center' });

        // ─── Second divider ────────────────────────────────────────────
        const div2Y = 345;
        doc
            .moveTo(pageWidth * 0.25, div2Y)
            .lineTo(pageWidth * 0.75, div2Y)
            .lineWidth(1.5)
            .stroke('#A5B4FC');

        // ─── Signature area ────────────────────────────────────────────
        const sigY = 370;
        const leftSigX = pageWidth * 0.2;
        const rightSigX = pageWidth * 0.65;

        // Left signature line
        doc
            .moveTo(leftSigX, sigY + 30)
            .lineTo(leftSigX + 160, sigY + 30)
            .lineWidth(1)
            .stroke('#9CA3AF');

        doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor('#6B7280')
            .text('Event Organizer', leftSigX, sigY + 38, { width: 160, align: 'center' });

        // Right signature line
        doc
            .moveTo(rightSigX, sigY + 30)
            .lineTo(rightSigX + 160, sigY + 30)
            .lineWidth(1)
            .stroke('#9CA3AF');

        doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor('#6B7280')
            .text('System Administrator', rightSigX, sigY + 38, { width: 160, align: 'center' });

        // ─── Certificate ID footer ─────────────────────────────────────
        doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#9CA3AF')
            .text(`Certificate ID: ${certificateId}  |  Issued: ${new Date().toLocaleDateString('en-US')}`, 0, pageHeight - 55, {
                align: 'center',
            });

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
};

module.exports = { generateCertificatePDF };
