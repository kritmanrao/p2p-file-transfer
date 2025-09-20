# p2p-file-transfer

Browser-based peer-to-peer file transfer using WebRTC data channels and Socket.IO for signaling.

![demo-gif-placeholder](./demo.gif)

## Features
- Create / join rooms using Socket.IO signaling
- Direct browser-to-browser file transfer over WebRTC data channels
- Progress indicator and simple UI
- No files uploaded to server — direct peer transfer

## Tech stack
- Client: plain JavaScript / HTML / CSS (or React)
- Signaling server: Node.js + Express + Socket.IO
- Web APIs: WebRTC (RTCPeerConnection, DataChannel), getUserMedia (if you use webcam/voice)

## Quick start (example)
1. Clone:
```bash
git clone https://github.com/kritmanrao>/p2p-file-transfer.git
cd p2p-file-transfer
