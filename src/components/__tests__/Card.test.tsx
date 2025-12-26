import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Components', () => {
    it('renders Card with content', () => {
        render(
            <Card>
                <CardContent>Card Content</CardContent>
            </Card>
        );
        expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders Card with header and title', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent>Card Content</CardContent>
            </Card>
        );
        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders Card with footer', () => {
        render(
            <Card>
                <CardContent>Card Content</CardContent>
                <CardFooter>Card Footer</CardFooter>
            </Card>
        );
        expect(screen.getByText('Card Content')).toBeInTheDocument();
        expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });
});

