import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import useIntersectionObserver from "./useIntersectionObserver";

const observe = jest.fn();
const unobserve = jest.fn();
const entry = { isIntersecting: false };
let options: IntersectionObserverInit = {};

window.IntersectionObserver = class {
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords = () => [];
  disconnect = () => undefined;
  unobserve = unobserve;
  observe = observe;

  constructor(
    cb: IntersectionObserverCallback,
    opts?: IntersectionObserverInit,
  ) {
    cb([entry as IntersectionObserverEntry], this);
    if (opts) options = opts;
  }
};

interface TestProps {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  useDependencies?: boolean;
  isElementNull?: boolean;
}

const Test = ({
  callback,
  options,
  useDependencies,
  isElementNull,
}: TestProps) => {
  const [rerender, setRerender] = useState({});

  const ref = useRef<HTMLButtonElement>(null);

  useIntersectionObserver(ref, callback, {
    observerOptions: options,
    deps: useDependencies ? [rerender] : undefined,
  });

  return (
    <button
      ref={isElementNull ? undefined : ref}
      onClick={() => setRerender({})}
    >
      rerender
    </button>
  );
};

beforeEach(() => {
  options = {};
});

describe("useIntersectionObserver()", () => {
  it("does nothing if the element is null", () => {
    const callback = jest.fn();

    render(<Test callback={callback} isElementNull />);

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback", () => {
    const callback = jest.fn();

    render(<Test callback={callback} />);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("uses the options", () => {
    const opts = { threshold: 1 };

    render(<Test callback={() => null} options={opts} />);

    expect(options).toStrictEqual(opts);
  });

  it("observes the element", () => {
    render(<Test callback={() => null} />);

    expect(observe).toHaveBeenCalledTimes(1);
  });

  it("unobserves the element if the component is unmounted", () => {
    const { unmount } = render(<Test callback={() => null} />);

    unmount();

    expect(unobserve).toHaveBeenCalledTimes(1);
  });

  it("uses the dependencies", async () => {
    const callback = jest.fn();

    render(<Test callback={callback} useDependencies />);

    const btn = screen.getByRole("button");
    await userEvent.click(btn);

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
