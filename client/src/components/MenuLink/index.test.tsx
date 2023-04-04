import { screen } from "@testing-library/react";
import MenuLink from ".";
import { ReactComponent as HomeIcon } from "../../images/home_20.svg";
import { ReactComponent as HomeFillIcon } from "../../images/home_20_fill.svg";
import renderRouter from "../SignInPage/renderRouter";

describe("<MenuLink />", () => {
  it("renders correctly", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <MenuLink
            Icon={HomeIcon}
            IconActive={HomeFillIcon}
            label="home"
            to="/home"
          />
        ),
      },
    ]);

    const link = screen.getByRole("link");
    expect(link).not.toHaveClass("bg-blue-700");
    expect(link).toHaveAttribute("href", "/home");
    expect(link).toHaveTextContent(/home/i);

    const icon = screen.getByText(/home_20/i);
    expect(icon).toBeInTheDocument();
  });

  it("renders correctly when it is active", () => {
    renderRouter(
      [
        {
          path: "/home",
          element: (
            <MenuLink
              Icon={HomeIcon}
              IconActive={HomeFillIcon}
              label="home"
              to="/home"
            />
          ),
        },
      ],
      { initialEntries: ["/home"] },
    );

    const link = screen.getByRole("link");
    expect(link).toHaveClass("bg-blue-700");

    const icon = screen.getByText(/home_20_fill/i);
    expect(icon).toBeInTheDocument();
  });
});
