import { screen } from "@testing-library/react";
import MemberList from ".";
import axios from "../Root/axios";
import renderRouter from "../SignInPage/renderRouter";

jest.mock("../WebSocketProvider", () => ({
  __esModule: true,
  useWebSocket: () => ({ send: undefined }),
}));

jest.mock("../Root/axios");

const axiosMock = axios as jest.Mocked<typeof axios>;

describe("<MemberList />", () => {
  it("renders the members", async () => {
    axiosMock.get
      .mockResolvedValue({ data: { id: 0, name: "bob", image: null } })
      .mockResolvedValueOnce({ data: { id: 1, name: "john", image: null } });

    renderRouter([
      {
        path: "/",
        element: (
          <MemberList
            roomSubject="test"
            userId={0}
            creatorId={0}
            memberIds={[0, 1]}
            isRoomPrivate
          />
        ),
      },
    ]);

    const john = await screen.findByText(/john/i);
    expect(john).toBeInTheDocument();

    const bob = screen.getByText(/bob/i);
    expect(bob).toBeInTheDocument();
  });
});
