import { screen } from "@testing-library/react";
import Root from ".";
import renderRouter from "../SignInPage/renderRouter";

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("<Root />", () => {
  it("renders the sign in page if the user is unauthenticated", () => {
    renderRouter([{ path: "/", element: <Root /> }]);

    const title = screen.getByRole("heading", { level: 2, name: /sign in/i });
    expect(title).toBeInTheDocument();
  });

  it("renders the app if the user is authenticated", async () => {
    renderRouter([{ path: "/", element: <Root />, loader: () => ({}) }]);

    const menu = await screen.findByRole("navigation");
    expect(menu).toBeInTheDocument();
  });
});
