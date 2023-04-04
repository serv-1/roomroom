import { useRef, useState } from "react";
import { Grid } from "@giphy/react-components";
import giphy from "../../giphy";
import "./index.css";
import { IGif } from "../ChatMessageBox";

interface GifSearchBoxProps {
  isOpen: boolean;
  setGif: React.Dispatch<React.SetStateAction<IGif | undefined>>;
}

const GifSearchBox = ({ isOpen, setGif }: GifSearchBoxProps) => {
  const [searchKey, setSearchKey] = useState<string>();

  const container = useRef<HTMLDivElement>(null);

  const fetchGifs = async (offset: number) => {
    if (searchKey) {
      return await giphy.search(searchKey, { offset, limit: 10 });
    }

    return await giphy.trending({ offset, limit: 10 });
  };

  const isScreenLarge = window.innerWidth > 744;

  return (
    <div ref={container}>
      {isOpen && (
        <>
          <input
            type="search"
            placeholder="Search..."
            onChange={(e) => setSearchKey(e.target.value)}
            className="w-full bg-blue-700 p-2 text-blue-50 placeholder:text-blue-200 dark:bg-dark dark:placeholder:text-blue-50/30 lg:border-y-2 lg:border-blue-600 lg:bg-blue-50 lg:text-dark lg:placeholder:text-blue-600 lg:dark:text-blue-50 lg:dark:placeholder:text-blue-500"
          />
          <div className="gifBox h-56 overflow-y-scroll bg-blue-900 pt-2 dark:bg-dark-1 md:pt-4 lg:bg-blue-50 lg:dark:bg-dark">
            {container.current && (
              <Grid
                className="m-auto"
                width={
                  container.current.clientWidth - (isScreenLarge ? 32 : 16)
                }
                columns={isScreenLarge ? 3 : 2}
                gutter={isScreenLarge ? 16 : 8}
                fetchGifs={fetchGifs}
                key={searchKey}
                hideAttribution
                noLink
                onGifClick={setGif}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GifSearchBox;
