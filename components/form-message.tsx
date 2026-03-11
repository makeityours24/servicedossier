type FormMessageProps = {
  error?: string;
  success?: string;
};

export function FormMessage({ error, success }: FormMessageProps) {
  if (error) {
    return <p className="melding-fout">{error}</p>;
  }

  if (success) {
    return <p className="melding-succes">{success}</p>;
  }

  return null;
}
