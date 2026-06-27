import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider } from './components/ui/ToastProvider';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastProvider />
    </>
  );
}

export default App;
