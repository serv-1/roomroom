import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RadiosField from ".";

describe("<RadiosField />", () => {
  it("renders correctly", () => {
    render(
      <RadiosField
        name="color"
        radios={[
          { value: "red", label: "Red", note: "red note" },
          { value: "grey", label: "Grey", note: "grey note" },
        ]}
        validate={async () => undefined}
      />,
    );

    const inputs = screen.getAllByRole("radio");

    const redInputId = inputs[0].getAttribute("id");
    const greyInputId = inputs[1].getAttribute("id");

    expect(redInputId).toBeDefined();
    expect(inputs[0]).toHaveAttribute("name", "color");
    expect(inputs[0]).toHaveAttribute("value", "red");
    expect(inputs[0].className).not.toMatch(/red/i);
    expect(inputs[0]).not.toHaveFocus();
    expect(inputs[0]).toHaveAttribute("aria-describedby", redInputId + "-note");

    expect(greyInputId).toBeDefined();
    expect(inputs[1]).toHaveAttribute("name", "color");
    expect(inputs[1]).toHaveAttribute("value", "grey");
    expect(inputs[1].className).not.toMatch(/red/i);
    expect(inputs[1]).not.toHaveFocus();
    expect(inputs[1]).toHaveAttribute(
      "aria-describedby",
      greyInputId + "-note",
    );

    const redLabel = screen.getByText("Red");
    expect(redLabel.getAttribute("for")).toBe(redInputId);

    const greyLabel = screen.getByText("Grey");
    expect(greyLabel.getAttribute("for")).toBe(greyInputId);

    const redNote = screen.getByText("red note");
    expect(redNote).toHaveAttribute("id", redInputId + "-note");

    const greyNote = screen.getByText("grey note");
    expect(greyNote).toHaveAttribute("id", greyInputId + "-note");
  });

  it("does not render a note", () => {
    render(
      <RadiosField
        name="color"
        radios={[{ value: "red", label: "Red" }]}
        validate={async () => undefined}
      />,
    );

    const input = screen.getByRole("radio");
    expect(input).not.toHaveAttribute("aria-describedby");

    const note = screen.getByText("Red").nextElementSibling;
    expect(note).not.toBeInTheDocument();
  });

  it("focuses the first input", () => {
    render(
      <RadiosField
        name="color"
        isFocused
        radios={[
          { value: "red", label: "Red", note: "red note" },
          { value: "grey", label: "Grey", note: "grey note" },
        ]}
        validate={async () => undefined}
      />,
    );

    const inputs = screen.getAllByRole("radio");
    expect(inputs[0]).toHaveFocus();
  });

  it("validates the input's value on change", async () => {
    const validate = jest.fn();

    render(
      <RadiosField
        name="color"
        radios={[{ value: "red", label: "Red" }]}
        validate={validate}
      />,
    );

    const input = screen.getByRole("radio");
    await userEvent.click(input);

    expect(validate).toHaveBeenNthCalledWith(1, "color", "red");
  });

  it("renders a red border if there is an error", () => {
    render(
      <RadiosField
        name="color"
        radios={[{ value: "red", label: "Red" }]}
        error="error"
        validate={async () => undefined}
      />,
    );

    const input = screen.getByRole("radio");
    expect(input.className).toMatch(/red/i);
  });
});
