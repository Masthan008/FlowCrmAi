import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Leads from '../pages/Leads';
import Contacts from '../pages/Contacts';
import Companies from '../pages/Companies';
import Deals from '../pages/Deals';
import Activities from '../pages/Activities';
import Calendar from '../pages/Calendar';
import Tasks from '../pages/Tasks';
import Products from '../pages/Products';
import Quotes from '../pages/Quotes';
import Invoices from '../pages/Invoices';
import Reports from '../pages/Reports';
import Analytics from '../pages/Analytics';
import Team from '../pages/Team';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';

// Authentication Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Unauthorized from '../pages/auth/Unauthorized';
import Profile from '../pages/auth/Profile';
import AccountSettings from '../pages/auth/AccountSettings';
import MySessions from '../pages/auth/MySessions';

// Guards
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';

export const router = createBrowserRouter([
  // Public Auth Pages
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },

  // Private Dashboard Layout & Child Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      
      // Leads with view protection
      {
        path: 'leads',
        element: (
          <ProtectedRoute requiredPermission="leads:view">
            <Leads />
          </ProtectedRoute>
        ),
      },
      
      // Contacts with view protection
      {
        path: 'contacts',
        element: (
          <ProtectedRoute requiredPermission="contacts:view">
            <Contacts />
          </ProtectedRoute>
        ),
      },
      
      // Companies with view protection
      {
        path: 'companies',
        element: (
          <ProtectedRoute requiredPermission="companies:view">
            <Companies />
          </ProtectedRoute>
        ),
      },
      
      // Deals with view protection
      {
        path: 'deals',
        element: (
          <ProtectedRoute requiredPermission="deals:view">
            <Deals />
          </ProtectedRoute>
        ),
      },

      // Reports with view protection
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredPermission="reports:view">
            <Reports />
          </ProtectedRoute>
        ),
      },
      
      // Settings with access protection
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredPermission="settings:access">
            <Settings />
          </ProtectedRoute>
        ),
      },

      // General utility modules
      { path: 'activities', element: <Activities /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'products', element: <Products /> },
      { path: 'quotes', element: <Quotes /> },
      { path: 'invoices', element: <Invoices /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'team', element: <Team /> },
      { path: 'notifications', element: <Notifications /> },
      
      // Personal profiles and settings endpoints
      { path: 'profile', element: <Profile /> },
      { path: 'account-settings', element: <AccountSettings /> },
      { path: 'sessions', element: <MySessions /> },
      
      // Fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
