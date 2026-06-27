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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'leads', element: <Leads /> },
      { path: 'contacts', element: <Contacts /> },
      { path: 'companies', element: <Companies /> },
      { path: 'deals', element: <Deals /> },
      { path: 'activities', element: <Activities /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'products', element: <Products /> },
      { path: 'quotes', element: <Quotes /> },
      { path: 'invoices', element: <Invoices /> },
      { path: 'reports', element: <Reports /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'team', element: <Team /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
