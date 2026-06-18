export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-brown-dark text-center p-6">
      <h1 className="font-serif text-3xl font-bold mb-4">You're offline</h1>
      <p className="text-brown-warm">Looks like you've lost your connection. Reconnect to keep cooking 🍲</p>
    </div>
  );
}
