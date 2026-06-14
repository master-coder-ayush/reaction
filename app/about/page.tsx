export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Heart,
  Globe,
  FlaskConical,
  BookOpen,
  Gamepad2,
  Users,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { loadLoggedInDashboard } from "@/lib/dashboard";

export const metadata = {
  title: "About",
  description:
    "Meet Prachi Gupta, the chemistry educator behind Level Up Chemistry — a free gamified platform helping Class 11 & 12 students master Organic Chemistry reactions.",
  openGraph: {
    title: "About · Level Up Chemistry",
    description:
      "Prachi Gupta, Post Graduate Chemistry Teacher, built Level Up Chemistry to make Organic Chemistry practice fun, free, and effective for every student.",
  },
};

export default async function AboutPage() {
  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session?.user?.id);
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  return (
    <AppShell isGuest={isGuest} xp={xp} username={session?.user?.username}>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">

        {/* Hero card */}
        <div className="fade-rise overflow-hidden rounded-3xl shadow-soft-lg" style={{ background: "#ff9090", border: "1px solid #e2e2ef" }}>
          <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
            <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
              <Image
                src="/prachi.png"
                alt="Prachi Gupta"
                fill
                className="rounded-2xl object-cover shadow-soft"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                About the Creator
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Prachi Gupta
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-muted-foreground">
                Chemistry Educator · Researcher · Sustainability Advocate
              </p>
              <a
                href="mailto:prachigupta7888@gmail.com"
                className="mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-foreground transition"
                style={{ background: "#f4f4f8", border: "1px solid #e2e2ef" }}
              >
                <Mail className="h-4 w-4 text-primary" />
                prachigupta7888@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Story section */}
        <section className="mt-8 space-y-6">

          {/* Who I am */}
          <div className="card-soft p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="icon-chip bg-primary-soft text-primary-border">
                <BookOpen className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">My Journey</h2>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Hello, I am{" "}
              <span className="font-semibold text-foreground">Prachi Gupta</span>, a
              Post Graduate Teacher of Chemistry from India. My journey as an educator
              began in <span className="font-semibold text-foreground">2020</span> during
              the COVID-19 pandemic as soon as I completed my B.Sc. Medical degree. What
              started as teaching young learners soon grew into a passion for science and
              chemistry education.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Today, I teach Chemistry to students of Classes 11 and 12 and work every
              day to make learning more meaningful, engaging and accessible.
            </p>
          </div>

          {/* The problem */}
          <div className="card-soft p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="icon-chip bg-warn-soft text-warn-border">
                <Lightbulb className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">The Problem I Saw</h2>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Over the years, I realised that one of the biggest challenges students face
              in Chemistry is learning and remembering{" "}
              <span className="font-semibold text-foreground">
                Organic Chemistry reactions
              </span>
              . Many students understand the concepts during class but struggle to retain
              the reactions, reagents and conversions over time.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              As a teacher, I often wondered — could learning reactions become less about
              memorisation and more about{" "}
              <span className="font-semibold text-foreground">
                practice, curiosity and enjoyment
              </span>
              ? That question led to the creation of LevelUp Chemistry.
            </p>
          </div>

          {/* The project */}
          <div className="card-soft p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="icon-chip bg-secondary-soft text-secondary-border">
                <FlaskConical className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">
                What is LevelUp Chemistry?
              </h2>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              LevelUp Chemistry is a{" "}
              <span className="font-semibold text-foreground">free learning initiative</span>{" "}
              designed to help students master Organic Chemistry reactions through
              gamification, daily streaks, challenges, rewards and learning through play.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: Gamepad2, label: "Gamified practice", desc: "Earn XP, level up, unlock cards" },
                { icon: FlaskConical, label: "Reaction modules", desc: "MCQ, name reactions, mechanisms, pathways" },
                { icon: Users, label: "Boss & Escape Room", desc: "Challenge yourself with timed modes" },
                { icon: Globe, label: "Fully free", desc: "No paywalls, open to all students" },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-bold">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SDG */}
          <div className="card-soft p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="icon-chip bg-accent-soft text-accent-border">
                <Globe className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">SDG 4 — Quality Education</h2>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              This project is my contribution towards the{" "}
              <span className="font-semibold text-foreground">
                United Nations Sustainable Development Goal 4 – Quality Education
              </span>
              . I strongly believe that every student deserves access to innovative and
              engaging learning resources regardless of their background. By keeping the
              platform freely accessible, I hope to support learners in building
              confidence in Chemistry and developing a positive attitude toward science.
            </p>
          </div>

          {/* Vision */}
          <div className="card-soft p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="icon-chip bg-pink-soft text-pink-border">
                <Heart className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">The Vision Ahead</h2>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              LevelUp Chemistry is only the beginning. In the future, I hope to expand
              the platform by introducing theory-based Organic Chemistry games as well as
              interactive learning modules for Physical and Inorganic Chemistry. My
              vision is to create a{" "}
              <span className="font-semibold text-foreground">
                complete learning ecosystem
              </span>{" "}
              where students can learn Chemistry through exploration, practice and play.
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-3xl border-2 border-primary/30 bg-primary-soft p-6 text-center sm:p-8" style={{ background: "#ff9090", border: "1px solid #e2e2ef" }}>
            <p className="text-base font-bold text-foreground">
              I invite you to try the game, share your feedback and suggest new features.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share it with your classmates, colleagues and fellow educators. Your
              participation supports ongoing research on gamification in Chemistry education.
            </p>
            <blockquote className="mt-5 border-l-4 border-primary pl-4 text-left text-sm italic text-muted-foreground">
              "Together, let us make Chemistry a subject that students enjoy learning,
              not one they fear."
            </blockquote>
            <p className="mt-2 text-right text-sm font-bold text-foreground">
              — Prachi Gupta
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
              >
                Start learning <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:prachigupta7888@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-extrabold text-foreground transition hover:bg-muted"
              >
                <Mail className="h-4 w-4" /> Send feedback
              </a>
            </div>
          </div>

        </section>
      </main>
    </AppShell>
  );
}
