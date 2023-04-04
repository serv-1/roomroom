import { GifsResult } from "@giphy/js-fetch-api";
import { render, screen } from "@testing-library/react";
import GifSearchBox from ".";
import { IGif } from "../ChatMessageBox";
import { useEffect as mockUseEffect } from "react";
import giphy from "../../giphy";
import userEvent from "@testing-library/user-event";

interface GridProps {
  width: number;
  columns: number;
  gutter: number;
  fetchGifs: (offset: number) => Promise<GifsResult>;
  onGifClick: (gif: IGif, e: React.SyntheticEvent<HTMLElement, Event>) => void;
}

jest.mock("@giphy/react-components", () => ({
  __esModule: true,
  Grid: ({ width, columns, gutter, fetchGifs, onGifClick }: GridProps) => {
    mockUseEffect(() => {
      fetchGifs(15);
    });

    return (
      <div data-testid="gif" onClick={(e) => onGifClick({} as IGif, e)}>
        <div data-testid="width">{width}</div>
        <div data-testid="columns">{columns}</div>
        <div data-testid="gutter">{gutter}</div>
      </div>
    );
  },
}));

jest.mock("../../giphy");

const mockGiphy = giphy as jest.Mocked<typeof giphy>;

describe("<GifSearchBox />", () => {
  it("is closed", () => {
    render(<GifSearchBox isOpen={false} setGif={() => null} />);

    const searchInput = screen.queryByRole("searchbox");
    expect(searchInput).not.toBeInTheDocument();
  });

  it("is open and fetches the trending gifs", () => {
    render(<GifSearchBox isOpen={false} setGif={() => null} />).rerender(
      <GifSearchBox isOpen setGif={() => null} />,
    );

    const container = screen.getByRole("searchbox")
      .parentElement as HTMLDivElement;

    const width = screen.getByTestId("width");
    expect(width).toHaveTextContent(String(container.clientWidth - 32));

    const columns = screen.getByTestId("columns");
    expect(columns).toHaveTextContent("3");

    const gutter = screen.getByTestId("gutter");
    expect(gutter).toHaveTextContent("16");

    expect(mockGiphy.trending).toHaveBeenNthCalledWith(1, {
      offset: 15,
      limit: 10,
    });
  });

  it("renders a smaller grid on smaller screen", () => {
    window.innerWidth = 360;

    render(<GifSearchBox isOpen={false} setGif={() => null} />).rerender(
      <GifSearchBox isOpen setGif={() => null} />,
    );

    const container = screen.getByRole("searchbox")
      .parentElement as HTMLDivElement;

    const width = screen.getByTestId("width");
    expect(width).toHaveTextContent(String(container.clientWidth - 16));

    const columns = screen.getByTestId("columns");
    expect(columns).toHaveTextContent("2");

    const gutter = screen.getByTestId("gutter");
    expect(gutter).toHaveTextContent("8");
  });

  it("searches the gifs matching the search", async () => {
    render(<GifSearchBox isOpen={false} setGif={() => null} />).rerender(
      <GifSearchBox isOpen setGif={() => null} />,
    );

    const inputSearch = screen.getByRole("searchbox");
    await userEvent.type(inputSearch, "a");

    expect(giphy.search).toHaveBeenNthCalledWith(1, "a", {
      offset: 15,
      limit: 10,
    });
  });

  it("selects the gif by clicking on it", async () => {
    const setGif = jest.fn();

    render(<GifSearchBox isOpen={false} setGif={setGif} />).rerender(
      <GifSearchBox isOpen setGif={setGif} />,
    );

    const gif = screen.getByTestId("gif");
    await userEvent.click(gif);

    expect(setGif).toHaveBeenCalledTimes(1);
  });
});
