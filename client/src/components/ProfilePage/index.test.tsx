import { screen } from "@testing-library/react";
import ProfilePage from ".";
import { User } from "../Root";
import renderRouter from "../SignInPage/renderRouter";
import { UserRoom } from "./loader";

jest.mock("../Room", () => ({
  __esModule: true,
  default: ({ subject }: { subject: string }) => <div>{subject}</div>,
}));

const user: Omit<User, "email"> = {
  id: 0,
  name: "bob",
  image: null,
};

const authUser = { ...user, email: "bob@bob.bob" };

const room: UserRoom = {
  id: 0,
  subject: "Yo",
  scope: "public",
  updatedAt: "01/01/01",
};

describe("<ProfilePage />", () => {
  it("renders correctly with the authenticated user", async () => {
    renderRouter([
      {
        path: "/",
        element: <ProfilePage />,
        loader: () => ({ user: authUser, rooms: [] }),
      },
    ]);

    const updateBtn = await screen.findByRole("button", { name: /update/i });
    expect(updateBtn).toBeInTheDocument();

    const name = screen.getByText("bob");
    expect(name).toBeInTheDocument();

    const email = screen.getByText("bob@bob.bob");
    expect(email).toBeInTheDocument();

    expect(document.title).toBe("Profile - RoomRoom");
  });

  it("renders correctly with another user with an image", async () => {
    renderRouter([
      {
        path: "/",
        element: <ProfilePage />,
        loader: () => ({ user: { ...user, image: "bob.jpg" }, rooms: [] }),
      },
    ]);

    const name = await screen.findByText("bob");
    expect(name).toBeInTheDocument();

    const updateBtn = screen.queryByRole("button", { name: /update/i });
    expect(updateBtn).not.toBeInTheDocument();

    const email = screen.queryByText("@");
    expect(email).not.toBeInTheDocument();

    expect(document.title).toBe("bob's profile - RoomRoom");
  });

  it("renders the rooms in which the user is a member", async () => {
    renderRouter([
      {
        path: "/",
        element: <ProfilePage />,
        loader: () => ({ user, rooms: [room, { ...room, id: 1 }] }),
      },
    ]);

    const rooms = await screen.findAllByRole("listitem");
    expect(rooms).toHaveLength(2);
  });

  it("renders some text if the user is not a member", async () => {
    renderRouter([
      {
        path: "/",
        element: <ProfilePage />,
        loader: () => ({ user, rooms: [] }),
      },
    ]);

    const text = await screen.findByText(/no chat rooms/i);
    expect(text).toBeInTheDocument();
  });
});
