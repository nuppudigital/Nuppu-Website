import { createBrowserRouter } from 'react-router';
import { Splash } from './screens/Splash';
import { Login } from './screens/Login';
import { Welcome } from './screens/Welcome';
import { NameStep } from './screens/onboarding/NameStep';
import { AgeStep } from './screens/onboarding/AgeStep';
import { InterestsStep } from './screens/onboarding/InterestsStep';
import { FreeTopic } from './screens/onboarding/FreeTopic';
import { ChildCard } from './screens/onboarding/ChildCard';
import { Home } from './screens/Home';
import { StoryLibrary } from './screens/StoryLibrary';
import { StoryDetail } from './screens/StoryDetail';
import { Reader } from './screens/Reader';
import { AudioPlayer } from './screens/AudioPlayer';
import { StoryComplete } from './screens/StoryComplete';
import { Friends } from './screens/Friends';
import { ParentGate } from './screens/ParentGate';
import { AdultCorner } from './screens/adult-corner/AdultCorner';
import { AiPersonalization } from './screens/adult-corner/AiPersonalization';
import { AiSafety } from './screens/adult-corner/AiSafety';
import { Subscription } from './screens/adult-corner/Subscription';
import { MicroSupport } from './screens/adult-corner/MicroSupport';
import { NuppuLetter } from './screens/adult-corner/NuppuLetter';
import { ChildProfiles } from './screens/adult-corner/ChildProfiles';
import { LanguageSettings } from './screens/adult-corner/LanguageSettings';
import { Feedback } from './screens/adult-corner/Feedback';
import { StoryAdminList } from './screens/story-admin/StoryAdminList';
import { StoryAdminForm } from './screens/story-admin/StoryAdminForm';

export const router = createBrowserRouter(
  [
    { path: '/', element: <Splash /> },
    { path: '/login', element: <Login /> },
    { path: '/welcome', element: <Welcome /> },
    { path: '/onboarding/name', element: <NameStep /> },
    { path: '/onboarding/age', element: <AgeStep /> },
    { path: '/onboarding/interests', element: <InterestsStep /> },
    { path: '/onboarding/free-topic', element: <FreeTopic /> },
    { path: '/onboarding/child-card', element: <ChildCard /> },

    { path: '/home', element: <Home /> },
    { path: '/stories', element: <StoryLibrary /> },
    { path: '/stories/:storyId', element: <StoryDetail /> },
    { path: '/stories/:storyId/read', element: <Reader /> },
    { path: '/stories/:storyId/listen', element: <AudioPlayer /> },
    { path: '/stories/:storyId/complete', element: <StoryComplete /> },
    { path: '/friends', element: <Friends /> },

    { path: '/parent-gate', element: <ParentGate /> },
    { path: '/adults', element: <AdultCorner /> },
    { path: '/adults/ai-personalization', element: <AiPersonalization /> },
    { path: '/adults/ai-safety', element: <AiSafety /> },
    { path: '/adults/subscription', element: <Subscription /> },
    { path: '/adults/micro-support', element: <MicroSupport /> },
    { path: '/adults/micro-support/:storyId', element: <MicroSupport /> },
    { path: '/adults/nuppu-letter', element: <NuppuLetter /> },
    { path: '/adults/child-profiles', element: <ChildProfiles /> },
    { path: '/adults/language', element: <LanguageSettings /> },
    { path: '/adults/feedback', element: <Feedback /> },

    { path: '/story-admin', element: <StoryAdminList /> },
    { path: '/story-admin/new', element: <StoryAdminForm /> },
    { path: '/story-admin/:id/edit', element: <StoryAdminForm /> },

    { path: '*', element: <Splash /> },
  ],
  { basename: import.meta.env.BASE_URL },
);
