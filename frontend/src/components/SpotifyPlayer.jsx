export default function SpotifyPlayer() {
  return (
    <aside className="fixed bottom-4 right-4 z-30 hidden w-80 rounded-2xl border border-rosewood/15 bg-white/85 p-2 shadow-soft backdrop-blur md:block">
      <iframe
        title="Couple Playlist"
        className="h-20 w-full rounded-xl"
        src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </aside>
  );
}
