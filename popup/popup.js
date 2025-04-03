
const keywordsList = document.getElementById("keywords-list");
const emptyMessage = document.getElementById("empty-message");

function loadKeywords() {
  chrome.storage.sync.get("keywords", (data) => {
    const keywords = data.keywords || []; 

    keywordsList.innerHTML = "";

    if (keywords.length === 0) {
      emptyMessage.style.display = "block";
    } else {
      emptyMessage.style.display = "none";

      keywords.forEach(keyword => {
        const listItem = document.createElement("li");
        listItem.textContent = keyword;
        keywordsList.appendChild(listItem);
      });
    }
  });
}

loadKeywords();