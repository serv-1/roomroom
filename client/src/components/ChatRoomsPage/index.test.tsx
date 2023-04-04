import { screen } from "@testing-library/react";
import ChatRoomsPage from ".";
import renderRouter from "../SignInPage/renderRouter";

jest.mock("../ExpandableRoom", () => ({
  __esModule: true,
  default: ({ subject }: { subject: string }) => <div>{subject}</div>,
}));

describe("<ChatRoomsPage />", () => {
  it("renders the informative text if there is no chat rooms", () => {
    renderRouter([{ path: "/", element: <ChatRoomsPage /> }]);

    const text = screen.getByText(/you haven't created any chat rooms yet/i);
    expect(text).toBeInTheDocument();
  });

  it("renders the chat rooms", async () => {
    renderRouter([
      {
        path: "/",
        element: <ChatRoomsPage />,
        loader: () => [
          {
            id: 0,
            subject: "chat room 1",
            scope: "public",
            updatedAt: "01/01/01",
          },
          {
            id: 1,
            subject: "chat room 2",
            scope: "private",
            updatedAt: "01/01/01",
          },
        ],
      },
    ]);

    const chatRoom1 = await screen.findByText(/chat room 1/i);
    expect(chatRoom1).toBeInTheDocument();

    const chatRoom2 = screen.getByText(/chat room 2/i);
    expect(chatRoom2).toBeInTheDocument();
  });
});
