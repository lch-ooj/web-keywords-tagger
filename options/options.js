
const keywordsInput = document.getElementById("keywords-input");
const saveButton = document.getElementById("save-button");
const messageDiv = document.getElementById("message");

function loadKeywords() {
  chrome.storage.sync.get("keywords", (data) => {
    if (data.keywords) {
      keywordsInput.value = data.keywords.join("\n");
    }
  });
}

saveButton.addEventListener("click", () => {
  const keywords = keywordsInput.value.split("\n").map(keyword => keyword.trim()).filter(keyword => keyword.length > 0);
  chrome.storage.sync.set({ keywords }, () => {
    messageDiv.textContent = "敏感词已保存！";
    setTimeout(() => {
      messageDiv.textContent = "";
    }, 3000);
  });
});

loadKeywords();