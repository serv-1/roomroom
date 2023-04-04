import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import ChatRoomOnlineMemberListModal from ".";
import renderRouter from "../SignInPage/renderRouter";
import { useWebSocket } from "../WebSocketProvider";

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

const send = jest.fn();

beforeEach(() => {
  useWebSocketMock.mockReturnValue({ send });
});

describe("<ChatRoomOnlineMemberListModal />", () => {
  it("sends a message to get the list of the online member", async () => {
    renderRouter([
      {
        path: "/",
        element: (
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
            isRoomPrivate
          />
        ),
      },
    ]);

    const nbOfOnlineMember = screen.getByText(/0 online/i);
    expect(nbOfOnlineMember).toBeInTheDocument();

    await waitFor(() => {
      expect(send).toHaveBeenNthCalledWith(1, "onlineMembers", { roomId: 0 });
    });
  });

  it("receives the list of online members", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "onlineMembers", data: { ids: [0, 1] } });
      }, []);

      return {};
    });

    renderRouter([
      {
        path: "/",
        element: (
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
            isRoomPrivate
          />
        ),
      },
    ]);

    const nbOfOnlineMember = screen.getByText(/2 online/i);
    expect(nbOfOnlineMember).toBeInTheDocument();
  });

  it("receives a new online member", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "onlineMember", data: { id: 1 } });
      }, []);

      return {};
    });

    renderRouter([
      {
        path: "/",
        element: (
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
            isRoomPrivate
          />
        ),
      },
    ]);

    const nbOfOnlineMember = screen.getByText(/1 online/i);
    expect(nbOfOnlineMember).toBeInTheDocument();
  });

  it("receives a new offline member", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "onlineMembers", data: { ids: [0, 1] } });
        messageHandler({ event: "offlineMember", data: { id: 0 } });
      }, []);

      return {};
    });

    renderRouter([
      {
        path: "/",
        element: (
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
            isRoomPrivate
          />
        ),
      },
    ]);

    const nbOfOnlineMember = screen.getByText(/1 online/i);
    expect(nbOfOnlineMember).toBeInTheDocument();
  });

  it("receives a new banned member", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "onlineMembers", data: { ids: [0, 1] } });
        messageHandler({ event: "bannedMember", data: { id: 0 } });
      }, []);

      return {};
    });

    renderRouter([
      {
        path: "/",
        element: (
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
            isRoomPrivate
          />
        ),
      },
    ]);

    const nbOfOnlineMember = screen.getByText(/1 online/i);
    expect(nbOfOnlineMember).toBeInTheDocument();
  });

  it("is closed by default", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
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
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
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
          <ChatRoomOnlineMemberListModal
            roomSubject="test"
            roomId={0}
            userId={0}
            creatorId={0}
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
});
