"use client";

import Link from "next/link";
import { BookOpen, CheckCircle, FileText, Sparkles, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    desc: "Create curriculum-aligned question papers in seconds using Gemini AI.",
  },
  {
    icon: FileText,
    title: "Multiple Question Types",
    desc: "MCQs, short answers, long answers, diagrams, numericals and more.",
  },
  {
    icon: Zap,
    title: "Instant PDF Export",
    desc: "Download print-ready PDFs with answer keys in one click.",
  },
  {
    icon: CheckCircle,
    title: "Section Regeneration",
    desc: "Don't like a section? Regenerate just that part without losing the rest.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-gray-100 px-6 py-4 lg:px-16">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-[#111111]" />
          <span className="text-lg font-bold text-[#111111]">VedaAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#111111] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center lg:pt-32">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-600">
          <Sparkles size={14} className="text-orange-500" />
          AI-Powered Assessment Creator
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#111111] lg:text-6xl lg:leading-[1.1]">
          Create exam papers
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            in seconds, not hours
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-500 lg:text-lg">
          VedaAI helps teachers generate structured, curriculum-aligned question
          papers using AI. Just fill in the details, and we&apos;ll handle the rest.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex h-12 items-center gap-2 rounded-xl bg-[#111111] px-8 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg"
          >
            <Sparkles size={16} />
            Start Creating — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center rounded-xl border border-gray-200 px-8 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[#111111] lg:text-3xl">
            Everything you need to create assessments
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-gray-500">
            From question generation to print-ready PDFs — VedaAI handles the
            entire workflow so you can focus on teaching.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                    <Icon size={20} className="text-orange-500" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#111111]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center lg:px-16">
        <div className="mx-auto max-w-2xl rounded-2xl bg-[#111111] px-8 py-14">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">
            Ready to save hours on exam prep?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
            Join teachers who are already using VedaAI to create professional
            question papers in minutes.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-[#111111] transition-all hover:bg-gray-100"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6 text-center text-xs text-gray-400 lg:px-16">
        © 2026 VedaAI. Built for teachers, powered by AI.
      </footer>
    </div>
  );
}
