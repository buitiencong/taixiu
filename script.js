const questionElement = document.getElementById("question");
const answerInput = document.getElementById("answer");
const submitButton = document.getElementById("submit");
const bridgeContainer = document.getElementById("bridge-container");
const messageElement = document.getElementById("message");

const maxBridgeParts = 5;
let currentBridgeParts = 0;
let currentQuestion = { a: 0, b: 0 };

// Tạo sẵn các mảnh cầu và ẩn đi
function generateBridgeSkeleton() {
  // Tạo ảnh bờ trái
  const leftBank = document.createElement("img");
  leftBank.src = "left-bank.jpg"; // 👈 đổi đường dẫn phù hợp
  leftBank.classList.add("bridge-bank");
  leftBank.style.gridColumn = "1";
  bridgeContainer.appendChild(leftBank);

  // Tạo 5 mảnh cầu vào các cột 2–6
  for (let i = 0; i < maxBridgeParts; i++) {
    const segment = document.createElement("img");
    segment.src = "bridge.jpg";
    segment.style.visibility = "hidden";
    segment.style.width = "60px";
    segment.classList.add("bridge-segment");
    segment.style.gridColumn = (i + 2).toString(); // Cột 2 → 6
    bridgeContainer.appendChild(segment);
  }

  // Tạo ảnh bờ phải
  const rightBank = document.createElement("img");
  rightBank.src = "right-bank.jpg"; // 👈 đổi đường dẫn phù hợp
  rightBank.classList.add("bridge-bank");
  rightBank.style.gridColumn = "7";
  bridgeContainer.appendChild(rightBank);
}


// Hiện từng mảnh cầu theo thứ tự
function showNextBridgePart() {
  const segments = document.querySelectorAll(".bridge-segment");
  if (currentBridgeParts < segments.length) {
    const segment = segments[currentBridgeParts];
    segment.style.visibility = "visible";
    segment.classList.add("fall-in"); // 💥 Thêm hiệu ứng rơi
    currentBridgeParts++;
  }
}

// Xoá mảnh cầu
function removeLastBridgePart() {
  const segments = document.querySelectorAll(".bridge-segment");
  if (currentBridgeParts > 0) {
    currentBridgeParts--;
    const segment = segments[currentBridgeParts];
    segment.style.visibility = "hidden";
    segment.classList.remove("fall-in");
  }
}


// Tạo câu hỏi ngẫu nhiên
function generateQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  currentQuestion = { a, b };
  questionElement.textContent = `📐 ${a} + ${b} = ?`;
  answerInput.value = "";
  answerInput.focus();
}

// Xử lý khi nhấn nút "Trả lời"
submitButton.addEventListener("click", () => {
  const userAnswer = parseInt(answerInput.value.trim());
  const correctAnswer = currentQuestion.a + currentQuestion.b;

  if (userAnswer === correctAnswer) {
    showNextBridgePart();

    if (currentBridgeParts >= maxBridgeParts) {
      messageElement.textContent = "🎉 Bạn đã hoàn thành cây cầu!";
      submitButton.disabled = true;
      answerInput.disabled = true;
    } else {
      generateQuestion();
    }
  } else {
    alert("❌ Sai rồi! Thử lại nhé.");
    removeLastBridgePart();
    answerInput.focus();
  }

});

// Khởi động khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  generateBridgeSkeleton();
  generateQuestion();
});
