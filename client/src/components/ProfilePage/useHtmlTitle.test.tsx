import { render } from "@testing-library/react";
import useHtmlTitle from "./useHtmlTitle";

const Test = () => {
  useHtmlTitle("Test");

  return <h1>Test</h1>;
};

describe("useHtmlTitle()", () => {
  it("changes the document title", () => {
    render(<Test />);

    expect(document.title).toBe("Test");
  });
});
