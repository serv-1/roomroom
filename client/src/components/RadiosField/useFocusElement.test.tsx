import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import useFocusElement from "./useFocusElement";

const TestInput = ({ isFocused }: { isFocused?: boolean }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusElement(inputRef, isFocused);

  return <input type="text" ref={inputRef} />;
};

describe("useFocusElement()", () => {
  it("focuses the given element", () => {
    render(<TestInput isFocused />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
  });

  it("does not focus the given element", () => {
    render(<TestInput />);

    const input = screen.getByRole("textbox");
    expect(input).not.toHaveFocus();
  });
});
