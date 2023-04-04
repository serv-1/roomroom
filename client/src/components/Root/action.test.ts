import axios from "./axios";
import action from "./action";
import { redirect } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  __esModule: true,
  redirect: jest.fn(),
}));

const axiosPost = jest.spyOn(axios, "post");

describe("action()", () => {
  it("calls the api to begin the authentication by email and returns true after a valid submission", async () => {
    const formData = new FormData();
    formData.set("email", "bob@bob.bob");

    const data = await action({
      request: {
        formData: jest.fn().mockResolvedValue(formData),
      } as unknown as Request,
      params: {},
    });

    expect(axiosPost).toHaveBeenNthCalledWith(1, "/auth/email", {
      data: { destination: formData.get("email") },
    });

    expect(data).toBe(true);
  });

  it("calls the api to create a room and redirects to /rooms/:id", async () => {
    axiosPost.mockResolvedValue({ data: { id: 0 } });

    const formData = new FormData();
    formData.set("subject", "My Room");
    formData.set("scope", "public");

    await action({
      request: {
        formData: jest.fn().mockResolvedValue(formData),
      } as unknown as Request,
      params: {},
    });

    expect(axiosPost).toHaveBeenNthCalledWith(1, "/rooms", {
      data: { subject: formData.get("subject"), scope: formData.get("scope") },
      csrf: true,
    });

    expect(redirect).toHaveBeenNthCalledWith(1, "/rooms/0");
  });
});
