// 获取 DOM 元素
const keywordsInput = document.getElementById("keywords-input");
const saveButton = document.getElementById("save-button");
const messageDiv = document.getElementById("message");

// 加载已保存的关键词
function loadKeywords() {
  chrome.storage.sync.get("keywords", (data) => {
    if (data.keywords) {
      keywordsInput.value = data.keywords.join("\n");
    }
  });
}

// 保存关键词到浏览器存储
saveButton.addEventListener("click", () => {
  const keywords = keywordsInput.value.split("\n").map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);
  chrome.storage.sync.set({ keywords }, () => {
    messageDiv.textContent = "关键词已保存！";
    setTimeout(() => {
      messageDiv.textContent = "";
    }, 3000);
  });
});

// 初始化加载
loadKeywords();