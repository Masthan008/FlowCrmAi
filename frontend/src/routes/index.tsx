import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Leads from '../pages/Leads';
import LeadAdd from '../pages/leads/LeadAdd';
import LeadEdit from '../pages/leads/LeadEdit';
import LeadView from '../pages/leads/LeadView';
import Contacts from '../pages/Contacts';
import ContactProfile from '../pages/contacts/ContactProfile';
import Companies from '../pages/Companies';
import CompanyAdd from '../pages/companies/CompanyAdd';
import CompanyEdit from '../pages/companies/CompanyEdit';
import CompanyProfile from '../pages/companies/CompanyProfile';
import Deals from '../pages/Deals';
import { DealWorkspace } from '../pages/deals/DealWorkspace';
import { SalesPipeline } from '../pages/deals/SalesPipeline';
import { ExecutiveInsights } from '../pages/deals/ExecutiveInsights';
import { WorkflowBuilder } from '../pages/deals/WorkflowBuilder';
import { PlaybookManager } from '../pages/deals/PlaybookManager';
import Activities from '../pages/Activities';
import Calendar from '../pages/Calendar';
import Tasks from '../pages/Tasks';
import TaskAdd from '../pages/tasks/TaskAdd';
import TaskEdit from '../pages/tasks/TaskEdit';
import TaskView from '../pages/tasks/TaskView';
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
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
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
      {
        path: 'leads/new',
        element: (
          <ProtectedRoute requiredPermission="leads:create">
            <LeadAdd />
          </ProtectedRoute>
        ),
      },
      {
        path: 'leads/:id',
        element: (
          <ProtectedRoute requiredPermission="leads:view">
            <LeadView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'leads/:id/edit',
        element: (
          <ProtectedRoute requiredPermission="leads:edit">
            <LeadEdit />
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
      {
        path: 'contacts/:id',
        element: (
          <ProtectedRoute requiredPermission="contacts:view">
            <ContactProfile />
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
      {
        path: 'companies/new',
        element: (
          <ProtectedRoute requiredPermission="companies:create">
            <CompanyAdd />
          </ProtectedRoute>
        ),
      },
      {
        path: 'companies/:id',
        element: (
          <ProtectedRoute requiredPermission="companies:view">
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'companies/:id/edit',
        element: (
          <ProtectedRoute requiredPermission="companies:edit">
            <CompanyEdit />
          </ProtectedRoute>
        ),
      },
      
      // Deals with view protection
      {
        path: 'deals',
        element: (
          <ProtectedRoute requiredPermission="deals:view">
            <ErrorBoundary>
              <Deals />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: 'deals/pipeline',
        element: (
          <ProtectedRoute requiredPermission="deals:view">
            <ErrorBoundary>
              <SalesPipeline />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: 'deals/insights',
        element: (
          <ProtectedRoute requiredPermission="deals:view">
            <ErrorBoundary>
              <ExecutiveInsights />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: 'deals/workflows',
        element: (
          <ProtectedRoute requiredPermission="deals:view">
            <ErrorBoundary>
              <WorkflowBuilder />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: 'deals/playbooks',
        element: (
          <ProtectedRoute requiredPermission="deals:view">
            <ErrorBoundary>
              <PlaybookManager />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: 'deals/:id',
        element: (
          <ProtectedRoute requiredPermission="deals:view">
            <ErrorBoundary>
              <DealWorkspace />
            </ErrorBoundary>
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
            <ErrorBoundary>
              <Settings />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },

      // General utility modules
      { path: 'activities', element: <Activities /> },
      { path: 'calendar', element: <Calendar /> },
      // Tasks with view protection
      {
        path: 'tasks',
        element: (
          <ProtectedRoute requiredPermission="tasks:view">
            <Tasks />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/new',
        element: (
          <ProtectedRoute requiredPermission="tasks:create">
            <TaskAdd />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/:id',
        element: (
          <ProtectedRoute requiredPermission="tasks:view">
            <TaskView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/:id/edit',
        element: (
          <ProtectedRoute requiredPermission="tasks:edit">
            <TaskEdit />
          </ProtectedRoute>
        ),
      },
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
