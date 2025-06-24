function rollDice() {
  // Xoá thông báo cũ
  const messageElem = document.getElementById("message");
  messageElem.textContent = "";
  messageElem.classList.remove("tai", "xiu");

  const area = document.getElementById("dice-area");

  // Xoá xúc xắc và bát cũ nếu có
  const oldDice = area.querySelectorAll(".dice");
  oldDice.forEach(d => d.remove());

  const oldBowl = document.getElementById("bowl");
  if (oldBowl) oldBowl.remove();

  // Lấy xác suất ra Tài từ thanh trượt
  const taiChance = parseInt(document.getElementById("prob-slider").value);

  // Sinh tổng điểm theo xác suất Tài/Xỉu
  let total;
  if (Math.random() * 100 < taiChance) {
    // Ép ra Tài (tổng > 10)
    do {
      total = 0;
      for (let j = 0; j < 3; j++) {
        total += Math.floor(Math.random() * 6) + 1;
      }
    } while (total <= 10);
  } else {
    // Ép ra Xỉu (tổng ≤ 10)
    do {
      total = 0;
      for (let j = 0; j < 3; j++) {
        total += Math.floor(Math.random() * 6) + 1;
      }
    } while (total > 10);
  }

  // Tách tổng thành 3 viên xúc xắc
  const diceValues = generateDiceFromTotal(total);

  // Tạo 3 viên xúc xắc
  for (let i = 0; i < 3; i++) {
    const num = diceValues[i];
    const dice = document.createElement("img");
    dice.src = `${num}.png`;
    dice.classList.add("dice");

    // Vị trí trong vùng 50% giữa đĩa
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

  // Thêm bát lên trên
  const bowl = document.createElement("img");
  bowl.src = "bat.png";
  bowl.id = "bowl";
  bowl.style.position = "absolute";
  bowl.style.left = "0";
  bowl.style.top = "0";
  area.appendChild(bowl);

  // Cho phép kéo bát thoải mái
  makeDraggableBowl(bowl);
}



// Hàm cho phép kéo tự do bát (không giới hạn)
function makeDraggableBowl(elem) {
  let offsetX = 0, offsetY = 0;
  let isDragging = false;

  elem.style.cursor = "grab";

  elem.addEventListener("mousedown", startDrag);
  elem.addEventListener("touchstart", startDrag, { passive: false });

  function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    elem.style.cursor = "grabbing";

    // Lấy vị trí con trỏ chuột hoặc chạm
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Lấy bounding rect của element (vị trí tuyệt đối trên viewport)
    const rect = elem.getBoundingClientRect();

    // Tính offset = khoảng cách con trỏ chuột so với góc trên trái của ảnh
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    // Đăng ký event listener trên document để theo dõi kéo chuột/di chuyển
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
