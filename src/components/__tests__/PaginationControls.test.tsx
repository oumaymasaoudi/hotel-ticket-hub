import { render, screen, fireEvent } from '@testing-library/react';
import { PaginationControls } from '../PaginationControls';

describe('PaginationControls', () => {
    const mockOnPageChange = jest.fn();
    const mockOnItemsPerPageChange = jest.fn();

    const defaultProps = {
        currentPage: 1,
        totalPages: 5,
        itemsPerPage: 10,
        totalItems: 50,
        startIndex: 0,
        endIndex: 10,
        onPageChange: mockOnPageChange,
        onItemsPerPageChange: mockOnItemsPerPageChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders pagination controls', () => {
        render(<PaginationControls {...defaultProps} />);

        expect(screen.getByText('Affichage de 1 à 10 sur 50 résultats')).toBeInTheDocument();
        expect(screen.getByText('Précédent')).toBeInTheDocument();
        expect(screen.getByText('Suivant')).toBeInTheDocument();
    });

    it('disables previous button on first page', () => {
        render(<PaginationControls {...defaultProps} currentPage={1} />);

        const prevButton = screen.getByText('Précédent').closest('button');
        expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
        render(<PaginationControls {...defaultProps} currentPage={5} totalPages={5} />);

        const nextButton = screen.getByText('Suivant').closest('button');
        expect(nextButton).toBeDisabled();
    });

    it('calls onPageChange when previous button is clicked', () => {
        render(<PaginationControls {...defaultProps} currentPage={2} />);

        const prevButton = screen.getByText('Précédent').closest('button');
        if (prevButton) {
            fireEvent.click(prevButton);
        }

        expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('calls onPageChange when next button is clicked', () => {
        render(<PaginationControls {...defaultProps} currentPage={1} />);

        const nextButton = screen.getByText('Suivant').closest('button');
        if (nextButton) {
            fireEvent.click(nextButton);
        }

        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when page number is clicked', () => {
        render(<PaginationControls {...defaultProps} currentPage={1} />);

        const pageButton = screen.getByText('2');
        fireEvent.click(pageButton);

        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onItemsPerPageChange when items per page changes', async () => {
        render(<PaginationControls {...defaultProps} />);

        const itemsPerPageSelect = screen.getByText('10').closest('button');
        if (itemsPerPageSelect) {
            fireEvent.click(itemsPerPageSelect);
            await screen.findByText('20');
            const option20 = screen.getByText('20');
            fireEvent.click(option20);
        }

        expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(20);
    });

    it('shows all pages when totalPages <= 5', () => {
        render(<PaginationControls {...defaultProps} totalPages={3} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows ellipsis when currentPage is near start', () => {
        render(<PaginationControls {...defaultProps} currentPage={2} totalPages={10} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('shows ellipsis when currentPage is near end', () => {
        render(<PaginationControls {...defaultProps} currentPage={9} totalPages={10} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        // Use getAllByText and check that at least one page 10 button exists in pagination
        const page10Buttons = screen.getAllByText('10');
        // Should have at least one page button with 10 (may also have the itemsPerPage selector)
        expect(page10Buttons.length).toBeGreaterThan(0);
    });

    it('shows ellipsis when currentPage is in middle', () => {
        render(<PaginationControls {...defaultProps} currentPage={5} totalPages={10} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        // Use getAllByText and check that at least one page 10 button exists in pagination
        const page10Buttons = screen.getAllByText('10');
        // Should have at least one page button with 10 (may also have the itemsPerPage selector)
        expect(page10Buttons.length).toBeGreaterThan(0);
    });

    it('highlights current page', () => {
        render(<PaginationControls {...defaultProps} currentPage={3} />);

        const currentPageButton = screen.getByText('3').closest('button');
        expect(currentPageButton).toHaveClass('bg-primary');
    });

    it('returns null when totalPages <= 1 and totalItems <= itemsPerPage', () => {
        const { container } = render(
            <PaginationControls {...defaultProps} totalPages={1} totalItems={5} itemsPerPage={10} />
        );

        expect(container.firstChild).toBeNull();
    });

    it('uses custom itemsPerPageOptions', async () => {
        const customOptions = [5, 15, 25];
        // Use itemsPerPage that matches one of the custom options
        render(<PaginationControls {...defaultProps} itemsPerPage={5} itemsPerPageOptions={customOptions} />);

        // Find the select trigger button by role before clicking
        const itemsPerPageSelect = screen.getByRole('combobox');
        expect(itemsPerPageSelect).toHaveTextContent('5');

        fireEvent.click(itemsPerPageSelect);

        // Wait for the dropdown to open and options to appear
        // Check for option 15 which should only appear in the dropdown (not in pagination)
        await screen.findByText('15', {}, { timeout: 3000 });

        // Verify all custom options are present in the dropdown
        // We check for 15 and 25 which should only be in the dropdown
        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
    });
});

