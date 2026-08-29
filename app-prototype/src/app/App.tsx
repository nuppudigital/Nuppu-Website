import { RouterProvider } from 'react-router';
import { ChildProvider } from './context/ChildContext';
import { router } from './routes';

export default function App() {
  return (
    <ChildProvider>
      <RouterProvider router={router} />
    </ChildProvider>
  );
}
