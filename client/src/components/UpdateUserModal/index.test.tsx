import UpdateUserModal from ".";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderRouter from "../SignInPage/renderRouter";

const user = { id: 0, name: "bob", email: "bob@bob.bob", image: null };

describe("<UpdateUserModal />", () => {
  it("is closed by default", async () => {
    renderRouter([{ path: "/", element: <UpdateUserModal user={user} /> }]);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });

  it("opens on click on the open button", async () => {
    renderRouter([{ path: "/", element: <UpdateUserModal user={user} /> }]);

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
  });

  it("closes on click on the close button", async () => {
    renderRouter([{ path: "/", element: <UpdateUserModal user={user} /> }]);

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });

  it("renders an error if the image is too big", async () => {
    const image = new File([new Uint8Array(1000001).toString()], "img.jpg", {
      type: "image/jpeg",
    });

    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line
    (FormData as jest.Mock).mockReturnValue([["image", image]]);

    renderRouter([
      {
        path: "/",
        element: <UpdateUserModal user={user} />,
        action: () => null,
      },
    ]);

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    const submitBtn = screen.getByRole("button", { name: /^update$/i });
    await userEvent.click(submitBtn);

    const error = screen.getAllByRole("alert")[0];
    expect(error).toHaveTextContent(
      "The image must have a size inferior to 1mb.",
    );

    FormData = _FormData; // eslint-disable-line
  });

  it("renders an error if the image is not an image", async () => {
    const image = new File(["data"], "img.txt");

    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line
    (FormData as jest.Mock).mockReturnValue([["image", image]]);

    renderRouter([
      {
        path: "/",
        element: <UpdateUserModal user={user} />,
        action: () => null,
      },
    ]);

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    const submitBtn = screen.getByRole("button", { name: /^update$/i });
    await userEvent.click(submitBtn);

    const error = screen.getAllByRole("alert")[0];
    expect(error).toHaveTextContent(
      "An image (.jpg, .jpeg, .png, .gif) is expected.",
    );

    FormData = _FormData; // eslint-disable-line
  });

  it("does not render an error if there is no uploaded image", async () => {
    renderRouter([
      {
        path: "/",
        element: <UpdateUserModal user={user} />,
        action: () => null,
      },
    ]);

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    const submitBtn = screen.getByRole("button", { name: /^update$/i });
    await userEvent.click(submitBtn);

    const error = screen.getAllByRole("alert")[0];
    expect(error).toBeEmptyDOMElement();
  });

  it("renders the given error", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <UpdateUserModal
            user={user}
            error={{ field: "name", error: "error" }}
          />
        ),
      },
    ]);

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    const errors = screen.getAllByRole("alert");
    expect(errors[0]).toBeEmptyDOMElement();
    expect(errors[1]).toHaveTextContent("error");
    expect(errors[2]).toBeEmptyDOMElement();
  });
});
