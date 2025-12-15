import jsPDF from 'jspdf';
import { TicketResponse } from '@/services/apiService';

/**
 * Exporte des données en CSV
 */
export function exportToCSV(data: any[], filename: string = 'export.csv') {
    if (!data || data.length === 0) {
        throw new Error('Aucune donnée à exporter');
    }

    // Obtenir les en-têtes depuis le premier objet
    const headers = Object.keys(data[0]);
    
    // Créer la ligne d'en-tête
    const csvHeaders = headers.map(h => `"${h}"`).join(',');
    
    // Créer les lignes de données
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Gérer les valeurs null/undefined et les chaînes contenant des virgules
            if (value === null || value === undefined) return '""';
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return `"${value}"`;
        }).join(',');
    });
    
    // Combiner tout
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Créer le blob et télécharger
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporte un rapport en PDF
 */
export function exportReportToPDF(
    title: string,
    content: {
        sections: Array<{
            title: string;
            data: Array<{ label: string; value: string | number }>;
        }>;
        tables?: Array<{
            headers: string[];
            rows: string[][];
        }>;
    },
    filename: string = 'rapport.pdf'
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    const lineHeight = 7;
    const sectionSpacing = 10;

    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Date de génération
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Généré le ${dateStr}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Sections
    content.sections.forEach((section, sectionIndex) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > pageHeight - margin - 30) {
            doc.addPage();
            yPosition = margin;
        }

        // Titre de section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, yPosition);
        yPosition += lineHeight * 1.5;

        // Données de la section
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        section.data.forEach(item => {
            if (yPosition > pageHeight - margin - 10) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(`${item.label}:`, margin + 5, yPosition);
            doc.setFont('helvetica', 'bold');
            doc.text(String(item.value), margin + 60, yPosition);
            doc.setFont('helvetica', 'normal');
            yPosition += lineHeight;
        });

        yPosition += sectionSpacing;
    });

    // Tables
    if (content.tables && content.tables.length > 0) {
        content.tables.forEach(table => {
            // Vérifier si on a besoin d'une nouvelle page
            if (yPosition > pageHeight - margin - 50) {
                doc.addPage();
                yPosition = margin;
            }

            // En-têtes de table
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const colWidth = (pageWidth - 2 * margin) / table.headers.length;
            let xPosition = margin;

            table.headers.forEach((header, colIndex) => {
                doc.text(header, xPosition, yPosition);
                xPosition += colWidth;
            });

            yPosition += lineHeight * 1.5;

            // Lignes de données
            doc.setFont('helvetica', 'normal');
            table.rows.forEach(row => {
                if (yPosition > pageHeight - margin - 10) {
                    doc.addPage();
                    yPosition = margin;
                    // Réafficher les en-têtes
                    doc.setFont('helvetica', 'bold');
                    xPosition = margin;
                    table.headers.forEach(header => {
                        doc.text(header, xPosition, yPosition);
                        xPosition += colWidth;
                    });
                    yPosition += lineHeight * 1.5;
                    doc.setFont('helvetica', 'normal');
                }

                xPosition = margin;
                row.forEach((cell, colIndex) => {
                    doc.text(String(cell), xPosition, yPosition);
                    xPosition += colWidth;
                });
                yPosition += lineHeight;
            });

            yPosition += sectionSpacing;
        });
    }

    // Télécharger le PDF
    doc.save(filename);
}

/**
 * Exporte un ticket individuel en PDF
 */
export function exportTicketToPDF(ticket: TicketResponse) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    const lineHeight = 7;

    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ticket ${ticket.ticketNumber}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Informations générales
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Générales', margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const generalInfo = [
        ['Numéro de ticket', ticket.ticketNumber],
        ['Hôtel', ticket.hotelName || 'N/A'],
        ['Catégorie', ticket.categoryName || 'N/A'],
        ['Statut', ticket.status],
        ['Priorité', ticket.isUrgent ? 'Urgent' : 'Normale'],
        ['Date de création', new Date(ticket.createdAt).toLocaleDateString('fr-FR')],
    ];

    generalInfo.forEach(([label, value]) => {
        doc.text(`${label}:`, margin + 5, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), margin + 60, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += lineHeight;
    });

    yPosition += lineHeight;

    // Informations client
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations Client', margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${ticket.clientEmail || 'N/A'}`, margin + 5, yPosition);
    yPosition += lineHeight;
    if (ticket.clientPhone) {
        doc.text(`Téléphone: ${ticket.clientPhone}`, margin + 5, yPosition);
        yPosition += lineHeight;
    }

    yPosition += lineHeight;

    // Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(ticket.description || 'Aucune description', pageWidth - 2 * margin - 10);
    descriptionLines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text(line, margin + 5, yPosition);
        yPosition += lineHeight;
    });

    yPosition += lineHeight;

    // Technicien assigné
    if (ticket.assignedTechnicianName) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Technicien Assigné', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(ticket.assignedTechnicianName, margin + 5, yPosition);
        yPosition += lineHeight;
    }

    // SLA
    if (ticket.slaDeadline) {
        yPosition += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('SLA', margin, yPosition);
        yPosition += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const slaDate = new Date(ticket.slaDeadline);
        doc.text(`Date limite: ${slaDate.toLocaleDateString('fr-FR')} ${slaDate.toLocaleTimeString('fr-FR')}`, margin + 5, yPosition);
        yPosition += lineHeight;
    }

    // Date de génération
    yPosition = doc.internal.pageSize.getHeight() - margin;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
    );

    doc.save(`ticket-${ticket.ticketNumber}.pdf`);
}

/**
 * Génère un rapport mensuel en PDF pour un hôtel
 */
export function generateMonthlyReportPDF(reportData: any, hotelName: string) {
    const sections = [
        {
            title: 'Statistiques Générales',
            data: [
                { label: 'Période', value: `${reportData.month || 'N/A'}/${reportData.year || 'N/A'}` },
                { label: 'Total Tickets', value: reportData.totalTickets || 0 },
                { label: 'Tickets Ouverts', value: reportData.openTickets || 0 },
                { label: 'Tickets Résolus', value: reportData.resolvedTickets || 0 },
                { label: 'Tickets Escaladés', value: reportData.escalatedTickets || 0 },
            ]
        }
    ];

    const tables = [];

    // Table par catégorie si disponible
    if (reportData.byCategory && Array.isArray(reportData.byCategory)) {
        tables.push({
            headers: ['Catégorie', 'Nombre de Tickets'],
            rows: reportData.byCategory.map((cat: any) => [
                cat.categoryName || cat.name || 'N/A',
                cat.count || 0
            ])
        });
    }

    // Table par technicien si disponible
    if (reportData.byTechnician && Array.isArray(reportData.byTechnician)) {
        tables.push({
            headers: ['Technicien', 'Tickets Assignés', 'Tickets Résolus'],
            rows: reportData.byTechnician.map((tech: any) => [
                tech.technicianName || tech.name || 'N/A',
                tech.assignedTickets || 0,
                tech.resolvedTickets || 0
            ])
        });
    }

    exportReportToPDF(
        `Rapport Mensuel - ${hotelName}`,
        { sections, tables },
        `rapport-mensuel-${hotelName}-${reportData.year || 'N/A'}-${reportData.month || 'N/A'}.pdf`
    );
}

/**
 * Génère un rapport de performance en CSV
 */
export function generatePerformanceReportCSV(reportData: any, filename: string = 'rapport-performance.csv') {
    const data: any[] = [];

    // Ajouter les statistiques générales
    if (reportData.byTechnician && Array.isArray(reportData.byTechnician)) {
        reportData.byTechnician.forEach((tech: any) => {
            data.push({
                'Technicien': tech.technicianName || tech.name || 'N/A',
                'Tickets Assignés': tech.assignedTickets || 0,
                'Tickets Résolus': tech.resolvedTickets || 0,
                'Temps Moyen (heures)': tech.averageResolutionTime || 0,
                'Taux de Résolution (%)': tech.resolutionRate || 0,
            });
        });
    }

    if (data.length === 0) {
        throw new Error('Aucune donnée de performance disponible');
    }

    exportToCSV(data, filename);
}

