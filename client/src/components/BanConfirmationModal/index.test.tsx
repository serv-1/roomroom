import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BanConfirmationModal from ".";
import renderRouter from "../SignInPage/renderRouter";
import { useWebSocket } from "../WebSocketProvider";

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: jest.fn(),
}));

const useWebSocketMock = useWebSocket as jest.MockedFunction<
  typeof useWebSocket
>;

const send = jest.fn();

beforeEach(() => {
  useWebSocketMock.mockReturnValue({ send });
});

describe("<BanConfirmationModal />", () => {
  it("is closed by default", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <BanConfirmationModal userId={0} userName="bob" roomSubject="test" />
        ),
      },
    ]);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });

  it("opens by clicking on the open button", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <BanConfirmationModal userId={0} userName="bob" roomSubject="test" />
        ),
      },
    ]);

    const btn = screen.getByRole("button", { name: /ban bob/i });
    await userEvent.click(btn);

    const modal = screen.getByRole("dialog");
    expect(modal).toHaveTextContent(/bob/i);
    expect(modal).toHaveTextContent(/test/i);
  });

  it("closes by clicking on the close button", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <BanConfirmationModal userId={0} userName="bob" roomSubject="test" />
        ),
      },
    ]);

    const btn = screen.getByRole("button", { name: /ban bob/i });
    await userEvent.click(btn);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /close/i });

    await userEvent.click(closeBtn);

    expect(modal).not.toBeInTheDocument();
  });

  it("closes by clicking on the cancel button", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <BanConfirmationModal userId={0} userName="bob" roomSubject="test" />
        ),
      },
    ]);

    const btn = screen.getByRole("button", { name: /ban bob/i });
    await userEvent.click(btn);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });

    await userEvent.click(cancelBtn);

    expect(modal).not.toBeInTheDocument();
  });

  it("bans the user by clicking on the ban button", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <BanConfirmationModal userId={0} userName="bob" roomSubject="test" />
        ),
      },
    ]);

    const btn = screen.getByRole("button", { name: /ban bob/i });
    await userEvent.click(btn);

    const banBtn = screen.getByRole("button", { name: /ban$/i });
    await userEvent.click(banBtn);

    expect(send).toHaveBeenNthCalledWith(1, "banMember", { id: 0 });
  });
});
