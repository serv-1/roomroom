import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAB from ".";

describe("<FAB />", () => {
  it("renders a primary FAB correctly", () => {
    render(
      <FAB color="primary" ariaLabel="okok" onClick={() => null}>
        ok
      </FAB>,
    );

    const fab = screen.getByRole("button");
    expect(fab).toHaveTextContent(/ok/i);
    expect(fab).toHaveAccessibleName(/okok/i);
    expect(fab).toHaveClass("bg-blue-600");
  });

  it("renders a secondary FAB correctly", () => {
    render(
      <FAB color="secondary" ariaLabel="ok" onClick={() => null}>
        ok
      </FAB>,
    );

    const fab = screen.getByRole("button");
    expect(fab).toHaveClass("bg-fuchsia-400");
  });

  it("renders a danger FAB correctly", () => {
    render(
      <FAB color="danger" ariaLabel="ok" onClick={() => null}>
        ok
      </FAB>,
    );

    const fab = screen.getByRole("button");
    expect(fab).toHaveClass("bg-red-700");
  });

  it("can do something on click", async () => {
    const onClick = jest.fn();

    render(
      <FAB color="primary" ariaLabel="ok" onClick={onClick}>
        ok
      </FAB>,
    );

    const fab = screen.getByRole("button");
    await userEvent.click(fab);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
