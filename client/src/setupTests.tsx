import "@testing-library/jest-dom";

jest.mock("./env", () => ({
  __esModule: true,
  default: {
    GIPHY_API_KEY: "giphyApiKey",
    AWS_URL: "awsUrl",
    WS_URL: "ws://wsUrl",
  },
}));

jest.mock("react-modal", () => {
  const Modal = ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => isOpen && <div role="dialog">{children}</div>;

  Modal.setAppElement = () => null;

  return {
    __esModule: true,
    default: Modal,
  };
});
