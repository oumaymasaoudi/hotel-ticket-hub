import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge Component', () => {
    it('renders badge with text', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies default variant', () => {
        render(<Badge>Default</Badge>);
        const badge = screen.getByText('Default');
        expect(badge).toBeInTheDocument();
    });

    it('applies destructive variant', () => {
        render(<Badge variant="destructive">Error</Badge>);
        const badge = screen.getByText('Error');
        expect(badge).toHaveClass('bg-destructive');
    });

    it('applies secondary variant', () => {
        render(<Badge variant="secondary">Info</Badge>);
        const badge = screen.getByText('Info');
        expect(badge).toHaveClass('bg-secondary');
    });

    it('applies outline variant', () => {
        render(<Badge variant="outline">Outline</Badge>);
        const badge = screen.getByText('Outline');
        expect(badge).toHaveClass('border');
    });
});

