import ChatRoomPage from ".";
import renderRouter from "../SignInPage/renderRouter";
import { useWebSocket } from "../WebSocketProvider";
import { Room } from "./loader";
import { User, useRootContext } from "../Root";
import { screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";

jest.mock("../ChatRoomTopBar", () => ({
  __esModule: true,
  default: () => <div>Chat Room Top Bar Mock</div>,
}));

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: jest.fn(),
}));

jest.mock("../Root", () => ({
  __esModule: true,
  useRootContext: jest.fn(),
}));

const useWebSocketMock = useWebSocket as jest.MockedFunction<
  typeof useWebSocket
>;
const useRootContextMock = useRootContext as jest.MockedFunction<
  typeof useRootContext
>;

const user: User = { id: 0, name: "bob", email: "bob@bob.bob", image: null };
const room: Room = {
  id: 0,
  subject: "Testing Chat Room",
  scope: "public",
  creatorId: 0,
  memberIds: [0],
  messages: [],
  updatedAt: new Date().toISOString(),
};

const send = jest.fn();

Element.prototype.scrollBy = () => undefined;

beforeEach(() => {
  useWebSocketMock.mockReturnValue({ send });
  useRootContextMock.mockReturnValue({ user });
});

describe("<ChatRoomPage />", () => {
  describe("if the user is a member", () => {
    it("sends an 'onlineMember' message", async () => {
      renderRouter([
        {
          path: "/",
          element: <ChatRoomPage />,
          loader: () => ({ room }),
        },
      ]);

      await waitFor(() => {
        expect(send).toHaveBeenNthCalledWith(1, "onlineMember", {
          roomId: room.id,
          userId: user.id,
        });
      });
    });

    it("sends an 'offlineMember' message when the page unmounts", async () => {
      const { unmount } = renderRouter([
        { path: "/", element: <ChatRoomPage />, loader: () => ({ room }) },
      ]);

      await waitFor(() => expect(send).toHaveBeenCalled());

      unmount();

      expect(send).toHaveBeenNthCalledWith(2, "offlineMember", {
        roomId: room.id,
        userId: user.id,
      });
    });

    it("sends an 'offlineMember' message before the page unload", async () => {
      renderRouter([
        { path: "/", element: <ChatRoomPage />, loader: () => ({ room }) },
      ]);

      await waitFor(() => expect(send).toHaveBeenCalled());

      window.dispatchEvent(new Event("beforeunload"));

      expect(send).toHaveBeenNthCalledWith(2, "offlineMember", {
        roomId: room.id,
        userId: user.id,
      });
    });
  });

  describe("if the user is not member", () => {
    it("does not send an 'onlineMember' message", async () => {
      renderRouter([
        {
          path: "/",
          element: <ChatRoomPage />,
          loader: () => ({ room: { ...room, memberIds: [1] } }),
        },
      ]);

      await expect(async () => {
        await waitFor(() => expect(send).toHaveBeenCalled(), { timeout: 0 });
      }).rejects.toThrow();
    });

    it("does not send an 'offlineMember' message when the page unmounts", async () => {
      const { unmount } = renderRouter([
        {
          path: "/",
          element: <ChatRoomPage />,
          loader: () => ({ room: { ...room, memberIds: [1] } }),
        },
      ]);

      const topBar = await screen.findByText(/top bar/i);
      expect(topBar).toBeInTheDocument();

      unmount();

      await expect(async () => {
        await waitFor(() => expect(send).toHaveBeenCalled(), { timeout: 0 });
      }).rejects.toThrow();
    });

    it("does not send an 'offlineMember' message before the page unload", async () => {
      renderRouter([
        {
          path: "/",
          element: <ChatRoomPage />,
          loader: () => ({ room: { ...room, memberIds: [1] } }),
        },
      ]);

      window.dispatchEvent(new Event("beforeunload"));

      await expect(async () => {
        await waitFor(() => expect(send).toHaveBeenCalled(), { timeout: 0 });
      }).rejects.toThrow();
    });
  });

  it("redirects the user to / if it receives a 'bannedMember' message with the user id", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "bannedMember", data: { id: user.id } });
      }, []);

      return {};
    });

    renderRouter(
      [
        {
          path: "/",
          element: <div>Home</div>,
        },
        {
          path: "/room",
          element: <ChatRoomPage />,
          loader: () => ({ room }),
        },
      ],
      { initialEntries: ["/room"] },
    );

    const home = await screen.findByText(/home/i);
    expect(home).toBeInTheDocument();
  });

  it("does not redirect the user to / if the 'bannedMember' message's user id does not equal the user id ", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "bannedMember", data: { id: 9 } });
      }, []);

      return {};
    });

    renderRouter(
      [
        {
          path: "/",
          element: <div>Home</div>,
        },
        {
          path: "/room",
          element: <ChatRoomPage />,
          loader: () => ({ room }),
        },
      ],
      { initialEntries: ["/room"] },
    );

    await expect(async () => {
      await screen.findByText(/home/i);
    }).rejects.toThrow();
  });

  it("sends an 'onlineMember' message if the user becomes a member of the chat room", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "member", data: { id: user.id } });
      }, []);

      return { send };
    });

    renderRouter([
      {
        path: "/",
        element: <ChatRoomPage />,
        loader: () => ({ room: { ...room, member_ids: [1] } }),
      },
    ]);

    await waitFor(() => {
      expect(send).toHaveBeenNthCalledWith(1, "onlineMember", {
        roomId: room.id,
        userId: user.id,
      });
    });
  });

  it("does not send an 'onlineMember' message if another user becomes a member of the chat room", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({ event: "member", data: { id: 9 } });
      }, []);

      return { send };
    });

    renderRouter([
      {
        path: "/",
        element: <ChatRoomPage />,
        loader: () => ({ room }),
      },
    ]);

    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
  });
});
