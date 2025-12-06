import Image from "next/image";
import { Suspense } from "react";

const donationTiers = [
  {
    label: "Blessings Tier",
    amount: "$25",
    description: "Support daily incense, temple upkeep, and shared prayer offerings.",
  },
  {
    label: "Harmony Tier",
    amount: "$50",
    description: "Contribute to community meals and weekly Dharma classes for seniors.",
  },
  {
    label: "Lotus Guardian",
    amount: "$100",
    description: "Sustain heritage preservation, youth outreach, and festival preparations.",
  },
];

const benefits = [
  {
    title: "Secure Singpass login",
    copy: "Authenticate with Singpass before donating so your receipt is auto-filled with your verified details.",
  },
  {
    title: "Transparent impact",
    copy: "Each gift supports cultural preservation, charitable aid, and the temple's daily operations.",
  },
  {
    title: "Receipts made simple",
    copy: "Receive e-receipts instantly with your NRIC/FIN captured for tax submission.",
  },
];

const faqs = [
  {
    question: "Can I donate without a Singpass login?",
    answer:
      "Singpass login is encouraged for secure authentication and accurate receipts, but manual entry is available at the counter on-site.",
  },
  {
    question: "Will I receive a tax deduction?",
    answer:
      "Yes. After you authenticate with Singpass, we tag your NRIC/FIN to your receipt for tax deduction submission.",
  },
  {
    question: "How are funds used?",
    answer:
      "Donations sustain daily prayers, welfare distributions, cultural festivals, and upkeep of the temple grounds.",
  },
];

function SingpassButton() {
  return (
    <a
      href="/api/auth/myinfo"
      className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ED1C24]"
      aria-label="Continue with Singpass to start your donation"
    >
      <Image
        src="/singpass_logo_fullcolours.svg"
        alt="Singpass login"
        width={140}
        height={40}
        priority
      />
      <span className="sr-only">Login with Singpass</span>
      <span className="pointer-events-none absolute inset-0 rounded-full border border-transparent transition group-hover:border-black/5" />
    </a>
  );
}

function StatusBanner({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const isSuccess = type === "success";
  return (
    <div
      className={`flex w-full items-start gap-3 rounded-2xl p-4 text-sm md:text-base ${
        isSuccess
          ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100"
          : "bg-red-50 text-red-900 ring-1 ring-red-100"
      }`}
    >
      <div
        className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${
          isSuccess ? "bg-emerald-500" : "bg-red-500"
        }`}
        aria-hidden
      >
        {isSuccess ? "✓" : "!"}
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{isSuccess ? "Logged in" : "Authentication issue"}</p>
        <p className="text-sm leading-6 text-current/80">{message}</p>
      </div>
    </div>
  );
}

function HeroSection({ status }: { status?: { type: "success" | "error"; message: string } }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-100 px-6 py-12 shadow-sm ring-1 ring-orange-100 md:px-12 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,115,33,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(234,88,12,0.1),transparent_30%)]" aria-hidden />
      <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          {status && <StatusBanner type={status.type} message={status.message} />}
          <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 ring-1 ring-orange-100">
            Temple Giving · Since 1952
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
              Offer a gift. Sustain the temple. Bless the community.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-700">
              This dedicated donation portal supports Lotus Heart Temple's heritage, seniors outreach, and daily prayers.
              Authenticate securely with Singpass and complete your offering in minutes.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SingpassButton />
            <p className="text-sm text-zinc-600">
              Fast, secure login via Singpass. You can still browse tiers before signing in.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-zinc-600">Community meals monthly</dt>
              <dd className="text-2xl font-semibold text-zinc-900">1,200+</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-600">Years serving devotees</dt>
              <dd className="text-2xl font-semibold text-zinc-900">72</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-zinc-600">Festival beneficiaries</dt>
              <dd className="text-2xl font-semibold text-zinc-900">15k</dd>
            </div>
          </dl>
        </div>
        <div className="relative h-full">
          <div className="relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-orange-100">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100" />
              <div>
                <p className="text-sm font-semibold text-orange-800">Lotus Heart Temple</p>
                <p className="text-xs text-zinc-500">Online Offerings Centre</p>
              </div>
            </div>
            <div className="space-y-4">
              {donationTiers.map((tier) => (
                <div
                  key={tier.label}
                  className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/60 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-orange-700">{tier.label}</p>
                      <p className="text-xl font-semibold text-zinc-900">{tier.amount}</p>
                    </div>
                    <button className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow hover:-translate-y-0.5 hover:shadow-lg transition">
                      Donate
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{tier.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-orange-900 px-4 py-3 text-sm text-orange-50">
              Prefer recurring offerings? We can arrange monthly deductions after your Singpass login.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-100 md:grid-cols-3">
      {benefits.map((item) => (
        <div key={item.title} className="space-y-3 rounded-2xl border border-zinc-100 bg-gradient-to-br from-zinc-50 to-white p-5">
          <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
          <p className="text-sm leading-6 text-zinc-600">{item.copy}</p>
        </div>
      ))}
    </section>
  );
}

function StepsSection() {
  const steps = [
    {
      title: "Login with Singpass",
      description: "Tap the official Singpass button to authenticate securely and pre-fill your particulars.",
    },
    {
      title: "Choose your offering",
      description: "Select a giving tier or enter a custom amount for one-time or monthly gifts.",
    },
    {
      title: "Receive your receipt",
      description: "Get your e-receipt instantly with NRIC/FIN tagged for tax submission.",
    },
  ];

  return (
    <section className="grid gap-6 rounded-3xl bg-gradient-to-br from-orange-900 via-orange-800 to-amber-700 p-8 text-orange-50 shadow-sm ring-1 ring-orange-800/40 md:grid-cols-3">
      {steps.map((step, index) => (
        <div key={step.title} className="space-y-3 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-orange-200">Step {index + 1}</p>
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <p className="text-sm leading-6 text-orange-100">{step.description}</p>
        </div>
      ))}
    </section>
  );
}

function FAQSection() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Frequently asked</p>
          <h2 className="text-2xl font-semibold text-zinc-900">Questions from devotees</h2>
        </div>
        <a
          href="tel:+6565558888"
          className="text-sm font-semibold text-orange-800 underline decoration-2 decoration-orange-400 underline-offset-4"
        >
          Need help? Call the temple office
        </a>
      </div>
      <div className="mt-6 space-y-4">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-5">
            <h3 className="text-lg font-semibold text-zinc-900">{item.question}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="mt-10 flex flex-col gap-3 rounded-3xl bg-zinc-900 px-6 py-8 text-zinc-100 shadow-sm ring-1 ring-zinc-800 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Lotus Heart Temple</p>
        <p className="text-sm text-zinc-200">Online donation portal for devotees and well-wishers.</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-orange-100">
        <span>Secure payments</span>
        <span className="h-4 w-px bg-orange-200/50" aria-hidden />
        <span>24/7 availability</span>
        <span className="h-4 w-px bg-orange-200/50" aria-hidden />
        <span>Receipts emailed instantly</span>
      </div>
    </footer>
  );
}

function DonationPage({
  status,
}: {
  status?: { type: "success" | "error"; message: string };
}) {
  return (
    <div className="bg-zinc-50 pb-16 pt-12 font-sans text-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl bg-white/80 px-5 py-3 shadow-sm ring-1 ring-zinc-100 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600" />
            <div>
              <p className="text-sm font-semibold text-zinc-900">Lotus Heart Temple</p>
              <p className="text-xs text-zinc-500">Online Donation Portal</p>
            </div>
          </div>
          <a
            href="#donation"
            className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
          >
            Give now
          </a>
        </header>

        <HeroSection status={status} />

        <section id="donation" className="space-y-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Donation options</p>
              <h2 className="text-2xl font-semibold text-zinc-900">Choose an offering or enter a custom amount</h2>
            </div>
            <SingpassButton />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {donationTiers.map((tier) => (
              <div
                key={tier.label}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-gradient-to-b from-white to-orange-50/40 p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-orange-700">{tier.label}</p>
                <p className="text-3xl font-semibold text-zinc-900">{tier.amount}</p>
                <p className="text-sm leading-6 text-zinc-600">{tier.description}</p>
                <button className="mt-auto inline-flex justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  Donate {tier.amount}
                </button>
              </div>
            ))}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-dashed border-orange-200 bg-orange-50/70 p-5 text-zinc-800">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-orange-800">Custom amount</p>
                <p className="text-sm leading-6 text-zinc-700">
                  Prefer another amount? Enter your gift during checkout after you login with Singpass.
                </p>
              </div>
              <SingpassButton />
            </div>
          </div>
        </section>

        <BenefitsSection />
        <StepsSection />
        <FAQSection />
        <FooterSection />
      </div>
    </div>
  );
}

function MyInfoFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="space-y-6 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Loading</p>
            <p className="text-lg text-zinc-600">Preparing the donation experience…</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; error?: string; error_description?: string }>;
}) {
  return (
    <Suspense fallback={<MyInfoFallback />}>
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
      <DonationPage
        status={{ type: "error", message: error_description || error || "We could not authenticate you. Please try again." }}
      />
    );
  }

  if (name) {
    return (
      <DonationPage
        status={{ type: "success", message: `Welcome back, ${name}. You can proceed with your offering.` }}
      />
    );
  }

  return <DonationPage />;
}
