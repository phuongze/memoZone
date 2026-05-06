import confetti from "canvas-confetti";

export default function useConfetti() {
  return () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffdfe8", "#dff7ee", "#fffaf1", "#8f5a68"],
    });
  };
}
