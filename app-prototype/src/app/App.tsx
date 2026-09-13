import { RouterProvider } from 'react-router';
import { LanguageProvider } from './i18n/LanguageContext';
import { ChildProvider } from './context/ChildContext';
import { CustomStoriesProvider } from './context/CustomStoriesContext';
import { router } from './routes';

export default function App() {
  return (
    <LanguageProvider>
      <ChildProvider>
        <CustomStoriesProvider>
          <RouterProvider router={router} />
        </CustomStoriesProvider>
      </ChildProvider>
    </LanguageProvider>
  );
}
