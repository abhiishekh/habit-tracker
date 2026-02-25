import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";

interface props {
    loadingText: string;
    buttonText: string
}

export function SubmitButton({loadingText, buttonText}:props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-2xl
        bg-indigo-600 px-7 py-4 text-sm font-bold text-white
        shadow-lg shadow-indigo-500/25 transition-all
        hover:bg-indigo-700 hover:shadow-indigo-500/40
        active:scale-95 disabled:opacity-50"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          {loadingText}...
        </span>
      ) : (
        <>
          {buttonText}
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}