"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Status = { type: "success" | "error"; message: string } | null;

type Event = {
  id: string;
  title: string;
  description: string;
  amount: string;
  tag: string;
  badge?: string;
};

const events: Event[] = [
  {
    id: "blessing",
    title: "Blessing Tier",
    description: "Support daily prayers, incense, and temple upkeep for community devotees.",
    amount: "$25",
    tag: "Ongoing temple events",
    badge: "Popular",
  },
  {
    id: "harmony",
    title: "Harmony Tier",
    description: "Contribute to community meals and weekly Dharma classes for seniors.",
    amount: "$50",
    tag: "Monthly giving",
  },
  {
    id: "guardian",
    title: "Lotus Guardian",
    description: "Sustain heritage preservation, youth outreach, and festival preparations.",
    amount: "$100",
    tag: "Festival support",
  },
];

const presetAmounts = {
  monthly: [8, 18, 38, 68],
  once: [25, 50, 100, 250],
};

const defaultMonthlyAmount = presetAmounts.monthly[0].toString();

function BorderedSingpassButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="/api/auth/myinfo"
      className={`group relative inline-flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ED1C24] ${className}`.trim()}
      aria-label="Continue with Singpass to start your donation"
    >
      <div className="flex items-center gap-3">
        <Image src="/singpass_logo_fullcolours.svg" alt="Singpass login" width={130} height={36} />
        <span className="hidden text-xs font-medium text-slate-600 sm:inline">Secure login via Singpass</span>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-lg border border-transparent transition group-hover:border-slate-200" />
    </a>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;

  const isSuccess = status.type === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm md:text-base ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
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
        <p className="text-sm leading-6 text-current/80">{status.message}</p>
      </div>
    </div>
  );
}

function SingpassLoginCard({ status }: { status: Status }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
        <span className="text-lg">ℹ️</span>
        <div>
          <p className="font-semibold">Important notice</p>
          <p className="text-xs leading-5 text-blue-900/80">
            Stay vigilant against suspicious SMSes and emails. We will never ask for your password or 2FA.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">Log in with</p>
        <BorderedSingpassButton className="w-full justify-center" />
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <span className="h-px w-full bg-slate-200" aria-hidden />
          or
          <span className="h-px w-full bg-slate-200" aria-hidden />
        </div>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Email address*</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            placeholder="Enter your email to continue"
            type="email"
            aria-label="Email address"
          />
        </label>
        <button className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-md">
          Continue
        </button>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <a className="underline decoration-2 underline-offset-4" href="#">
            Forgot password?
          </a>
          <a className="underline decoration-2 underline-offset-4" href="#">
            Sign up for an account
          </a>
        </div>
      </div>
      <StatusBanner status={status} />
    </div>
  );
}

function EventCard({
  event,
  active,
  onSelect,
}: {
  event: Event;
  active: boolean;
  onSelect: (event: Event) => void;
}) {
  return (
    <button
      onClick={() => onSelect(event)}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow ${
        active
          ? "border-orange-300 bg-orange-50/80 shadow-orange-200"
          : "border-slate-200 bg-white/70"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-sm font-semibold text-orange-800">
        {event.amount}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
          {event.badge && (
            <span className="rounded-full bg-orange-600/10 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
              {event.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600">{event.description}</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">{event.tag}</p>
      </div>
    </button>
  );
}

function DonationWizard({ event }: { event: Event }) {
  const [frequency, setFrequency] = useState<"monthly" | "once">("monthly");
  const [amount, setAmount] = useState(defaultMonthlyAmount);
  const [step, setStep] = useState<"amount" | "details">("amount");
  const [dedication, setDedication] = useState("");

  const amountOptions = useMemo(() => presetAmounts[frequency], [frequency]);
  const buttonLabel = step === "amount" ? `Donate ${frequency === "monthly" ? "monthly" : "now"}` : "Continue";

  useEffect(() => {
    setAmount(presetAmounts[frequency][0].toString());
  }, [frequency]);

  useEffect(() => {
    setFrequency("monthly");
    setAmount(defaultMonthlyAmount);
    setStep("amount");
    setDedication("");
  }, [event.id]);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Secure donation</p>
          <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
          <p className="text-sm text-slate-600">{event.description}</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Verified</div>
      </div>

      {step === "amount" ? (
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-700">
            <button
              className={`rounded-full px-3 py-1.5 transition ${
                frequency === "once" ? "bg-white shadow" : ""
              }`}
              onClick={() => setFrequency("once")}
            >
              Give once
            </button>
            <button
              className={`rounded-full px-3 py-1.5 transition ${
                frequency === "monthly" ? "bg-white shadow" : ""
              }`}
              onClick={() => setFrequency("monthly")}
            >
              Monthly
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 text-sm font-semibold text-slate-800">
            {amountOptions.map((value) => {
              const isActive = amount === value.toString();
              return (
                <button
                  key={value}
                  onClick={() => setAmount(value.toString())}
                  className={`rounded-lg border px-3 py-2 transition ${
                    isActive
                      ? "border-orange-400 bg-orange-50 text-orange-800 shadow"
                      : "border-slate-200 bg-white/70 hover:border-slate-300"
                  }`}
                >
                  ${value}
                </button>
              );
            })}
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-semibold">Custom amount (SGD)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base font-semibold shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              inputMode="decimal"
              aria-label="Custom donation amount"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Dedicate this donation</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Optional</span>
            </div>
            <input
              value={dedication}
              onChange={(e) => setDedication(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              placeholder="Write a short dedication"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-semibold">First name</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                placeholder="First name"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-semibold">Last name</span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                placeholder="Last name"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-semibold">Email address</span>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                placeholder="name@email.com"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Phone number</span>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Optional</span>
              </div>
              <input
                type="tel"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                placeholder="+65 8888 8888"
              />
            </label>
          </div>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
              <span>Donate as an organization</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
              <span>Donate anonymously</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <span>Subscribe to our mailing list</span>
            </label>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Amount selected: <span className="font-semibold text-slate-800">${amount}</span> {frequency === "monthly" ? "per month" : "one-time"}
        </div>
        <div className="flex gap-2">
          {step === "details" && (
            <button
              onClick={() => setStep("amount")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (step === "amount" ? setStep("details") : null)}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {step === "amount" ? `${buttonLabel}` : "Donate now"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DonationExperience({ status }: { status: Status }) {
  const [activeEvent, setActiveEvent] = useState<Event>(events[0]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950/80 text-slate-900">
      <div className="absolute inset-0">
        <Image
          src="/temple-backdrop.svg"
          alt="Lotus Heart Temple facade"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-slate-900/70 to-orange-900/50" aria-hidden />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-24">
              <Image src="/temple-logo.svg" alt="Lotus Heart Temple" fill className="object-contain" />
            </div>
            <div className="hidden items-center gap-4 text-xs font-semibold uppercase tracking-[0.2em] sm:flex">
              <a className="hover:text-orange-100" href="#donate">
                Donate
              </a>
              <a className="hover:text-orange-100" href="#events">
                Events
              </a>
              <a className="hover:text-orange-100" href="#stories">
                Stories
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
            <a className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-white shadow-sm transition hover:border-white/60" href="#">
              Log in
            </a>
            <a className="rounded-full bg-orange-500 px-3 py-1 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" href="#">
              Sign up
            </a>
          </div>
        </nav>

        <main className="grid grid-cols-1 gap-6 rounded-3xl border border-white/10 bg-white/70 p-6 backdrop-blur-lg shadow-xl shadow-slate-900/20 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-orange-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">
              Temple Giving · Since 1952
            </p>
            <div className="space-y-3 text-slate-900">
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Offer a gift. Sustain the temple. Bless the community.
              </h1>
              <p className="text-base leading-7 text-slate-700">
                This dedicated donation portal supports Lotus Heart Temple's heritage, seniors outreach, and daily prayers.
                Authenticate securely with Singpass and complete your offering in minutes.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-slate-800">
              <div className="rounded-2xl bg-white/90 p-3 shadow-sm shadow-slate-900/5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Community meals monthly</p>
                <p className="text-2xl font-semibold text-slate-900">1,200+</p>
              </div>
              <div className="rounded-2xl bg-white/90 p-3 shadow-sm shadow-slate-900/5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Years serving devotees</p>
                <p className="text-2xl font-semibold text-slate-900">72</p>
              </div>
              <div className="rounded-2xl bg-white/90 p-3 shadow-sm shadow-slate-900/5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Festival beneficiaries</p>
                <p className="text-2xl font-semibold text-slate-900">15k</p>
              </div>
            </div>
            <SingpassLoginCard status={status} />
          </div>

          <div id="donate" className="space-y-4">
            <div id="events" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Temple & Giving</p>
                  <h2 className="text-xl font-semibold text-slate-900">Choose an offering and donate</h2>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Trusted flow</div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} active={event.id === activeEvent.id} onSelect={setActiveEvent} />
                ))}
              </div>
            </div>

            <DonationWizard event={activeEvent} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams?: { name?: string; error?: string; error_description?: string };
}) {
  const status: Status = useMemo(() => {
    if (!searchParams) return null;
    const { name, error, error_description } = searchParams;

    if (error) {
      return { type: "error", message: error_description || error || "We could not authenticate you. Please try again." };
    }

    if (name) {
      return { type: "success", message: `Welcome back, ${name}. You can proceed with your offering.` };
    }

    return null;
  }, [searchParams]);

  return <DonationExperience status={status} />;
}
