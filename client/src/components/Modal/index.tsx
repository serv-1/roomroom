import { useEffect } from "react";
import ReactModal from "react-modal";
import { useLocation } from "react-router-dom";
import { ReactComponent as CloseIcon } from "../../images/close_24.svg";
import "./index.css";

interface ModalProps {
  isOpen: boolean;
  onModalClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onModalClose, title, children }: ModalProps) => {
  ReactModal.setAppElement("#root");

  const location = useLocation();

  useEffect(() => {
    if (isOpen) onModalClose();
  }, [location.pathname]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onModalClose}
      closeTimeoutMS={900}
      aria={{ labelledby: "title" }}
      className={{
        base: "modal",
        afterOpen: "modal--open",
        beforeClose: "modal--close",
      }}
      overlayClassName={{
        base: "modal__overlay",
        afterOpen: "modal__overlay--open",
        beforeClose: "modal__overlay--close",
      }}
      portalClassName="fixed top-0 left-0 z-30"
      bodyOpenClassName="overflow-hidden"
      htmlOpenClassName="overflow-hidden"
    >
      <div className="flew-nowrap flex flex-row items-center">
        <h2 id="title" className="w-full text-5">
          {title}
        </h2>
        <button onClick={onModalClose} tabIndex={0} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      {children}
    </ReactModal>
  );
};

export default Modal;
