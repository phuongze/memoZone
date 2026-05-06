import { motion } from "framer-motion";
import { Clock3, HeartHandshake, Milestone, Save, Send, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";

const defaultProfile = {
  username: "",
  displayName: "",
  roleLabel: "",
  bio: "",
  favoriteDateSpot: "",
  avatarUrl: "",
};

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ProfilePage({ onDashboardRefresh, members = [] }) {
  const [me, setMe] = useState(defaultProfile);
  const [partner, setPartner] = useState(null);
  const [counter, setCounter] = useState({
    startDate: "",
    milestones: [],
    pendingForMe: [],
    members: [],
  });
  const [startDateInput, setStartDateInput] = useState("");
  const [inviteDate, setInviteDate] = useState("");
  const [inviteNote, setInviteNote] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [feedback, setFeedback] = useState("");

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });

  const loadProfileAndCounter = async () => {
    const [profileRes, counterRes] = await Promise.all([api.get("/profile"), api.get("/counter")]);
    setMe(profileRes.data.me || defaultProfile);
    setPartner(profileRes.data.partner || null);
    setCounter(counterRes.data || {});
    setStartDateInput(counterRes.data?.startDate?.slice(0, 16) || "");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await loadProfileAndCounter();
      } catch (error) {
        setFeedback(error?.response?.data?.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const onProfileUpdated = (event) => {
      const { username, profile } = event.detail || {};
      if (!username || !profile) return;

      setCounter((prev) => ({
        ...prev,
        profiles: {
          ...(prev.profiles || {}),
          [username]: profile,
        },
      }));

      setMe((prev) => (prev.username === username ? { ...prev, ...profile } : prev));
      setPartner((prev) => (prev?.username === username ? { ...prev, ...profile } : prev));
    };

    window.addEventListener("oss:profile-updated", onProfileUpdated);

    return () => {
      window.removeEventListener("oss:profile-updated", onProfileUpdated);
    };
  }, []);

  useEffect(() => {
    const partnerUsername = members.find((username) => username !== me.username);
    if (!partnerUsername) return;

    const partnerProfile = counter.profiles?.[partnerUsername];
    if (!partnerProfile) return;

    setPartner(partnerProfile);
  }, [counter.profiles, me.username, members]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");

    try {
      const { data } = await api.patch("/profile", me);
      setMe(data.me || defaultProfile);
      setPartner(data.partner || null);
      if (onDashboardRefresh) {
        await onDashboardRefresh();
      }
      setFeedback("Profile updated successfully.");
    } catch (error) {
      setFeedback(error?.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStartDate = async () => {
    if (!startDateInput) return;

    setSavingDate(true);
    setFeedback("");

    try {
      await api.patch("/counter", { startDate: startDateInput });
      await loadProfileAndCounter();
      if (onDashboardRefresh) {
        await onDashboardRefresh();
      }
      setFeedback("Start date updated.");
    } catch (error) {
      setFeedback(error?.response?.data?.message || "Failed to update start date.");
    } finally {
      setSavingDate(false);
    }
  };

  const handleSendInvite = async (event) => {
    event.preventDefault();
    if (!inviteDate) return;

    setSendingInvite(true);
    setFeedback("");

    try {
      const { data } = await api.post("/counter/invites", {
        proposedAt: inviteDate,
        note: inviteNote,
      });
      setInviteDate("");
      setInviteNote("");
      await loadProfileAndCounter();
      if (onDashboardRefresh) {
        await onDashboardRefresh();
      }
      setFeedback(`Invite sent: ${data.code}`);
    } catch (error) {
      setFeedback(error?.response?.data?.message || "Failed to send invite.");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleInviteAction = async (inviteId, action) => {
    const code = inviteCodeInput[inviteId] || "";
    setFeedback("");

    try {
      await api.patch(`/counter/invites/${inviteId}`, {
        action,
        code,
      });
      await loadProfileAndCounter();
      if (onDashboardRefresh) {
        await onDashboardRefresh();
      }
      setFeedback(action === "accept" ? "Invite accepted." : "Invite rejected.");
    } catch (error) {
      setFeedback(error?.response?.data?.message || "Failed to process invite.");
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

      if (!file.type.startsWith("image/")) {
      setFeedback("Please select a valid image file.");
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setMe((prev) => ({ ...prev, avatarUrl: imageDataUrl }));
      setFeedback("Image uploaded — click 'Save profile' to confirm.");
    } catch {
      setFeedback("Cannot read image file.");
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <section className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
          <p className="text-rosewood/80">Loading profile...</p>
        </section>
      </main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 sm:px-6"
    >
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-rosewood">
            <UserRound className="h-5 w-5" />
            <h1 className="font-serif text-3xl">Manage Profile</h1>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <label className="block text-sm text-rosewood/85">
              Username
              <input
                value={me.username || ""}
                disabled
                className="mt-1 w-full rounded-xl border border-rosewood/20 bg-cream/60 px-3 py-2"
              />
            </label>

            <label className="block text-sm text-rosewood/85">
              Display name
              <input
                value={me.displayName || ""}
                onChange={(event) =>
                  setMe((prev) => ({ ...prev, displayName: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
              />
            </label>

            <label className="block text-sm text-rosewood/85">
              Role
              <input
                value={me.roleLabel || ""}
                onChange={(event) =>
                  setMe((prev) => ({ ...prev, roleLabel: event.target.value }))
                }
                placeholder="He / She / ..."
                className="mt-1 w-full rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
              />
            </label>

            <label className="block text-sm text-rosewood/85">
              Short bio
              <textarea
                rows={4}
                value={me.bio || ""}
                onChange={(event) => setMe((prev) => ({ ...prev, bio: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
              />
            </label>

            <label className="block text-sm text-rosewood/85">
              Favorite date spot
              <input
                value={me.favoriteDateSpot || ""}
                onChange={(event) =>
                  setMe((prev) => ({ ...prev, favoriteDateSpot: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
              />
            </label>

            <div className="rounded-2xl border border-rosewood/20 bg-white/75 p-3">
              <p className="mb-2 text-sm text-rosewood/85">Avatar</p>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-rosewood/20 bg-cream">
                  {me.avatarUrl ? (
                    <img src={me.avatarUrl} alt="My avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-rosewood/60">
                      {(me.displayName || me.username || "M").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-xl border border-rosewood/30 px-3 py-2 text-sm text-rosewood transition hover:bg-cream/80">
                    Choose image
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setMe((prev) => ({ ...prev, avatarUrl: "" }))}
                    className="rounded-xl border border-rosewood/20 px-3 py-2 text-sm text-rosewood"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-rosewood px-4 py-2 text-white disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-rosewood">
            <HeartHandshake className="h-5 w-5" />
            <h2 className="font-serif text-3xl">Partner Profile</h2>
          </div>

          {partner ? (
            <div className="space-y-3 text-rosewood/85">
              <div className="mb-2 h-20 w-20 overflow-hidden rounded-2xl border border-rosewood/20 bg-cream">
                {partner.avatarUrl ? (
                  <img src={partner.avatarUrl} alt="Partner avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-rosewood/60">
                    {(partner.displayName || partner.username || "P").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <p>
                <span className="font-semibold">Username:</span> {partner.username}
              </p>
              <p>
                <span className="font-semibold">Ten hien thi:</span> {partner.displayName}
              </p>
              <p>
                <span className="font-semibold">Vai tro:</span> {partner.roleLabel}
              </p>
              <p>
                <span className="font-semibold">Gioi thieu:</span> {partner.bio || "-"}
              </p>
              <p>
                <span className="font-semibold">Spot yeu thich:</span> {partner.favoriteDateSpot || "-"}
              </p>
            </div>
          ) : (
              <p className="text-sm text-rosewood/80">No partner information yet.</p>
          )}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-rosewood">
            <Clock3 className="h-5 w-5" />
            <h2 className="font-serif text-2xl">Set Start Date</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="datetime-local"
              value={startDateInput}
              onChange={(event) => setStartDateInput(event.target.value)}
              className="w-full rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
            />
            <button
              onClick={handleUpdateStartDate}
              disabled={savingDate}
              className="rounded-xl bg-rosewood px-4 py-2 text-white disabled:opacity-70"
            >
              {savingDate ? "Saving..." : "Save"}
            </button>
          </div>
          <p className="mt-3 text-xs text-rosewood/70">Current: {formatDateTime(counter.startDate)}</p>
        </article>

        <article className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-rosewood">
            <Send className="h-5 w-5" />
            <h2 className="font-serif text-2xl">Send Date Invite</h2>
          </div>
          <form onSubmit={handleSendInvite} className="space-y-3">
            <input
              type="datetime-local"
              value={inviteDate}
              onChange={(event) => setInviteDate(event.target.value)}
              className="w-full rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
              required
            />
            <input
              value={inviteNote}
              onChange={(event) => setInviteNote(event.target.value)}
              placeholder="Note (optional)"
              className="w-full rounded-xl border border-rosewood/20 bg-white/80 px-3 py-2"
            />
            <button
              type="submit"
              disabled={sendingInvite}
              className="rounded-xl bg-pine px-4 py-2 text-white disabled:opacity-70"
            >
              {sendingInvite ? "Sending..." : "Send invite"}
            </button>
          </form>
        </article>
      </section>

      <section className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2 text-rosewood">
          <Clock3 className="h-5 w-5" />
            <h2 className="font-serif text-2xl">Pending Invites</h2>
        </div>

        {counter.pendingForMe?.length ? (
          <div className="space-y-4">
            {counter.pendingForMe.map((invite) => (
              <article key={invite.id} className="rounded-2xl bg-cream/70 p-4">
                <p className="text-sm text-rosewood/80">
                  <span className="font-semibold">{invite.from}</span> invited you for a date at {" "}
                  <span className="font-semibold">{formatDateTime(invite.proposedAt)}</span>
                </p>
                {invite.note && <p className="mt-1 text-sm text-rosewood/70">{invite.note}</p>}
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={inviteCodeInput[invite.id] || ""}
                    onChange={(event) =>
                      setInviteCodeInput((prev) => ({
                        ...prev,
                        [invite.id]: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Enter invite code"
                    className="rounded-xl border border-rosewood/20 bg-white px-3 py-2"
                  />
                  <button
                    onClick={() => handleInviteAction(invite.id, "accept")}
                    className="rounded-xl bg-rosewood px-4 py-2 text-white"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleInviteAction(invite.id, "reject")}
                    className="rounded-xl border border-rosewood/30 px-4 py-2 text-rosewood"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-rosewood/75">No pending invites.</p>
        )}
      </section>

      <section className="rounded-3xl border border-rosewood/15 bg-white/70 p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2 text-rosewood">
          <Milestone className="h-5 w-5" />
          <h2 className="font-serif text-2xl">Milestones</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(counter.milestones || []).map((item) => (
            <article
              key={item.days}
              className={`rounded-2xl border p-3 ${
                item.reached
                  ? "border-pine/30 bg-mint/60 text-pine"
                  : "border-rosewood/20 bg-cream/70 text-rosewood"
              }`}
            >
              <p className="text-sm font-semibold">{item.days} days</p>
              <p className="text-xs">{formatDateTime(item.date)}</p>
              <p className="mt-1 text-xs">{item.reached ? "Reached" : "Upcoming"}</p>
            </article>
          ))}
        </div>
      </section>

      {feedback && (
        <section className="rounded-2xl border border-rosewood/20 bg-white/70 p-4 text-sm text-rosewood">
          {feedback}
        </section>
      )}
    </motion.main>
  );
}
