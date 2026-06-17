import React from "react";

export default function SavedLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <header className="px-6 py-4 flex items-center justify-between border-b border-brown-warm/5 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="h-8 w-40 bg-brown-warm/10 animate-pulse rounded-lg" />
        <div className="w-10 h-10 rounded-full bg-brown-warm/5 animate-pulse" />
      </header>

      <main className="flex-1 px-4 py-8 w-full max-w-2xl mx-auto space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 w-full bg-brown-warm/5 animate-pulse rounded-[2rem] border border-brown-warm/5" />
        ))}
      </main>
    </div>
  );
}
