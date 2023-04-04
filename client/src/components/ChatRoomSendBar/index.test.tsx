import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatRoomSendBar from ".";
import { useWebSocket } from "../WebSocketProvider";
import addToS3 from "../ProfilePage/addToS3";

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: jest.fn(),
}));

jest.mock("../ProfilePage/addToS3");

interface GifSearchBoxProps {
  isOpen: boolean;
  setGif: (gif: { id: string }) => void;
}

jest.mock("../GifSearchBox", () => ({
  __esModule: true,
  default: ({ isOpen, setGif }: GifSearchBoxProps) =>
    isOpen ? (
      <div data-testid="gifBox">
        <div data-testid="gif" onClick={() => setGif({ id: "gif" })}></div>
      </div>
    ) : null,
}));

jest.mock("@giphy/react-components", () => ({
  __esModule: true,
  Gif: ({ width }: { width: number }) => (
    <div data-testid="selectedGif" style={{ width }}></div>
  ),
}));

const useWebSocketMock = useWebSocket as jest.MockedFunction<
  typeof useWebSocket
>;

const addToS3Mock = addToS3 as jest.MockedFunction<typeof addToS3>;

const send = jest.fn();

beforeEach(() => {
  useWebSocketMock.mockReturnValue({ send });
});

describe("<ChatRoomSendBar />", () => {
  it("triggers the file input by clicking on the upload button", async () => {
    render(<ChatRoomSendBar roomId={0} />);

    const uploadBtn = screen.getByRole("button", { name: /upload/i });
    const filesInput = uploadBtn.previousElementSibling as HTMLInputElement;

    filesInput.click = jest.fn();

    await userEvent.click(uploadBtn);

    expect(filesInput.click).toHaveBeenCalledTimes(1);
  });

  it("does not send a message if there is no text, no files and no gif", async () => {
    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line

    (FormData as jest.Mock).mockReturnValue({
      get: () => "",
      getAll: () => [new File([""], "")],
    });

    render(<ChatRoomSendBar roomId={0} />);

    const submitBtn = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitBtn);

    const alert = screen.queryByRole("alert");
    expect(alert).not.toBeInTheDocument();

    expect(send).not.toHaveBeenCalled();
    FormData = _FormData; // eslint-disable-line
  });

  it("opens and closes the gif search box", async () => {
    render(<ChatRoomSendBar roomId={0} />);

    let gifBox = screen.queryByTestId("gifBox");
    expect(gifBox).not.toBeInTheDocument();

    const openBtn = screen.getByRole("button", { name: /open gif box/i });
    expect(openBtn).not.toHaveClass("rounded");

    await userEvent.click(openBtn);

    gifBox = screen.queryByTestId("gifBox");
    expect(gifBox).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /close gif box/i });
    expect(closeBtn).toHaveClass("rounded");

    await userEvent.click(closeBtn);

    expect(gifBox).not.toBeInTheDocument();
  });

  it("renders the selected gif", async () => {
    render(<ChatRoomSendBar roomId={0} />);

    const openBtn = screen.getByRole("button", { name: /open gif box/i });
    await userEvent.click(openBtn);

    const gif = screen.getByTestId("gif");
    await userEvent.click(gif);

    const selectedGif = screen.getByTestId("selectedGif");
    expect(selectedGif).toHaveStyle("width: 200px;");
  });

  it("renders the selected gif smaller if the screen is small", async () => {
    window.innerWidth = 360;

    render(<ChatRoomSendBar roomId={0} />);

    const openBtn = screen.getByRole("button", { name: /open gif box/i });
    await userEvent.click(openBtn);

    const gif = screen.getByTestId("gif");
    await userEvent.click(gif);

    const selectedGif = screen.getByTestId("selectedGif");
    expect(selectedGif).toHaveStyle("width: 100px;");
  });

  it("deselects the selected gif by clicking on the deselect button", async () => {
    render(<ChatRoomSendBar roomId={0} />);

    const openBtn = screen.getByRole("button", { name: /open gif box/i });
    await userEvent.click(openBtn);

    const gif = screen.getByTestId("gif");
    await userEvent.click(gif);

    const deselectBtn = screen.getByRole("button", { name: /deselect/i });
    await userEvent.click(deselectBtn);

    const selectedGif = screen.queryByTestId("selectedGif");
    expect(selectedGif).not.toBeInTheDocument();
  });

  describe("sends a message with", () => {
    it("some text", async () => {
      const _FormData = FormData;
      FormData = jest.fn(); // eslint-disable-line

      (FormData as jest.Mock).mockReturnValue({
        get: () => "text",
        getAll: () => [new File([""], "")],
      });

      render(<ChatRoomSendBar roomId={0} />);

      const submitBtn = screen.getByRole("button", { name: /send/i });
      await userEvent.click(submitBtn);

      expect(send).toHaveBeenNthCalledWith(1, "message", {
        text: "text",
        roomId: 0,
      });

      expect(addToS3Mock).not.toHaveBeenCalled();
      FormData = _FormData; // eslint-disable-line
    });

    it("some files", async () => {
      addToS3Mock
        .mockResolvedValue("lKey")
        .mockResolvedValueOnce("iKey")
        .mockResolvedValueOnce("jKey")
        .mockResolvedValueOnce("kKey");

      const _FormData = FormData;
      FormData = jest.fn(); // eslint-disable-line

      (FormData as jest.Mock).mockReturnValue({
        get: () => "",
        getAll: () => [
          new File(["data"], "i.jpg", { type: "image/jpeg" }),
          new File(["data"], "j.jpg", { type: "image/jpeg" }),
          new File(["data"], "k.mp4", { type: "video/mp4" }),
          new File(["data"], "l.mp4", { type: "video/mp4" }),
        ],
      });

      render(<ChatRoomSendBar roomId={0} />);

      const submitBtn = screen.getByRole("button", { name: /send/i });
      await userEvent.click(submitBtn);

      expect(send).toHaveBeenNthCalledWith(1, "message", {
        images: ["iKey", "jKey"],
        videos: ["kKey", "lKey"],
        roomId: 0,
      });

      expect(addToS3Mock).toHaveBeenCalledTimes(4);
      FormData = _FormData; // eslint-disable-line
    });

    it("a gif", async () => {
      render(<ChatRoomSendBar roomId={0} />);

      const openBtn = screen.getByRole("button", { name: /open gif box/i });
      await userEvent.click(openBtn);

      const gif = screen.getByTestId("gif");
      await userEvent.click(gif);

      const submitBtn = screen.getByRole("button", { name: /send/i });
      await userEvent.click(submitBtn);

      expect(send).toHaveBeenNthCalledWith(1, "message", {
        gif: "gif",
        roomId: 0,
      });

      expect(addToS3Mock).not.toHaveBeenCalled();

      await waitForElementToBeRemoved(() => screen.queryByTestId("gifBox"));

      const selectedGif = screen.queryByTestId("selectedGif");
      expect(selectedGif).not.toBeInTheDocument();
    });

    it("all", async () => {
      addToS3Mock.mockResolvedValue("jKey").mockResolvedValueOnce("iKey");

      const _FormData = FormData;
      FormData = jest.fn(); // eslint-disable-line

      (FormData as jest.Mock).mockReturnValue({
        get: () => "text",
        getAll: () => [
          new File(["data"], "i.jpg", { type: "image/jpeg" }),
          new File(["data"], "j.mp4", { type: "video/mp4" }),
        ],
      });

      render(<ChatRoomSendBar roomId={0} />);

      const openBtn = screen.getByRole("button", { name: /open gif box/i });
      await userEvent.click(openBtn);

      const gif = screen.getByTestId("gif");
      await userEvent.click(gif);

      const submitBtn = screen.getByRole("button", { name: /send/i });
      await userEvent.click(submitBtn);

      expect(send).toHaveBeenNthCalledWith(1, "message", {
        text: "text",
        images: ["iKey"],
        videos: ["jKey"],
        gif: "gif",
        roomId: 0,
      });

      expect(addToS3Mock).toHaveBeenCalledTimes(2);
      FormData = _FormData; // eslint-disable-line

      await waitForElementToBeRemoved(() => screen.queryByTestId("gifBox"));

      const selectedGif = screen.queryByTestId("selectedGif");
      expect(selectedGif).not.toBeInTheDocument();
    });
  });

  it("renders an error if a file is not an image nor a video", async () => {
    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line

    const file = new File(["text"], "t.txt", { type: "text/plain" });
    (FormData as jest.Mock).mockReturnValue({
      get: () => "",
      getAll: () => [file],
    });

    render(<ChatRoomSendBar roomId={0} />);

    const submitBtn = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/(image|video)/i);

    expect(send).not.toHaveBeenCalled();
    FormData = _FormData; // eslint-disable-line
  });

  it("renders an error if an image is too big", async () => {
    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line
    (FormData as jest.Mock).mockReturnValue({
      get: () => "",
      getAll: () => [
        new File([new Uint8Array(1_000_000)], "i.jpg", {
          type: "image/jpeg",
        }),
      ],
    });

    render(<ChatRoomSendBar roomId={0} />);

    const submitBtn = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/(image|video)/i);

    expect(send).not.toHaveBeenCalled();
    FormData = _FormData; // eslint-disable-line
  });

  it("renders an error if a video is too big", async () => {
    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line
    (FormData as jest.Mock).mockReturnValue({
      get: () => "",
      getAll: () => [
        new File([new Uint8Array(100_000_000)], "v.avi", {
          type: "video/x-msvideo",
        }),
      ],
    });

    render(<ChatRoomSendBar roomId={0} />);

    const submitBtn = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/(image|video)/i);

    expect(send).not.toHaveBeenCalled();
    FormData = _FormData; // eslint-disable-line
  });

  it("renders an error if S3 fails to add the files in the bucket", async () => {
    addToS3Mock.mockRejectedValue("");

    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line

    (FormData as jest.Mock).mockReturnValue({
      get: () => "",
      getAll: () => [new File(["data"], "img.jpeg", { type: "image/jpeg" })],
    });

    render(<ChatRoomSendBar roomId={0} />);

    const submitBtn = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/files could not be uploaded/i);

    expect(send).not.toHaveBeenCalled();
    FormData = _FormData; // eslint-disable-line
  });

  it("clears the inputs once the message is sent", async () => {
    addToS3Mock.mockResolvedValue("iKey");

    const _FormData = FormData;
    FormData = jest.fn(); // eslint-disable-line

    const file = new File(["data"], "i.jpg", { type: "image/jpeg" });

    (FormData as jest.Mock).mockReturnValue({
      get: () => "text",
      getAll: () => [file],
    });

    render(<ChatRoomSendBar roomId={0} />);

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "text");

    const filesInput = screen.getByRole("button", { name: /upload/i })
      .previousElementSibling as HTMLInputElement;
    await userEvent.upload(filesInput, file);

    const submitBtn = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitBtn);

    expect(textarea).toHaveValue("");
    expect(filesInput).toHaveValue("");

    FormData = _FormData; // eslint-disable-line
  });
});
