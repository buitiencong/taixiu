let isRolling = false;  // Đang lắc hay không

function rollDice() {
  if (isRolling) return;
  isRolling = true;
  playRollSound();

  const button = document.getElementById("roll-button");
  const area = document.getElementById("dice-area");
  const messageElem = document.getElementById("message");

  // Ẩn thông báo
  messageElem.style.display = "none";
  messageElem.classList.remove("tai", "xiu");

  // Đổi nội dung nút và disable
  button.innerText = "Đang lắc...";
  button.disabled = true;

  // Xoá xúc xắc và bát cũ
  area.querySelectorAll(".dice").forEach(d => d.remove());
  const oldBowl = document.getElementById("bowl");
  if (oldBowl) oldBowl.remove();

  // Tạo lại bát nhưng chờ ảnh load xong mới xử lý tiếp
  const bowl = document.createElement("img");
  bowl.src = "bat.png";
  bowl.id = "bowl";
  bowl.style.position = "absolute";
  bowl.style.left = "0";
  bowl.style.top = "0";
  bowl.style.cursor = "not-allowed";

  bowl.onload = () => {
    area.appendChild(bowl);
    // Căn giữa bát theo vùng dice-area
    const areaRect = area.getBoundingClientRect();
    const bowlWidth = bowl.offsetWidth;
    const bowlHeight = bowl.offsetHeight;

    const centerLeft = (area.offsetWidth - bowlWidth) / 2;
    const centerTop = (area.offsetHeight - bowlHeight) / 2;

    bowl.style.left = `${centerLeft}px`;
    bowl.style.top = `${centerTop}px`;


    const plate = document.getElementById("plate");
    bowl.classList.add("shaking");
    if (plate) plate.classList.add("shaking");

    continueDiceRoll(); // xử lý tiếp phần sau
  };

  bowl.onerror = () => {
    console.error("Không thể tải ảnh bat.png");
    isRolling = false;
    button.disabled = false;
    button.innerText = "Lắc lại";
  };
}


function continueDiceRoll() {
  const area = document.getElementById("dice-area");
  const button = document.getElementById("roll-button");

  const taiChance = parseInt(document.getElementById("prob-slider").value);
  let total;
  if (Math.random() * 100 < taiChance) {
    do {
      total = 0;
      for (let j = 0; j < 3; j++) {
        total += Math.floor(Math.random() * 6) + 1;
      }
    } while (total <= 10);
  } else {
    do {
      total = 0;
      for (let j = 0; j < 3; j++) {
        total += Math.floor(Math.random() * 6) + 1;
      }
    } while (total > 10);
  }

  const diceValues = generateDiceFromTotal(total);

  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      const num = diceValues[i];
      const dice = document.createElement("img");
      dice.src = `${num}.png`;
      dice.classList.add("dice");

      const areaSize = 300;
      const usableRatio = 0.5;
      const usableSize = areaSize * usableRatio;
      const margin = (areaSize - usableSize) / 2;
      const posX = margin + Math.random() * (usableSize - 60);
      const posY = margin + Math.random() * (usableSize - 60);

      dice.style.position = "absolute";
      dice.style.left = `${posX}px`;
      dice.style.top = `${posY}px`;

      area.appendChild(dice);
      makeDraggableDice(dice);
    }

    const bowl = document.getElementById("bowl");
    const plate = document.getElementById("plate");
    if (bowl) bowl.classList.remove("shaking");
    if (plate) plate.classList.remove("shaking");

    bowl.style.cursor = "grab";
    makeDraggableBowl(bowl);

    button.innerText = "Lắc";
    button.disabled = false;
    isRolling = false;
  }, 3000);
}







// Hàm cho phép kéo tự do bát (không giới hạn)
function makeDraggableBowl(elem) {
  let offsetX = 0, offsetY = 0;
  let isDragging = false;

  elem.style.cursor = "grab";

  elem.addEventListener("mousedown", startDrag);
  elem.addEventListener("touchstart", startDrag, { passive: false });

  const testCanvas = document.createElement("canvas");
  const testCtx = testCanvas.getContext("2d");

    function startDrag(e) {
      e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Tính vị trí tương đối trong ảnh
      const rect = elem.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      // Chuẩn bị canvas cùng kích thước
      testCanvas.width = elem.naturalWidth;
      testCanvas.height = elem.naturalHeight;
      testCtx.clearRect(0, 0, testCanvas.width, testCanvas.height);
      testCtx.drawImage(elem, 0, 0);

      // Tính toạ độ trên ảnh gốc (vì ảnh có thể bị scale)
      const scaleX = elem.naturalWidth / elem.offsetWidth;
      const scaleY = elem.naturalHeight / elem.offsetHeight;
      const imgX = Math.floor(relX * scaleX);
      const imgY = Math.floor(relY * scaleY);

      const pixel = testCtx.getImageData(imgX, imgY, 1, 1).data;

      // pixel[3] = alpha, nếu bằng 0 thì là trong suốt
      if (pixel[3] === 0) return; // ❌ Không kéo nếu bấm vào phần trong suốt

      // Nếu hợp lệ, bắt đầu kéo
      isDragging = true;
      elem.style.cursor = "grabbing";

      offsetX = relX;
      offsetY = relY;

      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", stopDrag);
      document.addEventListener("touchmove", onDrag, { passive: false });
      document.addEventListener("touchend", stopDrag);
    }

    function onDrag(e) {
    if (!isDragging) return;

    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const area = document.getElementById("dice-area");
    const rect = area.getBoundingClientRect();

    let newLeft = clientX - rect.left - offsetX;
    let newTop = clientY - rect.top - offsetY;

    elem.style.position = "absolute";
    elem.style.left = `${newLeft}px`;
    elem.style.top = `${newTop}px`;

    // Lấy bounding box của bát
    const rawRect = elem.getBoundingClientRect();
    const paddingRatio = 0.15; // chỉnh nhỏ hoặc lớn hơn nếu cần
    const bowlRect = {
      left: rawRect.left + rawRect.width * paddingRatio,
      right: rawRect.right - rawRect.width * paddingRatio,
      top: rawRect.top + rawRect.height * paddingRatio,
      bottom: rawRect.bottom - rawRect.height * paddingRatio
    };

    const diceImgs = document.querySelectorAll(".dice");

    // Kiểm tra xem tâm của từng viên xúc xắc có nằm trong bát không
    let anyCovered = false;
    diceImgs.forEach(dice => {
      const diceRect = dice.getBoundingClientRect();
      const centerX = diceRect.left + diceRect.width / 2;
      const centerY = diceRect.top + diceRect.height / 2;

      const isInside =
        centerX >= bowlRect.left &&
        centerX <= bowlRect.right &&
        centerY >= bowlRect.top &&
        centerY <= bowlRect.bottom;

      if (isInside) anyCovered = true;
    });

    const messageElem = document.getElementById("message");

    if (!anyCovered) {
      // Không che tâm viên nào → hiện kết quả
      let total = 0;
      diceImgs.forEach(dice => {
        const match = dice.src.match(/(\d)\.png$/);
        if (match) total += parseInt(match[1]);
      });

      const result = total > 10 ? "🎲 Tài" : "🎲 Xỉu";
      messageElem.style.display = "block";
      messageElem.textContent = result;


      // Xóa class cũ, thêm class mới
      messageElem.classList.remove("tai", "xiu");
      messageElem.classList.add(result.includes("Tài") ? "tai" : "xiu");

    } else {
      messageElem.textContent = "";
    }
  }



  function stopDrag() {
    isDragging = false;
    elem.style.cursor = "grab";

    // Gỡ event listener khi kết thúc kéo
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", stopDrag);
  }
}



// Hàm cho phép kéo xúc sắc, giới hạn trong vùng #dice-area
function makeDraggableDice(elem) {
  let offsetX = 0, offsetY = 0;
  let isDragging = false;

  elem.style.cursor = "grab";

  elem.addEventListener("mousedown", startDrag);
  elem.addEventListener("touchstart", startDrag, { passive: false });

  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    elem.style.cursor = "grabbing";

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = elem.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("touchend", stopDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const area = document.getElementById("dice-area");
    const rect = area.getBoundingClientRect();

    let x = clientX - rect.left - offsetX;
    let y = clientY - rect.top - offsetY;

    // Giới hạn kéo trong vùng #dice-area
    x = Math.max(0, Math.min(x, rect.width - elem.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - elem.offsetHeight));

    elem.style.position = "absolute";
    elem.style.left = `${x}px`;
    elem.style.top = `${y}px`;
  }

  function stopDrag() {
    isDragging = false;
    elem.style.cursor = "grab";
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", stopDrag);
  }
}


// Thanh trượt
const slider = document.getElementById("prob-slider");
const label = document.getElementById("prob-label");

slider.addEventListener("input", () => {
  label.textContent = `Xác suất ra Tài: ${slider.value}%`;
});

// Tạo xúc sắc theo thanh trượt
function generateDiceFromTotal(total) {
  while (true) {
    const a = Math.floor(Math.random() * 6) + 1;
    const b = Math.floor(Math.random() * 6) + 1;
    const c = total - a - b;
    if (c >= 1 && c <= 6) return [a, b, c];
  }
}


// LẮC ĐIỆN THOẠI ĐỂ LẮC XÚC XẮC
let lastShakeTime = 0;
const shakeThreshold = 25; // có thể chỉnh lên 30 nếu quá nhạy
const shakeCooldown = 2000; // ms

function initShakeListener() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(state => {
        if (state === 'granted') {
          window.addEventListener('devicemotion', detectShake);
        } else {
          alert("Không được cấp quyền cảm biến chuyển động.");
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('devicemotion', detectShake);
  }
}

function detectShake(event) {
  const acc = event.accelerationIncludingGravity;
  if (!acc) return;

  const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
  const now = Date.now();

  if (force > shakeThreshold && now - lastShakeTime > shakeCooldown) {
    lastShakeTime = now;
    simulateRollByShake();
  }
}

function simulateRollByShake() {
  if (isRolling) return;
  rollDice();
}



let hasRequestedMotionPermission = false;

function handleUserRoll() {
  if (isRolling) return;

  if (!hasRequestedMotionPermission && typeof DeviceMotionEvent?.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(state => {
      if (state === 'granted') {
        window.addEventListener('devicemotion', detectShake);
        hasRequestedMotionPermission = true;
      }
    }).catch(console.error);
  }

  rollDice();
}



// Phát âm thanh
let isMuted = true;
let audioContext = null;
let rollBuffer = null;
let hasLoadedAudio = false;

function initAudio() {
  if (hasLoadedAudio) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  fetch('sound.mp3')
    .then(res => res.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => {
      rollBuffer = buffer;
      hasLoadedAudio = true;
    })
    .catch(err => {
      console.error("Không thể tải âm thanh:", err);
    });
}

function playRollSound() {
  if (isMuted || !rollBuffer || !audioContext) return;

  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      playRollSound(); // thử lại sau resume
    });
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = rollBuffer;
  source.connect(audioContext.destination);
  source.start(0);
}

// ✅ Đặt sau khi khai báo các hàm trên
document.addEventListener("click", () => {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
});




// Bật tắt âm thanh


// Gán sự kiện toggle âm thanh
const soundToggleBtn = document.getElementById("sound-toggle");
const iconSoundOn = document.getElementById("icon-sound-on");
const iconSoundOff = document.getElementById("icon-sound-off");

soundToggleBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  iconSoundOn.style.display = isMuted ? "none" : "inline";
  iconSoundOff.style.display = isMuted ? "inline" : "none";

  if (!isMuted && !hasLoadedAudio) {
    initAudio(); // ✅ chỉ tải khi người dùng bật âm thanh
  }
});


// Load ảnh bát ngay từ đầu
window.addEventListener("load", () => {
  const area = document.getElementById("dice-area");

  // Nếu chưa có bát, thêm bát vào
  if (!document.getElementById("bowl")) {
    const bowl = document.createElement("img");
    bowl.src = "bat.png";
    bowl.id = "bowl";
    bowl.style.position = "absolute";
    bowl.style.cursor = "grab";
    bowl.style.zIndex = "3";
    bowl.style.width = "65%";
    bowl.style.height = "auto";

    bowl.onload = () => {
      // Căn giữa
      const bowlWidth = bowl.offsetWidth;
      const bowlHeight = bowl.offsetHeight;
      const centerLeft = (area.offsetWidth - bowlWidth) / 2;
      const centerTop = (area.offsetHeight - bowlHeight) / 2;
      bowl.style.left = `${centerLeft}px`;
      bowl.style.top = `${centerTop}px`;

      makeDraggableBowl(bowl);
    };

    area.appendChild(bowl);
  }
});
