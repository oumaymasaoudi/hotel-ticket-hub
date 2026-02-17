import { exportToCSV, exportReportToPDF, exportTicketToPDF, generateMonthlyReportPDF, generatePerformanceReportCSV } from '../exportUtils';
import { TicketResponse } from '@/services/apiService';
import jsPDF from 'jspdf';

// Mock jsPDF
jest.mock('jspdf', () => {
    const mockDoc = {
        setFontSize: jest.fn(),
        setFont: jest.fn(),
        text: jest.fn(),
        addPage: jest.fn(),
        save: jest.fn(),
        splitTextToSize: jest.fn((text: string) => [text]),
        internal: {
            pageSize: {
                getWidth: () => 210,
                getHeight: () => 297,
            },
        },
    };
    return jest.fn(() => mockDoc);
});

// Mock URL.createObjectURL and document methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('exportUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock document.createElement and appendChild
        const mockLink = {
            setAttribute: jest.fn(),
            click: jest.fn(),
            style: {},
        };
        jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    });

    describe('exportToCSV', () => {
        it('should export data to CSV successfully', () => {
            const data = [
                { id: 1, name: 'Test', value: 100 },
                { id: 2, name: 'Test2', value: 200 },
            ];

            exportToCSV(data, 'test.csv');

            expect(document.createElement).toHaveBeenCalledWith('a');
        });

        it('should throw error for empty data', () => {
            expect(() => exportToCSV([], 'test.csv')).toThrow('Aucune donnée à exporter');
        });

        it('should handle null values', () => {
            const data = [
                { id: 1, name: null, value: undefined },
            ];

            expect(() => exportToCSV(data, 'test.csv')).not.toThrow();
        });

        it('should handle strings with commas', () => {
            const data = [
                { id: 1, name: 'Test, with, commas', value: 100 },
            ];

            expect(() => exportToCSV(data, 'test.csv')).not.toThrow();
        });
    });

    describe('exportReportToPDF', () => {
        it('should export report to PDF successfully', () => {
            const content = {
                sections: [
                    {
                        title: 'Test Section',
                        data: [
                            { label: 'Label1', value: 'Value1' },
                            { label: 'Label2', value: 123 },
                        ],
                    },
                ],
                tables: [
                    {
                        headers: ['Header1', 'Header2'],
                        rows: [['Row1Col1', 'Row1Col2'], ['Row2Col1', 'Row2Col2']],
                    },
                ],
            };

            exportReportToPDF('Test Report', content, 'test.pdf');

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle report without tables', () => {
            const content = {
                sections: [
                    {
                        title: 'Test Section',
                        data: [{ label: 'Label1', value: 'Value1' }],
                    },
                ],
            };

            expect(() => exportReportToPDF('Test Report', content, 'test.pdf')).not.toThrow();
        });
    });

    describe('exportTicketToPDF', () => {
        it('should export ticket to PDF successfully', () => {
            const ticket: TicketResponse = {
                id: '1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                description: 'Test ticket',
                status: 'OPEN',
                isUrgent: false,
                clientEmail: 'test@example.com',
                clientPhone: '',
                slaDeadline: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            exportTicketToPDF(ticket);

            expect(jsPDF).toHaveBeenCalled();
        });

        it('should handle ticket with all fields', () => {
            const ticket: TicketResponse = {
                id: '1',
                ticketNumber: 'TKT-001',
                hotelId: 'hotel-1',
                hotelName: 'Test Hotel',
                categoryId: 'cat-1',
                categoryName: 'Test Category',
                categoryIcon: 'icon',
                categoryColor: '#000',
                description: 'Test ticket',
                status: 'RESOLVED',
                isUrgent: true,
                clientEmail: 'test@example.com',
                clientPhone: '123456789',
                assignedTechnicianId: 'tech-1',
                assignedTechnicianName: 'John Doe',
                slaDeadline: new Date().toISOString(),
                resolvedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            expect(() => exportTicketToPDF(ticket)).not.toThrow();
        });
    });

    describe('generateMonthlyReportPDF', () => {
        it('should generate monthly report PDF successfully', () => {
            const reportData = {
                month: 2,
                year: 2026,
                totalTickets: 100,
                openTickets: 20,
                resolvedTickets: 70,
                escalatedTickets: 10,
                byCategory: [
                    { categoryName: 'Category1', count: 50 },
                    { name: 'Category2', count: 50 },
                ],
                byTechnician: [
                    { technicianName: 'Tech1', assignedTickets: 30, resolvedTickets: 25 },
                    { name: 'Tech2', assignedTickets: 20, resolvedTickets: 15 },
                ],
            };

            expect(() => generateMonthlyReportPDF(reportData, 'Test Hotel')).not.toThrow();
        });

        it('should handle report without categories and technicians', () => {
            const reportData = {
                month: 2,
                year: 2026,
                totalTickets: 100,
            };

            expect(() => generateMonthlyReportPDF(reportData, 'Test Hotel')).not.toThrow();
        });
    });

    describe('generatePerformanceReportCSV', () => {
        it('should generate performance report CSV successfully', () => {
            const reportData = {
                byTechnician: [
                    {
                        technicianName: 'Tech1',
                        assignedTickets: 30,
                        resolvedTickets: 25,
                        averageResolutionTime: 5,
                        resolutionRate: 83.3,
                    },
                ],
            };

            expect(() => generatePerformanceReportCSV(reportData, 'performance.csv')).not.toThrow();
        });

        it('should throw error for empty data', () => {
            const reportData = {};

            expect(() => generatePerformanceReportCSV(reportData, 'performance.csv')).toThrow(
                'Aucune donnée de performance disponible'
            );
        });

        it('should handle technicians with name field', () => {
            const reportData = {
                byTechnician: [
                    {
                        name: 'Tech1',
                        assignedTickets: 30,
                        resolvedTickets: 25,
                    },
                ],
            };

            expect(() => generatePerformanceReportCSV(reportData, 'performance.csv')).not.toThrow();
        });
    });
});
