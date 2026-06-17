import React from "react";

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl flex justify-between items-center w-full px-6 py-4 border-b border-brown-warm/5">
        <div className="h-8 w-32 bg-brown-warm/10 animate-pulse rounded-lg" />
        <div className="w-10 h-10 rounded-full bg-brown-warm/5 animate-pulse" />
      </header>

      <main className="pt-28 pb-40 w-full max-w-4xl mx-auto flex flex-col items-center px-6">
        <div className="w-full max-w-2xl space-y-6 text-center mb-12">
          <div className="h-12 w-3/4 bg-brown-warm/10 animate-pulse rounded-xl mx-auto" />
          <div className="h-6 w-1/2 bg-brown-warm/5 animate-pulse rounded-lg mx-auto" />
        </div>

        <div className="w-full max-w-xl h-24 bg-brown-warm/5 animate-pulse rounded-[2rem] mb-12" />

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[300px] bg-brown-warm/5 animate-pulse rounded-3xl" />
          <div className="h-[300px] bg-brown-warm/5 animate-pulse rounded-3xl" />
        </div>
      </main>
    </div>
  );
}
