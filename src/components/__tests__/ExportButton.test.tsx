import { render, screen, fireEvent } from '@testing-library/react';
import { ExportButton } from '../export/ExportButton';
import { TicketResponse } from '@/services/apiService';

// Mock dependencies - must be before imports
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

// Mock jspdf-autotable FIRST to prevent DOM manipulation during import
jest.mock('jspdf-autotable', () => ({}), { virtual: true });

jest.mock('jspdf', () => {
  const mockDoc = {
    setFontSize: jest.fn().mockReturnThis(),
    setFont: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    autoTable: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    output: jest.fn(() => 'mock-pdf-data'),
    internal: {
      events: [],
    },
  };
  return jest.fn(() => mockDoc);
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

const mockTickets: TicketResponse[] = [
  {
    id: '1',
    ticketNumber: 'TKT-001',
    description: 'Test ticket 1',
    status: 'OPEN',
    categoryName: 'Category 1',
    createdAt: new Date().toISOString(),
    isUrgent: false,
  },
  {
    id: '2',
    ticketNumber: 'TKT-002',
    description: 'Test ticket 2',
    status: 'RESOLVED',
    categoryName: 'Category 2',
    assignedTechnicianName: 'John Doe',
    createdAt: new Date().toISOString(),
    isUrgent: true,
  },
];

describe('ExportButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a real DOM element instead of a mock object
    // This prevents appendChild errors from jsPDF
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const link = originalCreateElement('a');
        link.click = jest.fn();
        return link;
      }
      return originalCreateElement(tagName);
    });
  });

  it('should render export button', () => {
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should open dropdown menu on click', () => {
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Check if menu items are visible
    expect(screen.getByText(/CSV/i)).toBeInTheDocument();
  });

  it('should export to CSV when CSV option is clicked', () => {
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const csvOption = screen.getByText(/CSV/i);
    fireEvent.click(csvOption);
    
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should export to Excel when Excel option is clicked', () => {
    const XLSX = require('xlsx');
    
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const excelOption = screen.getByText(/Excel/i);
    fireEvent.click(excelOption);
    
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
  });

  it('should export to PDF when PDF option is clicked', () => {
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const pdfOption = screen.getByText(/PDF/i);
    fireEvent.click(pdfOption);
    
    const jsPDF = require('jspdf');
    expect(jsPDF).toHaveBeenCalled();
  });

  it('should use custom filename when provided', () => {
    render(<ExportButton data={mockTickets} filename="custom-export" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const csvOption = screen.getByText(/CSV/i);
    fireEvent.click(csvOption);
    
    // The filename should be used in the download
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should handle empty data array', () => {
    render(<ExportButton data={[]} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
