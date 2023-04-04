import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Outlet } from "react-router-dom";
import TopBarMenu from ".";
import renderRouter from "../SignInPage/renderRouter";

describe("<TopBarMenu />", () => {
  it("is closed by default", () => {
    renderRouter([{ path: "/", element: <TopBarMenu /> }]);

    const openBtn = screen.getByRole("button");
    expect(openBtn).toHaveTextContent(/menu_24/i);

    const menu = screen.queryByRole("navigation");
    expect(menu).not.toBeInTheDocument();
  });

  it("opens by clicking on the open button", async () => {
    renderRouter([{ path: "/", element: <TopBarMenu /> }]);

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);

    expect(openBtn).toHaveTextContent(/close_24/i);

    const menu = screen.getByRole("navigation");
    expect(menu).toBeInTheDocument();
  });

  it("closes by clicking a second time on the open button", async () => {
    renderRouter([{ path: "/", element: <TopBarMenu /> }]);

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);
    await userEvent.click(openBtn);

    expect(openBtn).toHaveTextContent(/menu_24/i);

    const menu = screen.queryByRole("navigation");
    expect(menu).not.toBeInTheDocument();
  });

  it("closes if the url's path changes", async () => {
    renderRouter(
      [
        {
          path: "/",
          element: (
            <>
              <TopBarMenu />
              <Outlet />
            </>
          ),
          children: [
            { index: true, element: <Link to="/other">other link</Link> },
            { path: "/other", element: <div>other page</div> },
          ],
        },
      ],
      { initialEntries: ["/"] },
    );

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);

    const link = screen.getByRole("link", { name: /other link/i });
    await userEvent.click(link);

    const otherPage = screen.getByText(/other page/i);
    expect(otherPage).toBeInTheDocument();

    const menu = screen.queryByRole("navigation");
    expect(menu).not.toBeInTheDocument();
  });
});
