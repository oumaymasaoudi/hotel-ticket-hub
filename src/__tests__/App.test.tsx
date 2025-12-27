import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all page components
jest.mock('../pages/Index', () => ({
    __esModule: true,
    default: () => <div>Index Page</div>,
}));

jest.mock('../pages/CreateTicket', () => ({
    __esModule: true,
    default: () => <div>Create Ticket Page</div>,
}));

jest.mock('../pages/TrackTicket', () => ({
    __esModule: true,
    default: () => <div>Track Ticket Page</div>,
}));

jest.mock('../pages/Login', () => ({
    __esModule: true,
    default: () => <div>Login Page</div>,
}));

jest.mock('../pages/Signup', () => ({
    __esModule: true,
    default: () => <div>Signup Page</div>,
}));

jest.mock('../pages/ClientDashboard', () => ({
    __esModule: true,
    default: () => <div>Client Dashboard</div>,
}));

jest.mock('../pages/TechnicianDashboard', () => ({
    __esModule: true,
    default: () => <div>Technician Dashboard</div>,
}));

jest.mock('../pages/AdminDashboard', () => ({
    __esModule: true,
    default: () => <div>Admin Dashboard</div>,
}));

jest.mock('../pages/SuperAdminDashboard', () => ({
    __esModule: true,
    default: () => <div>Super Admin Dashboard</div>,
}));

jest.mock('../pages/NotFound', () => ({
    __esModule: true,
    default: () => <div>Not Found Page</div>,
}));

describe('App Component', () => {
    it('renders App component with routes', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Index Page')).toBeInTheDocument();
    });

    it('renders create ticket route', () => {
        render(
            <MemoryRouter initialEntries={['/create-ticket']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Create Ticket Page')).toBeInTheDocument();
    });

    it('renders track ticket route', () => {
        render(
            <MemoryRouter initialEntries={['/track-ticket']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Track Ticket Page')).toBeInTheDocument();
    });

    it('renders login route', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders signup route', () => {
        render(
            <MemoryRouter initialEntries={['/signup']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Signup Page')).toBeInTheDocument();
    });

    it('renders client dashboard route', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard/client']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
    });

    it('renders technician dashboard route', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard/technician']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Technician Dashboard')).toBeInTheDocument();
    });

    it('renders admin dashboard route', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('renders superadmin dashboard route', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard/superadmin']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    });

    it('renders not found route for unknown paths', () => {
        render(
            <MemoryRouter initialEntries={['/unknown-path']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });
});

