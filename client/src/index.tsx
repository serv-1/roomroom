import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Root from "./components/Root";
import rootAction from "./components/Root/action";
import rootLoader from "./components/Root/loader";
import RootError from "./components/RootError";
import ProfilePage from "./components/ProfilePage";
import profileAction from "./components/ProfilePage/action";
import profileLoader from "./components/ProfilePage/loader";
import RouteError from "./components/RouteError";
import ChatRoomPage from "./components/ChatRoomPage";
import chatRoomLoader from "./components/ChatRoomPage/loader";
import ChatRoomsPage from "./components/ChatRoomsPage";
import chatRoomsLoader from "./components/ChatRoomsPage/loader";
import IndexPage from "./components/IndexPage";
import indexLoader from "./components/IndexPage/loader";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      errorElement={<RootError />}
      element={<Root />}
      action={rootAction}
      loader={rootLoader}
    >
      <Route
        index
        element={<IndexPage />}
        loader={indexLoader}
        errorElement={<RouteError />}
      />
      <Route
        path="/profile/:id?"
        element={<ProfilePage />}
        action={profileAction}
        loader={profileLoader}
        errorElement={<RouteError />}
      />
      <Route
        path="/rooms/:id"
        element={<ChatRoomPage />}
        loader={chatRoomLoader}
        errorElement={<RouteError />}
      />
      <Route
        path="/rooms"
        element={<ChatRoomsPage />}
        loader={chatRoomsLoader}
        errorElement={<RouteError />}
      />
    </Route>,
  ),
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
