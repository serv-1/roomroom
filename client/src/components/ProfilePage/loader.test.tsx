import loader, { UserRoom } from "./loader";
import axios from "../Root/axios";
import { User } from "../Root";

jest.mock("../Root/axios");

const axiosMock = axios as jest.Mocked<typeof axios>;

const user: Omit<User, "email"> = {
  id: 0,
  name: "bob",
  image: null,
};

const authUser: User = { ...user, email: "bob@bob.bob" };

const room: UserRoom = {
  id: 0,
  subject: "Yo",
  scope: "public",
  updatedAt: "01/01/01",
};

describe("loader()", () => {
  it("returns the user fetched by the given id and its rooms", async () => {
    axiosMock.get
      .mockResolvedValue({ data: { rooms: [room] } })
      .mockResolvedValueOnce({ data: user });

    expect(
      await loader({ params: { id: "0" }, request: new Request("") }),
    ).toEqual({ user, rooms: [room] });

    expect(axiosMock.get).toHaveBeenNthCalledWith(1, "/users/0");
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, "/rooms/?userId=0");
  });

  it("returns the authenticated user if no id is given and its rooms", async () => {
    axiosMock.get
      .mockResolvedValue({ data: { rooms: [room] } })
      .mockResolvedValueOnce({ data: authUser });

    expect(await loader({ params: {}, request: new Request("") })).toEqual({
      user: authUser,
      rooms: [room],
    });

    expect(axiosMock.get).toHaveBeenNthCalledWith(1, "/user");
    expect(axiosMock.get).toHaveBeenNthCalledWith(2, "/rooms/?userId=0");
  });
});
