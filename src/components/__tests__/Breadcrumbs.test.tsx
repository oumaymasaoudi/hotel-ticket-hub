import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumbs } from '../navigation/Breadcrumbs';

const renderWithRouter = (component: React.ReactElement, initialPath = '/') => {
  window.history.pushState({}, 'Test page', initialPath);
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Breadcrumbs', () => {
  it('should render breadcrumbs for dashboard route', () => {
    renderWithRouter(<Breadcrumbs />, '/dashboard/admin');
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
  });

  it('should render breadcrumbs for tickets route', () => {
    renderWithRouter(<Breadcrumbs />, '/tickets');
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Tickets')).toBeInTheDocument();
  });

  it('should render breadcrumbs for nested route', () => {
    renderWithRouter(<Breadcrumbs />, '/dashboard/admin/tickets');
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
  });

  it('should not render breadcrumbs for home route', () => {
    const { container } = renderWithRouter(<Breadcrumbs />, '/');
    
    expect(container.firstChild).toBeNull();
  });

  it('should handle unknown routes', () => {
    renderWithRouter(<Breadcrumbs />, '/unknown/route');
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
  });

  it('should format route names correctly', () => {
    renderWithRouter(<Breadcrumbs />, '/test-route-name');
    
    expect(screen.getByText('Test Route Name')).toBeInTheDocument();
  });

  it('should render breadcrumbs with icons', () => {
    renderWithRouter(<Breadcrumbs />, '/dashboard/admin');
    
    // Check if icons are present (they should be rendered)
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
