import { render, screen } from "@testing-library/react";
import UserImage from ".";

describe("<UserImage />", () => {
  describe("renders with an image", () => {
    test("of 40px", () => {
      render(<UserImage name="bob" image="bob.jpg" size={40} />);

      const img = screen.getByRole("img");
      expect(img).toHaveClass("h-10");
      expect(img).toHaveAttribute("src", "awsUrl/bob.jpg");
      expect(img).toHaveAttribute("alt", "bob's profile picture");
      expect(img).toHaveAttribute("width", "40");
      expect(img).toHaveAttribute("height", "40");
    });

    test("of 76px", () => {
      render(<UserImage name="bob" image="bob.jpg" size={76} />);

      const img = screen.getByRole("img");
      expect(img).toHaveClass("h-[76px]");
      expect(img).toHaveAttribute("src", "awsUrl/bob.jpg");
      expect(img).toHaveAttribute("alt", "bob's profile picture");
      expect(img).toHaveAttribute("width", "76");
      expect(img).toHaveAttribute("height", "76");
    });
  });

  describe("renders the image placeholder", () => {
    test("of 40px", () => {
      const { container } = render(<UserImage name="bob" size={40} />);

      const border = container.firstElementChild as HTMLDivElement;
      expect(border).toHaveClass("h-10");
      expect(border.className).not.toContain("hover");

      const head = border.firstElementChild as HTMLDivElement;
      expect(head).toHaveClass("top-1");
      expect(head.className).not.toContain("hover");

      const body = head.nextElementSibling as HTMLDivElement;
      expect(body).toHaveClass("h-5");
      expect(body.className).not.toContain("hover");
    });

    test("of 76px", () => {
      const { container } = render(<UserImage name="bob" size={76} />);

      const border = container.firstElementChild as HTMLDivElement;
      expect(border).toHaveClass("h-[76px]");
      expect(border.className).not.toContain("hover");

      const head = border.firstElementChild as HTMLDivElement;
      expect(head).toHaveClass("top-2");
      expect(head.className).not.toContain("hover");

      const body = head.nextElementSibling as HTMLDivElement;
      expect(body).toHaveClass("h-8");
      expect(body.className).not.toContain("hover");
    });

    test("in a button (with hover state)", () => {
      const { container } = render(<UserImage name="bob" size={40} inButton />);

      const border = container.firstElementChild as HTMLDivElement;
      expect(border.className).toContain("hover");

      const head = border.firstElementChild as HTMLDivElement;
      expect(head.className).toContain("hover");

      const body = head.nextElementSibling as HTMLDivElement;
      expect(body.className).toContain("hover");
    });
  });
});
