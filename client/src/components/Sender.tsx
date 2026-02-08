import { useEffect, useRef, useState } from "react";
import { useSocket } from "../service/socket";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

function createPeerConnection(onIce: (c: RTCIceCandidate) => void) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  pc.onicecandidate = (e) => {
    if (e.candidate) onIce(e.candidate);
  };

  return pc;
}

type SendStatus = "idle" | "connecting" | "sending" | "done" | "error";

export default function Sender({
  roomId,
  onShared,
}: {
  roomId: string;
  onShared: (f: { id: string; name: string; size: number; at: number }) => void;
}) {
  const { socket } = useSocket();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<SendStatus>("idle");
  const [progress, setProgress] = useState(0);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  // keep handlers to cleanup
  const iceHandlerRef = useRef<((payload: any) => void) | null>(null);
  const answerHandlerRef = useRef<((payload: any) => void) | null>(null);

  useEffect(() => {
    return () => {
      // cleanup listeners if component unmounts
      if (iceHandlerRef.current)
        socket.off("webrtc:ice", iceHandlerRef.current);
      if (answerHandlerRef.current)
        socket.off("webrtc:answer", answerHandlerRef.current);

      // close connections
      try {
        dcRef.current?.close();
      } catch {}
      try {
        pcRef.current?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startSend() {
    if (!file) return;

    // create a stable transfer id so receiver + panel can track this file
    const transferId = crypto.randomUUID();

    setStatus("connecting");
    setProgress(0);

    const pc = createPeerConnection((candidate) => {
      socket.emit("webrtc:ice", { roomId, candidate });
    });
    pcRef.current = pc;

    const dc = pc.createDataChannel("file");
    dcRef.current = dc;

    dc.onopen = async () => {
      try {
        setStatus("sending");

        // send meta FIRST
        dc.send(
          JSON.stringify({
            kind: "meta",
            id: transferId,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
          }),
        );

        const CHUNK = 64 * 1024;
        let offset = 0;

        while (offset < file.size) {
          const slice = file.slice(offset, offset + CHUNK);
          const buf = await slice.arrayBuffer();
          dc.send(buf);

          offset += buf.byteLength;
          setProgress(Math.min(100, Math.round((offset / file.size) * 100)));
          await new Promise((r) => setTimeout(r, 0));
        }

        // signal done with id
        dc.send(JSON.stringify({ kind: "done", id: transferId }));

        setStatus("done");
        onShared({
          id: transferId,
          name: file.name,
          size: file.size,
          at: Date.now(),
        });
      } catch {
        setStatus("error");
      }
    };

    // offer/answer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc:offer", { roomId, offer });

    const onAnswer = async ({ answer }: any) => {
      socket.off("webrtc:answer", onAnswer);
      answerHandlerRef.current = null;
      await pc.setRemoteDescription(answer);
    };
    answerHandlerRef.current = onAnswer;
    socket.on("webrtc:answer", onAnswer);

    const onIce = async ({ candidate }: any) => {
      try {
        await pc.addIceCandidate(candidate);
      } catch {}
    };
    iceHandlerRef.current = onIce;
    socket.on("webrtc:ice", onIce);
  }

  const isBusy = status === "connecting" || status === "sending";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <DropZone
        file={file}
        onPick={setFile}
        onDropFile={setFile}
        disabled={isBusy}
      />

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Progress</span>
          <span className="text-white/60">{progress}%</span>
        </div>

        <progress
          value={progress}
          max={100}
          className="mt-3 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:bg-white/80"
        />

        <button
          onClick={startSend}
          disabled={!file || isBusy}
          className="mt-4 h-11 w-full rounded-2xl bg-white text-sm font-bold text-slate-950 hover:bg-white/90 disabled:opacity-50"
        >
          {status === "connecting"
            ? "Connecting..."
            : status === "sending"
              ? "Sending..."
              : "Send now"}
        </button>

        <p className="mt-3 text-center text-xs text-white/60">
          {status === "done"
            ? "Sent. Ask the receiver to download from the panel."
            : status === "error"
              ? "Failed. Try again."
              : status === "sending"
                ? "Sending peer-to-peer…"
                : " "}
        </p>
      </div>
    </div>
  );
}

function DropZone({
  file,
  onPick,
  onDropFile,
  disabled = false,
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  onDropFile: (f: File) => void;
  disabled?: boolean;
}) {
  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onDropFile(f);
      }}
      className={`group relative flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center ${disabled ? "cursor-not-allowed opacity-60" : "hover:bg-white/10"}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-white/80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V4" />
          <path d="M7 9l5-5 5 5" />
          <path d="M20 16.5A4.5 4.5 0 0 1 15.5 21h-7A4.5 4.5 0 0 1 4 16.5" />
        </svg>
      </div>

      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          Drop files here
        </h3>
        <p className="text-sm text-white/60">or browse from your device</p>
      </div>

      <div className="flex items-center gap-3">
        <label
          className={`inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 ${disabled ? "pointer-events-none opacity-70" : "cursor-pointer hover:bg-white/90"}`}
        >
          <input
            type="file"
            className="hidden"
            disabled={disabled}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          Browse file
        </label>

        {file && (
          <button
            type="button"
            onClick={() => onPick(null)}
            disabled={disabled}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

      {file && (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
          <div className="truncate text-sm font-semibold text-white/90">
            {file.name}
          </div>
          <div className="mt-1 text-xs text-white/50">
            {formatBytes(file.size)}
          </div>
        </div>
      )}
    </div>
  );
}
