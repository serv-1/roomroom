import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Outlet } from "react-router-dom";
import Modal from ".";
import renderRouter from "../SignInPage/renderRouter";

describe("<Modal />", () => {
  it("renders correctly", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <Modal isOpen={true} title="Confirmation" onModalClose={() => null}>
            <button>OK</button>
          </Modal>
        ),
      },
    ]);

    const title = screen.getByRole("heading");
    expect(title).toHaveTextContent(/confirmation/i);

    const body = screen.getByRole("button", { name: /ok/i });
    expect(body).toBeInTheDocument();
  });

  test("the close button closes the modal", async () => {
    const onModalClose = jest.fn();

    renderRouter([
      {
        path: "/",
        element: (
          <Modal isOpen={true} title="title" onModalClose={onModalClose}>
            body
          </Modal>
        ),
      },
    ]);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    expect(onModalClose).toHaveBeenCalledTimes(2);
  });

  it("closes if the url's path changes", async () => {
    const onModalClose = jest.fn();

    renderRouter([
      {
        path: "/",
        element: (
          <>
            <Modal isOpen={true} title="title" onModalClose={onModalClose}>
              <Link to="/new">link</Link>
            </Modal>
            <Outlet />
          </>
        ),
        children: [
          {
            path: "/new",
            element: <div>new page</div>,
          },
        ],
      },
    ]);

    const link = screen.getByRole("link");
    await userEvent.click(link);

    expect(onModalClose).toHaveBeenCalledTimes(2);
  });
});
