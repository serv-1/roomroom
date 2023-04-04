import { render, screen } from "@testing-library/react";
import ThemeSwitch from ".";
import userEvent from "@testing-library/user-event";

describe("<ThemeSwitch />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is in light theme by default", () => {
    render(<ThemeSwitch />);

    const _switch = screen.getByRole("switch");
    expect(_switch).toHaveAccessibleName(/dark/i);
    expect(_switch).toHaveAttribute("aria-checked", "false");
    expect(_switch).toHaveClass("bg-blue-50");

    const icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-1");

    const darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-100");

    const lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-0");
  });

  it("is in dark theme if it is the current theme", () => {
    localStorage.setItem("theme", "dark");

    render(<ThemeSwitch />);

    const _switch = screen.getByRole("switch");
    expect(_switch).toHaveAccessibleName(/light/i);
    expect(_switch).toHaveAttribute("aria-checked", "true");
    expect(_switch).toHaveClass("bg-dark");

    const icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-7");

    const darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-0");

    const lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-100");
  });

  it("toggles the dark theme on click", async () => {
    render(<ThemeSwitch />);

    const _switch = screen.getByRole("switch");
    await userEvent.click(_switch);

    expect(_switch).toHaveAccessibleName(/light/i);
    expect(_switch).toHaveAttribute("aria-checked", "true");
    expect(_switch).toHaveClass("bg-dark");

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    let icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-7");

    let darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-0");

    let lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-100");

    await userEvent.click(_switch);

    expect(_switch).toHaveAccessibleName(/dark/i);
    expect(_switch).toHaveAttribute("aria-checked", "false");
    expect(_switch).toHaveClass("bg-blue-50");

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");

    icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-1");

    darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-100");

    lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-0");
  });

  it("toggles the dark theme if it is focused and Enter is pressed", async () => {
    render(<ThemeSwitch />);

    const _switch = screen.getByRole("switch");

    _switch.focus();
    await userEvent.keyboard("{Enter}");

    expect(_switch).toHaveAccessibleName(/light/i);
    expect(_switch).toHaveAttribute("aria-checked", "true");
    expect(_switch).toHaveClass("bg-dark");

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    let icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-7");

    let darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-0");

    let lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-100");

    await userEvent.keyboard("{Enter}");

    expect(_switch).toHaveAccessibleName(/dark/i);
    expect(_switch).toHaveAttribute("aria-checked", "false");
    expect(_switch).toHaveClass("bg-blue-50");

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");

    icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-1");

    darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-100");

    lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-0");
  });

  it("toggles the dark theme if it is focused and Space is pressed", async () => {
    render(<ThemeSwitch />);

    const _switch = screen.getByRole("switch");

    _switch.focus();
    await userEvent.keyboard(" ");

    expect(_switch).toHaveAccessibleName(/light/i);
    expect(_switch).toHaveAttribute("aria-checked", "true");
    expect(_switch).toHaveClass("bg-dark");

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    let icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-7");

    let darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-0");

    let lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-100");

    await userEvent.keyboard(" ");

    expect(_switch).toHaveAccessibleName(/dark/i);
    expect(_switch).toHaveAttribute("aria-checked", "false");
    expect(_switch).toHaveClass("bg-blue-50");

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");

    icons = _switch.firstElementChild as HTMLDivElement;
    expect(icons).toHaveClass("left-1");

    darkIcon = icons.firstElementChild as SVGSVGElement;
    expect(darkIcon).toHaveClass("opacity-100");

    lightIcon = darkIcon.nextElementSibling as SVGSVGElement;
    expect(lightIcon).toHaveClass("opacity-0");
  });
});
