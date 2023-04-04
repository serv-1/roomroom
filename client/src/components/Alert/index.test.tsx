import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import Alert from ".";

describe("<Alert />", () => {
  it("does not render without text", () => {
    const { container } = render(<Alert />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders with the given text", () => {
    render(<Alert text="yo" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/yo/i);
  });

  it("closes by clicking on the close button", async () => {
    render(<Alert text="yo" />);

    const closeBtn = screen.getByRole("button");
    await userEvent.click(closeBtn);

    const alert = screen.queryByRole("alert");
    expect(alert).not.toBeInTheDocument();
  });

  it("closes 10 seconds after being rendered", async () => {
    jest.useFakeTimers();
    render(<Alert text="yo" />);

    let alert = screen.queryByRole("alert");
    expect(alert).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    alert = screen.queryByRole("alert");
    expect(alert).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("resets its timeout each time the text change", async () => {
    jest.useFakeTimers();
    const { rerender } = render(<Alert text="yo" />);

    let alert = screen.queryByRole("alert");
    expect(alert).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    alert = screen.queryByRole("alert");
    expect(alert).not.toBeInTheDocument();

    rerender(<Alert text="Yahoo!" />);

    alert = screen.queryByRole("alert");
    expect(alert).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    alert = screen.queryByRole("alert");
    expect(alert).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
