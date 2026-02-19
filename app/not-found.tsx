import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-6 text-center">
      <h2 className="text-9xl font-black text-slate-200 dark:text-zinc-800 select-none">
        404
      </h2>
      <div className="absolute">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Lost in the habit loop?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="text-indigo-500 font-semibold hover:underline underline-offset-4"
        >
          ← Back to safety
        </Link>
      </div>
    </div>
  );
}