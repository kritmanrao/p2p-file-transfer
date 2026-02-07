export default function RightPanel({
  tipsOpen,
  setTipsOpen,
  sharedFiles,
  receivedFiles,
  onDeleteReceived,
}: {
  tipsOpen: boolean;
  setTipsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sharedFiles: { id: string; name: string; size: number; at: number }[];
  receivedFiles: {
    id: string;
    name: string;
    size: number;
    url: string;
    at: number;
  }[];
  onDeleteReceived: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-white">Panel</div>
        <button
          onClick={() => setTipsOpen((v) => !v)}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-black/30"
        >
          {tipsOpen ? "Hide tips" : "Show tips"}
        </button>
      </div>

      {tipsOpen && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="font-semibold text-white">Tips</div>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/60">
            <li>Use the same room id on both devices.</li>
            <li>
              If some networks block P2P, you’ll later add TURN (production).
            </li>
            <li>Keep this tab open during transfer.</li>
          </ul>
        </div>
      )}

      {/* Shared files */}
      <div className="mt-5">
        <div className="text-sm font-semibold text-white">Shared files</div>
        {sharedFiles.length === 0 ? (
          <div className="mt-2 text-sm text-white/50">No shared files yet.</div>
        ) : (
          <div className="mt-2 space-y-2">
            {sharedFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white/90">
                    {f.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <span className="text-xs text-emerald-300/80">sent</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Received files */}
      <div className="mt-5">
        <div className="text-sm font-semibold text-white">Received files</div>
        {receivedFiles.length === 0 ? (
          <div className="mt-2 text-sm text-white/50">
            No received files yet.
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {receivedFiles.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white/90">
                    {f.name}
                  </div>
                  <div className="text-xs text-white/50">
                    {(f.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <a
                    href={f.url}
                    download={f.name}
                    className="flex-1 rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-slate-950 hover:bg-white/90"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => onDeleteReceived(f.id)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
