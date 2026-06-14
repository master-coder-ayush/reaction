import { FlaskConical } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-app flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="gradient-brand shadow-soft mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white">
            <FlaskConical className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Level Up Chemistry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn organic reactions into a game.
          </p>
        </div>
        <div className="card-soft shadow-soft-lg p-6 sm:p-8">{children}</div>
      </div>
    </main>
  );
}
