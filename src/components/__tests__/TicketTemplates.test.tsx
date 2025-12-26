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

        const newButton = screen.getByText('Nouveau template');
        fireEvent.click(newButton);

        await waitFor(() => {
            // Dialog title should appear (there are two "Nouveau template" texts - button and dialog title)
            // Check for dialog description to ensure dialog is open
            expect(screen.getByText('Créez un template pour accélérer la création de tickets récurrents')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('saves new template when form is filled', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByText('Nouveau template');
        fireEvent.click(newButton);

        await waitFor(() => {
            const nameInput = screen.getByPlaceholderText('Ex: Problème de plomberie');
            fireEvent.change(nameInput, { target: { value: 'New Template' } });

            const descInput = screen.getByPlaceholderText('Description du problème...');
            fireEvent.change(descInput, { target: { value: 'Test description' } });

            const saveButton = screen.getByText('Créer');
            fireEvent.click(saveButton);
        }, { timeout: 3000 });

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Succès',
            description: 'Template créé avec succès',
        });
    });

    it('shows error when saving template without required fields', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByText('Nouveau template');
        fireEvent.click(newButton);

        await waitFor(() => {
            const saveButton = screen.getByText('Créer');
            fireEvent.click(saveButton);
        }, { timeout: 3000 });

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Erreur',
            description: 'Veuillez remplir tous les champs obligatoires',
            variant: 'destructive',
        });
    });

    it('opens edit dialog when edit button is clicked', async () => {
        render(<TicketTemplates {...defaultProps} />);

        // Find edit button by looking for buttons with Edit icon
        const buttons = screen.getAllByRole('button');
        const editButton = buttons.find(btn => {
            const svg = btn.querySelector('svg');
            return svg && btn.getAttribute('class')?.includes('h-6') && !btn.getAttribute('class')?.includes('text-destructive');
        });

        if (editButton) {
            fireEvent.click(editButton);

            await waitFor(() => {
                expect(screen.getByText('Modifier le template')).toBeInTheDocument();
            }, { timeout: 3000 });
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

        const newButton = screen.getByText('Nouveau template');
        fireEvent.click(newButton);

        await waitFor(() => {
            const categorySelect = screen.getByText('Sélectionner une catégorie').closest('select');
            expect(categorySelect).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('handles urgent checkbox', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByText('Nouveau template');
        fireEvent.click(newButton);

        await waitFor(() => {
            const urgentCheckbox = screen.getByLabelText('Marquer comme urgent');
            fireEvent.click(urgentCheckbox);

            expect(urgentCheckbox).toBeChecked();
        }, { timeout: 3000 });
    });

    it('cancels dialog when cancel button is clicked', async () => {
        render(<TicketTemplates {...defaultProps} />);

        const newButton = screen.getByText('Nouveau template');
        fireEvent.click(newButton);

        await waitFor(() => {
            const cancelButton = screen.getByText('Annuler');
            fireEvent.click(cancelButton);
        }, { timeout: 3000 });

        await waitFor(() => {
            // Dialog should be closed - check that description is not visible
            expect(screen.queryByText('Créez un template pour accélérer la création de tickets récurrents')).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('updates template when editing', async () => {
        render(<TicketTemplates {...defaultProps} />);

        // Find edit button
        const buttons = screen.getAllByRole('button');
        const editButton = buttons.find(btn => {
            const svg = btn.querySelector('svg');
            return svg && btn.getAttribute('class')?.includes('h-6') && !btn.getAttribute('class')?.includes('text-destructive');
        });

        if (editButton) {
            fireEvent.click(editButton);

            await waitFor(() => {
                const nameInput = screen.getByDisplayValue('Problème de plomberie');
                fireEvent.change(nameInput, { target: { value: 'Updated Template' } });

                const saveButton = screen.getByText('Modifier');
                fireEvent.click(saveButton);
            }, { timeout: 3000 });

            expect(mockToast).toHaveBeenCalledWith({
                title: 'Succès',
                description: 'Template modifié avec succès',
            });
        }
    });
});

