interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const formInputClass =
  'w-full px-3 py-2.5 rounded-lg border border-border text-text-primary placeholder:text-text-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-teal-accent focus:border-transparent transition';

export function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-text-primary mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
