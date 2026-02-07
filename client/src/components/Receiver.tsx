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

type Meta = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export default function Receiver({
  roomId,
  onReceived,
}: {
  roomId: string;
  onReceived: (f: {
    id: string;
    name: string;
    size: number;
    url: string;
    at: number;
  }) => void;
}) {
  const { socket } = useSocket();

  const [waiting, setWaiting] = useState(true);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [received, setReceived] = useState(0);

  // show download/delete buttons
  const [ready, setReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("download");

  // store binary chunks (BlobPart-safe)
  const chunksRef = useRef<ArrayBuffer[]>([]);
  const metaRef = useRef<Meta | null>(null);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  // cleanup object url
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const progress = meta
    ? Math.min(100, Math.round((received / meta.size) * 100))
    : 0;

  useEffect(() => {
    const onOffer = async ({ offer }: any) => {
      setWaiting(false);

      // reset ui state for new incoming transfer
      setMeta(null);
      setReceived(0);
      chunksRef.current = [];

      setReady(false);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setFileName("download");

      const pc = createPeerConnection((candidate) => {
        socket.emit("webrtc:ice", { roomId, candidate });
      });

      pc.ondatachannel = (e) => {
        const dc = e.channel;

        dc.onmessage = (msg) => {
          // text messages (meta/done)
          if (typeof msg.data === "string") {
            let data: any;
            try {
              data = JSON.parse(msg.data);
            } catch {
              return;
            }

            if (data.kind === "meta") {
              const m: Meta = {
                id: String(data.id ?? ""),
                name: String(data.name ?? "file"),
                size: Number(data.size ?? 0),
                type: String(data.type ?? "application/octet-stream"),
              };
              setMeta(m);
              setFileName(m.name);
              return;
            }

            if (data.kind === "done") {
              const m = metaRef.current;
              if (!m) return;

              const blob = new Blob(chunksRef.current, {
                type: m.type || "application/octet-stream",
              });
              const url = URL.createObjectURL(blob);

              setDownloadUrl(url);
              setReady(true);

              onReceived({
                id: m.id,
                name: m.name,
                size: m.size,
                url,
                at: Date.now(),
              });

              return;
            }

            return;
          }

          // binary chunk
          const buf = msg.data as ArrayBuffer;
          chunksRef.current.push(buf);
          setReceived((x) => x + buf.byteLength);
        };
      };

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { roomId, answer });

      const onIce = async ({ candidate }: any) => {
        try {
          await pc.addIceCandidate(candidate);
        } catch {}
      };

      socket.on("webrtc:ice", onIce);

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          // optional: setWaiting(true)
        }
      };
    };

    socket.on("webrtc:offer", onOffer);
    return () => {
      socket.off("webrtc:offer", onOffer);
    };
  }, [socket, roomId, downloadUrl, onReceived]);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <h2 className="text-lg font-semibold">Receive file</h2>

      {waiting ? (
        <p className="mt-3 text-sm text-white/60">Waiting for sender…</p>
      ) : (
        <>
          <div className="mt-3 text-sm text-white/80">
            {meta ? (
              <>
                <div>
                  Incoming: <span className="font-semibold">{meta.name}</span>
                </div>
                <div className="text-white/50">
                  Size: {formatBytes(meta.size)}
                </div>
              </>
            ) : (
              <div className="text-white/50">Connecting…</div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{progress}%</span>
              <span>{formatBytes(received)}</span>
            </div>

            <progress
              value={progress}
              max={100}
              className="mt-2 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:bg-white/70"
            />
          </div>

          {ready && downloadUrl && (
            <div className="mt-4 flex gap-3">
              <a
                href={downloadUrl}
                download={fileName}
                className="flex-1 rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-slate-950 hover:bg-white/90"
              >
                Download
              </a>

              <button
                onClick={() => {
                  URL.revokeObjectURL(downloadUrl);
                  setDownloadUrl(null);
                  setReady(false);

                  chunksRef.current = [];
                  setMeta(null);
                  setReceived(0);
                  setWaiting(true);
                }}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
