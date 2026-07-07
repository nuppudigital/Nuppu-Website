import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Home from "./pages/Home";
import Characters from "./pages/Characters";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import EmotionalSupport from "./pages/EmotionalSupport";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "characters", Component: Characters },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "privacy", Component: Privacy },
      { path: "terms", Component: Terms },
      { path: "cookies", Component: Cookies },
      { path: "emotional-support", Component: EmotionalSupport },
      { path: "*", Component: NotFound },
    ],
  },
]);
