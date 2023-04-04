interface FieldErrorProps {
  error?: string;
}

const FieldError = ({ error }: FieldErrorProps) => {
  return (
    <span
      role="alert"
      className="mt-1 break-words text-red-700 dark:text-red-500"
    >
      {error}
    </span>
  );
};

export default FieldError;
