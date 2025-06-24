function rollDice() {
  const area = document.getElementById("dice-area");

  // Xoá xúc xắc và bát cũ nếu có
  const oldDice = area.querySelectorAll(".dice");
  oldDice.forEach(d => d.remove());

  const oldBowl = document.getElementById("bowl");
  if (oldBowl) oldBowl.remove();

  // Tạo 3 xúc xắc ngẫu nhiên
  for (let i = 0; i < 3; i++) {
    const num = Math.floor(Math.random() * 6) + 1;
    const dice = document.createElement("img");
    dice.src = `${num}.png`;
    dice.classList.add("dice");

    // Vị trí ngẫu nhiên trên đĩa
    const posX = 60 + Math.random() * 120; // khoảng trong đĩa
    const posY = 80 + Math.random() * 100;

    dice.style.position = "absolute";
    dice.style.left = `${posX}px`;
    dice.style.top = `${posY}px`;

    area.appendChild(dice);

    // Cho phép kéo từng viên xúc xắc, giới hạn trong đĩa
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

  // Cho phép kéo bát thoải mái, không giới hạn vùng
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

  // Kiểm tra nếu bát nằm ngoài đĩa
  const bowlRect = elem.getBoundingClientRect();
  const plateRect = rect; // hoặc: document.getElementById("plate").getBoundingClientRect();

  const isOut =
    bowlRect.right < plateRect.left ||
    bowlRect.left > plateRect.right ||
    bowlRect.bottom < plateRect.top ||
    bowlRect.top > plateRect.bottom;

  const messageElem = document.getElementById("message");
  if (isOut) {
    // Tính tổng 3 viên xúc xắc
    const diceImgs = document.querySelectorAll(".dice");
    let total = 0;
    diceImgs.forEach(dice => {
      const match = dice.src.match(/(\d)\.png$/);
      if (match) total += parseInt(match[1]);
    });
    // messageElem.textContent = `🎲 Tổng điểm: ${total}`;
    const result = total > 10 ? "🎲 Tài" : "🎲 Xỉu";
    messageElem.textContent = result;

    messageElem.style.color = "green";
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

