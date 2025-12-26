import { render, screen } from '@testing-library/react';
import { CategoryCard } from '../CategoryCard';
import { Wrench } from 'lucide-react';

describe('CategoryCard Component', () => {
    it('renders category card with name', () => {
        render(
            <CategoryCard
                icon={Wrench}
                name="Test Category"
                color="#000000"
                onClick={() => { }}
            />
        );
        expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(
            <CategoryCard
                icon={Wrench}
                name="Test Category"
                color="#000000"
                onClick={handleClick}
            />
        );

        const button = screen.getByRole('button');
        button.click();
        expect(handleClick).toHaveBeenCalled();
    });

    it('applies selected styles when selected', () => {
        render(
            <CategoryCard
                icon={Wrench}
                name="Test Category"
                color="#000000"
                selected={true}
                onClick={() => { }}
            />
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass('border-primary');
    });

    it('does not apply selected styles when not selected', () => {
        render(
            <CategoryCard
                icon={Wrench}
                name="Test Category"
                color="#000000"
                selected={false}
                onClick={() => { }}
            />
        );
        const button = screen.getByRole('button');
        expect(button).not.toHaveClass('border-primary');
    });
});

