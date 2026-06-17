"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { TactileButton } from "@/components/ui/tactile-button";
import { Mail, Utensils, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/");
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    setLoading(false);
    if (!error) alert("Check your email for a magic link!");
    else alert(error.message);
  };

  if (checkingAuth) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background p-6">
      <h1 className="mb-8 text-4xl font-bold text-primary">Welcome to Culinara</h1>
      
      <div className="flex w-full max-w-md flex-col gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 mb-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <TactileButton
          onClick={handleGoogle}
          variant="secondary"
          size="lg"
          disabled={loading}
          className="flex items-center justify-center gap-2"
        >
          <Utensils className="h-5 w-5" />
          Continue with Google
        </TactileButton>
        <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-brown-dark">
            Email (magic link)
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-brown-warm/10 bg-cream px-4 py-2 text-brown-dark placeholder:text-brown-warm/50 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <TactileButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="flex items-center justify-center gap-2"
          >
            <Mail className="h-5 w-5" />
            Send Magic Link
          </TactileButton>
        </form>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
