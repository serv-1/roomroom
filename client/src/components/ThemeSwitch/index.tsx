import classNames from "classnames";
import { useEffect, useState } from "react";
import { ReactComponent as DarkModeIcon } from "../../images/dark_mode_24.svg";
import { ReactComponent as LightModeIcon } from "../../images/light_mode_24.svg";

const ThemeSwitch = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const isDark = theme === "dark";

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div
      role="switch"
      tabIndex={0}
      aria-label={"Switch to " + (isDark ? "Light" : "Dark") + " theme"}
      aria-checked={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          setTheme(isDark ? "light" : "dark");
        }
      }}
      className={classNames(
        "relative m-auto h-8 w-14 cursor-pointer rounded-full p-1 transition-all duration-500 lg:border-2 lg:p-0.5",
        isDark ? "bg-dark lg:border-blue-50" : "bg-blue-50 lg:border-dark",
      )}
    >
      <div
        className={classNames(
          "absolute top-1 transition-[left] duration-500 lg:top-0.5",
          isDark ? "left-7 lg:left-[26px]" : "left-1 lg:left-0.5",
        )}
      >
        <DarkModeIcon
          className={classNames(
            "absolute text-dark transition-opacity duration-500",
            isDark ? "opacity-0" : "opacity-100",
          )}
        />
        <LightModeIcon
          className={classNames(
            "absolute text-blue-50 transition-opacity duration-500",
            isDark ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
};

export default ThemeSwitch;
