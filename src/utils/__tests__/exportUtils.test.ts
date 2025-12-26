import { exportToCSV, exportReportToPDF, exportTicketToPDF, generateMonthlyReportPDF, generatePerformanceReportCSV } from '../exportUtils';
import { TicketResponse } from '@/services/apiService';
import jsPDF from 'jspdf';

// Mock jsPDF
jest.mock('jspdf', () => {
    const mockImplementation = () => ({
        text: jest.fn(),
        save: jest.fn(),
        setFontSize: jest.fn(),
        setFont: jest.fn(),
        addPage: jest.fn(),
        splitTextToSize: jest.fn((text: string) => [text]),
        internal: {
            pageSize: {
                getWidth: jest.fn(() => 210),
                getHeight: jest.fn(() => 297),
            },
        },
    });
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(mockImplementation),
    };
});

// Mock html2canvas
jest.mock('html2canvas', () => ({
    __esModule: true,
    default: jest.fn().mockResolvedValue({
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test'),
    }),
}));

describe('exportUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock URL.createObjectURL
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
        // Mock window.open
        global.window.open = jest.fn();
        // Mock document.createElement
        global.document.createElement = jest.fn((tag: string) => {
            if (tag === 'a') {
                return {
                    href: '',
                    download: '',
                    click: jest.fn(),
                    style: { display: '' },
                    setAttribute: jest.fn(),
                } as unknown as HTMLAnchorElement;
            }
            return document.createElement(tag);
        });
        global.document.body.appendChild = jest.fn();
        global.document.body.removeChild = jest.fn();
    });

    describe('exportToCSV', () => {
        it('should export data to CSV', () => {
            const data = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 25 },
            ];

            exportToCSV(data, 'test.csv');

            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });

        it('should throw error for empty data', () => {
            expect(() => exportToCSV([], 'test.csv')).toThrow('Aucune donnée à exporter');
        });

        it('should handle data with special characters', () => {
            const data = [
                { name: 'John, "Doe"', age: 30 },
                { name: 'Jane\nSmith', age: 25 },
            ];

            exportToCSV(data, 'test.csv');
            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });
    });

    describe('exportReportToPDF', () => {
        it('should export report to PDF', () => {
            const title = 'Test Report';
            const content = {
                sections: [
                    {
                        title: 'Section 1',
                        data: [
                            { label: 'Label 1', value: 'Value 1' }
                        ]
                    }
                ]
            };
            const filename = 'test.pdf';

            exportReportToPDF(title, content, filename);

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle empty sections', () => {
            exportReportToPDF('Test', { sections: [] }, 'test.pdf');
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle tables in report', () => {
            const title = 'Test Report';
            const content = {
                sections: [
                    {
                        title: 'Section 1',
                        data: [
                            { label: 'Label 1', value: 'Value 1' }
                        ]
                    }
                ],
                tables: [
                    {
                        headers: ['Header 1', 'Header 2'],
                        rows: [['Row 1 Col 1', 'Row 1 Col 2'], ['Row 2 Col 1', 'Row 2 Col 2']]
                    }
                ]
            };
            const filename = 'test.pdf';

            exportReportToPDF(title, content, filename);

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle multiple sections', () => {
            const title = 'Test Report';
            const content = {
                sections: [
                    {
                        title: 'Section 1',
                        data: [
                            { label: 'Label 1', value: 'Value 1' },
                            { label: 'Label 2', value: 'Value 2' }
                        ]
                    },
                    {
                        title: 'Section 2',
                        data: [
                            { label: 'Label 3', value: 'Value 3' }
                        ]
                    }
                ]
            };
            const filename = 'test.pdf';

            exportReportToPDF(title, content, filename);

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should add new page when yPosition exceeds page height before section (lines 123-124)', () => {
            const title = 'Test Report';
            // Create a first section with enough data to push yPosition high
            // pageHeight = 297, margin = 20, so we need yPosition > 297 - 20 - 30 = 247
            // Starting yPosition after title and date: ~20 (margin) + 14 (title) + 14 (date) = 48
            // Each section title adds ~10.5 (lineHeight * 1.5)
            // Each data item adds ~7 (lineHeight) - we have 2 calls per item (label and value)
            // Section spacing adds 10
            // So for 40 items: 48 + 10.5 + 40*7*2 + 10 = 48 + 10.5 + 560 + 10 = 628.5 > 247
            const content = {
                sections: [
                    {
                        title: 'Section 1',
                        data: Array.from({ length: 40 }, (_, i) => ({
                            label: `Label ${i}`,
                            value: `Value ${i}`
                        }))
                    },
                    {
                        title: 'Section 2',
                        data: [
                            { label: 'Label 2', value: 'Value 2' }
                        ]
                    }
                ]
            };
            const filename = 'test.pdf';

            // Simulate yPosition tracking
            let simulatedY = 20; // Start at margin
            let textCallIndex = 0;
            const mockDoc = {
                text: jest.fn((text, x, y) => {
                    textCallIndex++;
                    if (y !== undefined) {
                        simulatedY = y;
                    }
                    // Simulate yPosition increase
                    // After title: yPosition += 14
                    // After date: yPosition += 14
                    // After section title: yPosition += 10.5
                    // After each data item: yPosition += 7 (called twice per item)
                    // After section: yPosition += 10
                    if (textCallIndex === 1) {
                        simulatedY += 14; // Title
                    } else if (textCallIndex === 2) {
                        simulatedY += 14; // Date
                    } else if (text.includes('Section')) {
                        simulatedY += 10.5; // Section title
                    } else {
                        simulatedY += 7; // Data items
                    }
                }),
                save: jest.fn(),
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                addPage: jest.fn(() => {
                    simulatedY = 20; // Reset after addPage
                }),
                splitTextToSize: jest.fn((text: string) => [text]),
                internal: {
                    pageSize: {
                        getWidth: jest.fn(() => 210),
                        getHeight: jest.fn(() => 297),
                    },
                },
            };

            // Override jsPDF mock for this test
            (jsPDF as unknown as jest.Mock).mockImplementation(() => mockDoc);

            exportReportToPDF(title, content, filename);

            // Should call addPage when yPosition exceeds pageHeight - margin - 30 before second section
            // With 40 items, yPosition should be > 247
            expect(mockDoc.addPage).toHaveBeenCalled();
        });

        it('should add new page when yPosition exceeds page height in sections (lines 138-139)', () => {
            const title = 'Test Report';
            const content = {
                sections: [
                    {
                        title: 'Section 1',
                        data: Array.from({ length: 50 }, (_, i) => ({
                            label: `Label ${i}`,
                            value: `Value ${i}`
                        }))
                    }
                ]
            };
            const filename = 'test.pdf';

            const mockDoc = {
                text: jest.fn(),
                save: jest.fn(),
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                addPage: jest.fn(),
                splitTextToSize: jest.fn((text: string) => [text]),
                internal: {
                    pageSize: {
                        getWidth: jest.fn(() => 210),
                        getHeight: jest.fn(() => 297),
                    },
                },
            };

            (jsPDF as unknown as jest.Mock).mockReturnValue(mockDoc);

            exportReportToPDF(title, content, filename);

            // Should call addPage when yPosition exceeds page height
            expect(mockDoc.addPage).toHaveBeenCalled();
        });

        it('should add new page when yPosition exceeds page height before table (lines 156-157)', () => {
            const title = 'Test Report';
            // Create sections with enough data to push yPosition high before table
            // pageHeight = 297, margin = 20, so we need yPosition > 297 - 20 - 50 = 227
            // Starting yPosition after title and date: ~20 (margin) + 14 (title) + 14 (date) = 48
            // Section title adds ~10.5
            // Each data item adds ~7 (lineHeight) - we have 2 calls per item (label and value)
            // Section spacing adds 10
            // So for 35 items: 48 + 10.5 + 35*7*2 + 10 = 48 + 10.5 + 490 + 10 = 558.5 > 227
            const content = {
                sections: [
                    {
                        title: 'Section 1',
                        data: Array.from({ length: 35 }, (_, i) => ({
                            label: `Label ${i}`,
                            value: `Value ${i}`
                        }))
                    }
                ],
                tables: [
                    {
                        headers: ['Header 1', 'Header 2'],
                        rows: [['Row 1 Col 1', 'Row 1 Col 2']]
                    }
                ]
            };
            const filename = 'test.pdf';

            // Simulate yPosition tracking
            let simulatedY = 20; // Start at margin
            let textCallIndex = 0;
            const mockDoc = {
                text: jest.fn((text, x, y) => {
                    textCallIndex++;
                    if (y !== undefined) {
                        simulatedY = y;
                    }
                    // Simulate yPosition increase
                    if (textCallIndex === 1) {
                        simulatedY += 14; // Title
                    } else if (textCallIndex === 2) {
                        simulatedY += 14; // Date
                    } else if (text.includes('Section')) {
                        simulatedY += 10.5; // Section title
                    } else {
                        simulatedY += 7; // Data items
                    }
                }),
                save: jest.fn(),
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                addPage: jest.fn(() => {
                    simulatedY = 20; // Reset after addPage
                }),
                splitTextToSize: jest.fn((text: string) => [text]),
                internal: {
                    pageSize: {
                        getWidth: jest.fn(() => 210),
                        getHeight: jest.fn(() => 297),
                    },
                },
            };

            // Override jsPDF mock for this test
            (jsPDF as unknown as jest.Mock).mockImplementation(() => mockDoc);

            exportReportToPDF(title, content, filename);

            // Should call addPage when yPosition exceeds pageHeight - margin - 50 before table
            // With 35 items, yPosition should be > 227
            expect(mockDoc.addPage).toHaveBeenCalled();
        });

        it('should add new page when yPosition exceeds page height in tables (lines 156-157)', () => {
            const title = 'Test Report';
            const content = {
                sections: [],
                tables: [
                    {
                        headers: ['Header 1', 'Header 2'],
                        rows: Array.from({ length: 50 }, (_, i) => [`Row ${i} Col 1`, `Row ${i} Col 2`])
                    }
                ]
            };
            const filename = 'test.pdf';

            const mockDoc = {
                text: jest.fn(),
                save: jest.fn(),
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                addPage: jest.fn(),
                splitTextToSize: jest.fn((text: string) => [text]),
                internal: {
                    pageSize: {
                        getWidth: jest.fn(() => 210),
                        getHeight: jest.fn(() => 297),
                    },
                },
            };

            (jsPDF as unknown as jest.Mock).mockReturnValue(mockDoc);

            exportReportToPDF(title, content, filename);

            // Should call addPage when yPosition exceeds page height
            expect(mockDoc.addPage).toHaveBeenCalled();
        });
    });

    describe('exportTicketToPDF', () => {
        it('should export ticket to PDF', () => {
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                clientPhone: '1234567890',
                description: 'Test description',
                status: 'OPEN',
                isUrgent: false,
                slaDeadline: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            exportTicketToPDF(ticket);

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle ticket with null values', () => {
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                clientPhone: null,
                description: 'Test description',
                status: 'OPEN',
                isUrgent: false,
                slaDeadline: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            exportTicketToPDF(ticket);

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle ticket with assigned technician', () => {
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                clientPhone: '1234567890',
                description: 'Test description',
                status: 'OPEN',
                isUrgent: false,
                assignedTechnicianName: 'John Doe',
                slaDeadline: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            exportTicketToPDF(ticket);

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should add new page when description exceeds page height (lines 277-278)', () => {
            const longDescription = 'A'.repeat(5000); // Very long description
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                description: longDescription,
                status: 'OPEN',
                isUrgent: false,
                clientPhone: undefined,
                slaDeadline: undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const mockDoc = {
                text: jest.fn(),
                save: jest.fn(),
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                addPage: jest.fn(),
                splitTextToSize: jest.fn((text: string) => {
                    // Return many lines to trigger page break
                    return Array.from({ length: 100 }, () => 'A'.repeat(50));
                }),
                internal: {
                    pageSize: {
                        getWidth: jest.fn(() => 210),
                        getHeight: jest.fn(() => 297),
                    },
                },
            };

            (jsPDF as unknown as jest.Mock).mockReturnValue(mockDoc);

            exportTicketToPDF(ticket);

            // Should call addPage when yPosition exceeds page height
            expect(mockDoc.addPage).toHaveBeenCalled();
        });

        it('should handle ticket with SLA deadline', () => {
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                clientPhone: '1234567890',
                description: 'Test description',
                status: 'OPEN',
                isUrgent: true,
                slaDeadline: new Date(Date.now() + 86400000).toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            exportTicketToPDF(ticket);

            expect(jsPDF).toHaveBeenCalled();
        });
    });

    describe('exportToCSV edge cases', () => {
        it('should handle null values in CSV', () => {
            const data = [
                { name: 'John', age: null, city: undefined },
            ];

            exportToCSV(data, 'test.csv');
            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });

        it('should handle numeric values in CSV', () => {
            const data = [
                { name: 'John', age: 30, score: 95.5 },
            ];

            exportToCSV(data, 'test.csv');
            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });

        it('should handle boolean values in CSV', () => {
            const data = [
                { name: 'John', active: true, verified: false },
            ];

            exportToCSV(data, 'test.csv');
            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });
    });

    describe('generateMonthlyReportPDF', () => {
        it('should generate monthly report PDF', () => {
            const reportData = {
                month: 1,
                year: 2024,
                totalTickets: 10,
                openTickets: 5,
                resolvedTickets: 3,
                escalatedTickets: 2,
                byCategory: [
                    { categoryName: 'Category 1', count: 5 }
                ],
                byTechnician: [
                    { technicianName: 'Tech 1', assignedTickets: 3, resolvedTickets: 2 }
                ]
            };

            generateMonthlyReportPDF(reportData, 'Test Hotel');
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle report without categories and technicians', () => {
            const reportData = {
                month: 1,
                year: 2024,
                totalTickets: 10,
                openTickets: 5,
                resolvedTickets: 3,
                escalatedTickets: 2
            };

            generateMonthlyReportPDF(reportData, 'Test Hotel');
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle report with category using name property (line 4 coverage)', () => {
            const reportData = {
                month: 1,
                year: 2024,
                totalTickets: 10,
                openTickets: 5,
                resolvedTickets: 3,
                escalatedTickets: 2,
                byCategory: [
                    { name: 'Category 1', count: 5 } // Using 'name' instead of 'categoryName'
                ]
            };

            generateMonthlyReportPDF(reportData, 'Test Hotel');
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle report with technician using name property', () => {
            const reportData = {
                month: 1,
                year: 2024,
                totalTickets: 10,
                openTickets: 5,
                resolvedTickets: 3,
                escalatedTickets: 2,
                byTechnician: [
                    { name: 'Tech 1', assignedTickets: 3, resolvedTickets: 2 } // Using 'name' instead of 'technicianName'
                ]
            };

            generateMonthlyReportPDF(reportData, 'Test Hotel');
            expect(jsPDF).toHaveBeenCalled();
        });
    });

    describe('generatePerformanceReportCSV', () => {
        it('should generate performance report CSV', () => {
            const reportData = {
                byTechnician: [
                    {
                        technicianName: 'Tech 1',
                        assignedTickets: 10,
                        resolvedTickets: 8,
                        averageResolutionTime: 2.5,
                        resolutionRate: 80
                    }
                ]
            };

            generatePerformanceReportCSV(reportData, 'performance.csv');
            expect(global.document.createElement).toHaveBeenCalledWith('a');
        });

        it('should throw error when no data available', () => {
            const reportData = {
                byTechnician: []
            };

            expect(() => generatePerformanceReportCSV(reportData, 'performance.csv')).toThrow('Aucune donnée de performance disponible');
        });
    });

    describe('exportTicketToPDF edge cases', () => {
        it('should handle ticket without assigned technician', () => {
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                clientPhone: '1234567890',
                description: 'Test description',
                status: 'OPEN',
                isUrgent: false,
                slaDeadline: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            exportTicketToPDF(ticket);
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle ticket without SLA deadline', () => {
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                clientPhone: '1234567890',
                description: 'Test description',
                status: 'OPEN',
                isUrgent: false,
                slaDeadline: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            exportTicketToPDF(ticket);
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle ticket with long description that requires page break', () => {
            const longDescription = 'A'.repeat(1000);
            const ticket: TicketResponse = {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                clientEmail: 'client@test.com',
                clientPhone: '1234567890',
                description: longDescription,
                status: 'OPEN',
                isUrgent: false,
                slaDeadline: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            exportTicketToPDF(ticket);
            expect(jsPDF).toHaveBeenCalled();
        });
    });

    describe('exportReportToPDF edge cases', () => {
        it('should handle empty sections', () => {
            const title = 'Test Report';
            const content = {
                sections: [],
                tables: []
            };
            const filename = 'test.pdf';

            exportReportToPDF(title, content, filename);
            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle table with many rows requiring page breaks', () => {
            const title = 'Test Report';
            const content = {
                sections: [],
                tables: [
                    {
                        headers: ['Header 1', 'Header 2'],
                        rows: Array.from({ length: 100 }, (_, i) => [`Row ${i} Col 1`, `Row ${i} Col 2`])
                    }
                ]
            };
            const filename = 'test.pdf';

            exportReportToPDF(title, content, filename);
            expect(jsPDF).toHaveBeenCalled();
        });
    });
});

