import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Menu from ".";
import axios from "../Root/axios";

const mockNavigate = jest.fn();

interface MockLinkProps {
  children: React.ReactNode;
  to: string;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
}

interface MockNavLinkProps {
  children: (p: { isActive: boolean }) => React.ReactNode;
  to: string;
}

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  Link: ({ children, to, onClick }: MockLinkProps) => (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  ),
  NavLink: ({ children, to }: MockNavLinkProps) => (
    <a href={to}>{children({ isActive: true })}</a>
  ),
}));

const axiosDelete = jest.spyOn(axios, "delete");

describe("<Menu />", () => {
  it("signs out the authenticated user", async () => {
    render(<Menu />);

    const signOutLink = screen.getByRole("link", { name: /sign out/i });
    await userEvent.click(signOutLink);

    expect(axiosDelete).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, 0);
  });
});
