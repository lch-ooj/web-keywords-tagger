let keywords = [];
chrome.storage.sync.get("keywords", (data) => {
  keywords = data.keywords || [];
  getAllTextContent(keywords);
});


function getAllTextContent() {
  let allText = "";

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.processed) return;

      const text = node.textContent.trim();
      if (text) {
        allText += text + " ";

        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            highlightNode(node, keyword);
            showWarning(keyword);
          }
        });
        node.processed = true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(child => traverse(child));
    }
  }

  function highlightNode(textNode, keyword) {
    const text = textNode.textContent;
    const index = text.indexOf(keyword);
    if (index === -1) return;

    const fragment = document.createDocumentFragment();

    if (index > 0) {
      const beforeText = document.createTextNode(text.substring(0, index));
      fragment.appendChild(beforeText);
    }

    const keywordSpan = document.createElement("span");
    keywordSpan.style.backgroundColor = "red";
    keywordSpan.style.color = "white";
    keywordSpan.textContent = keyword;
    fragment.appendChild(keywordSpan);

    const afterIndex = index + keyword.length;
    if (afterIndex < text.length) {
      const afterText = document.createTextNode(text.substring(afterIndex));
      fragment.appendChild(afterText);
    }

    if (textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    } else {
      console.warn("Text node has no parent node:", textNode);
    }
  }

  function showWarning(keyword) {
    if (document.getElementById("warning-box")) return;

    const warningBox = document.createElement("div");
    warningBox.id = "warning-box";
    warningBox.style.position = "fixed";
    warningBox.style.top = "20px";
    warningBox.style.right = "20px";
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) {
      warningBox.style.width = "90%";
    } else {
      warningBox.style.width = "400px";
    }
    warningBox.style.padding = "15px 20px";
    warningBox.style.backgroundColor = "green";
    warningBox.style.color = "white";
    warningBox.style.borderRadius = "8px";
    warningBox.style.zIndex = "9999";
    warningBox.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
    warningBox.style.fontSize = "22px";
    warningBox.style.lineHeight = "1.5";
    warningBox.style.textAlign = "center";
    warningBox.textContent = `警告：页面中包含‘${keyword}’！`;

    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.float = "right";
    closeButton.style.background = "none";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "21px";
    closeButton.style.cursor = "pointer";
    closeButton.onclick = () => warningBox.remove();

    warningBox.appendChild(closeButton);

    document.body.appendChild(warningBox);

    setTimeout(() => {
      warningBox.remove();
    }, 8000);
  }

  traverse(document.body);
}