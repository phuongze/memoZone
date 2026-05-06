import { CheckCircle2, Circle, Edit2, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function WishCard({ wish, onToggle, onUncomplete, onViewDetails, onEdit }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-2xl border border-rosewood/15 bg-white/80 shadow-soft"
    >
      {wish.image ? (
        <img src={wish.image} alt={wish.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 bg-gradient-to-r from-blush to-mint" />
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-rosewood">{wish.title}</h3>
            <p className="text-sm text-rosewood/70">{wish.category || "Together"}</p>
          </div>
          <div className="flex items-center gap-1">
            {!wish.isCompleted && onEdit && (
              <button
                onClick={() => onEdit(wish)}
                className="rounded-full p-1 text-rosewood transition hover:bg-cream"
                aria-label="Edit wish"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => (wish.isCompleted ? onUncomplete(wish) : onToggle(wish))}
              className="rounded-full p-1 text-rosewood transition hover:bg-cream"
              aria-label={wish.isCompleted ? "Mark as incomplete" : "Mark as complete"}
            >
              {wish.isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-pine" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {wish.description && <p className="text-sm text-rosewood/80">{wish.description}</p>}

        {wish.isCompleted && wish.completionData?.checkInImages?.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {wish.completionData.checkInImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Check-in ${idx + 1}`}
                className="h-20 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {wish.isCompleted && wish.completionData?.notes && (
            <div className="rounded-lg bg-mint/20 p-2 text-xs text-pine">
            <p className="font-medium">Notes:</p>
            <p className="mt-1 line-clamp-2">{wish.completionData.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
              wish.isCompleted
                ? "bg-mint text-pine"
                : "bg-blush/70 text-rosewood"
            }`}
          >
            {wish.isCompleted ? "Done" : "Not done"}
          </span>
          {wish.isCompleted && onViewDetails && (
            <button
              onClick={() => onViewDetails(wish)}
              className="inline-flex items-center gap-1 rounded-full bg-blush/40 px-3 py-1 text-xs font-medium text-rosewood transition hover:bg-blush"
            >
              <Eye className="h-3.5 w-3.5" />
              View details
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
