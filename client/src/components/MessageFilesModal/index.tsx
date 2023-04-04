import classNames from "classnames";
import { useState } from "react";
import ReactModal from "react-modal";
import env from "../../env";
import { ReactComponent as CloseIcon } from "../../images/close_24.svg";
import { ReactComponent as PlayArrowIcon } from "../../images/play_arrow_24_fill.svg";

const awsUrl = env.AWS_URL + "/";

interface MessageFilesModalProps {
  type: "images" | "videos";
  keys: string[];
}

const MessageFilesModal = ({ type, keys }: MessageFilesModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const nb = keys.length;
  const isVideos = type === "videos";

  return nb ? (
    <>
      <div
        className={classNames(
          nb > 1 &&
            "grid grid-cols-2 gap-1 md:gap-1.5" +
              (nb > 2 ? " grid-rows-2" : " grid-rows-1"),
        )}
      >
        {keys.slice(0, 4).map((key, i) => (
          <button
            aria-label={
              "See " +
              ((type === "images" ? "image" : "video") + (nb > 1 ? "s" : ""))
            }
            onClick={() => setIsOpen(true)}
            key={key}
            className={classNames(
              (isVideos || (i === 3 && nb > 4)) && "relative",
              nb === 1
                ? "h-40 w-full align-bottom md:h-64"
                : !isVideos && i === 1 && nb === 3
                ? " row-span-2"
                : isVideos && i === 2 && nb === 3
                ? " col-span-2 h-[119px] md:h-[199px]"
                : " aspect-square",
            )}
          >
            {isVideos ? (
              <video
                src={awsUrl + key}
                className="h-full w-full rounded-lg object-cover"
                preload="metadata"
              />
            ) : (
              <img
                className="h-full w-full rounded-lg object-cover"
                src={awsUrl + key}
                alt=""
                loading="lazy"
              />
            )}
            {i === 3 && nb > 4 ? (
              <div className="absolute top-0 flex h-full w-full items-center justify-center rounded-lg bg-dark/80 text-4 text-blue-50">
                +{nb - 4}
              </div>
            ) : (
              isVideos && (
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-dark/80 p-3">
                  <PlayArrowIcon className="text-blue-50" />
                </div>
              )
            )}
          </button>
        ))}
      </div>
      <ReactModal
        isOpen={isOpen}
        className="h-screen overflow-y-auto bg-dark/95"
        overlayClassName="z-30 absolute w-screen h-screen top-0 left-0"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="flex w-full justify-end p-2"
          aria-label="Close"
        >
          <CloseIcon className="text-blue-50" />
        </button>
        <div className="flex flex-col gap-y-2 md:m-auto md:w-3/4 md:gap-y-4 lg:w-1/2">
          {keys.map((key) =>
            isVideos ? (
              <video
                key={key}
                role="application"
                src={awsUrl + key}
                controls
                preload="metadata"
              />
            ) : (
              <img key={key} src={awsUrl + key} alt="" loading="lazy" />
            ),
          )}
        </div>
      </ReactModal>
    </>
  ) : null;
};

export default MessageFilesModal;
