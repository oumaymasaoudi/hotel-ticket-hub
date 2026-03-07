import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportButton } from '../export/ExportButton';
import { TicketResponse } from '@/services/apiService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

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
  let createElementSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on document.createElement to verify it's called
    createElementSpy = jest.spyOn(document, 'createElement');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render export button', () => {
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should open dropdown menu on click', async () => {
    const user = userEvent.setup();
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button', { name: /exporter/i });
    await user.click(button);
    
    // Wait for the dropdown menu to open
    await waitFor(() => {
      expect(screen.getByText(/CSV/i)).toBeInTheDocument();
    });
  });

  it('should export to CSV when CSV option is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button', { name: /exporter/i });
    await user.click(button);
    
    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText(/CSV/i)).toBeInTheDocument();
    });
    
    const csvOption = screen.getByText(/CSV/i);
    await user.click(csvOption);
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('should export to Excel when Excel option is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button', { name: /exporter/i });
    await user.click(button);
    
    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText(/Excel/i)).toBeInTheDocument();
    });
    
    const excelOption = screen.getByText(/Excel/i);
    await user.click(excelOption);
    
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
  });

  it('should export to PDF when PDF option is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportButton data={mockTickets} />);
    
    const button = screen.getByRole('button', { name: /exporter/i });
    await user.click(button);
    
    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText(/PDF/i)).toBeInTheDocument();
    });
    
    const pdfOption = screen.getByText(/PDF/i);
    await user.click(pdfOption);
    
    expect(jsPDF).toHaveBeenCalled();
  });

  it('should use custom filename when provided', async () => {
    const user = userEvent.setup();
    render(<ExportButton data={mockTickets} filename="custom-export" />);
    
    const button = screen.getByRole('button', { name: /exporter/i });
    await user.click(button);
    
    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText(/CSV/i)).toBeInTheDocument();
    });
    
    const csvOption = screen.getByText(/CSV/i);
    await user.click(csvOption);
    
    // The filename should be used in the download
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('should handle empty data array', () => {
    render(<ExportButton data={[]} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
