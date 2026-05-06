import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import api from "./api/client";
import Header from "./components/Header";
import CompletionModal from "./components/CompletionModal";
import ActivityDetailsModal from "./components/ActivityDetailsModal";
import EditWishModal from "./components/EditWishModal";
import SpotifyPlayer from "./components/SpotifyPlayer";
import { useAuth } from "./context/AuthContext";
import useConfetti from "./hooks/useConfetti";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import { getRealtimeSocket } from "./realtime/socket";

const fallbackCounter = {
  startDate: "2024-02-14T19:00",
  coupleName: "memory_admin & love_guest",
  members: ["memory_admin", "love_guest"],
  invites: [],
  milestones: [],
  pendingForMe: [],
};

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
      <SpotifyPlayer />
    </div>
  );
}

function App() {
  const [counter, setCounter] = useState(fallbackCounter);
  const [wishes, setWishes] = useState([]);
  const { isAuthenticated } = useAuth();
  const fireConfetti = useConfetti();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedWishForCompletion, setSelectedWishForCompletion] = useState(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [selectedActivityWish, setSelectedActivityWish] = useState(null);
  const [showEditWishModal, setShowEditWishModal] = useState(false);
  const [selectedWishForEdit, setSelectedWishForEdit] = useState(null);

  const loadDashboardData = async () => {
    const [counterRes, wishesRes] = await Promise.all([
      api.get("/counter"),
      api.get("/wishes"),
    ]);
    setCounter(counterRes.data);
    setWishes(wishesRes.data);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        await loadDashboardData();
      } catch (error) {
        console.error("Load data failed", error);
      }
    };

    loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getRealtimeSocket();
    const handleProfileUpdated = (payload) => {
      if (!payload?.username || !payload?.profile) return;

      setCounter((prev) => ({
        ...prev,
        profiles: {
          ...(prev.profiles || {}),
          [payload.username]: payload.profile,
        },
      }));

      window.dispatchEvent(new CustomEvent("oss:profile-updated", { detail: payload }));
    };

    socket.on("profile:updated", handleProfileUpdated);

    return () => {
      socket.off("profile:updated", handleProfileUpdated);
    };
  }, [isAuthenticated]);

  const handleToggleWish = (wish) => {
    if (!wish.isCompleted) {
      // Opening completion flow
      setSelectedWishForCompletion(wish);
      setShowCompletionModal(true);
    }
  };

  const handleCompleteWish = async (completionData) => {
    if (!selectedWishForCompletion) return;

    try {
      const { data } = await api.patch(`/wishes/${selectedWishForCompletion._id}`, {
        isCompleted: true,
        completionData,
      });

      setWishes((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setShowCompletionModal(false);
      setSelectedWishForCompletion(null);
      fireConfetti();
    } catch (error) {
      console.error("Cannot complete wish", error);
    }
  };

  const handleUncompleteWish = async (wish) => {
    try {
      const { data } = await api.patch(`/wishes/${wish._id}`, {
        isCompleted: false,
      });

      setWishes((prev) => prev.map((item) => (item._id === data._id ? data : item)));
    } catch (error) {
      console.error("Cannot update wish", error);
    }
  };

  const handleViewActivityDetails = (wish) => {
    setSelectedActivityWish(wish);
    setShowActivityDetails(true);
  };

  const handleEditWish = (wish) => {
    if (wish.isCompleted) return;

    setSelectedWishForEdit(wish);
    setShowEditWishModal(true);
  };

  const handleSaveWishDetails = async (payload) => {
    if (!selectedWishForEdit) return;

    try {
      const { data } = await api.patch(`/wishes/${selectedWishForEdit._id}/details`, payload);
      setWishes((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setShowEditWishModal(false);
      setSelectedWishForEdit(null);
    } catch (error) {
      console.error("Cannot update wish details", error);
    }
  };

  const handleCreateWish = async (payload) => {
    try {
      const { data } = await api.post("/wishes", payload);
      setWishes((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Cannot create wish", error);
    }
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route
            path="/"
            element={<HomePage counter={counter} />}
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                wishes={wishes}
                onToggleWish={handleToggleWish}
                onUncompleteWish={handleUncompleteWish}
                onViewDetails={handleViewActivityDetails}
                onEditWish={handleEditWish}
                onCreateWish={handleCreateWish}
              />
            }
          />
          <Route
            path="/profile"
            element={<ProfilePage onDashboardRefresh={loadDashboardData} members={counter.members || []} />}
          />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>

      {showCompletionModal && selectedWishForCompletion && (
        <CompletionModal
          wish={selectedWishForCompletion}
          onConfirm={handleCompleteWish}
          onCancel={() => {
            setShowCompletionModal(false);
            setSelectedWishForCompletion(null);
          }}
        />
      )}

      {showActivityDetails && selectedActivityWish && (
        <ActivityDetailsModal
          wish={selectedActivityWish}
          onClose={() => {
            setShowActivityDetails(false);
            setSelectedActivityWish(null);
          }}
        />
      )}

      {showEditWishModal && selectedWishForEdit && (
        <EditWishModal
          wish={selectedWishForEdit}
          onConfirm={handleSaveWishDetails}
          onCancel={() => {
            setShowEditWishModal(false);
            setSelectedWishForEdit(null);
          }}
        />
      )}
    </>
  );
}

export default App;
