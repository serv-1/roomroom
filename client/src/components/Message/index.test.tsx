import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import Message from ".";
import { IGif } from "../ChatMessageBox";
import renderRouter from "../SignInPage/renderRouter";
import { useWebSocket } from "../WebSocketProvider";

jest.mock("@giphy/react-components", () => ({
  __esModule: true,
  Gif: ({ width }: { width: number }) => (
    <div data-testid="gif" style={{ width }}></div>
  ),
}));

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: jest.fn(),
}));

const useWebSocketMock = useWebSocket as jest.MockedFunction<
  typeof useWebSocket
>;

const props = {
  userId: 0,
  authorId: 1,
  name: "bob",
  image: "img",
  banned: false,
  createdAt: "01/01/01",
  text: "no",
  images: null,
  videos: null,
  gif: null,
};

describe("<Message />", () => {
  it("renders a message of the authenticated user", () => {
    const { container } = renderRouter([
      { path: "/", element: <Message {...props} authorId={0} /> },
    ]);

    const message = container.children[0].children[0];
    expect(message).toHaveClass("text-right");

    const userName = screen.getByText(/you/i);
    expect(userName).toBeInTheDocument();

    const textContainer = screen.getByText(/no/i).parentElement;
    expect(textContainer).toHaveClass("bg-blue-600");
    expect(textContainer).not.toHaveClass("w-full");
  });

  it("renders a message of another user", () => {
    const { container } = renderRouter([
      { path: "/", element: <Message {...props} /> },
    ]);

    const message = container.children[0].children[0];
    expect(message).not.toHaveClass("text-right");

    const userName = screen.getByRole("link", { name: /bob/i });
    expect(userName).toBeInTheDocument();

    const textContainer = screen.getByText(/no/i).parentElement;
    expect(textContainer).toHaveClass("bg-blue-200");
    expect(textContainer).not.toHaveClass("w-full");
  });

  it("renders a line through the user name when he is banned", () => {
    renderRouter([{ path: "/", element: <Message {...props} banned /> }]);

    const userName = screen.getByText(/bob/i);
    expect(userName).toHaveClass("line-through");
    expect(userName.tagName).not.toBe("A");
  });

  it("renders a special name if the author's account is deleted", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <Message {...{ ...props, authorId: null, name: null, image: null }} />
        ),
      },
    ]);

    const name = screen.getByText(/deleted/i);
    expect(name).toBeInTheDocument();
  });

  it("renders the message content", () => {
    renderRouter([
      {
        path: "/",
        element: (
          <Message
            {...props}
            images={["img"]}
            videos={["vid"]}
            gif={{} as IGif}
          />
        ),
      },
    ]);

    const text = screen.getByText(/no/i);
    expect(text).toBeInTheDocument();

    const image = screen.getAllByRole("img")[1];
    expect(image).toBeInTheDocument();

    const video = screen.getByRole("button", {
      name: /see video/i,
    }).firstElementChild;
    expect(video).toBeInTheDocument();

    const gif = screen.getByTestId("gif");
    expect(gif).toHaveStyle("width: 404px;");
  });

  it("renders the gif smaller if the screen is small", () => {
    window.innerWidth = 360;

    renderRouter([
      { path: "/", element: <Message {...props} gif={{} as IGif} /> },
    ]);

    const gif = screen.getByTestId("gif");
    expect(gif).toHaveStyle("width: 242px;");
  });

  it("goes on the message author profile by clicking on its name", async () => {
    renderRouter([
      { path: "/", element: <Message {...props} /> },
      { path: "/profile/:id", element: <div>User page</div> },
    ]);

    const userName = screen.getByRole("link", { name: /bob/i });
    await userEvent.click(userName);

    const userPage = screen.getByText(/user page/i);
    expect(userPage).toBeInTheDocument();
  });

  describe("when we receive a 'bannedMember' message", () => {
    it("renders a line through the user name if the banned member is the author", async () => {
      useWebSocketMock.mockImplementation((messageHandler) => {
        useEffect(() => {
          if (!messageHandler) return;
          messageHandler({ event: "bannedMember", data: { id: 1 } });
        }, []);

        return {};
      });

      renderRouter([{ path: "/", element: <Message {...props} /> }]);

      const userName = screen.getByText(/bob/i);
      expect(userName).toHaveClass("line-through");
      expect(userName.tagName).not.toBe("A");
    });

    it("does not render a line through the user name if the banned member is not the author", async () => {
      useWebSocketMock.mockImplementation((messageHandler) => {
        useEffect(() => {
          if (!messageHandler) return;
          messageHandler({ event: "bannedMember", data: { id: 2 } });
        }, []);

        return {};
      });

      renderRouter([{ path: "/", element: <Message {...props} /> }]);

      const userName = screen.getByRole("link", { name: /bob/i });
      expect(userName).not.toHaveClass("line-through");
    });
  });
});
