import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InviteModal from ".";
import renderRouter from "../SignInPage/renderRouter";
import axios from "../Root/axios";

jest.mock("../Root/axios");

const axiosMock = axios as jest.Mocked<typeof axios>;

describe("<InviteModal />", () => {
  it("opens and closes", async () => {
    renderRouter([{ path: "/", element: <InviteModal roomId={0} /> }]);

    let closeBtn = screen.queryByRole("button", { name: /close/i });
    expect(closeBtn).not.toBeInTheDocument();

    const openBtn = screen.getByRole("button", { name: /invite/i });
    await userEvent.click(openBtn);

    closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    expect(closeBtn).not.toBeInTheDocument();
  });

  it("renders the users which can be invited", async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        users: [
          { id: 0, name: "bob", image: null },
          { id: 1, name: "rob", image: null },
        ],
      },
    });

    renderRouter([{ path: "/", element: <InviteModal roomId={0} /> }]);

    const openBtn = screen.getByRole("button", { name: /invite/i });
    await userEvent.click(openBtn);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    expect(axiosMock.get).toHaveBeenNthCalledWith(1, "/invite?roomId=0&name=a");

    const bob = screen.getByText(/bob/i);
    expect(bob).toBeInTheDocument();

    const rob = screen.getByText(/rob/i);
    expect(rob).toBeInTheDocument();

    const selectBobBtn = screen.getByRole("button", { name: /select bob/i });
    expect(selectBobBtn).toBeInTheDocument();

    const selectRobBtn = screen.getByRole("button", { name: /select rob/i });
    expect(selectRobBtn).toBeInTheDocument();
  });

  it("renders the selected users", async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        users: [
          { id: 0, name: "bob", image: null },
          { id: 1, name: "rob", image: null },
        ],
      },
    });

    renderRouter([{ path: "/", element: <InviteModal roomId={0} /> }]);

    const openBtn = screen.getByRole("button", { name: /invite/i });
    await userEvent.click(openBtn);

    const statusText = screen.getByText(/users to invite will display here/i);
    expect(statusText).toBeInTheDocument();

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    const selectRobBtn = screen.getByRole("button", { name: /select rob/i });
    await userEvent.click(selectRobBtn);

    expect(selectRobBtn).not.toBeInTheDocument();

    const doneIcon = screen.getByText(/done_24/i);
    expect(doneIcon).toBeInTheDocument();

    const selectedRob = screen.getAllByText(/rob/i)[0];
    expect(selectedRob).toBeInTheDocument();

    expect(statusText).not.toBeInTheDocument();
  });

  it("deselects a selected user by clicking on the cross", async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        users: [
          { id: 0, name: "bob", image: null },
          { id: 1, name: "rob", image: null },
        ],
      },
    });

    renderRouter([{ path: "/", element: <InviteModal roomId={0} /> }]);

    const openBtn = screen.getByRole("button", { name: /invite/i });
    await userEvent.click(openBtn);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    let selectRobBtn = screen.getByRole("button", { name: /select rob/i });
    await userEvent.click(selectRobBtn);

    const deselectRobBtn = screen.getByRole("button", {
      name: /deselect rob/i,
    });
    await userEvent.click(deselectRobBtn);

    expect(deselectRobBtn).not.toBeInTheDocument();

    selectRobBtn = screen.getByRole("button", { name: /select rob/i });
    expect(selectRobBtn).toBeInTheDocument();
  });

  it("invites the selected users by clicking on the invite button", async () => {
    axiosMock.get.mockResolvedValue({
      data: {
        users: [
          { id: 0, name: "bob", image: null },
          { id: 1, name: "rob", image: null },
        ],
      },
    });

    renderRouter([{ path: "/", element: <InviteModal roomId={0} /> }]);

    const openBtn = screen.getByRole("button", { name: /invite/i });
    await userEvent.click(openBtn);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "a");

    const selectBobBtn = screen.getByRole("button", { name: /select bob/i });
    await userEvent.click(selectBobBtn);

    const selectRobBtn = screen.getByRole("button", { name: /select rob/i });
    await userEvent.click(selectRobBtn);

    const selectedBob = screen.getAllByText(/bob/i)[0];
    expect(selectedBob).toBeInTheDocument();

    const selectedRob = screen.getAllByText(/rob/i)[0];
    expect(selectedRob).toBeInTheDocument();

    const inviteBtn = screen.getAllByRole("button", { name: /invite/i })[1];
    await userEvent.click(inviteBtn);

    expect(axiosMock.post).toHaveBeenNthCalledWith(1, "/invite", {
      data: { roomId: 0, userIds: [0, 1] },
      csrf: true,
    });

    expect(selectedBob).not.toBeInTheDocument();
    expect(selectedRob).not.toBeInTheDocument();
  });

  it("does nothing by clicking on the invite button if there is no one to invite", async () => {
    renderRouter([{ path: "/", element: <InviteModal roomId={0} /> }]);

    const openBtn = screen.getByRole("button", { name: /invite/i });
    await userEvent.click(openBtn);

    const inviteBtn = screen.getAllByRole("button", { name: /invite/i })[1];
    await userEvent.click(inviteBtn);

    expect(axiosMock.post).not.toHaveBeenCalled();
  });
});
