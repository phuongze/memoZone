import { X } from "lucide-react";
import { useState } from "react";

export default function CompletionModal({ wish, onConfirm, onCancel }) {
  const [checkInImages, setCheckInImages] = useState([]);
  const [notes, setNotes] = useState("");
  const [imagePreview, setImagePreview] = useState([]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setCheckInImages((prev) => [...prev, dataUrl]);
        setImagePreview((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setCheckInImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const confirmed = window.confirm("Final confirmation: do you want to complete this event?");
    if (!confirmed) return;

    onConfirm({
      checkInImages,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-3xl border border-rosewood/15 bg-white/95 p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-rosewood">Complete: {wish.title}</h2>
          <button
            onClick={onCancel}
            className="rounded-full p-1 text-rosewood/70 transition hover:bg-cream"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rosewood/85">
              Check-in photos (max 3)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={checkInImages.length >= 3}
              className="mt-2 block w-full text-sm text-rosewood/70 file:rounded-lg file:border-0 file:bg-blush file:px-3 file:py-2 file:text-sm file:font-medium file:text-rosewood disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {imagePreview.length > 0 && (
            <div className="grid gap-2">
              <p className="text-xs text-rosewood/70">{imagePreview.length} selected images:</p>
              <div className="grid grid-cols-3 gap-2">
                {imagePreview.map((src, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg">
                    <img src={src} alt={`Check-in ${index + 1}`} className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition hover:opacity-100"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-rosewood/85">
              Activity notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your memory, details, or feelings..."
              className="mt-2 h-24 w-full rounded-xl border border-rosewood/20 bg-white/70 px-3 py-2 text-sm placeholder-rosewood/40 outline-none ring-rosewood/30 transition focus:ring"
            />
          </div>

          <div className="flex gap-2">
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
              Confirm completion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
