import React from "react";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center w-full">
        <div className="w-10 h-10 rounded-full bg-brown-warm/5 animate-pulse" />
        <div className="h-8 w-32 bg-brown-warm/10 animate-pulse rounded-lg" />
        <div className="w-10 h-10 rounded-full bg-brown-warm/5 animate-pulse" />
      </header>

      <main className="px-6 max-w-md mx-auto space-y-10 pt-6 w-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-[2rem] bg-brown-warm/5 animate-pulse" />
          <div className="h-8 w-48 bg-brown-warm/10 animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-brown-warm/5 animate-pulse rounded-lg" />
        </div>

        <div className="h-24 w-full bg-brown-warm/5 animate-pulse rounded-[1.5rem]" />
        
        <div className="space-y-4">
          <div className="h-8 w-48 bg-brown-warm/10 animate-pulse rounded-lg" />
          <div className="h-40 w-full bg-brown-warm/5 animate-pulse rounded-[1.5rem]" />
        </div>
      </main>
    </div>
  );
}
