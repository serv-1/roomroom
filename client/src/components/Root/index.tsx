import { Outlet, useLoaderData, useOutletContext } from "react-router-dom";
import env from "../../env";
import SideBar from "../SideBar";
import SearchTopBar from "../SearchTopBar";
import SignInPage from "../SignInPage";
import { WebSocketProvider } from "../WebSocketProvider";

export interface User {
  id: number;
  name: string;
  email: string;
  image: string | null;
}

const Root = () => {
  const user = useLoaderData() as User | undefined;

  return user ? (
    <WebSocketProvider url={env.WS_URL}>
      <div className="min-h-screen dark:bg-dark md:grid md:h-screen md:grid-cols-[184px,1fr] md:grid-rows-[auto,1fr] lg:m-auto lg:grid-cols-[1fr,252px,560px,1fr]">
        <SideBar />
        <SearchTopBar />
        <Outlet context={{ user }} />
      </div>
    </WebSocketProvider>
  ) : (
    <SignInPage />
  );
};

export default Root;

interface ContextType {
  user: User;
}

export const useRootContext = () => {
  return useOutletContext<ContextType>();
};
