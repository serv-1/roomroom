import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef } from "react";
import ScrollToBottomButton from ".";
import useIntersectionObserver from "../ChatMessageBox/useIntersectionObserver";

jest.mock("../ChatMessageBox/useIntersectionObserver");

const mockUseIntersectionObserver =
  useIntersectionObserver as jest.MockedFunction<
    typeof useIntersectionObserver
  >;

const scrollBy = jest.fn();
Element.prototype.scrollBy = scrollBy;

interface TestProps {
  isThereUnseenMsg?: boolean;
}

const Test = ({ isThereUnseenMsg }: TestProps) => {
  const scrollableElement = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollableElement}>
      <div ref={target}></div>
      <ScrollToBottomButton
        scrollableElement={scrollableElement}
        target={target}
        isThereUnseenMsg={isThereUnseenMsg || false}
      />
    </div>
  );
};

describe("<ScrollToBottomButton />", () => {
  it("does not render by default", () => {
    render(<Test />);

    const btn = screen.queryByRole("button");
    expect(btn).not.toBeInTheDocument();
  });

  describe("when the target is not visible", () => {
    it("does not render if there is an unseen message", () => {
      mockUseIntersectionObserver.mockImplementation((ref, cb, opts) => {
        useEffect(() => {
          if (!ref.current) return;
          cb(
            [{ isIntersecting: false } as unknown as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
        }, opts?.deps);
      });

      render(<Test isThereUnseenMsg />);

      const btn = screen.queryByRole("button");
      expect(btn).not.toBeInTheDocument();
    });

    it("renders if there is no unseen message", () => {
      mockUseIntersectionObserver.mockImplementation((ref, cb, opts) => {
        useEffect(() => {
          if (!ref.current) return;
          cb(
            [{ isIntersecting: false } as unknown as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
        }, opts?.deps);
      });

      render(<Test />);

      const btn = screen.getByRole("button");
      expect(btn).toBeInTheDocument();
    });
  });

  it("does not render when the target is visible", () => {
    mockUseIntersectionObserver.mockImplementation((ref, cb, opts) => {
      useEffect(() => {
        if (!ref.current) return;
        cb(
          [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }, opts?.deps);
    });

    render(<Test />);

    const btn = screen.queryByRole("button");
    expect(btn).not.toBeInTheDocument();
  });

  it("scrolls to the bottom of the scrollableElement on click", async () => {
    mockUseIntersectionObserver.mockImplementation((ref, cb, opts) => {
      useEffect(() => {
        if (!ref.current) return;
        cb(
          [{ isIntersecting: false } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }, opts?.deps);
    });

    render(<Test />);

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    expect(scrollBy).toHaveBeenNthCalledWith(1, { top: 0, behavior: "smooth" });
  });
});
