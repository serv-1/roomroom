import { ReactComponent as CameraIcon } from "../../images/photo_camera_24.svg";
import { ReactComponent as SendIcon } from "../../images/send_24.svg";
import { ReactComponent as GifBoxIcon } from "../../images/gif_box_24.svg";
import { ReactComponent as CloseIcon } from "../../images/close_24.svg";
import { array, mixed, object, string, ValidationError } from "yup";
import { useWebSocket } from "../WebSocketProvider";
import { useRef, useState } from "react";
import addToS3 from "../ProfilePage/addToS3";
import Alert from "../Alert";
import GifSearchBox from "../GifSearchBox";
import classNames from "classnames";
import { Gif } from "@giphy/react-components";
import { IGif } from "../ChatMessageBox";

interface MessageData {
  images?: string[];
  videos?: string[];
  text?: string;
  roomId: number;
  gif?: string | number;
}

const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const videoMimeTypes = [
  "video/webm",
  "video/ogg",
  "video/mpeg",
  "video/mp4",
  "video/x-msvideo",
];

const schema = object({
  files: array(
    mixed()
      .test(
        "type",
        "An image (.jpg, .jpeg, .png, .gif) or a video (.avi, .ogg, .mpeg, .mp4, .webm) is expected.",
        (value: File) => {
          return (
            value.size === 0 ||
            imageMimeTypes.includes(value.type) ||
            videoMimeTypes.includes(value.type)
          );
        },
      )
      .test(
        "size",
        "The image maximum size is 1mb. The video maximum size is 100mb.",
        (value: File) => {
          if (imageMimeTypes.includes(value.type)) {
            return value.size < 1_000_000;
          }
          return value.size < 100_000_000;
        },
      ),
  ).typeError("The images/videos are invalid."),
  text: string()
    .max(500, "The message can not exceed 500 characters.")
    .typeError("The message is invalid."),
});

interface ChatRoomSendBarProps {
  roomId: number;
}

const ChatRoomSendBar = ({ roomId }: ChatRoomSendBarProps) => {
  const [error, setError] = useState<string>();
  const [isGifSearchBoxOpen, setIsGifSearchBoxOpen] = useState(false);
  const [gif, setGif] = useState<IGif>();

  const { send } = useWebSocket();

  const filesInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!send || !textAreaRef.current || !filesInputRef.current) return;

    const formData = new FormData(e.currentTarget);
    const text = formData.get("text") as string;
    const files = formData.getAll("files") as File[];

    if (!text && !files[0].size && !gif) return;

    try {
      await schema.validate({ files, text });

      const images: string[] = [];
      const videos: string[] = [];

      if (files[0].size) {
        for (const file of files) {
          const key = await addToS3(file);

          if (imageMimeTypes.includes(file.type)) {
            images.push(key);
            continue;
          }

          videos.push(key);
        }
      }

      const data: MessageData = { roomId };

      if (images.length) data.images = images;
      if (videos.length) data.videos = videos;
      if (gif) data.gif = gif.id;
      if (text) data.text = text;

      send("message", data);

      textAreaRef.current.value = "";
      filesInputRef.current.value = "";

      resizeTextArea(textAreaRef.current);

      setIsGifSearchBoxOpen(false);
      setGif(undefined);
    } catch (e) {
      if (e instanceof ValidationError) {
        setError((e as ValidationError).message);
        return;
      }

      setError("For an unknown reason your files could not be uploaded.");
    }
  };

  const resizeTextArea = (e: HTMLTextAreaElement) => {
    e.style.height = "0";

    if (e.scrollHeight > 104) {
      e.style.height = "104px";
    } else {
      e.style.height = e.scrollHeight + "px";
      e.style.bottom = e.scrollHeight - 32 + "px";
    }
  };

  return (
    <>
      <div className="relative shadow-8 lg:border-t-2 lg:border-r-2 lg:border-blue-600 lg:shadow-none lg:dark:border-blue-500">
        {gif && (
          <div className="absolute -top-1 right-2 -translate-y-full">
            <div className="relative">
              <Gif
                gif={gif}
                width={window.innerWidth > 744 ? 200 : 100}
                className="border-4 border-fuchsia-400"
                hideAttribution
                noLink
              />
              <button
                className="absolute -top-1 -right-1 rounded-full bg-fuchsia-400 text-dark"
                onClick={() => setGif(undefined)}
                aria-label="Deselect the gif"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}
        <form
          method="post"
          noValidate
          encType="multipart/form-data"
          onSubmit={onSubmit}
          className="z-10 flex h-12 w-full flex-row flex-nowrap items-center gap-x-2 bg-blue-600 p-2 dark:bg-dark-3 md:h-14 md:py-3 lg:bg-blue-50 lg:dark:bg-dark"
        >
          <input
            ref={filesInputRef}
            className="hidden"
            type="file"
            name="files"
            multiple
          />
          <button
            type="button"
            className="text-blue-50 dark:text-blue-500 lg:text-blue-600 lg:dark:text-blue-500"
            onClick={() => filesInputRef.current?.click()}
            aria-label="Upload images/videos"
          >
            <CameraIcon />
          </button>
          <button
            type="button"
            className={classNames(
              isGifSearchBoxOpen &&
                "rounded bg-blue-50/30 p-0.5 shadow-2 dark:bg-dark-24/50",
              "text-blue-50 dark:text-blue-500 lg:text-blue-600 lg:dark:text-blue-500",
            )}
            onClick={() => setIsGifSearchBoxOpen(!isGifSearchBoxOpen)}
            aria-label={(isGifSearchBoxOpen ? "Close" : "Open") + " Gif Box"}
          >
            <GifBoxIcon />
          </button>
          <textarea
            className="scrollbar relative h-8 max-h-[104px] w-full resize-none self-start rounded-lg bg-blue-700 p-1 text-blue-50 placeholder:text-blue-200 dark:bg-dark dark:placeholder:text-[rgba(243,242,253,35%)] lg:bg-blue-100 lg:text-dark lg:placeholder:text-blue-600 lg:dark:bg-dark-1 lg:dark:text-blue-50 lg:dark:placeholder:text-blue-500"
            placeholder="Type here..."
            name="text"
            onInput={(e) => resizeTextArea(e.currentTarget)}
            ref={textAreaRef}
          ></textarea>
          <button
            className="text-blue-50 dark:text-blue-500 lg:text-blue-600 lg:dark:text-blue-500"
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </form>
        <GifSearchBox isOpen={isGifSearchBoxOpen} setGif={setGif} />
      </div>
      <Alert text={error} />
    </>
  );
};

export default ChatRoomSendBar;
