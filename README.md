```markdown
# 📂 P2P File Transfer

A browser-based **peer-to-peer file transfer app** using **WebRTC** for direct data transfer and **Socket.IO** for signaling.  
This project allows users to send files directly between browsers without uploading them to a central server.

---

## ✨ Features
- 🔗 Create / Join rooms using Socket.IO signaling
- 📤 Direct browser-to-browser file transfer over WebRTC data channels
- 📊 Real-time file transfer progress indicator
- 🔒 No files stored on server — fully peer-to-peer
- 🖥️ Simple and minimal UI

---

## 🛠️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript (or React if you extend it)
- **Backend (Signaling Server)**: Node.js + Express + Socket.IO
- **Web APIs**:  
  - WebRTC (RTCPeerConnection, DataChannel)  
  - getUserMedia (optional for audio/video)

---

## 📂 Project Structure
```

p2p-file-transfer/
├── frontend/          # client-side code (HTML/CSS/JS)
├── server/            # Node.js + Socket.IO signaling server
├── .gitignore
├── README.md

````

---

## 🚀 Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/kritmanrao/p2p-file-transfer.git
cd p2p-file-transfer
````

### 2️⃣ Start the signaling server

```bash
cd server
npm install
npm start
```

By default the server runs on **[http://localhost:3000](http://localhost:3000)**.

### 3️⃣ Start the frontend

* Open the `frontend/index.html` file directly in a browser, **or**
* Use a simple HTTP server (e.g., `npm install -g live-server`)

```bash
cd frontend
live-server
```

---

## 🎮 How It Works

1. User **A** creates a room → server generates a unique room ID.
2. User **B** joins the same room using that room ID.
3. Server uses **Socket.IO** to exchange WebRTC offers/answers (signaling).
4. Once the peer connection is established, files are transferred **directly** between browsers via WebRTC DataChannels.
5. The server is **only used for signaling**, not for file storage.

---

## 📸 Demo (Optional)

*Add screenshots or a GIF here showing file transfer in action.*

---

## 📜 .gitignore (important)

```gitignore
# Node.js dependencies
node_modules/

# Logs
*.log

# Environment files
.env

# Build outputs
dist/
build/

# OS/editor files
.DS_Store
Thumbs.db
.vscode/
.idea/
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Kritman Kumar Rao**

* GitHub: [@kritmanrao](https://github.com/kritmanrao)
* LinkedIn: [Kritman Kumar Rao](https://www.linkedin.com/in/kritman-kumar-rao-009325327/)
* LeetCode: [kritmanrao](https://leetcode.com/u/kritmanrao/)

````

---

👉 Next step: Copy this into your repo’s `README.md`, commit, and push:

```bash
git add README.md
git commit -m "docs: add full project README"
git push origin main
````

---
