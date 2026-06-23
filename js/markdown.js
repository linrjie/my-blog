// ===== Lightweight Markdown Parser =====
function parseMarkdown(md) {
  if (!md) return '<p class="md-empty">开始输入内容...</p>';

  let html = md;

  // Escape HTML (but preserve our markdown)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code (`...`)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");
  // Merge consecutive blockquotes
  html = html.replace(
    /<\/blockquote>\n<blockquote>/g,
    "\n"
  );

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  // Don't wrap already wrapped lists
  html = html.replace(/(?<!<\/?ul>)((?:<li>.*<\/li>\n?)+)/g, (match) => {
    if (match.includes("<ul>")) return match;
    return "<ol>" + match + "</ol>";
  });

  // Tables
  html = html.replace(
    /^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm,
    (match, header, body) => {
      const headers = header
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean);
      const rows = body
        .trim()
        .split("\n")
        .map((r) =>
          r
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
        );

      let table = "<table><thead><tr>";
      headers.forEach((h) => (table += `<th>${h}</th>`));
      table += "</tr></thead><tbody>";
      rows.forEach((row) => {
        table += "<tr>";
        row.forEach((cell) => (table += `<td>${cell}</td>`));
        table += "</tr>";
      });
      table += "</tbody></table>";
      return table;
    }
  );

  // Paragraphs - wrap remaining lines
  const lines = html.split("\n");
  const result = [];
  let inBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      result.push("");
      continue;
    }

    // Check if we're in a block element
    if (
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("<pre") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("<table") ||
      trimmed.startsWith("<hr") ||
      trimmed.startsWith("</") ||
      trimmed.startsWith("<img")
    ) {
      result.push(line);
    } else {
      result.push("<p>" + trimmed + "</p>");
    }
  }

  return result.join("\n");
}

// ===== Toolbar Actions =====
function insertMarkdown(textarea, syntax) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);

  let insertion = "";
  let cursorOffset = 0;

  switch (syntax) {
    case "bold":
      insertion = `**${selected || "粗体文字"}**`;
      cursorOffset = selected ? insertion.length : 2;
      break;
    case "italic":
      insertion = `*${selected || "斜体文字"}*`;
      cursorOffset = selected ? insertion.length : 1;
      break;
    case "strikethrough":
      insertion = `~~${selected || "删除线"}~~`;
      cursorOffset = selected ? insertion.length : 2;
      break;
    case "h1":
      insertion = `# ${selected || "标题1"}`;
      cursorOffset = insertion.length;
      break;
    case "h2":
      insertion = `## ${selected || "标题2"}`;
      cursorOffset = insertion.length;
      break;
    case "h3":
      insertion = `### ${selected || "标题3"}`;
      cursorOffset = insertion.length;
      break;
    case "code":
      insertion = `\`${selected || "代码"}\``;
      cursorOffset = selected ? insertion.length : 1;
      break;
    case "codeblock":
      insertion = `\`\`\`\n${selected || "代码块"}\n\`\`\``;
      cursorOffset = selected ? insertion.length : 4;
      break;
    case "link":
      insertion = `[${selected || "链接文字"}](url)`;
      cursorOffset = selected ? insertion.length - 1 : 1;
      break;
    case "image":
      insertion = `![${selected || "图片描述"}](url)`;
      cursorOffset = selected ? insertion.length - 1 : 2;
      break;
    case "quote":
      insertion = `> ${selected || "引用文字"}`;
      cursorOffset = insertion.length;
      break;
    case "ul":
      insertion = `- ${selected || "列表项"}`;
      cursorOffset = insertion.length;
      break;
    case "ol":
      insertion = `1. ${selected || "列表项"}`;
      cursorOffset = insertion.length;
      break;
    case "hr":
      insertion = `\n---\n`;
      cursorOffset = insertion.length;
      break;
    case "table":
      insertion = `| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |`;
      cursorOffset = insertion.length;
      break;
    default:
      return;
  }

  textarea.value = text.substring(0, start) + insertion + text.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;

  // Trigger preview update
  textarea.dispatchEvent(new Event("input"));
}
