// 获取 DOM 元素
const keywordsList = document.getElementById("keywords-list");
const emptyMessage = document.getElementById("empty-message");

// 从浏览器存储中加载关键词列表
function loadKeywords() {
  chrome.storage.sync.get("keywords", (data) => {
    const keywords = data.keywords || []; // 如果没有配置，默认为空数组

    // 清空现有的列表
    keywordsList.innerHTML = "";

    if (keywords.length === 0) {
      // 如果没有关键词，显示提示信息
      emptyMessage.style.display = "block";
    } else {
      // 如果有关键词，隐藏提示信息并显示列表
      emptyMessage.style.display = "none";

      keywords.forEach(keyword => {
        const listItem = document.createElement("li");
        listItem.textContent = keyword;
        keywordsList.appendChild(listItem);
      });
    }
  });
}

// 初始化加载
loadKeywords();