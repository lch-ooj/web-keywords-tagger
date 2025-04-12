let keywords = [];
// 创建一个对象来存储关键词的出现次数
const keywordCounts = {};

//chrome.storage.sync.get 是一个异步操作，其回调函数会在数据加载完成后执行
//防止先执行main函数，再加载，确保keywords有数据
chrome.storage.sync.get("keywords", (data) => {
  keywords = data.keywords || []; // 如果没有配置，默认为空数组
  // 初始化计数器
  keywords.forEach(keyword => {
    keywordCounts[keyword] = 0;
  });
  // 调用函数
  mainFunction(keywords);
});

// 获取页面中的所有文字内容，并在检测到特定关键字时标红和弹出提示
function mainFunction() {
  // 定义一个变量来存储所有文字内容
  let allText = "";

  // 遍历 DOM 树，提取每个文本节点的内容
  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // 如果节点已被处理，跳过
      if (node.processed) return;

      const text = node.textContent.trim();
      if (text) {
        allText += text + " "; // 添加到结果中，并用空格分隔

        // 检查是否包含任意关键字
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            keywordCounts[keyword]++; // 更新关键词计数
            highlightNode(node, keyword); // 高亮该文本节点中的关键字
          }
        });

        // 标记节点为已处理
        node.processed = true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(child => traverse(child));
    }
  }

  // 高亮包含关键字的文本节点
  function highlightNode(textNode, keyword) {
    const text = textNode.textContent;
    const index = text.indexOf(keyword);
    if (index === -1) return;

    // 创建一个新的文档片段来存放拆分后的节点
    const fragment = document.createDocumentFragment();

    // 处理关键字前的部分
    if (index > 0) {
      const beforeText = document.createTextNode(text.substring(0, index));
      fragment.appendChild(beforeText);
    }

    // 创建一个 span 包装关键字
    const keywordSpan = document.createElement("span");
    keywordSpan.style.backgroundColor = "red"; // 设置背景为红色
    keywordSpan.style.color = "white"; // 可选：设置文字颜色为白色
    keywordSpan.textContent = keyword;
    fragment.appendChild(keywordSpan);

    // 处理关键字后的部分
    const afterIndex = index + keyword.length;
    if (afterIndex < text.length) {
      const afterText = document.createTextNode(text.substring(afterIndex));
      fragment.appendChild(afterText);
    }

    // 替换原始文本节点
    if (textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    } else {
      console.warn("Text node has no parent node:", textNode);
    }
  }

  // 弹窗提示
  function showWarnings() {
    // 遍历关键词计数器，为每个出现过的关键词创建提示框
    Object.keys(keywordCounts).forEach((keyword) => {
      const count = keywordCounts[keyword];
      if (count > 0) {
        createWarningBox(keyword, count);
      }
    });
  }

  //创建弹窗
  function createWarningBox(keyword) {
    // 为每个关键词生成唯一的提示框 ID
    const warningBoxId = `warning-box-${keyword}`;
    // 检查是否已经存在提示框，避免重复创建
    if (document.getElementById(warningBoxId)) return;
  
    // 创建提示框
    const warningBox = document.createElement("div");
    warningBox.id = warningBoxId;
    warningBox.style.position = "fixed"; // 固定位置
    warningBox.style.top = `${getTopPosition()}px`; // 动态计算顶部位置
    warningBox.style.right = "20px"; // 距离右侧 20px
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) {
      warningBox.style.width = "90%"; // 在小屏幕上占满宽度
    } else {
      warningBox.style.width = "360px"; // 在大屏幕上固定宽度
    }
    warningBox.style.padding = "12px 20px"; // 内边距
    warningBox.style.backgroundColor = "green"; // 背景颜色
    warningBox.style.color = "white"; // 文字颜色
    warningBox.style.borderRadius = "8px"; // 圆角
    warningBox.style.zIndex = "9999"; // 确保显示在最上层
    warningBox.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)"; // 阴影效果
    warningBox.style.fontSize = "19px"; // 字体大小
    warningBox.style.lineHeight = "1.5"; // 行高
    warningBox.style.textAlign = "center"; // 文字居中

  
     // 提示框内容：包括关键词和统计信息
     warningBox.innerHTML = `
     <strong>注意：</strong>出现关键词 “ ${keyword} ”<br>
     <small>出现次数：${keywordCounts[keyword]}</small>
    `;

    // 添加关闭按钮
    const closeButton = createCloseButton(() => warningBox.remove());
    warningBox.appendChild(closeButton);
  
    // 插入提示框到页面中
    document.body.appendChild(warningBox);
  
    // 自动隐藏提示框（例如 8 秒后）
    setTimeout(() => {
      warningBox.remove();
    }, 8000);
  }

  // 动态计算提示框的顶部位置
  function getTopPosition() {
    const existingWarnings = document.querySelectorAll("[id^='warning-box-']");
    return 20 + Array.from(existingWarnings).length * 100; // 每个提示框间隔 100px
  }

  // 添加一键清除标记的按钮
  function addClearHighlightsButton() {
    if (document.getElementById("clear-highlights-button")) return;

    const clearButton = document.createElement("button");
    clearButton.id = "clear-highlights-button";
    clearButton.style.position = "fixed";
    clearButton.style.width = "150px";
    clearButton.style.height="50px"
    clearButton.style.bottom = "20px";
    clearButton.style.right = "20px";
    clearButton.style.padding = "10px 20px";
    clearButton.style.backgroundColor = "blue";
    clearButton.style.color = "white";
    clearButton.style.border = "none";
    clearButton.style.borderRadius = "5px";
    clearButton.style.fontSize = "16px";
    clearButton.style.cursor = "pointer";
    clearButton.style.zIndex = "9999";
    clearButton.textContent = "清除标记";

    //注意！！！！事件冒泡（event bubbling）机制导致：点击关闭按钮的事件会向上传播到父元素（即清除标记按钮），从而触发清除操作。
    // 添加关闭按钮
    const closeButton = createCloseButton(() => clearButton.remove());
    clearButton.appendChild(closeButton);

    clearButton.onclick = () => {
      clearAllHighlights();
    };

    document.body.appendChild(clearButton);
  }

  // 清除所有高亮标记
  function clearAllHighlights() {
    const highlightedSpans = document.querySelectorAll("span[style*='background-color: red']");
    highlightedSpans.forEach(span => {
      const parentNode = span.parentNode;
      if (parentNode) {
        parentNode.replaceChild(document.createTextNode(span.textContent), span);
      }
    });
  }

   // 封装关闭按钮的创建逻辑，函数接收一个 onClickHandler 参数，作为点击关闭按钮时的回调函数
   function createCloseButton(onClickHandler) {
    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.style.float = "right";
    closeButton.style.background = "none";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "22px";
    closeButton.style.cursor = "pointer";

    // 阻止事件冒泡
    closeButton.onclick = (event) => {
      event.stopPropagation(); // 阻止事件冒泡
      onClickHandler(); // 调用传入的回调函数
      };
    return closeButton;
  }

  // 从文档的 body 开始遍历
  traverse(document.body);

  showWarnings();
  //添加一键清除按钮
  addClearHighlightsButton();
}
