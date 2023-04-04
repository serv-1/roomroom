import { render, screen } from "@testing-library/react";
import MessageListDate from ".";

describe("<MessageListDate />", () => {
  it("renders only the weekday if the year is the current year", () => {
    const date = new Date();

    render(<MessageListDate date={date} />);

    const expectedDate = date.toLocaleDateString("en-US", { weekday: "long" });

    const renderedDate = screen.getByText(
      new RegExp("^" + expectedDate + "$", "i"),
    );

    expect(renderedDate).toBeInTheDocument();
  });

  it("renders the full date if the year is not the current year", () => {
    const date = new Date();
    date.setFullYear(2020);

    render(<MessageListDate date={date} />);

    const expectedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const renderedDate = screen.getByText(
      new RegExp("^" + expectedDate + "$", "i"),
    );

    expect(renderedDate).toBeInTheDocument();
  });

  it("renders only the month and the day if the month is not the current month", () => {
    const date = new Date();
    const month = date.getMonth();

    date.setMonth(month > 0 ? month - 1 : month + 1);

    render(<MessageListDate date={date} />);

    const expectedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const renderedDate = screen.getByText(
      new RegExp("^" + expectedDate + "$", "i"),
    );

    expect(renderedDate).toBeInTheDocument();
  });

  it("renders only the day if the day is not the current day", () => {
    const date = new Date();
    const day = date.getDate();

    date.setDate(day > 1 ? day - 1 : day + 1);

    render(<MessageListDate date={date} />);

    const expectedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
    });

    const renderedDate = screen.getByText(
      new RegExp("^" + expectedDate + "$", "i"),
    );

    expect(renderedDate).toBeInTheDocument();
  });
});
