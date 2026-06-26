const STORAGE_KEY = "ai-intelligence-desk-v3";
const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_COUNT = 10;

const fallbackIssue = {
  version: 2,
  label: "AI Daily Brief",
  date: "2026 年 6 月 25 日",
  updatedAt: "离线样刊",
  title: "今天值得关注的 AI 情报",
  summary: "这是离线样刊。联网后会加载自动整理的模型、产品、AI 编程、影像创作与硬件动态。",
  signals: [
    {
      id: "fallback-codex",
      category: "AI 编程",
      badge: "Agent / 开发工具",
      title: "AI 编程工具正在从“帮你写代码”走向“接手一段任务”",
      oneLine: "这类更新的重点不是代码补全更快，而是模型能否理解目标、改文件、跑验证并把过程交代清楚。",
      judgment: "对产品经理有价值，因为它让你可以更快把需求变成可演示原型；但不能跳过验收和边界设定。",
      capability: "多步骤执行、工具调用、代码修改、错误修复和结果说明正在变成 AI 编程工具的基本能力。",
      boundary: "它仍可能误改、漏测或把不确定判断说得很肯定。涉及发布、权限、数据删除时必须保留人工确认。",
      pmInsight: "以后写需求时，可以把“AI 可执行步骤、需要确认的步骤、失败回退”写进 PRD，而不只是写一句“智能生成”。",
      askDev: "如果我们做类似 Agent 能力，哪些动作必须让用户确认？怎么记录 AI 做过什么？失败后如何回滚？",
      source: { name: "样例", url: "#" }
    },
    {
      id: "fallback-video",
      category: "影像/创作",
      badge: "视频生成 / 编辑",
      title: "视频生成与视频编辑能力继续逼近真实创作流",
      oneLine: "值得关注的是 AI 能否基于真实素材做整理、包装、改写，而不是只生成一段看起来炫的视频。",
      judgment: "对运动相机产品，机会在“帮用户找到真实高光并完成表达”，风险在“替用户虚构经历”。",
      capability: "图像、文字、视频参考混合输入后生成或编辑内容，正在成为影像 AI 的主线。",
      boundary: "人物一致性、动作真实性、版权和 AI 生成标识仍是产品设计必须处理的问题。",
      pmInsight: "可以把 AI 定位成剪辑助理、标题助理、素材整理助理，而不是默认替用户创造不存在的画面。",
      askDev: "我们能否区分真实素材片段和 AI 生成片段？能否给用户明确标识和关闭入口？",
      source: { name: "样例", url: "#" }
    }
  ],
  deepDives: [],
  practices: []
};

let issue = fallbackIssue;
let statusText = "正在加载今日情报…";
let isLoading = false;

function defaultState() {
  return { visibleCount: INITIAL_VISIBLE_COUNT, saved: {} };
}

function readState() {
  try {
    return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaultState();
  }
}

let state = readState();
const app = document.querySelector("#app");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[character]));
}

function normalizeIssue(data) {
  if (data && Array.isArray(data.signals) && data.signals.length) {
    return {
      ...fallbackIssue,
      ...data,
      signals: data.signals,
      deepDives: Array.isArray(data.deepDives) ? data.deepDives : [],
      practices: Array.isArray(data.practices) ? data.practices : []
    };
  }

  if (data && Array.isArray(data.briefs) && data.briefs.length) {
    const signals = data.briefs.map((item) => ({
      id: item.id,
      category: item.section,
      badge: item.badge,
      title: item.title,
      oneLine: item.happened,
      judgment: item.relevanceText,
      capability: item.fact,
      boundary: item.boundary,
      pmInsight: item.relevanceText,
      askDev: "如果要做类似能力，团队需要确认：输入数据是什么、输出怎样验收、失败时用户如何纠正？",
      source: item.source
    }));
    return { ...fallbackIssue, ...data, version: 2, signals, deepDives: signals.slice(0, 3), practices: [] };
  }

  return fallbackIssue;
}

async function loadLatestIssue(manual = false) {
  if (isLoading) return;
  isLoading = true;
  statusText = manual ? "正在刷新…" : "正在加载今日情报…";
  render();

  try {
    const response = await fetch(`./data/daily.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("daily brief unavailable");
    issue = normalizeIssue(await response.json());
    statusText = issue.updatedAt ? `已更新 · ${issue.updatedAt}` : "已加载最新情报";
    if (manual) showToast("已刷新到最新内容");
  } catch {
    issue = fallbackIssue;
    statusText = "当前为离线样刊；联网后会加载今日情报";
    if (manual) showToast("刷新失败，先显示离线样刊");
  } finally {
    isLoading = false;
    render();
  }
}

function getSavedSignals() {
  return issue.signals.filter((item) => state.saved[item.id]);
}

function sourceLink(source = {}) {
  if (!source.url || source.url === "#") return `<span class="source muted">${escapeHtml(source.name || "来源")}</span>`;
  return `<a class="source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name || "原始来源")} ↗</a>`;
}

function signalCard(item, index, compact = false) {
  const saved = Boolean(state.saved[item.id]);
  const categoryClass = categoryToClass(item.category);
  return `<article class="signal-card ${compact ? "compact" : ""}">
    <div class="signal-top">
      <span class="rank">${String(index + 1).padStart(2, "0")}</span>
      <span class="pill ${categoryClass}">${escapeHtml(item.category || "AI 情报")}</span>
      <span class="badge">${escapeHtml(item.badge || "动态")}</span>
    </div>
    <h2>${escapeHtml(item.title)}</h2>
    <p class="one-line">${escapeHtml(item.oneLine)}</p>
    <details>
      <summary>展开我的判断</summary>
      <div class="analysis-grid">
        ${analysisBlock("我的判断", item.judgment)}
        ${analysisBlock("能力变化", item.capability)}
        ${analysisBlock("边界提醒", item.boundary)}
        ${analysisBlock("产品经理启发", item.pmInsight)}
        ${analysisBlock("可以追问开发", item.askDev)}
      </div>
    </details>
    <div class="card-actions">
      ${sourceLink(item.source)}
      <button type="button" class="ghost-button" data-action="toggle-save" data-id="${escapeHtml(item.id)}">${saved ? "已收藏" : "收藏"}</button>
    </div>
  </article>`;
}

function analysisBlock(title, body) {
  if (!body) return "";
  return `<section><b>${escapeHtml(title)}</b><p>${escapeHtml(body)}</p></section>`;
}

function categoryToClass(category = "") {
  if (category.includes("编程")) return "code";
  if (category.includes("影像") || category.includes("创作")) return "creative";
  if (category.includes("硬件")) return "hardware";
  if (category.includes("产品")) return "product";
  if (category.includes("中文")) return "china";
  return "model";
}

function deepDiveCard(item, index) {
  return `<article class="deep-card">
    <div class="deep-label">重点 ${index + 1}</div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.judgment || item.oneLine)}</p>
    <div class="deep-sections">
      ${analysisBlock("为什么重要", item.pmInsight || item.capability)}
      ${analysisBlock("不要高估", item.boundary)}
      ${analysisBlock("团队讨论问题", item.askDev)}
    </div>
    <div class="card-actions">${sourceLink(item.source)}</div>
  </article>`;
}

function practiceCard(item, index) {
  return `<article class="practice-card">
    <div class="practice-meta">实操 ${index + 1} · ${escapeHtml(item.time || "10 分钟")}</div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.why)}</p>
    <div class="prompt-box">${escapeHtml(item.prompt)}</div>
    <button type="button" class="button" data-action="copy-prompt" data-prompt="${encodeURIComponent(item.prompt || "")}">复制提示词</button>
  </article>`;
}

function renderHero() {
  return `<section class="hero">
    <div class="eyebrow">${escapeHtml(issue.label || "AI Daily Brief")}</div>
    <h1>${escapeHtml(issue.title || "今天值得关注的 AI 情报")}</h1>
    <p>${escapeHtml(issue.summary || "")}</p>
    <div class="meta-row">
      <span>${escapeHtml(issue.date || "")}</span>
      <span>${escapeHtml(statusText)}</span>
    </div>
    <div class="hero-actions">
      <button type="button" class="button" data-action="refresh-live">刷新今日内容</button>
      <button type="button" class="button secondary" data-action="load-more">再给我 10 条</button>
    </div>
  </section>`;
}

function renderStats() {
  const signals = issue.signals || [];
  const deep = issue.deepDives || [];
  const saved = getSavedSignals().length;
  return `<section class="stats">
    <div><b>${signals.length}</b><span>今日内容池</span></div>
    <div><b>${Math.min(state.visibleCount, signals.length)}</b><span>当前展示</span></div>
    <div><b>${deep.length}</b><span>重点解读</span></div>
    <div><b>${saved}</b><span>已收藏</span></div>
  </section>`;
}

function renderSignals() {
  const signals = issue.signals || [];
  const visible = signals.slice(0, Math.min(state.visibleCount, signals.length));
  const hasMore = state.visibleCount < signals.length;
  return `<section class="section">
    <div class="section-head">
      <div>
        <span class="section-kicker">先扫一遍</span>
        <h2>快讯流</h2>
      </div>
      <p>短讯可多，重点是快速知道 AI 又推进了什么。</p>
    </div>
    <div class="signal-list">${visible.map((item, index) => signalCard(item, index)).join("")}</div>
    ${hasMore ? `<button type="button" class="load-more" data-action="load-more">再给我 10 条</button>` : `<div class="end-note">今天的内容池已看完。可以刷新检查是否有新版本。</div>`}
  </section>`;
}

function renderDeepDives() {
  const deepDives = (issue.deepDives && issue.deepDives.length ? issue.deepDives : issue.signals.slice(0, 3));
  if (!deepDives.length) return "";
  return `<section class="section">
    <div class="section-head">
      <div>
        <span class="section-kicker">值得深挖</span>
        <h2>我建议你重点看这几条</h2>
      </div>
      <p>把新闻变成产品判断。</p>
    </div>
    <div class="deep-list">${deepDives.slice(0, 4).map(deepDiveCard).join("")}</div>
  </section>`;
}

function renderPractices() {
  const practices = issue.practices || [];
  if (!practices.length) return "";
  return `<section class="section">
    <div class="section-head">
      <div>
        <span class="section-kicker">可选</span>
        <h2>今天可以亲手试一下</h2>
      </div>
      <p>不是每天强制做，只挑适合体验边界的能力。</p>
    </div>
    <div class="practice-list">${practices.slice(0, 2).map(practiceCard).join("")}</div>
  </section>`;
}

function renderSaved() {
  const saved = getSavedSignals();
  if (!saved.length) return "";
  return `<section class="section">
    <div class="section-head">
      <div>
        <span class="section-kicker">留着后看</span>
        <h2>你的收藏</h2>
      </div>
      <p>只保留你想带进工作讨论的线索。</p>
    </div>
    <div class="saved-list">${saved.map((item, index) => signalCard(item, index, true)).join("")}</div>
  </section>`;
}

function render() {
  app.innerHTML = `${renderHero()}${renderStats()}${renderDeepDives()}${renderSignals()}${renderPractices()}${renderSaved()}`;
}

function showToast(message) {
  const template = document.querySelector("#toastTemplate");
  const toast = template.content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 220);
  }, 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast("已复制，可以粘贴到 Codex / Claude / 豆包里试");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "load-more") {
    state.visibleCount = Math.min((issue.signals || []).length, state.visibleCount + LOAD_MORE_COUNT);
    saveState();
    render();
    return;
  }

  if (action === "refresh-live") {
    state.visibleCount = INITIAL_VISIBLE_COUNT;
    saveState();
    loadLatestIssue(true);
    return;
  }

  if (action === "toggle-save") {
    const id = target.dataset.id;
    state.saved[id] = !state.saved[id];
    saveState();
    render();
    showToast(state.saved[id] ? "已收藏" : "已取消收藏");
    return;
  }

  if (action === "copy-prompt") {
    copyText(decodeURIComponent(target.dataset.prompt || ""));
  }
});

render();
loadLatestIssue();
