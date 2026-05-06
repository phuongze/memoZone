import { X } from "lucide-react";
import { useEffect, useState } from "react";

const defaultForm = {
  title: "",
  description: "",
  category: "Together",
  image: "",
};

export default function EditWishModal({ wish, onConfirm, onCancel }) {
  const [formData, setFormData] = useState(defaultForm);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!wish) return;

    setFormData({
      title: wish.title || "",
      description: wish.description || "",
      category: wish.category || "Together",
      image: wish.image || "",
    });
    setImagePreview(wish.image || "");
  }, [wish]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-3xl border border-rosewood/15 bg-white/95 p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-rosewood">Edit wish</h2>
          <button
            onClick={onCancel}
            className="rounded-full p-1 text-rosewood/70 transition hover:bg-cream"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
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
            <img src={imagePreview} alt="preview" className="mt-2 h-24 w-24 rounded-lg object-cover md:col-span-2" />
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
            className="rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2 md:col-span-2"
          />
          <div className="flex gap-2 md:col-span-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-rosewood/20 px-4 py-2 font-medium text-rosewood transition hover:bg-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-rosewood px-4 py-2 font-medium text-white transition hover:opacity-90"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
