import { AxiosError } from "axios";
import { useEffect } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

const RootError = () => {
  const error = useRouteError();
  const isErrorResponse = isRouteErrorResponse(error);

  let errorMessage = "Something broke! Refresh the page or come back later.";
  let status: number | undefined;
  let statusText: string | undefined;

  if (isErrorResponse) {
    status = error.status;
    statusText = error.statusText;
  } else if (error instanceof AxiosError) {
    status = error.response?.status;
    statusText = error.response?.statusText;
  }

  if (status === 404) errorMessage = "It seems that you are lost...";

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col justify-center gap-y-16 bg-blue-50 px-4 dark:bg-dark">
      <h1 className="self-center text-6 text-blue-600 dark:text-blue-500">
        <Link to="/">RoomRoom</Link>
      </h1>
      <p className="max-w-[456px] self-center text-1 text-red-700 dark:text-red-500">
        {errorMessage}
      </p>
      {status && statusText && (
        <span className="self-center dark:text-blue-50">
          {status + " - " + statusText}
        </span>
      )}
    </div>
  );
};

export default RootError;
