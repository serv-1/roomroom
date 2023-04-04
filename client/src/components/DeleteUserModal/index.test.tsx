import DeleteUserModal from ".";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import renderRouter from "../SignInPage/renderRouter";
import axios from "../Root/axios";

jest.mock("../Root/axios");

const mockAxios = axios as jest.Mocked<typeof axios>;

const reload = jest.fn();

Object.defineProperty(window, "location", { get: () => ({ reload }) });

describe("<DeleteUserModal />", () => {
  it("opens and closes", async () => {
    renderRouter([{ path: "/", element: <DeleteUserModal /> }]);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    expect(closeBtn).not.toBeInTheDocument();

    await userEvent.click(openBtn);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelBtn);

    expect(cancelBtn).not.toBeInTheDocument();
  });

  it("deletes the user by clicking on the delete button", async () => {
    renderRouter([{ path: "/", element: <DeleteUserModal /> }]);

    const openBtn = screen.getByRole("button");
    await userEvent.click(openBtn);

    const deleteBtn = screen.getByRole("button", { name: /^delete$/i });
    await userEvent.click(deleteBtn);

    expect(mockAxios.delete).toHaveBeenNthCalledWith(1, "/user", {
      csrf: true,
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
