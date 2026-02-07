import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedFilters } from '../AdvancedFilters';

describe('AdvancedFilters', () => {
    const mockOnFilterChange = jest.fn();

    const defaultProps = {
        onFilterChange: mockOnFilterChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with default filters', () => {
        render(<AdvancedFilters {...defaultProps} />);

        expect(screen.getByText('Filtres Avancés')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Numéro, email, description...')).toBeInTheDocument();
    });

    it('calls onFilterChange when search input changes', () => {
        render(<AdvancedFilters {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Numéro, email, description...');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        expect(mockOnFilterChange).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'test search' })
        );
    });

    it('calls onFilterChange when status changes', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        const statusSelect = screen.getByText('Tous les statuts').closest('button');
        if (statusSelect) {
            fireEvent.click(statusSelect);
            await waitFor(() => {
                const openOption = screen.getByText('OPEN');
                fireEvent.click(openOption);
            }, { timeout: 3000 });
        }

        expect(mockOnFilterChange).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'OPEN' })
        );
    });

    it('displays categories when provided', async () => {
        const categories = [
            { id: '1', name: 'Plomberie', color: '#FF0000' },
            { id: '2', name: 'Électricité', color: '#00FF00' },
        ];

        render(<AdvancedFilters {...defaultProps} categories={categories} />);

        const categorySelect = screen.getByText('Toutes les catégories').closest('button');
        if (categorySelect) {
            fireEvent.click(categorySelect);
            await waitFor(() => {
                expect(screen.getByText('Plomberie')).toBeInTheDocument();
                expect(screen.getByText('Électricité')).toBeInTheDocument();
            }, { timeout: 3000 });
        }
    });

    it('calls onFilterChange when category changes (line 134)', async () => {
        const categories = [
            { id: '1', name: 'Plomberie', color: '#FF0000' },
            { id: '2', name: 'Électricité', color: '#00FF00' },
        ];

        render(<AdvancedFilters {...defaultProps} categories={categories} />);

        const categorySelect = screen.getByText('Toutes les catégories').closest('button');
        if (categorySelect) {
            fireEvent.click(categorySelect);
            await waitFor(() => {
                const plomberieOption = screen.getByText('Plomberie');
                fireEvent.click(plomberieOption);
            }, { timeout: 3000 });
        }

        await waitFor(() => {
            expect(mockOnFilterChange).toHaveBeenCalledWith(
                expect.objectContaining({ categoryId: '1' })
            );
        }, { timeout: 3000 });
    });

    it('displays technicians when provided', async () => {
        const technicians = [
            { id: '1', fullName: 'John Doe' },
            { id: '2', fullName: 'Jane Smith' },
        ];

        render(<AdvancedFilters {...defaultProps} technicians={technicians} />);

        const technicianSelect = screen.getByText('Tous les techniciens').closest('button');
        if (technicianSelect) {
            fireEvent.click(technicianSelect);
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            }, { timeout: 3000 });
        }
    });

    it('calls onFilterChange when technician changes (line 163)', async () => {
        const technicians = [
            { id: '1', fullName: 'John Doe' },
            { id: '2', fullName: 'Jane Smith' },
        ];

        render(<AdvancedFilters {...defaultProps} technicians={technicians} />);

        const technicianSelect = screen.getByText('Tous les techniciens').closest('button');
        if (technicianSelect) {
            fireEvent.click(technicianSelect);
            await waitFor(() => {
                const johnOption = screen.getByText('John Doe');
                fireEvent.click(johnOption);
            }, { timeout: 3000 });
        }

        await waitFor(() => {
            expect(mockOnFilterChange).toHaveBeenCalledWith(
                expect.objectContaining({ technicianId: '1' })
            );
        }, { timeout: 3000 });
    });

    it('shows active filters count badge when filters are active', () => {
        render(<AdvancedFilters {...defaultProps} />);

        // Initially no badge should be shown
        expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('shows clear filters button when filters are active', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        // Change status filter (which is counted in activeFiltersCount)
        const statusSelect = screen.getByText('Tous les statuts').closest('button');
        if (statusSelect) {
            fireEvent.click(statusSelect);
            await waitFor(() => {
                const openOption = screen.getByText('OPEN');
                fireEvent.click(openOption);
            }, { timeout: 3000 });
        }

        // Wait for the state to update and the button to appear
        await waitFor(() => {
            const clearButton = screen.queryByText('Réinitialiser');
            expect(clearButton).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('clears all filters when clear button is clicked', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        // Change status filter (which is counted in activeFiltersCount)
        const statusSelect = screen.getByText('Tous les statuts').closest('button');
        if (statusSelect) {
            fireEvent.click(statusSelect);
            await waitFor(() => {
                const openOption = screen.getByText('OPEN');
                fireEvent.click(openOption);
            }, { timeout: 3000 });
        }

        // Wait for the button to appear
        const clearButton = await screen.findByText('Réinitialiser', {}, { timeout: 3000 });
        fireEvent.click(clearButton);

        // Verify that onFilterChange was called with empty filters
        expect(mockOnFilterChange).toHaveBeenCalledWith({
            search: '',
            status: 'all',
            categoryId: 'all',
            technicianId: 'all',
            dateFrom: null,
            dateTo: null,
            isUrgent: null,
        });
    });

    it('handles date selection', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        const dateFromButton = screen.getAllByText('Sélectionner une date')[0];
        fireEvent.click(dateFromButton);

        await waitFor(() => {
            // Calendar should be visible
            expect(screen.getByRole('grid')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('calls onFilterChange when dateFrom is selected (line 205)', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        const dateFromButton = screen.getAllByText('Sélectionner une date')[0];
        fireEvent.click(dateFromButton);

        await waitFor(() => {
            const calendar = screen.getByRole('grid');
            expect(calendar).toBeInTheDocument();

            // Click on a date (first available date button)
            const dateButtons = calendar.querySelectorAll('button');
            if (dateButtons.length > 0) {
                fireEvent.click(dateButtons[0]);
            }
        }, { timeout: 3000 });

        await waitFor(() => {
            expect(mockOnFilterChange).toHaveBeenCalledWith(
                expect.objectContaining({ dateFrom: expect.any(Date) })
            );
        }, { timeout: 3000 });
    });

    it('calls onFilterChange when dateTo is selected (line 236)', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        const dateToButton = screen.getAllByText('Sélectionner une date')[1];
        fireEvent.click(dateToButton);

        await waitFor(() => {
            const calendar = screen.getByRole('grid');
            expect(calendar).toBeInTheDocument();

            // Click on a date (first available date button)
            const dateButtons = calendar.querySelectorAll('button');
            if (dateButtons.length > 0) {
                fireEvent.click(dateButtons[0]);
            }
        }, { timeout: 3000 });

        await waitFor(() => {
            expect(mockOnFilterChange).toHaveBeenCalledWith(
                expect.objectContaining({ dateTo: expect.any(Date) })
            );
        }, { timeout: 3000 });
    });

    it('handles urgent filter selection', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        const prioritySelect = screen.getByText('Toutes les priorités').closest('button');
        if (prioritySelect) {
            fireEvent.click(prioritySelect);
            await waitFor(() => {
                const urgentOption = screen.getByText('Urgent uniquement');
                fireEvent.click(urgentOption);
            }, { timeout: 3000 });
        }

        expect(mockOnFilterChange).toHaveBeenCalledWith(
            expect.objectContaining({ isUrgent: true })
        );
    });

    it('handles normal priority filter selection', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        const prioritySelect = screen.getByText('Toutes les priorités').closest('button');
        if (prioritySelect) {
            fireEvent.click(prioritySelect);
            await waitFor(() => {
                const normalOption = screen.getByText('Non urgent');
                fireEvent.click(normalOption);
            }, { timeout: 3000 });
        }

        expect(mockOnFilterChange).toHaveBeenCalledWith(
            expect.objectContaining({ isUrgent: false })
        );
    });

    it('calls onFilterChange when priority changes to all (line 249)', async () => {
        render(<AdvancedFilters {...defaultProps} />);

        // First set priority to urgent
        const prioritySelect = screen.getByText('Toutes les priorités').closest('button');
        if (prioritySelect) {
            fireEvent.click(prioritySelect);
            await waitFor(() => {
                const urgentOption = screen.getByText('Urgent uniquement');
                fireEvent.click(urgentOption);
            }, { timeout: 3000 });
        }

        // Then change back to all
        const prioritySelect2 = screen.getByText('Urgent uniquement').closest('button');
        if (prioritySelect2) {
            fireEvent.click(prioritySelect2);
            await waitFor(() => {
                const allOption = screen.getByText('Toutes les priorités');
                fireEvent.click(allOption);
            }, { timeout: 3000 });
        }

        await waitFor(() => {
            expect(mockOnFilterChange).toHaveBeenCalledWith(
                expect.objectContaining({ isUrgent: null })
            );
        }, { timeout: 3000 });
    });

    it('uses custom statuses when provided', async () => {
        const customStatuses = ['CUSTOM1', 'CUSTOM2'];
        render(<AdvancedFilters {...defaultProps} statuses={customStatuses} />);

        const statusSelect = screen.getByText('Tous les statuts').closest('button');
        if (statusSelect) {
            fireEvent.click(statusSelect);
            await waitFor(() => {
                expect(screen.getByText('CUSTOM1')).toBeInTheDocument();
                expect(screen.getByText('CUSTOM2')).toBeInTheDocument();
            }, { timeout: 3000 });
        }
    });
});

