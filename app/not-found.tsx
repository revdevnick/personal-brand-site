import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-4 font-display text-5xl">This path does not compile.</h1>
      <p className="mt-6 text-ink/70">The doorway is still the home page.</p>
      <p className="mt-10">
        <Link href="/" className="font-ui text-sm tracking-widest uppercase hover:text-accent">
          Home
        </Link>
      </p>
    </div>
  );
}
