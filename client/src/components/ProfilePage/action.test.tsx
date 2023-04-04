import action from "./action";
import axios from "../Root/axios";
import addToS3 from "./addToS3";

jest.mock("./addToS3");

const addToS3Mock = addToS3 as jest.MockedFunction<typeof addToS3>;
const axiosPut = jest.spyOn(axios, "put");

describe("action()", () => {
  it("does not call the api if there is no data to update", async () => {
    const formData = new FormData();
    formData.set("image", new File([""], ""));
    formData.set("name", "");

    await action({
      request: {
        formData: jest.fn().mockResolvedValue(formData),
      } as unknown as Request,
      params: {},
    });

    expect(addToS3Mock).not.toHaveBeenCalled();
  });

  it("calls the api to update the user's data", async () => {
    const formData = new FormData();
    formData.set("name", "Bob");

    await action({
      request: {
        formData: jest.fn().mockResolvedValue(formData),
      } as unknown as Request,
      params: {},
    });

    expect(addToS3Mock).not.toHaveBeenCalled();
    expect(axiosPut).toHaveBeenNthCalledWith(1, "/user", {
      data: { name: formData.get("name") },
      csrf: true,
    });
  });

  it("calls the api to update the user's image", async () => {
    addToS3Mock.mockResolvedValue("key");

    const image = new File(["image"], "img.jpg");
    const formData = new FormData();
    formData.set("image", image);

    await action({
      request: {
        formData: jest.fn().mockResolvedValue(formData),
      } as unknown as Request,
      params: {},
    });

    expect(addToS3Mock).toHaveBeenNthCalledWith(1, image);
    expect(axiosPut).toHaveBeenNthCalledWith(1, "/user", {
      csrf: true,
      data: { image: "key" },
    });
  });

  it("throws an error if the server fails to update the user's data", async () => {
    const error = { response: { data: { error: "error" } } };
    axiosPut.mockRejectedValue(error);

    const formData = new FormData();
    formData.set("oh", "no");

    let result: typeof error | undefined;

    try {
      await action({
        request: {
          formData: jest.fn().mockResolvedValue(formData),
        } as unknown as Request,
        params: {},
      });
    } catch (e) {
      result = e as typeof error;
    }

    expect(result).toEqual(error);
  });

  it("returns the field name and the error of value which is already taken", async () => {
    const error = { field: "email", error: "email already taken" };
    axiosPut.mockRejectedValue({ response: { data: error } });

    const formData = new FormData();
    formData.set("email", "bob@bob.bob");

    const result = await action({
      request: {
        formData: jest.fn().mockResolvedValue(formData),
      } as unknown as Request,
      params: {},
    });

    expect(result).toEqual(error);
  });
});
