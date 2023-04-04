import { screen } from "@testing-library/react";
import { useEffect } from "react";
import Room from ".";
import renderRouter from "../SignInPage/renderRouter";
import { useWebSocket } from "../WebSocketProvider";

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: jest.fn(),
}));

const useWebSocketMock = useWebSocket as jest.MockedFunction<
  typeof useWebSocket
>;

beforeEach(() => {
  useWebSocketMock.mockReturnValue({});
});

describe("<Room />", () => {
  it("renders correctly", () => {
    const date = new Date().toISOString();

    renderRouter([
      {
        path: "/",
        element: <Room id={0} subject="Yo" scope="public" updatedAt={date} />,
      },
    ]);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/rooms/0");
    expect(link).toHaveClass("rounded-lg");

    const subject = screen.getByText(/yo/i);
    expect(subject).toBeInTheDocument();

    const scope = screen.getByText(/Public/);
    expect(scope).toBeInTheDocument();

    const nbOnline = screen.getByText(/0 online/i);
    expect(nbOnline).toBeInTheDocument();

    const updatedAt = screen.getByText(
      new RegExp(new Date(date).toLocaleDateString("fr-FR"), "i"),
    );
    expect(updatedAt).toBeInTheDocument();

    const nbOfUnseenMsg = screen.queryByText(/\+/);
    expect(nbOfUnseenMsg).not.toBeInTheDocument();
  });

  it("does not render the scope", () => {
    renderRouter([
      {
        path: "/",
        element: <Room id={0} subject="Yo" updatedAt="01/01/01" />,
      },
    ]);

    const scope = screen.queryByText(/public_20/i);
    expect(scope).not.toBeInTheDocument();
  });

  it("renders the number of unseen messages", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <Room
            id={0}
            subject="Yo"
            scope="public"
            updatedAt="01/01/01"
            nbOfUnseenMsg={1}
          />
        ),
      },
    ]);

    const nbOfUnseenMsg = screen.getByText(/\+1/);
    expect(nbOfUnseenMsg).toHaveAttribute("title", "1 new message");
  });

  it("renders an 's' to 'message' if the number of unseen messages is greater than 1", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <Room
            id={0}
            subject="Yo"
            scope="public"
            updatedAt="01/01/01"
            nbOfUnseenMsg={2}
          />
        ),
      },
    ]);

    const nbOfUnseenMsg = screen.getByText(/\+2/);
    expect(nbOfUnseenMsg).toHaveAttribute("title", "2 new messages");
  });

  it("does not render the number of unseen messages if there is 0", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <Room
            id={0}
            subject="Yo"
            scope="public"
            updatedAt="01/01/01"
            nbOfUnseenMsg={0}
          />
        ),
      },
    ]);

    const nbOfUnseenMsg = screen.queryByText(/0$/);
    expect(nbOfUnseenMsg).not.toBeInTheDocument();
  });

  it("renders the number of online members", async () => {
    const send = jest.fn();

    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({
          event: "onlineMembers",
          data: { ids: [0, 1], roomId: 0 },
        });
      }, []);

      return { send };
    });

    renderRouter([
      {
        path: "/",
        element: <Room id={0} subject="Yo" updatedAt="01/01/01" />,
      },
    ]);

    expect(send).toHaveBeenNthCalledWith(1, "onlineMembers", { roomId: 0 });

    const nbOnline = screen.getByText(/2 online/i);
    expect(nbOnline).toBeInTheDocument();
  });

  it("does not render the number of online members if they belong to another chat room", async () => {
    useWebSocketMock.mockImplementation((messageHandler) => {
      useEffect(() => {
        if (!messageHandler) return;
        messageHandler({
          event: "onlineMembers",
          data: { ids: [0, 1], roomId: 1 },
        });
      }, []);

      return { send: () => null };
    });

    renderRouter([
      {
        path: "/",
        element: <Room id={0} subject="Yo" updatedAt="01/01/01" />,
      },
    ]);

    const nbOnline = screen.getByText(/0 online/i);
    expect(nbOnline).toBeInTheDocument();
  });

  it("renders specific styles if it is expanded", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <Room
            id={0}
            subject="Yo"
            scope="public"
            updatedAt="01/01/01"
            isExpanded
          />
        ),
      },
    ]);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("rounded-t-lg");
  });
});
