import { render, screen } from "@testing-library/react";
import Member from ".";

jest.mock("../BanConfirmationModal", () => ({
  __esModule: true,
  default: () => <div role="dialog">Ban Confirmation Modal Mock</div>,
}));

describe("<Member />", () => {
  it("renders correctly", () => {
    render(
      <Member
        roomSubject="test"
        id={0}
        name="bob"
        image={null}
        userId={0}
        creatorId={0}
        isRoomPrivate
      />,
    );

    const name = screen.getByText(/bob/i);
    expect(name).toBeInTheDocument();

    const banModal = screen.queryByRole("dialog");
    expect(banModal).not.toBeInTheDocument();
  });

  it("renders the ban modal", () => {
    render(
      <Member
        roomSubject="test"
        id={1}
        name="bob"
        image={null}
        userId={0}
        creatorId={0}
        isRoomPrivate
      />,
    );

    const banModal = screen.getByRole("dialog");
    expect(banModal).toBeInTheDocument();
  });

  it("does not render the ban modal if the room is public", () => {
    render(
      <Member
        roomSubject="test"
        id={1}
        name="bob"
        image={null}
        userId={0}
        creatorId={0}
        isRoomPrivate={false}
      />,
    );

    const banModal = screen.queryByRole("dialog");
    expect(banModal).not.toBeInTheDocument();
  });

  it("does not render the ban modal if the signed in user is not the creator of the room", () => {
    render(
      <Member
        roomSubject="test"
        id={1}
        name="bob"
        image={null}
        userId={0}
        creatorId={2}
        isRoomPrivate={false}
      />,
    );

    const banModal = screen.queryByRole("dialog");
    expect(banModal).not.toBeInTheDocument();
  });
});
