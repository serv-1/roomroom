import { useEffect } from "react";

const useHtmlTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  });
};

export default useHtmlTitle;
