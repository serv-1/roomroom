import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateRoomModal from ".";
import renderRouter from "../SignInPage/renderRouter";

describe("<CreateRoomModal />", () => {
  it("is closed by default", () => {
    renderRouter([{ path: "/", element: <CreateRoomModal /> }]);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });

  it("opens on click on the FAB", async () => {
    renderRouter([{ path: "/", element: <CreateRoomModal /> }]);

    const fab = screen.getAllByRole("button")[0];
    await userEvent.click(fab);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
  });

  it("opens on click on the button", async () => {
    renderRouter([{ path: "/", element: <CreateRoomModal /> }]);

    const btn = screen.getAllByRole("button")[1];
    await userEvent.click(btn);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
  });

  it("closes on click on the close button", async () => {
    renderRouter([{ path: "/", element: <CreateRoomModal /> }]);

    const fab = screen.getAllByRole("button")[0];
    await userEvent.click(fab);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });

  it("hides if the pathname contains /rooms/", async () => {
    const { container } = renderRouter(
      [{ path: "/rooms/1", element: <CreateRoomModal /> }],
      {
        initialEntries: ["/rooms/1"],
      },
    );

    expect(container.firstElementChild).toHaveClass("hidden");
  });

  it("is not hidden if the pathname does not contain /rooms/", async () => {
    const { container } = renderRouter([
      { path: "/", element: <CreateRoomModal /> },
    ]);

    expect(container.firstElementChild).not.toHaveClass("hidden");
  });
});
