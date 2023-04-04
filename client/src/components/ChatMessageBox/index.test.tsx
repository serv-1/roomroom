import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import ChatMessageBox, { MsgWithGif } from ".";
import { RoomMessage } from "../ChatRoomPage/loader";
import axios from "../Root/axios";
import { useWebSocket } from "../WebSocketProvider";
import useIntersectionObserver from "./useIntersectionObserver";

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: jest.fn(),
}));

jest.mock("./useIntersectionObserver");

jest.mock("../MessageList", () => ({
  __esModule: true,
  default: ({ messages }: { messages: MsgWithGif[] }) =>
    messages.map((m) => <div key={m.id}>{m.text}</div>),
}));

jest.mock("../ScrollToBottomButton", () => ({
  __esModule: true,
  default: () => <button>to bottom</button>,
}));

const mockUseWebSocket = useWebSocket as jest.MockedFunction<
  typeof useWebSocket
>;

const mockUseIntersectionObserver =
  useIntersectionObserver as jest.MockedFunction<
    typeof useIntersectionObserver
  >;

jest.mock("../Root/axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const send = jest.fn();
const scrollBy = jest.fn();
Element.prototype.scrollBy = scrollBy;

const msg: RoomMessage = {
  id: 0,
  authorId: 0,
  name: "bob",
  image: null,
  banned: false,
  createdAt: "01/01/01",
  text: "message",
  images: null,
  videos: null,
  gif: null,
};

const createMessages = (nb: number, startingId = 0) => {
  const messages: RoomMessage[] = [];

  for (let i = startingId; i < startingId + nb; i++) {
    messages.push({ ...msg, id: i, text: "message " + (i + 1) });
  }

  return messages;
};

const useIOImpl =
  (noOp: boolean, isIntersecting?: boolean): typeof useIntersectionObserver =>
  (ref, cb, opts) => {
    useEffect(() => {
      if (!ref.current || noOp) return;
      cb(
        [{ isIntersecting } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    }, opts?.deps);
  };

beforeEach(() => {
  mockUseIntersectionObserver.mockImplementation(useIOImpl(true));
  mockUseWebSocket.mockReturnValue({ send });
  mockAxios.get.mockResolvedValue({ data: { messages: createMessages(2, 1) } });
});

describe("<ChatMessageBox />", () => {
  it("renders and scrolls down the message list", async () => {
    render(
      <ChatMessageBox
        messages={[msg, { ...msg, id: 1 }]}
        userId={0}
        roomId={1}
      />,
    );

    const messages = await screen.findAllByText(/message/i);
    expect(messages).toHaveLength(2);

    await waitFor(() => {
      expect(scrollBy).toHaveBeenNthCalledWith(1, {
        top: 0,
        behavior: "auto",
      });
    });
  });

  describe("when scrolling to the top", () => {
    it("fetches the previous messages and prevent scrolling", async () => {
      mockUseIntersectionObserver
        .mockImplementationOnce(useIOImpl(false, true))
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, true));

      mockAxios.get.mockResolvedValue({
        data: { messages: createMessages(1, 15) },
      });

      render(
        <ChatMessageBox messages={createMessages(15)} userId={0} roomId={1} />,
      );

      await screen.findAllByText(/message/i);

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenNthCalledWith(
          1,
          "/messages/1?msgId=0",
          { csrf: true },
        );
      });

      expect(scrollBy).toHaveBeenNthCalledWith(2, 0, 16);

      await waitFor(() => {
        const messages = screen.getAllByText(/message/i);
        expect(messages[0]).toHaveTextContent(/16/i);
        expect(messages).toHaveLength(16);
      });
    });

    it("does nothing if there is no more messages to fetch", async () => {
      mockUseIntersectionObserver
        .mockImplementationOnce(useIOImpl(false, true))
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, true));

      mockAxios.get.mockResolvedValue({ data: { messages: [] } });

      render(
        <ChatMessageBox messages={createMessages(15)} userId={0} roomId={1} />,
      );

      await screen.findAllByText(/message/i);

      await waitFor(() => expect(mockAxios.get).toHaveBeenCalled());

      expect(scrollBy).toHaveBeenCalledTimes(1);
    });

    it("does not fetch the previous messages if the start of the box leaves the viewport", async () => {
      mockUseIntersectionObserver
        .mockImplementationOnce(useIOImpl(false, false))
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, false));

      render(
        <ChatMessageBox messages={createMessages(15)} userId={0} roomId={1} />,
      );

      await screen.findAllByText(/message/i);

      await waitFor(() => expect(scrollBy).toHaveBeenCalled());

      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it("does not fetch the previous messages if it renders less than 15 messages", async () => {
      mockUseIntersectionObserver
        .mockImplementationOnce(useIOImpl(false, true))
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, true));

      render(
        <ChatMessageBox messages={createMessages(1)} userId={0} roomId={1} />,
      );

      await screen.findAllByText(/message/i);

      await waitFor(() => expect(scrollBy).toHaveBeenCalled());

      expect(mockAxios.get).not.toHaveBeenCalled();
    });
  });

  describe("when scrolling to the bottom", () => {
    it("tells to the server that the new message has been seen", async () => {
      mockUseIntersectionObserver
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, true))
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, true));

      render(
        <ChatMessageBox
          messages={createMessages(1)}
          userId={2}
          roomId={1}
          nbOfUnseenMsg={1}
        />,
      );

      await screen.findByText(/message/i);

      await waitFor(() => {
        expect(send).toHaveBeenNthCalledWith(1, "seeMessage", {
          msgId: 0,
          roomId: 1,
          userId: 2,
        });
      });
    });

    it("does not tell to the server that the new message has been seen if there is none", async () => {
      mockUseIntersectionObserver
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, true))
        .mockImplementationOnce(useIOImpl(true))
        .mockImplementationOnce(useIOImpl(false, true));

      render(
        <ChatMessageBox messages={createMessages(1)} userId={2} roomId={1} />,
      );

      await screen.findByText(/message/i);

      await waitFor(() => expect(scrollBy).toHaveBeenCalled());

      expect(send).not.toHaveBeenCalled();
    });
  });

  describe("if a message is received via websocket", () => {
    it("renders it", async () => {
      mockUseWebSocket.mockImplementation((messageHandler) => {
        useEffect(() => {
          if (!messageHandler) return;
          messageHandler({
            event: "message",
            data: createMessages(1, 1)[0],
          });
        }, []);

        return { send };
      });

      render(
        <ChatMessageBox
          messages={createMessages(1)}
          userId={0}
          roomId={1}
          nbOfUnseenMsg={0}
        />,
      );

      const messages = await screen.findAllByText(/message/i);
      expect(messages).toHaveLength(2);

      expect(messages[0]).toHaveTextContent(/1/i);
      expect(messages[1]).toHaveTextContent(/2/i);
    });

    it("scrolls until it is visible", async () => {
      mockUseWebSocket.mockImplementation((messageHandler) => {
        useEffect(() => {
          if (!messageHandler) return;
          messageHandler({ event: "message", data: createMessages(1, 1)[0] });
        }, []);

        return { send };
      });

      const { container } = render(
        <ChatMessageBox messages={createMessages(1)} userId={0} roomId={1} />,
      );

      const messageBox = container.firstElementChild;

      Object.defineProperties(messageBox, {
        scrollHeight: { value: 100 },
        scrollTop: { value: 50 },
        clientHeight: { value: 50 },
      });

      await screen.findAllByText(/message/i);

      await waitFor(() => {
        expect(scrollBy).toHaveBeenNthCalledWith(1, {
          top: 100,
          behavior: "smooth",
        });
      });
    });

    it("does not scroll if the user has already scrolled", async () => {
      mockUseWebSocket.mockImplementation((messageHandler) => {
        useEffect(() => {
          if (!messageHandler) return;
          messageHandler({ event: "message", data: createMessages(1, 1)[0] });
        }, []);

        return { send };
      });

      const { container } = render(
        <ChatMessageBox messages={createMessages(1)} userId={0} roomId={1} />,
      );

      const messageBox = container.firstElementChild;

      Object.defineProperties(messageBox, {
        scrollHeight: { value: 100 },
        scrollTop: { value: 50 },
        clientHeight: { value: 20 },
      });

      await screen.findAllByText(/message/i);

      expect(scrollBy).not.toHaveBeenCalled();
    });
  });
});
