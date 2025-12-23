import { exportToCSV, exportReportToPDF, exportTicketToPDF } from '../exportUtils';
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
    });
});

