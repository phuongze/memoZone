import { HeartHandshake } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username.trim(), password);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-rosewood/15 bg-white/80 p-8 shadow-soft backdrop-blur"
      >
        <div className="mb-6 flex items-center gap-2 text-rosewood">
          <HeartHandshake className="h-6 w-6" />
          <h1 className="font-serif text-4xl">Our Secret Space</h1>
        </div>
        <p className="mb-6 text-sm text-rosewood/80">
          For two hearts only. Please sign in to enter your private space.
        </p>

        <div className="space-y-4">
          <label className="block text-sm text-rosewood/85">
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-xl border border-rosewood/20 bg-white/70 px-3 py-2 outline-none ring-rosewood/30 transition focus:ring"
              required
            />
          </label>

          <label className="block text-sm text-rosewood/85">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-rosewood/20 bg-white/70 px-3 py-2 outline-none ring-rosewood/30 transition focus:ring"
              required
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-rosewood px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
