import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextField from ".";

describe("<TextField />", () => {
  it("renders a text input correctly", () => {
    render(<TextField type="text" label="Name" name="name" />);
    const input = screen.getByRole("textbox");
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveClass("rounded-lg border-blue-600");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("name", "name");
    expect(input).not.toHaveFocus();

    const label = screen.getByText(/name/i);
    expect(label.getAttribute("for")).toBe(input.getAttribute("id"));

    const error = screen.getByRole("alert");
    expect(error).toBeEmptyDOMElement();

    const btn = screen.queryByRole("button");
    expect(btn).not.toBeInTheDocument();
  });

  it("renders a textarea correctly", () => {
    render(
      <TextField type="textarea" label="Description" name="description" />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveClass("rounded-lg border-blue-600");
    expect(textarea).toHaveAttribute("name", "description");
    expect(textarea).not.toHaveFocus();

    const label = screen.getByText(/description/i);
    expect(label.getAttribute("for")).toBe(textarea.getAttribute("id"));

    const btn = screen.queryByRole("button");
    expect(btn).not.toBeInTheDocument();
  });

  test("The input's border is red if there is an error", () => {
    render(
      <TextField
        type="text"
        label="Name"
        name="name"
        error="error"
        validate={async () => undefined}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input.className).toMatch(/red/i);
  });

  it("validates the input's value on change", async () => {
    const validate = jest.fn();

    render(
      <TextField type="text" label="Name" name="name" validate={validate} />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    expect(validate).toHaveBeenNthCalledWith(1, "name", "a");
  });

  it("renders a button", () => {
    render(
      <TextField
        type="text"
        label="Name"
        name="name"
        validate={async () => undefined}
        btnText="update"
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("rounded-l-lg");

    const btn = screen.getByRole("button", { name: /update/i });
    expect(btn).toBeInTheDocument();
  });

  it("does something if the input's value change", async () => {
    const onChange = jest.fn();

    render(
      <TextField type="text" label="Name" name="name" onChange={onChange} />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does something and validates the input's value if it change", async () => {
    const validate = jest.fn();
    const onChange = jest.fn();

    render(
      <TextField
        type="text"
        label="Name"
        name="name"
        validate={validate}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    expect(validate).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
