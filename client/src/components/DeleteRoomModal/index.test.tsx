import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteRoomModal from ".";
import renderRouter from "../SignInPage/renderRouter";
import axios from "../Root/axios";

jest.mock("../Root/axios");

const axiosMock = axios as jest.Mocked<typeof axios>;

describe("<DeleteRoomModal />", () => {
  it("opens and closes", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <DeleteRoomModal id={0} subject="Yo" setIsDeleted={() => null} />
        ),
      },
    ]);

    let closeBtn = screen.queryByRole("button", { name: /close/i });
    expect(closeBtn).not.toBeInTheDocument();

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);

    closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    expect(closeBtn).not.toBeInTheDocument();

    await userEvent.click(openBtn);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelBtn);

    expect(cancelBtn).not.toBeInTheDocument();
  });

  it("deletes the chat room by clicking on the delete button", async () => {
    const setIsDeleted = jest.fn();

    renderRouter([
      {
        path: "/",
        element: (
          <DeleteRoomModal id={0} subject="Yo" setIsDeleted={setIsDeleted} />
        ),
      },
    ]);

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);

    const deleteBtn = screen.getAllByRole("button", { name: /delete/i })[1];
    await userEvent.click(deleteBtn);

    expect(setIsDeleted).toHaveBeenNthCalledWith(1, true);
    expect(axiosMock.delete).toHaveBeenNthCalledWith(1, "/rooms/0", {
      csrf: true,
    });
  });
});
