import { useEffect, useState } from "react";
import { useSocket } from "./service/socket";

import Sender from "./components/Sender";
import Receiver from "./components/Receiver";
import RightPanel from "./components/RightPanel"; // create this file from my earlier RightPanel component

type Step = "choose" | "send" | "receive";

export type SharedFile = {
  id: string;
  name: string;
  size: number;
  at: number;
};

export type ReceivedFile = {
  id: string;
  name: string;
  size: number;
  url: string;
  at: number;
};

export default function App() {
  const { socket } = useSocket();

  const [step, setStep] = useState<Step>("choose");
  const [roomId, setRoomId] = useState("123");
  const [joined, setJoined] = useState(false);

  const [tipsOpen, setTipsOpen] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);

  function joinRoom() {
    const r = roomId.trim();
    if (!r) return;
    socket.emit("room:join", r);
    setJoined(true);
  }

  function deleteReceived(id: string) {
    setReceivedFiles((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((x) => x.id !== id);
    });
  }

  // ✅ cleanup all object urls on unmount
  useEffect(() => {
    return () => {
      receivedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [receivedFiles]);

  return (
    <div className="min-h-screen bg-[#070a14] text-white">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute right-[-80px] -bottom-40 h-[520px] w-[520px] rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {socket.connected ? "Connected" : "Disconnected"}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Drop & share files instantly
          </h1>

          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            WebRTC sends files peer-to-peer. Socket.IO is only used to connect
            peers (signaling).
          </p>
        </div>

        {/* Join Room Card */}
        <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Join a room</div>
              <div className="text-xs text-white/60">
                Open this in 2 tabs/devices, use the same room id.
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. 234"
                className="h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none placeholder:text-white/30 focus:border-white/20 sm:w-64"
              />

              <button
                onClick={joinRoom}
                className="h-11 rounded-2xl bg-white px-5 text-sm font-bold text-slate-950 hover:bg-white/90 disabled:opacity-50"
                disabled={!socket.connected}
              >
                {joined ? "Joined" : "Join room"}
              </button>
            </div>
          </div>

          {joined && (
            <div className="mt-4 text-xs text-white/60">
              Room:{" "}
              <span className="font-semibold text-white/80">
                {roomId.trim()}
              </span>
            </div>
          )}
        </div>

        {/* Step chooser */}
        {step === "choose" && (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setStep("send")}
              disabled={!joined}
              className="group rounded-3xl border border-white/10 bg-white/5 p-7 text-left backdrop-blur transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="text-xl font-extrabold">Send</div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  Drag & drop
                </div>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Choose a file and send it directly peer-to-peer.
              </p>
              <div className="mt-5 text-sm font-semibold text-white/80 group-hover:text-white">
                Continue →
              </div>
            </button>

            <button
              onClick={() => setStep("receive")}
              disabled={!joined}
              className="group rounded-3xl border border-white/10 bg-white/5 p-7 text-left backdrop-blur transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="text-xl font-extrabold">Receive</div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  Waiting mode
                </div>
              </div>
              <p className="mt-2 text-sm text-white/60">
                Stay ready to accept a file from someone in your room.
              </p>
              <div className="mt-5 text-sm font-semibold text-white/80 group-hover:text-white">
                Continue →
              </div>
            </button>
          </div>
        )}

        {/* Step render */}
        {step !== "choose" && (
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between md:col-span-2">
              <button
                onClick={() => setStep("choose")}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
              >
                ← Back
              </button>

              <div className="text-xs text-white/60">
                Room:{" "}
                <span className="font-semibold text-white/80">
                  {roomId.trim()}
                </span>
              </div>
            </div>

            {step === "send" ? (
              <Sender
                roomId={roomId.trim()}
                onShared={(f) => setSharedFiles((prev) => [f, ...prev])}
              />
            ) : (
              <Receiver
                roomId={roomId.trim()}
                onReceived={(f) => setReceivedFiles((prev) => [f, ...prev])}
              />
            )}

            {/* ✅ Replace static Tips with RightPanel */}
            <RightPanel
              tipsOpen={tipsOpen}
              setTipsOpen={setTipsOpen}
              sharedFiles={sharedFiles}
              receivedFiles={receivedFiles}
              onDeleteReceived={deleteReceived}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/*
export function App1() {
  const { socket } = useSocket();

  const [step, setStep] = useState<Step>("choose");
  const [roomId, setRoomId] = useState("234");
  const [joined, setJoined] = useState(false);

  function joinRoom() {
    const r = roomId.trim();
    if (!r) return;
    socket.emit("room:join", r);
    setJoined(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-6 shadow-xl">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">
              Peer-to-Peer File Transfer (WebRTC)
            </h1>
            <p className="text-sm text-white/60">
              Socket.IO is only for signaling. File goes via WebRTC DataChannel.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <span className="text-sm font-semibold">Room</span>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-56 rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none placeholder:text-white/30"
              placeholder="room id"
            />
            <button
              onClick={joinRoom}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              {joined ? "Joined" : "Join room"}
            </button>

            <div className="ml-auto text-xs text-white/50">
              Socket: {socket.connected ? "connected" : "disconnected"}
            </div>
          </div>

          <div className="my-6 h-px bg-white/10" />

          {step === "choose" && (
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setStep("send")}
                disabled={!joined}
                className="group rounded-2xl border border-white/10 bg-slate-950/40 p-7 text-left hover:bg-slate-950/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-lg font-extrabold">Send file</div>
                <div className="mt-2 text-sm text-white/60">
                  Drag & drop or browse from device
                </div>
              </button>

              <button
                onClick={() => setStep("receive")}
                disabled={!joined}
                className="group rounded-2xl border border-white/10 bg-slate-950/40 p-7 text-left hover:bg-slate-950/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="text-lg font-extrabold">Receive file</div>
                <div className="mt-2 text-sm text-white/60">
                  Wait for sender in the same room
                </div>
              </button>
            </div>
          )}

          {step !== "choose" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between md:col-span-2">
                <button
                  onClick={() => setStep("choose")}
                  className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
                >
                  ← Back
                </button>
                <div className="text-xs text-white/50">
                  Room:{" "}
                  <span className="font-semibold text-white/80">
                    {roomId.trim()}
                  </span>
                </div>
              </div>

              {step === "send" ? (
                <Sender roomId={roomId.trim()} />
              ) : (
                <Receiver roomId={roomId.trim()} />
              )}

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-white/70">
                <div className="font-semibold text-white">Tip</div>
                <p className="mt-2 text-sm text-white/60">
                  If WebRTC fails on some networks, later you’ll add TURN
                  (normal in production).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}*/
