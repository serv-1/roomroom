import useForm, { Callback } from "./useForm";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { object, string, number, ObjectSchema } from "yup";
import { useEffect } from "react";

const mockSubmit = jest.fn();

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useSubmit: () => mockSubmit,
}));

const schema = object({
  email: string()
    .required("email required")
    .email("email invalid")
    .typeError("email invalid"),
  age: number().required("age required").typeError("age invalid"),
});

let emailError: string | undefined;
let ageError: string | undefined;

interface TestFormProps {
  error?: { field: "email" | "age"; error: string };
  callback?: Callback<typeof schema extends ObjectSchema<infer T> ? T : never>;
}

const TestForm = ({ error, callback }: TestFormProps) => {
  const { errors, handleSubmit, validate, setError } = useForm(schema);

  useEffect(() => {
    if (!error) return;
    setError(error.field, error.error);
  }, [error]);

  return (
    <form
      method="post"
      onSubmit={handleSubmit(callback)}
      noValidate
      data-testid="form"
    >
      <input
        type="email"
        name="email"
        onChange={async (e) => {
          const error = await validate("email", e.currentTarget.value);
          emailError = error;
        }}
      />
      <span role="alert">{errors.email}</span>

      <input
        type="number"
        name="age"
        onChange={async (e) => {
          const error = await validate("age", e.currentTarget.value);
          ageError = error;
        }}
      />
      <span role="alert">{errors.age}</span>

      <input type="submit" value="Submit" />
    </form>
  );
};

beforeEach(() => {
  emailError = undefined;
  ageError = undefined;
});

describe("useForm()", () => {
  it("does not render the errors if the form is not submitted yet", async () => {
    render(<TestForm />);

    let errors = screen.getAllByRole("alert");
    expect(errors[0]).toBeEmptyDOMElement();
    expect(errors[1]).toBeEmptyDOMElement();

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "a");

    const ageInput = screen.getByRole("spinbutton");
    await userEvent.type(ageInput, "a");

    errors = screen.getAllByRole("alert");
    expect(errors[0]).toBeEmptyDOMElement();
    expect(errors[1]).toBeEmptyDOMElement();

    expect(emailError).toBeUndefined();
    expect(ageError).toBeUndefined();
  });

  it("renders the errors if the form is submitted with invalid fields", async () => {
    render(<TestForm />);

    const submitBtn = screen.getByRole("button");
    await userEvent.click(submitBtn);

    const htmlEmailError = screen.getByText(/email/i);
    expect(htmlEmailError).toBeInTheDocument();

    const htmlAgeError = screen.getByText(/age/i);
    expect(htmlAgeError).toBeInTheDocument();
  });

  it("removes the errors if the values are valid and rerenders them if they are invalid", async () => {
    render(<TestForm />);

    const submitBtn = screen.getByRole("button");
    await userEvent.click(submitBtn);

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "a@a.a");

    const ageInput = screen.getByRole("spinbutton");
    await userEvent.type(ageInput, "1");

    const errors = screen.getAllByRole("alert");
    expect(errors[0]).toBeEmptyDOMElement();
    expect(errors[1]).toBeEmptyDOMElement();

    expect(emailError).toBeUndefined();
    expect(ageError).toBeUndefined();

    await userEvent.clear(emailInput);
    await userEvent.clear(ageInput);

    expect(errors[0]).toHaveTextContent(/email/i);
    expect(errors[1]).toHaveTextContent(/age/i);

    expect(emailError).toMatch(/email/i);
    expect(ageError).toMatch(/age/i);
  });

  it("submits the form if there is no error", async () => {
    render(<TestForm />);

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "a@a.a");

    const ageInput = screen.getByRole("spinbutton");
    await userEvent.type(ageInput, "1");

    const submitBtn = screen.getByRole("button");
    await userEvent.click(submitBtn);

    expect(mockSubmit).toHaveBeenCalledTimes(1);

    await userEvent.clear(emailInput);
    await userEvent.clear(ageInput);

    await userEvent.type(emailInput, "a@a.a");
    await userEvent.type(ageInput, "1");

    await userEvent.click(submitBtn);

    expect(mockSubmit).toHaveBeenCalledTimes(2);
  });

  it("does not submit the form if there is an error", async () => {
    render(<TestForm error={{ field: "age", error: "error" }} />);

    const submitBtn = screen.getByRole("button");
    await userEvent.click(submitBtn);

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("defines an external error", () => {
    render(<TestForm error={{ field: "age", error: "error" }} />);

    const htmlAgeError = screen.getAllByRole("alert")[1];
    expect(htmlAgeError).toHaveTextContent("error");
  });

  it("calls the callback if the form is submitted with no errors", async () => {
    const callback = jest.fn();

    render(<TestForm callback={callback} />);

    const emailInput = screen.getByRole("textbox");
    await userEvent.type(emailInput, "a@a.a");

    const ageInput = screen.getByRole("spinbutton");
    await userEvent.type(ageInput, "1");

    const submitBtn = screen.getByRole("button");
    await userEvent.click(submitBtn);

    expect(callback).toHaveBeenNthCalledWith(1, { email: "a@a.a", age: 1 });
  });
});
