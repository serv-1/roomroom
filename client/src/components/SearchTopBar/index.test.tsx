import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from ".";
import { Location, useLocation } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe("<SearchBar />", () => {
  it("is visible if the url does not contain /rooms/", () => {
    mockUseLocation.mockReturnValue({ pathname: "/rooms" } as Location);

    const { container } = render(<SearchBar />);

    expect(container.firstElementChild).not.toHaveClass("hidden");
  });

  it("is hidden if the url contains /rooms/", () => {
    mockUseLocation.mockReturnValue({ pathname: "/rooms/" } as Location);

    const { container } = render(<SearchBar />);

    expect(container.firstElementChild).toHaveClass("hidden");
  });

  it("adds the user's query to the url", async () => {
    mockUseLocation.mockReturnValue({ pathname: "/" } as Location);

    render(<SearchBar />);

    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "cat");

    const submitBtn = screen.getByRole("button", { name: /search/i });
    await userEvent.click(submitBtn);

    expect(mockNavigate).toHaveBeenNthCalledWith(1, "/?query=cat");
  });

  it("does not add the user's query to the url if it is invalid", async () => {
    mockUseLocation.mockReturnValue({ pathname: "/" } as Location);

    render(<SearchBar />);

    const submitBtn = screen.getByRole("button", { name: /search/i });
    await userEvent.click(submitBtn);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
