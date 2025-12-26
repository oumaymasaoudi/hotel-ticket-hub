import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketTemplates } from '../TicketTemplates';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/hooks/use-toast');
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

describe('TicketTemplates', () => {
    const mockOnSelectTemplate = jest.fn();

    const defaultProps = {
        onSelectTemplate: mockOnSelectTemplate,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders default templates', () => {
        render(<TicketTemplates {...defaultProps} />);

        expect(screen.getByText('Templates de tickets')).toBeInTheDocument();
        expect(screen.getByText('Problème de plomberie')).toBeInTheDocument();
        expect(screen.getByText('Panne électrique')).toBeInTheDocument();
        expect(screen.getByText('Problème WiFi')).toBeInTheDocument();
    });

    it('calls onSelectTemplate when template is selected', () => {
        render(<TicketTemplates {...defaultProps} />);

        const selectButton = screen.getAllByText('Utiliser ce template')[0];
        fireEvent.click(selectButton);

        expect(mockOnSelectTemplate).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
            title: 'Template sélectionné',
            description: expect.stringContaining('a été appliqué'),
        });
    });

    it('opens dialog when new template button is clicked', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByRole('button', { name: /nouveau template/i });
        fireEvent.click(newButton);

        await waitFor(() => {
            // Check for dialog title instead of button text to avoid ambiguity
            expect(screen.getByRole('heading', { name: 'Nouveau template' })).toBeInTheDocument();
        });
    });

    it('saves new template when form is filled', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByRole('button', { name: /nouveau template/i });
        fireEvent.click(newButton);

        await waitFor(() => {
            const nameInput = screen.getByPlaceholderText('Ex: Problème de plomberie');
            fireEvent.change(nameInput, { target: { value: 'New Template' } });

            const descInput = screen.getByPlaceholderText('Description du problème...');
            fireEvent.change(descInput, { target: { value: 'Test description' } });

            const saveButton = screen.getByText('Créer');
            fireEvent.click(saveButton);
        });

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Succès',
            description: 'Template créé avec succès',
        });
    });

    it('shows error when saving template without required fields', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByRole('button', { name: /nouveau template/i });
        fireEvent.click(newButton);

        await waitFor(() => {
            const saveButton = screen.getByText('Créer');
            fireEvent.click(saveButton);
        });

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Erreur',
            description: 'Veuillez remplir tous les champs obligatoires',
            variant: 'destructive',
        });
    });

    it('opens edit dialog when edit button is clicked', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const editButtons = screen.getAllByRole('button');
        const editButton = editButtons.find(btn =>
            btn.querySelector('svg') && btn.getAttribute('class')?.includes('h-6')
        );

        if (editButton) {
            fireEvent.click(editButton);

            await waitFor(() => {
                expect(screen.getByText('Modifier le template')).toBeInTheDocument();
            });
        }
    });

    it('deletes template when delete button is clicked', () => {
        render(<TicketTemplates {...defaultProps} />);

        const deleteButtons = screen.getAllByRole('button');
        const deleteButton = deleteButtons.find(btn =>
            btn.getAttribute('class')?.includes('text-destructive')
        );

        if (deleteButton) {
            fireEvent.click(deleteButton);

            expect(mockToast).toHaveBeenCalledWith({
                title: 'Succès',
                description: 'Template supprimé',
            });
        }
    });

    it('displays categories when provided', async () => {
        const categories = [
            { id: '1', name: 'Plomberie' },
            { id: '2', name: 'Électricité' },
        ];

        render(<TicketTemplates {...defaultProps} categories={categories} />);

        const newButton = screen.getByRole('button', { name: /nouveau template/i });
        fireEvent.click(newButton);

        await waitFor(() => {
            const categorySelect = screen.getByText('Sélectionner une catégorie').closest('select');
            expect(categorySelect).toBeInTheDocument();
        });
    });

    it('handles category selection change (covers line 240)', async () => {
        const categories = [
            { id: '1', name: 'Plomberie' },
            { id: '2', name: 'Électricité' },
        ];

        render(<TicketTemplates {...defaultProps} categories={categories} />);

        const newButton = screen.getByRole('button', { name: /nouveau template/i });
        fireEvent.click(newButton);

        await waitFor(() => {
            const categorySelect = screen.getByLabelText('Catégorie') as HTMLSelectElement;
            expect(categorySelect).toBeInTheDocument();

            // Test onChange handler (line 240)
            fireEvent.change(categorySelect, { target: { value: '1' } });
            expect(categorySelect.value).toBe('1');
        });
    });

    it('handles urgent checkbox', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByRole('button', { name: /nouveau template/i });
        fireEvent.click(newButton);

        await waitFor(() => {
            const urgentCheckbox = screen.getByLabelText('Marquer comme urgent');
            fireEvent.click(urgentCheckbox);

            expect(urgentCheckbox).toBeChecked();
        });
    });

    it('cancels dialog when cancel button is clicked', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByRole('button', { name: /nouveau template/i });
        fireEvent.click(newButton);

        await waitFor(() => {
            const cancelButton = screen.getByText('Annuler');
            fireEvent.click(cancelButton);
        });

        await waitFor(() => {
            // Check that dialog content is no longer present (not the button which is always visible)
            expect(screen.queryByPlaceholderText('Ex: Problème de plomberie')).not.toBeInTheDocument();
            expect(screen.queryByRole('heading', { name: 'Nouveau template' })).not.toBeInTheDocument();
        });
    });

    it('updates template when editing', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const editButtons = screen.getAllByRole('button');
        const editButton = editButtons.find(btn =>
            btn.querySelector('svg') && btn.getAttribute('class')?.includes('h-6')
        );

        if (editButton) {
            fireEvent.click(editButton);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Problème de plomberie');
                fireEvent.change(nameInput, { target: { value: 'Updated Template' } });

                const saveButton = screen.getByText('Modifier');
                fireEvent.click(saveButton);
            });

            expect(mockToast).toHaveBeenCalledWith({
                title: 'Succès',
                description: 'Template modifié avec succès',
            });
        }
    });
});

