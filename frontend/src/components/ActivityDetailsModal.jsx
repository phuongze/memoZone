import { ChevronLeft, X } from "lucide-react";
import { motion } from "framer-motion";

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default function ActivityDetailsModal({ wish, onClose }) {
  const { completionData } = wish;

  if (!completionData?.completedAt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-rosewood/15 bg-white/95 shadow-soft"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rosewood/10 bg-white/80 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-full p-1 text-rosewood/70 transition hover:bg-cream"
              aria-label="Quay lại"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-serif text-2xl text-rosewood">Chi tiết hoạt động</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-rosewood/70 transition hover:bg-cream"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Wish Title */}
          <div>
            <p className="text-xs uppercase tracking-widest text-rosewood/60">Điều ước</p>
            <h3 className="mt-2 font-serif text-3xl text-rosewood">{wish.title}</h3>
            <p className="mt-1 text-sm text-rosewood/70">{wish.category}</p>
          </div>

          {/* Completion Date */}
          <div className="rounded-2xl border border-rosewood/10 bg-blush/20 p-4">
            <p className="text-xs uppercase tracking-widest text-rosewood/60">Hoàn thành vào</p>
            <p className="mt-2 font-medium text-rosewood">
              {formatDateTime(completionData.completedAt)}
            </p>
          </div>

          {/* Check-in Images */}
          {completionData.checkInImages && completionData.checkInImages.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-rosewood/60">
                Ảnh check-in ({completionData.checkInImages.length})
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {completionData.checkInImages.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden rounded-xl border border-rosewood/10"
                  >
                    <img
                      src={img}
                      alt={`Check-in ${idx + 1}`}
                      className="h-40 w-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {completionData.notes && (
            <div className="rounded-2xl border border-rosewood/10 bg-mint/20 p-4">
              <p className="text-xs uppercase tracking-widest text-rosewood/60">Lưu bút hoạt động</p>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-rosewood">
                {completionData.notes}
              </p>
            </div>
          )}

          {/* Original Wish Details */}
          {wish.description && (
            <div className="rounded-2xl border border-rosewood/10 bg-cream/30 p-4">
              <p className="text-xs uppercase tracking-widest text-rosewood/60">Mô tả ban đầu</p>
              <p className="mt-2 text-rosewood/80">{wish.description}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3 rounded-2xl border border-rosewood/10 bg-white/50 p-4">
            <p className="text-xs uppercase tracking-widest text-rosewood/60">Dòng thời gian</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-rosewood flex-shrink-0" />
                <div>
                  <p className="text-xs text-rosewood/60">Tạo điều ước</p>
                  <p className="text-sm font-medium text-rosewood">
                    {formatDateTime(wish.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-pine flex-shrink-0" />
                <div>
                  <p className="text-xs text-rosewood/60">Hoàn thành</p>
                  <p className="text-sm font-medium text-rosewood">
                    {formatDateTime(completionData.completedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
