// aftech_frontend/src/components/ComingSoon.tsx
import { Link } from "react-router-dom";

type Props = {
  title?: string;
  subtitle?: string;
  backTo?: string;
  ctaLabel?: string;
};

/**
 * why: large, polished placeholder for unfinished sections; reusable via props
 */
export default function ComingSoon({
  title = "🚧 Coming Soon",
  subtitle = "We’re putting the finishing touches on this section.",
  backTo = "/jobcards/dashboard",
  ctaLabel = "Back to Jobcards",
}: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-cyan-50">
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_1px_1px,rgba(0,0,0,.045)_1px,transparent_0)] [background-size:26px_26px]"
      />

      {/* animated gradient ring behind card */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-cyan-300 via-emerald-200 to-orange-300 blur-3xl opacity-40 animate-pulse" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="w-full">
          {/* large glass card */}
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-12 shadow-2xl backdrop-blur-md">
            {/* top/bottom glow accents */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-28 h-64 w-64 rounded-full bg-cyan-200/50 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl"
            />

            {/* status pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-amber-400/70" />
              </span>
              In progress
            </div>

            {/* big headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
              {title}
            </h1>

            {/* larger subtitle */}
            <p className="mt-4 text-lg leading-8 text-gray-600 md:text-xl">
              {subtitle} Check back soon.
            </p>

            {/* actions */}
            <div className="mt-8">
              <Link
                to={backTo}
                className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-md outline-none transition hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              >
                <span className="-ml-1 text-2xl" aria-hidden>
                  ←
                </span>
                {ctaLabel}
              </Link>
            </div>

            {/* footer hint */}
            <div className="mt-8 text-sm text-gray-500">
              Tip: use the sidebar to navigate other sections.
            </div>

            {/* animated bottom border accent */}
            <div
              aria-hidden
              className="absolute inset-x-0 -bottom-px h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
