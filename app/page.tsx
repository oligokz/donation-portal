import { Suspense } from 'react';

function MyInfoContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            MyInfo Test Integration
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Test the MyInfo integration by signing in with Singpass.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            href="/api/auth/myinfo"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#1D65A6] px-8 text-white transition-colors hover:bg-[#154a7f] md:w-auto"
          >
            Login with Singpass
          </a>
        </div>
      </main>
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; error?: string; error_description?: string }>;
}) {
  return (
    <Suspense fallback={<MyInfoContent />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeContent({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const { name, error, error_description } = params;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-red-600 dark:text-red-400">
              Authentication Error
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {error_description || error}
            </p>
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              href="/"
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#1D65A6] px-8 text-white transition-colors hover:bg-[#154a7f] md:w-auto"
            >
              Try Again
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (name) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Success!
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Name retrieved from MyInfo: <span className="font-semibold text-black dark:text-zinc-50">{name}</span>
            </p>
          </div>
          <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
            <a
              href="/"
              className="flex h-12 w-full items-center justify-center rounded-full bg-[#1D65A6] px-8 text-white transition-colors hover:bg-[#154a7f] md:w-auto"
            >
              Test Again
            </a>
          </div>
        </main>
      </div>
    );
  }

  return <MyInfoContent />;
}
