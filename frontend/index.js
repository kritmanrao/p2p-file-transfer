const localVideo = document.getElementById("localVideo");
let flag = false;

function turnOnMedia() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.srcObject = stream;
    })
    .catch((e) => console.log(e));
}

function handleClick(btn) {
  if (flag) {
    const stream = localVideo.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    flag = false;
    localVideo.srcObject = null;
    btn.innerText = "Turn on Media";
    return;
  }
  turnOnMedia();
  btn.innerText = "Turn off Media";
  flag = true;
}
