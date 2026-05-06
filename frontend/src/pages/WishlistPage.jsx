import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import WishCard from "../components/WishCard";

const defaultForm = {
  title: "",
  description: "",
  category: "Date Idea",
  image: "",
};

export default function WishlistPage({ wishes, onToggleWish, onUncompleteWish, onViewDetails, onEditWish, onCreateWish }) {
  const [formData, setFormData] = useState(defaultForm);
  const [imagePreview, setImagePreview] = useState("");
  const [pickedWishId, setPickedWishId] = useState(null);
  const sharedWishCount = wishes.length;

  const pickedWish = useMemo(
    () => wishes.find((wish) => wish._id === pickedWishId),
    [wishes, pickedWishId],
  );

  const randomPicker = () => {
    if (!wishes.length) return;
    const randomIndex = Math.floor(Math.random() * wishes.length);
    setPickedWishId(wishes[randomIndex]._id);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) return;
    await onCreateWish(formData);
    setFormData(defaultForm);
    setImagePreview("");
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-10 sm:px-6">
      <section className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2 text-rosewood">
          <Sparkles className="h-5 w-5" />
          <h2 className="font-serif text-3xl">Wish List</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input
            placeholder="Wish title"
            value={formData.title}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, title: event.target.value }))
            }
            className="rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
            required
          />
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-xl border border-rosewood/20 px-3 py-2 text-sm text-rosewood transition hover:bg-cream/80">
              Choose image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = reader.result;
                    setFormData((prev) => ({ ...prev, image: dataUrl }));
                    setImagePreview(String(dataUrl));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, image: "" }));
                setImagePreview("");
              }}
              className="rounded-xl border border-rosewood/20 px-3 py-2 text-sm text-rosewood"
            >
              Remove
            </button>
          </div>
          {imagePreview && (
            <img src={imagePreview} alt="preview" className="mt-2 h-24 w-24 rounded-lg object-cover" />
          )}
          <input
            placeholder="Category"
            value={formData.category}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, category: event.target.value }))
            }
            className="rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
          />
          <input
            placeholder="Short description"
            value={formData.description}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, description: event.target.value }))
            }
            className="rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-rosewood px-4 py-2 font-medium text-white md:col-span-2"
          >
            Add wish
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-rosewood">Random Picker</h3>
          <button
            onClick={randomPicker}
            className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-white"
          >
            Pick random
          </button>
        </div>

        {pickedWish ? (
            <motion.p
            key={pickedWish._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-mint/80 p-4 text-pine"
          >
            Today I'll do: <span className="font-semibold">{pickedWish.title}</span>
          </motion.p>
        ) : (
          <p className="mt-4 text-sm text-rosewood/80">
            Click the button to suggest a plan for today.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-rosewood">Shared Wishlist</h3>
            <p className="text-sm text-rosewood/70">
              All your wishes in one place.
            </p>
          </div>
          <span className="rounded-full bg-blush/70 px-4 py-2 text-sm font-medium text-rosewood">
            {sharedWishCount} wishes
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {wishes.map((wish) => (
              <WishCard
                key={wish._id}
                wish={wish}
                onToggle={onToggleWish}
                onUncomplete={onUncompleteWish}
                onViewDetails={onViewDetails}
                onEdit={onEditWish}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
