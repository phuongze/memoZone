import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import LoveCounter from "../components/LoveCounter";

export default function HomePage({ counter }) {
  const members = counter.members || [];
  const profiles = counter.profiles || {};

  const firstUser = members[0];
  const secondUser = members[1];
  const firstProfile = firstUser ? profiles[firstUser] : null;
  const secondProfile = secondUser ? profiles[secondUser] : null;

  const firstName = firstProfile?.displayName || firstUser || "You";
  const secondName = secondProfile?.displayName || secondUser || "Love";

  const firstAvatar = firstProfile?.avatarUrl || "";
  const secondAvatar = secondProfile?.avatarUrl || "";

  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 sm:px-6"
    >
      <section className="relative overflow-hidden rounded-3xl border border-rosewood/15 bg-white/75 p-7 shadow-soft">
        <div className="pointer-events-none absolute -left-8 -top-14 h-40 w-40 rounded-full bg-blush/70 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-mint/80 blur-2xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-rosewood/60">Our story</p>
            <h1 className="mt-3 font-serif text-4xl text-rosewood sm:text-5xl">{counter.coupleName}</h1>
            <p className="mt-3 max-w-xl text-rosewood/75">
              A small space to count your anniversaries and keep gentle date memories.
            </p>
            <p className="mt-4 text-sm font-medium text-rosewood/80">{firstName} + {secondName}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-rosewood/15 bg-white/90 p-4"
          >
            <p className="mb-3 text-sm text-rosewood/70">Couple Portrait</p>
            <div className="flex items-center justify-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-rosewood/20 bg-cream">
                {firstAvatar ? (
                  <img src={firstAvatar} alt={firstName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-rosewood/60">
                    {firstName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="rounded-full bg-blush p-2 text-rosewood">
                <Heart className="h-5 w-5 fill-current" />
              </div>

              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-rosewood/20 bg-cream">
                {secondAvatar ? (
                  <img src={secondAvatar} alt={secondName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-rosewood/60">
                    {secondName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <LoveCounter startDate={counter.startDate} />
    </motion.main>
  );
}
