import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-200 flex items-center justify-center px-6">
      <main className="max-w-4xl w-full text-center space-y-10">

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-900">
          Ankur's Challenge
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 max-w-xl mx-auto">
          Push your limits. Build discipline. Transform your mindset.
        </p>

        <div className="pt-6">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-black rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Begin →
          </Link>
        </div>

      </main>
    </div>
  );
}