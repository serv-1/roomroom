import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExpandableRoom from ".";
import renderRouter from "../SignInPage/renderRouter";
import axios from "../Root/axios";

jest.mock("../Root/axios");

jest.mock("../Room", () => ({
  __esModule: true,
  default: ({ subject }: { subject: string }) => <div>{subject}</div>,
}));

const axiosMock = axios as jest.Mocked<typeof axios>;

const props = {
  id: 0,
  subject: "Yo",
  scope: "public" as const,
  updatedAt: "01/01/01",
};

describe("<ExpandableRoom />", () => {
  it("expands and hides", async () => {
    renderRouter([{ path: "/", element: <ExpandableRoom {...props} /> }]);

    let deleteBtn = screen.queryByRole("button", { name: /delete/i });
    expect(deleteBtn).not.toBeInTheDocument();

    const expandBtn = screen.getByRole("button", { name: /expand/i });
    expect(expandBtn).toHaveTextContent(/expand_more/i);

    await userEvent.click(expandBtn);

    deleteBtn = screen.getByRole("button", { name: /delete/i });
    expect(deleteBtn).toBeInTheDocument();

    expect(expandBtn).toHaveAttribute("aria-label", "Hide");
    expect(expandBtn).toHaveTextContent(/expand_less/i);
    await userEvent.click(expandBtn);

    expect(deleteBtn).not.toBeInTheDocument();
  });

  it("does not render the invite button if the chat room is public", async () => {
    renderRouter([{ path: "/", element: <ExpandableRoom {...props} /> }]);

    const expandBtn = screen.getByRole("button", { name: /expand/i });
    await userEvent.click(expandBtn);

    const inviteBtn = screen.queryByRole("button", { name: /invite/i });
    expect(inviteBtn).not.toBeInTheDocument();
  });

  it("renders the invite button if the chat room is private", async () => {
    renderRouter([
      { path: "/", element: <ExpandableRoom {...props} scope="private" /> },
    ]);

    const expandBtn = screen.getByRole("button", { name: /expand/i });
    await userEvent.click(expandBtn);

    const inviteBtn = screen.getByRole("button", { name: /invite/i });
    expect(inviteBtn).toBeInTheDocument();
  });

  it("does not render if it is deleted", async () => {
    renderRouter([{ path: "/", element: <ExpandableRoom {...props} /> }]);

    const expandBtn = screen.getByRole("button", { name: /expand/i });
    await userEvent.click(expandBtn);

    let deleteBtn = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteBtn);

    deleteBtn = screen.getAllByRole("button", { name: /delete/i })[1];
    await userEvent.click(deleteBtn);

    await waitFor(() => expect(expandBtn).not.toBeInTheDocument());
  });

  it("updates the subject", async () => {
    renderRouter([{ path: "/", element: <ExpandableRoom {...props} /> }]);

    const expandBtn = screen.getByRole("button", { name: /expand/i });
    await userEvent.click(expandBtn);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "New Yo");

    const submitBtn = screen.getByRole("button", { name: /update/i });
    await userEvent.click(submitBtn);

    const subject = await screen.findByText(/new yo/i);
    expect(subject).toBeInTheDocument();

    expect(axiosMock.put).toHaveBeenNthCalledWith(1, "/rooms/0", {
      data: { subject: "New Yo" },
      csrf: true,
    });
  });
});
