import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageFilesModal from ".";

describe("<MessageFilesModal />", () => {
  it("does not render if there is no images and no videos", () => {
    const { container } = render(<MessageFilesModal keys={[]} type="images" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("opens and closes", async () => {
    render(<MessageFilesModal keys={["img"]} type="images" />);

    const openBtn = screen.getByRole("button", { name: /see image/i });
    await userEvent.click(openBtn);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    expect(closeBtn).toBeInTheDocument();

    await userEvent.click(closeBtn);

    expect(closeBtn).not.toBeInTheDocument();
  });

  it("renders a grid with 1 row if there is 2 files", () => {
    const { container } = render(
      <MessageFilesModal type="images" keys={["1", "2"]} />,
    );

    const filesParent = container.firstElementChild;
    expect(filesParent).toHaveClass("grid grid-rows-1");
  });

  it("renders a grid with 2 rows if there is 3 or more files", () => {
    const { container } = render(
      <MessageFilesModal type="images" keys={["1", "2", "3"]} />,
    );

    const filesParent = container.firstElementChild;
    expect(filesParent).toHaveClass("grid grid-rows-2");
  });

  it("does not render a grid if there is 1 file", () => {
    const { container } = render(
      <MessageFilesModal type="images" keys={["1"]} />,
    );

    const filesParent = container.firstElementChild;
    expect(filesParent).not.toHaveClass("grid");
  });

  it("renders 1 image", async () => {
    render(<MessageFilesModal keys={["1"]} type="images" />);

    const openBtn = screen.getByRole("button", { name: /see image/i });
    expect(openBtn).not.toHaveClass("relative");
    expect(openBtn).toHaveClass("h-40");

    const openBtnImage = screen.getByRole("img");
    expect(openBtnImage).toHaveAttribute("src", "awsUrl/1");

    const plusOverlay = screen.queryByText(/\+-3/i);
    expect(plusOverlay).not.toBeInTheDocument();

    const videoOverlay = screen.queryByText(/play_arrow_24_fill/i);
    expect(videoOverlay).not.toBeInTheDocument();

    await userEvent.click(openBtn);

    const modalImage = screen.getAllByRole("img")[1];
    expect(modalImage).toHaveAttribute("src", "awsUrl/1");
  });

  it("renders 2 images", async () => {
    render(<MessageFilesModal keys={["1", "2"]} type="images" />);

    const openBtns = screen.getAllByRole("button", { name: /see images/i });

    expect(openBtns[0]).toHaveClass("aspect-square");
    expect(openBtns[1]).not.toHaveClass("relative");
    expect(openBtns[1]).toHaveClass("aspect-square");

    const openBtnsImages = screen.getAllByRole("img");
    expect(openBtnsImages[1]).toHaveAttribute("src", "awsUrl/2");

    const plusOverlay = screen.queryByText(/\+-2/i);
    expect(plusOverlay).not.toBeInTheDocument();

    await userEvent.click(openBtns[1]);

    const modalImage = screen.getAllByRole("img")[3];
    expect(modalImage).toHaveAttribute("src", "awsUrl/2");
  });

  it("renders 3 images", async () => {
    render(<MessageFilesModal keys={["1", "2", "3"]} type="images" />);

    const openBtns = screen.getAllByRole("button", { name: /see images/i });

    expect(openBtns[1]).toHaveClass("row-span-2");
    expect(openBtns[2]).not.toHaveClass("relative");
    expect(openBtns[2]).toHaveClass("aspect-square");

    const openBtnsImages = screen.getAllByRole("img");
    expect(openBtnsImages[2]).toHaveAttribute("src", "awsUrl/3");

    const plusOverlay = screen.queryByText(/\+-1/i);
    expect(plusOverlay).not.toBeInTheDocument();

    await userEvent.click(openBtns[2]);

    const modalImage = screen.getAllByRole("img")[5];
    expect(modalImage).toHaveAttribute("src", "awsUrl/3");
  });

  it("renders 4 images", async () => {
    render(<MessageFilesModal keys={["1", "2", "3", "4"]} type="images" />);

    const openBtns = screen.getAllByRole("button", { name: /see images/i });

    expect(openBtns[1]).toHaveClass("aspect-square");
    expect(openBtns[3]).not.toHaveClass("relative");
    expect(openBtns[3]).toHaveClass("aspect-square");

    const openBtnsImages = screen.getAllByRole("img");
    expect(openBtnsImages[3]).toHaveAttribute("src", "awsUrl/4");

    const plusOverlay = screen.queryByText(/\+0/i);
    expect(plusOverlay).not.toBeInTheDocument();

    await userEvent.click(openBtns[3]);

    const modalImage = screen.getAllByRole("img")[7];
    expect(modalImage).toHaveAttribute("src", "awsUrl/4");
  });

  it("renders 5 images", async () => {
    render(
      <MessageFilesModal keys={["1", "2", "3", "4", "5"]} type="images" />,
    );

    const openBtns = screen.getAllByRole("button", { name: /see images/i });

    expect(openBtns[3]).toHaveClass("relative");
    expect(openBtns[4]).toBeUndefined();

    const plusOverlay = screen.getByText(/\+1/i);
    expect(plusOverlay).toBeInTheDocument();

    await userEvent.click(openBtns[3]);

    const modalImage = screen.getAllByRole("img")[8];
    expect(modalImage).toHaveAttribute("src", "awsUrl/5");
  });

  it("renders 1 video", async () => {
    render(<MessageFilesModal keys={["1"]} type="videos" />);

    const openBtn = screen.getByRole("button", { name: /see video/i });
    expect(openBtn).toHaveClass("relative");
    expect(openBtn).toHaveClass("h-40");

    const openBtnVideo = openBtn.firstElementChild;
    expect(openBtnVideo).toHaveAttribute("src", "awsUrl/1");

    const plusOverlay = screen.queryByText(/\+-3/i);
    expect(plusOverlay).not.toBeInTheDocument();

    const videoOverlay = screen.getByText(/play_arrow_24_fill/i);
    expect(videoOverlay).toBeInTheDocument();

    await userEvent.click(openBtn);

    const modalVideo = screen.getByRole("application");
    expect(modalVideo).toHaveAttribute("src", "awsUrl/1");
  });

  it("renders 2 videos", async () => {
    render(<MessageFilesModal keys={["1", "2"]} type="videos" />);

    const openBtns = screen.getAllByRole("button", { name: /see videos/i });

    expect(openBtns[0]).toHaveClass("aspect-square");
    expect(openBtns[1]).toHaveClass("relative");
    expect(openBtns[1]).toHaveClass("aspect-square");

    const openBtnVideo = openBtns[1].firstElementChild;
    expect(openBtnVideo).toHaveAttribute("src", "awsUrl/2");

    const plusOverlay = screen.queryByText(/\+-2/i);
    expect(plusOverlay).not.toBeInTheDocument();

    const videoOverlay = screen.getAllByText(/play_arrow_24_fill/i)[1];
    expect(videoOverlay).toBeInTheDocument();

    await userEvent.click(openBtns[1]);

    const modalImage = screen.getAllByRole("application")[1];
    expect(modalImage).toHaveAttribute("src", "awsUrl/2");
  });

  it("renders 3 videos", async () => {
    render(<MessageFilesModal keys={["1", "2", "3"]} type="videos" />);

    const openBtns = screen.getAllByRole("button", { name: /see videos/i });

    expect(openBtns[2]).toHaveClass("relative");
    expect(openBtns[2]).toHaveClass("col-span-2");

    const openBtnsVideo = openBtns[2].firstElementChild;
    expect(openBtnsVideo).toHaveAttribute("src", "awsUrl/3");

    const plusOverlay = screen.queryByText(/\+-1/i);
    expect(plusOverlay).not.toBeInTheDocument();

    const videoOverlay = screen.getAllByText(/play_arrow_24_fill/i)[2];
    expect(videoOverlay).toBeInTheDocument();

    await userEvent.click(openBtns[2]);

    const modalVideo = screen.getAllByRole("application")[2];
    expect(modalVideo).toHaveAttribute("src", "awsUrl/3");
  });

  it("renders 4 videos", async () => {
    render(<MessageFilesModal keys={["1", "2", "3", "4"]} type="videos" />);

    const openBtns = screen.getAllByRole("button", { name: /see videos/i });

    expect(openBtns[2]).toHaveClass("aspect-square");
    expect(openBtns[3]).toHaveClass("relative");
    expect(openBtns[3]).toHaveClass("aspect-square");

    const openBtnVideo = openBtns[3].firstElementChild;
    expect(openBtnVideo).toHaveAttribute("src", "awsUrl/4");

    const plusOverlay = screen.queryByText(/\+0/i);
    expect(plusOverlay).not.toBeInTheDocument();

    const videoOverlay = screen.getAllByText(/play_arrow_24_fill/i)[3];
    expect(videoOverlay).toBeInTheDocument();

    await userEvent.click(openBtns[3]);

    const modalVideo = screen.getAllByRole("application")[3];
    expect(modalVideo).toHaveAttribute("src", "awsUrl/4");
  });

  it("renders 5 videos", async () => {
    render(
      <MessageFilesModal keys={["1", "2", "3", "4", "5"]} type="videos" />,
    );

    const openBtns = screen.getAllByRole("button", { name: /see videos/i });

    expect(openBtns[4]).toBeUndefined();

    const plusOverlay = screen.getByText(/\+1/i);
    expect(plusOverlay).toBeInTheDocument();

    const videoOverlays = screen.getAllByText(/play_arrow_24_fill/i);
    expect(videoOverlays[3]).toBeUndefined();
    expect(videoOverlays[4]).toBeUndefined();

    await userEvent.click(openBtns[3]);

    const modalVideo = screen.getAllByRole("application")[4];
    expect(modalVideo).toHaveAttribute("src", "awsUrl/5");
  });
});
