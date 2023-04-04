import SignInPage from ".";
import renderRouter from "../SignInPage/renderRouter";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("<SignInPage />", () => {
  it("renders a message indicating that an email has been sent", async () => {
    renderRouter([{ path: "/", element: <SignInPage />, action: () => true }]);

    let text = screen.queryByText(/we have sent you/i);
    expect(text).not.toBeInTheDocument();

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "a@a.a");

    const submitBtn = screen.getByRole("button", { name: /send/i });
    await userEvent.click(submitBtn);

    text = screen.getByText(/we have sent you/i);
    expect(text).toBeInTheDocument();

    expect(emailInput).not.toBeInTheDocument();
  });
});
