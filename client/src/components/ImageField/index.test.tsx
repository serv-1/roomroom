import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageField from ".";

describe("<ImageField />", () => {
  it("renders correctly without an image to preview", () => {
    render(<ImageField validate={async () => undefined} />);

    const img = screen.queryByRole("img");
    expect(img).not.toBeInTheDocument();

    const input = screen.getByLabelText(/^image$/i);
    const label = screen.getByText(/^image$/i);
    expect(label.getAttribute("for")).toBe(input.getAttribute("id"));

    const btn = screen.getByRole("button");
    expect(btn.className).not.toMatch(/red/i);
  });

  it("renders correctly the image to preview", () => {
    render(<ImageField validate={async () => undefined} image="image" />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "awsUrl/image");
    expect(img.getAttribute("alt")).toMatch(/profile image/i);
  });

  it("renders a preview of the uploaded image on change", async () => {
    render(<ImageField validate={async () => undefined} />);

    const input = screen.getByLabelText(/^image$/i);
    await userEvent.upload(input, new File(["data"], "img.jpg"));

    const img = await screen.findByRole("img");
    expect(img.getAttribute("src")).not.toMatch(/aws_url/);
    expect(img.getAttribute("alt")).toMatch(/uploaded image/i);
  });

  it("triggers a click on the input on click on the button", async () => {
    const click = jest.fn();

    render(<ImageField validate={async () => undefined} />);

    const input = screen.getByLabelText(/^image$/i);
    input.click = click;

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("validates the input's value on change", async () => {
    const validate = jest.fn();
    const image = new File(["data"], "img.jpg");

    render(<ImageField validate={validate} />);

    const input = screen.getByLabelText(/^image$/i);
    await userEvent.upload(input, image);

    expect(validate).toHaveBeenNthCalledWith(1, "image", image);
  });

  test("the button's background is red if there is an error", () => {
    render(<ImageField validate={async () => undefined} error="error" />);

    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/red/i);
  });

  it("resets the image to its original state if there is an error on change", async () => {
    render(<ImageField validate={async () => "error"} />);

    const input = screen.getByLabelText(/^image$/i);
    await userEvent.upload(input, new File(["data"], "text.txt"));

    const img = screen.queryByRole("img");
    expect(img).not.toBeInTheDocument();
  });
});
