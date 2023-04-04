import axios from "../Root/axios";
import loader from "./loader";

jest.mock("../Root/axios");

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("loader()", () => {
  it("fetches the last created chat rooms", async () => {
    mockAxios.get.mockResolvedValue({ data: { rooms: [] } });

    const rooms = await loader({
      request: new Request("http://localhost"),
      params: {},
    });

    expect(mockAxios.get).toHaveBeenNthCalledWith(1, "/rooms/search");

    expect(rooms).toBeInstanceOf(Array);
  });

  it("fetches the chat rooms matching the given subject", async () => {
    mockAxios.get.mockResolvedValue({ data: { rooms: [] } });

    const rooms = await loader({
      request: new Request("http://localhost?query=cat"),
      params: {},
    });

    expect(mockAxios.get).toHaveBeenNthCalledWith(
      1,
      "/rooms/search?subject=cat",
    );

    expect(rooms).toBeInstanceOf(Array);
  });
});
