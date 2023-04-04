import { useEffect } from "react";
import { screen } from "@testing-library/react";
import IndexPage, { SearchedRoom } from ".";
import renderRouter from "../SignInPage/renderRouter";
import useIntersectionObserver from "../ChatMessageBox/useIntersectionObserver";
import axios from "../Root/axios";

jest.mock("../Room", () => ({
  __esModule: true,
  default: ({ subject }: { subject: string }) => <div>{subject}</div>,
}));

jest.mock("../ChatMessageBox/useIntersectionObserver");

const mockUseIntersectionObserver =
  useIntersectionObserver as jest.MockedFunction<
    typeof useIntersectionObserver
  >;

jest.mock("../Root/axios");

const mockAxios = axios as jest.Mocked<typeof axios>;

const createRooms = (nb: number, startingId = 0) => {
  const rooms: SearchedRoom[] = [];

  for (let i = startingId; i < startingId + nb; i++) {
    rooms.push({
      id: i,
      subject: "chat room " + (i + 1),
      updatedAt: "01/01/01",
    });
  }

  return rooms;
};

const useIOImpl =
  (isIntersecting: boolean): typeof useIntersectionObserver =>
  (ref, cb, opts) => {
    useEffect(() => {
      if (!ref.current) return;
      cb(
        [{ isIntersecting } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    }, opts?.deps);
  };

describe("<IndexPage />", () => {
  it("renders a text if no chat rooms has been found", async () => {
    renderRouter([{ path: "/", element: <IndexPage />, loader: () => [] }]);

    const text = await screen.findByText(/we didn't found any chat rooms/i);
    expect(text).toBeInTheDocument();
  });

  it("renders the chat rooms", async () => {
    renderRouter([
      { path: "/", element: <IndexPage />, loader: () => createRooms(2) },
    ]);

    const chatRoom1 = await screen.findByText(/chat room 1/i);
    expect(chatRoom1).toBeInTheDocument();

    const chatRoom2 = screen.getByText(/chat room 2/i);
    expect(chatRoom2).toBeInTheDocument();
  });

  describe("when scrolling to the end of the list", () => {
    it("renders the next batch of chat rooms", async () => {
      mockUseIntersectionObserver.mockImplementation(useIOImpl(true));

      mockAxios.get.mockResolvedValue({ data: { rooms: createRooms(2, 20) } });

      renderRouter([
        { path: "/", element: <IndexPage />, loader: () => createRooms(20) },
      ]);

      await screen.findAllByText(/chat room/i);

      expect(mockAxios.get).toHaveBeenNthCalledWith(1, "/rooms/search?id=19");

      const chatRoom21 = await screen.findByText(/chat room 21/i);
      expect(chatRoom21).toBeInTheDocument();

      const chatRoom22 = await screen.findByText(/chat room 22/i);
      expect(chatRoom22).toBeInTheDocument();
    });

    it("renders the next batch of chat rooms matching the query", async () => {
      mockUseIntersectionObserver.mockImplementation(useIOImpl(true));

      mockAxios.get.mockResolvedValue({ data: { rooms: createRooms(2, 20) } });

      renderRouter(
        [{ path: "/", element: <IndexPage />, loader: () => createRooms(20) }],
        { initialEntries: ["?query=cat"] },
      );

      await screen.findAllByText(/chat room/i);

      expect(mockAxios.get).toHaveBeenNthCalledWith(
        1,
        "/rooms/search?id=19&subject=cat",
      );

      const chatRoom21 = await screen.findByText(/chat room 21/i);
      expect(chatRoom21).toBeInTheDocument();

      const chatRoom22 = await screen.findByText(/chat room 22/i);
      expect(chatRoom22).toBeInTheDocument();
    });

    it("stops to fetch the chat rooms if they have all been fetched", async () => {
      mockUseIntersectionObserver.mockImplementation(useIOImpl(true));

      mockAxios.get.mockResolvedValue({ data: { rooms: [] } });

      renderRouter([
        { path: "/", element: <IndexPage />, loader: () => createRooms(20) },
      ]);

      const chatRooms = await screen.findAllByText(/chat room/i);
      expect(chatRooms).toHaveLength(20);
    });

    it("does not fetch the chat rooms if it renders less than 20 chat rooms", async () => {
      mockUseIntersectionObserver.mockImplementation(useIOImpl(true));

      mockAxios.get.mockResolvedValue({ data: { rooms: createRooms(1, 1) } });

      renderRouter([
        { path: "/", element: <IndexPage />, loader: () => createRooms(1) },
      ]);

      await screen.findAllByText(/chat room/i);

      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it("does not fetch the chat rooms if the user did not scroll enough", async () => {
      mockUseIntersectionObserver.mockImplementation(useIOImpl(false));

      mockAxios.get.mockResolvedValue({ data: { rooms: createRooms(1, 20) } });

      renderRouter([
        { path: "/", element: <IndexPage />, loader: () => createRooms(20) },
      ]);

      await screen.findAllByText(/chat room/i);

      expect(mockAxios.get).not.toHaveBeenCalled();
    });
  });
});
