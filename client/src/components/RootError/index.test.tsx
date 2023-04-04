import RootError from ".";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { AxiosError, AxiosResponse } from "axios";

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useRouteError: jest.fn(),
  isRouteErrorResponse: jest.fn(),
  Link: () => null,
}));

const useRouteErrorMock = useRouteError as jest.Mock;
const isRouteErrResMock = isRouteErrorResponse as unknown as jest.Mock;

describe("<RootError />", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("renders the default error message correctly", () => {
    useRouteErrorMock.mockReturnValue(new Error("oh no!"));

    render(<RootError />);

    const errorMessage = screen.getByText(/something broke/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("renders the error message and the response status correctly", () => {
    isRouteErrResMock.mockReturnValue(true);
    useRouteErrorMock.mockReturnValue(
      new Response(null, { status: 418, statusText: "Teapot" }),
    );

    render(<RootError />);

    const errorMessage = screen.getByText(/something broke/i);
    expect(errorMessage).toBeInTheDocument();

    const statusCode = screen.getByText(/418/);
    expect(statusCode).toBeInTheDocument();

    const statusText = screen.getByText(/teapot/i);
    expect(statusText).toBeInTheDocument();
  });

  it("renders the 404 error message correctly", () => {
    isRouteErrResMock.mockReturnValue(true);
    useRouteErrorMock.mockReturnValue(
      new Response(null, { status: 404, statusText: "Not Found" }),
    );

    render(<RootError />);

    const errorMessage = screen.getByText(/you are lost/i);
    expect(errorMessage).toBeInTheDocument();

    const statusCode = screen.getByText(/404/);
    expect(statusCode).toBeInTheDocument();

    const statusText = screen.getByText(/not found/i);
    expect(statusText).toBeInTheDocument();
  });

  it("renders the axios error correctly", () => {
    useRouteErrorMock.mockReturnValue(
      new AxiosError("", "", {}, {}, {
        status: 418,
        statusText: "Teapot",
      } as AxiosResponse),
    );

    render(<RootError />);

    const errorMessage = screen.getByText(/something broke/i);
    expect(errorMessage).toBeInTheDocument();

    const statusCode = screen.getByText(/418/);
    expect(statusCode).toBeInTheDocument();

    const statusText = screen.getByText(/teapot/i);
    expect(statusText).toBeInTheDocument();
  });

  it("renders the axios 404 error correctly", () => {
    useRouteErrorMock.mockReturnValue(
      new AxiosError("", "", {}, {}, {
        status: 404,
        statusText: "Not found",
      } as AxiosResponse),
    );

    render(<RootError />);

    const errorMessage = screen.getByText(/you are lost/i);
    expect(errorMessage).toBeInTheDocument();

    const statusCode = screen.getByText(/404/);
    expect(statusCode).toBeInTheDocument();

    const statusText = screen.getByText(/not found/i);
    expect(statusText).toBeInTheDocument();
  });

  it("turns on the dark theme if it is the current theme", () => {
    useRouteErrorMock.mockReturnValue(new Error("oh no!"));
    localStorage.setItem("theme", "dark");

    render(<RootError />);

    expect(document.documentElement).toHaveClass("dark");
  });

  it("turns off the dark theme if it is not the current theme", () => {
    useRouteErrorMock.mockReturnValue(new Error("oh no!"));

    render(<RootError />);

    expect(document.documentElement).not.toHaveClass("dark");
  });
});
