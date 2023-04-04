import { RefObject, useState } from "react";
import FAB from "../FAB";
import { ReactComponent as ArrowDownwardIcon } from "../../images/arrow_downward_24.svg";
import useIntersectionObserver from "../ChatMessageBox/useIntersectionObserver";

interface ScrollToBottomButtonProps {
  scrollableElement: RefObject<HTMLElement>;
  target: RefObject<HTMLElement>;
  isThereUnseenMsg: boolean;
}

const ScrollToBottomButton = ({
  scrollableElement,
  target,
  isThereUnseenMsg,
}: ScrollToBottomButtonProps) => {
  const [isDisplayed, setIsDisplayed] = useState(false);

  useIntersectionObserver(
    target,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        setIsDisplayed(false);
      } else if (!isThereUnseenMsg) {
        setIsDisplayed(true);
      }
    },
    { deps: [isDisplayed, isThereUnseenMsg] },
  );

  return isDisplayed ? (
    <FAB
      color="secondary"
      ariaLabel="Go to bottom"
      onClick={() => {
        scrollableElement.current?.scrollBy({
          top: scrollableElement.current.scrollHeight,
          behavior: "smooth",
        });
      }}
    >
      <ArrowDownwardIcon className="m-auto" />
    </FAB>
  ) : null;
};

export default ScrollToBottomButton;
