import { createBrowserRouter } from 'react-router';
import { Splash } from './screens/Splash';
import { CreateAccount } from './screens/CreateAccount';
import { AddChildProfile } from './screens/AddChildProfile';
import { Preferences } from './screens/Preferences';
import { PrivacyConfirmation } from './screens/PrivacyConfirmation';
import { MicroSupportTutorial } from './screens/MicroSupportTutorial';
import { Home } from './screens/Home';
import { StoryLibrary } from './screens/StoryLibrary';
import { StoryDetail } from './screens/StoryDetail';
import { StoryPlayback } from './screens/StoryPlayback';
import { EmotionSelection } from './screens/EmotionSelection';
import { BreathingExercise } from './screens/BreathingExercise';
import { StoryCompletion } from './screens/StoryCompletion';
import { ProgressTracker } from './screens/ProgressTracker';
import { Settings } from './screens/Settings';
import { Sitemap } from './screens/Sitemap';
import { AdultCorner } from './screens/adult-corner/AdultCorner';
import { Subscription } from './screens/adult-corner/Subscription';
import { AboutNuppu } from './screens/adult-corner/AboutNuppu';
import { NuppuLetter } from './screens/adult-corner/NuppuLetter';
import { MicroSupportLibrary } from './screens/adult-corner/MicroSupportLibrary';
import { Feedback } from './screens/adult-corner/Feedback';

export const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/signup', element: <CreateAccount /> },
  { path: '/add-child', element: <AddChildProfile /> },
  { path: '/preferences', element: <Preferences /> },
  { path: '/privacy', element: <PrivacyConfirmation /> },
  { path: '/tutorial', element: <MicroSupportTutorial /> },
  { path: '/home', element: <Home /> },
  { path: '/library', element: <StoryLibrary /> },
  { path: '/story/:id', element: <StoryDetail /> },
  { path: '/playback/:id', element: <StoryPlayback /> },
  { path: '/story-playback', element: <StoryPlayback /> },
  { path: '/emotion-check', element: <EmotionSelection /> },
  { path: '/breathing', element: <BreathingExercise /> },
  { path: '/completion/:id', element: <StoryCompletion /> },
  { path: '/progress', element: <ProgressTracker /> },
  { path: '/settings', element: <Settings /> },
  { path: '/sitemap', element: <Sitemap /> },
  { path: '/adult-corner', element: <AdultCorner /> },
  { path: '/adult-corner/subscription', element: <Subscription /> },
  { path: '/adult-corner/about', element: <AboutNuppu /> },
  { path: '/adult-corner/letter', element: <NuppuLetter /> },
  { path: '/adult-corner/tips', element: <MicroSupportLibrary /> },
  { path: '/adult-corner/feedback', element: <Feedback /> },
], { basename: import.meta.env.BASE_URL });
