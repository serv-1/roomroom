import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from ".";
import { ReactComponent as CloseIcon } from "../../images/close_24.svg";

describe("<Button />", () => {
  it("renders correctly", () => {
    render(<Button color="primary" width="fit" type="button" text="OK" />);

    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveTextContent("OK");
    expect(btn).toHaveClass("w-fit rounded-lg");
  });

  it("renders a primary button correctly", () => {
    render(<Button color="primary" width="fit" type="button" text="OK" />);

    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/blue/i);
  });

  it("renders a secondary button correctly", () => {
    render(<Button color="secondary" width="fit" type="button" text="OK" />);

    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/fuchsia/i);
  });

  it("renders a danger button correctly", () => {
    render(<Button color="danger" width="fit" type="button" text="OK" />);

    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/red/i);
  });

  it("renders a submit button correctly", () => {
    render(<Button color="primary" width="fit" type="submit" text="OK" />);

    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "submit");
  });

  it("can do something on click", async () => {
    const onClick = jest.fn();

    render(
      <Button
        color="primary"
        width="fit"
        type="button"
        text="OK"
        onClick={onClick}
      />,
    );

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a button with an icon correctly", () => {
    render(
      <Button
        color="primary"
        width="fit"
        type="button"
        text="OK"
        Icon={CloseIcon}
      />,
    );

    const icon = screen.getByText(/close/i);
    expect(icon).toBeInTheDocument();
  });

  it("renders a full width button correctly", () => {
    render(<Button color="primary" width="full" type="button" text="OK" />);

    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("w-full");
  });

  it("renders a link with the appearance of a button correctly", () => {
    render(
      <Button
        color="primary"
        width="fit"
        text="home"
        type="link"
        href="/home"
      />,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/home");
  });

  it("renders the rounded angles", () => {
    const { rerender } = render(
      <Button
        color="primary"
        width="fit"
        rounded="top"
        type="button"
        text="ok"
      />,
    );

    let btn = screen.getByRole("button");
    expect(btn).toHaveClass("rounded-t-lg");

    rerender(
      <Button
        color="primary"
        width="fit"
        rounded="right"
        type="button"
        text="ok"
      />,
    );

    btn = screen.getByRole("button");
    expect(btn).toHaveClass("rounded-r-lg");

    rerender(
      <Button
        color="primary"
        width="fit"
        rounded="bottom"
        type="button"
        text="ok"
      />,
    );

    btn = screen.getByRole("button");
    expect(btn).toHaveClass("rounded-b-lg");

    rerender(
      <Button
        color="primary"
        width="fit"
        rounded="left"
        type="button"
        text="ok"
      />,
    );

    btn = screen.getByRole("button");
    expect(btn).toHaveClass("rounded-l-lg");
  });
});
