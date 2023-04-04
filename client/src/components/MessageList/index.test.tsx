import { render, screen } from "@testing-library/react";
import MessageList from ".";
import { MsgWithGif } from "../ChatMessageBox";

jest.mock("../Message", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <div>{text}</div>,
}));

const msg: MsgWithGif = {
  id: 0,
  authorId: 0,
  name: "bob",
  image: null,
  banned: false,
  createdAt: "01/01/01",
  text: "msg 1",
  images: null,
  videos: null,
  gif: null,
};

describe("<MessageList />", () => {
  it("renders the messages and the date", () => {
    render(
      <MessageList
        messages={[msg, { ...msg, id: 1, text: "msg 2" }]}
        userId={0}
      />,
    );

    const msg1 = screen.getByText(/msg 1/i);
    expect(msg1).toBeInTheDocument();

    const msg2 = screen.getByText(/msg 2/i);
    expect(msg2).toBeInTheDocument();

    const date = screen.getByText(/january/i);
    expect(date).toBeInTheDocument();
  });
});
