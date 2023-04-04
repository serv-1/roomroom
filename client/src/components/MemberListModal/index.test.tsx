import { screen } from "@testing-library/react";
import MemberListModal from ".";
import renderRouter from "../SignInPage/renderRouter";
import { useWebSocket } from "../WebSocketProvider";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: jest.fn(),
}));

jest.mock("../MemberList", () => ({
  __esModule: true,
  default: () => <ul></ul>,
}));

const useWebSocketMock = useWebSocket as jest.MockedFunction<
  typeof useWebSocket
>;

describe("<MemberListModal />", () => {
  it("renders the number of member of the chat room", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <MemberListModal
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0]}
            isRoomPrivate
          />
        ),
      },
    ]);

    let nbOfMember = screen.getByText(/1 member/i);
    expect(nbOfMember).toBeInTheDocument();

    renderRouter([
      {
        path: "/",
        element: (
          <MemberListModal
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0, 1]}
            isRoomPrivate
          />
        ),
      },
    ]);

    nbOfMember = screen.getByText(/2 members/i);
    expect(nbOfMember).toBeInTheDocument();
  });

  it("is closed by default", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <MemberListModal
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0]}
            isRoomPrivate
          />
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
          <MemberListModal
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0]}
            isRoomPrivate
          />
        ),
      },
    ]);

    const openBtn = screen.getByRole("button", { name: /open/i });
    await userEvent.click(openBtn);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
  });

  it("closes by clicking on the close button", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <MemberListModal
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0]}
            isRoomPrivate
          />
        ),
      },
    ]);

    const openBtn = screen.getByRole("button", { name: /open/i });
    await userEvent.click(openBtn);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeBtn);

    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });

  it("removes the banned member sent by the server", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "bannedMember", data: { id: 1 } });
      }, []);

      return {};
    });

    renderRouter([
      {
        path: "/",
        element: (
          <MemberListModal
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0, 1]}
            isRoomPrivate
          />
        ),
      },
    ]);

    const nbOfMember = await screen.findByText(/1 member/i);
    expect(nbOfMember).toBeInTheDocument();
  });

  it("renders the member sent by the server", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "member", data: { id: 1 } });
      }, []);

      return {};
    });

    renderRouter([
      {
        path: "/",
        element: (
          <MemberListModal
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0]}
            isRoomPrivate
          />
        ),
      },
    ]);

    const nbOfMember = await screen.findByText(/2 members/i);
    expect(nbOfMember).toBeInTheDocument();
  });
});
