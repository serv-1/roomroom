import loader from "./loader";
import axios from "../Root/axios";
import { redirect } from "react-router-dom";

jest.mock("../Root/axios");

jest.mock("react-router-dom", () => ({
  __esModule: true,
  redirect: jest.fn(),
}));

const axiosMock = axios as jest.Mocked<typeof axios>;
const redirectMock = redirect as jest.MockedFunction<typeof redirect>;

describe("loader()", () => {
  it("redirects to / if the authenticated user is not a member of the private room", async () => {
    axiosMock.get
      .mockResolvedValue({ data: { id: 0 } })
      .mockResolvedValueOnce({ data: { scope: "private", memberIds: [] } });

    await loader({ params: { id: "0" }, request: new Request("/rooms/0") });

    expect(redirectMock).toHaveBeenNthCalledWith(1, "/");
  });

  it("does not redirects to / if the authenticated user is a member of the private room", async () => {
    axiosMock.get
      .mockResolvedValue({ data: { id: 0 } })
      .mockResolvedValueOnce({ data: { scope: "private", memberIds: [0] } });

    await loader({ params: { id: "0" }, request: new Request("/rooms/0") });

    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("never redirects to / if the room is public", async () => {
    axiosMock.get
      .mockResolvedValue({ data: { id: 0 } })
      .mockResolvedValueOnce({ data: { scope: "public", memberIds: [] } });

    await loader({ params: { id: "0" }, request: new Request("/rooms/0") });

    expect(redirectMock).not.toHaveBeenCalled();
  });
});
