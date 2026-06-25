const STORAGE_KEY = "ai-intelligence-desk-v2";

const seedIssue = {
  label: "启动版 · 用来确认你每天想收到的内容形态",
  date: "2026 年 6 月 24 日",
  title: "今天，不用刷完 AI 世界。只看 4 件值得你知道的事。",
  summary: "我会替你跨模型、产品、硬件与创作工具筛选。你只需要判断：这件事是否值得理解、马上试，或留待以后。",
  briefs: [
    {
      id: "omni-video",
      section: "新能力",
      badge: "多模态 / 视频",
      time: "7 分钟",
      relevance: "与你相关",
      title: "AI 正从“理解多种输入”走向“用多种素材一起创作视频”",
      happened: "Google 在 I/O 2026 发布 Gemini Omni，主张可把文字、图片、视频等参考素材组合起来生成或编辑视频；首批能力聚焦视频创作与编辑。",
      fact: "值得关注的不是“又会生成视频”，而是输入可以混用：你可以用一段真实素材、一个参考画面和一段文字，要求它围绕同一想法改编。",
      boundary: "生成得像，不等于它理解真实事件；动作细节、人物一致性、真实素材与合成内容的边界、版权与标识仍要靠产品设计约束。",
      relevanceText: "对运动影像的启发：拍摄后的“高光再创作”正在变得可做；但产品不应把 AI 改写的片段伪装成用户真实拍到的经历。",
      tryTitle: "10 分钟体验：让 AI 给真实素材提出“非伪造”的高光包装建议",
      prompt: "我有一段真实拍摄的运动视频。请不要虚构或补造其中没有发生的动作。请基于我提供的素材描述，给出：1）三个高光片段的筛选标准；2）每段可用的标题与字幕；3）哪些编辑是安全的包装，哪些会改变事实、必须明确标识为 AI 生成。",
      source: { name: "Google I/O 2026：Gemini Omni", url: "https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/" }
    },
    {
      id: "proactive-agent",
      section: "产品模式",
      badge: "Agent / 主动服务",
      time: "6 分钟",
      relevance: "产品必看",
      title: "AI 产品的下一步，不只是等你提问，而是提前准备并建议下一步",
      happened: "Gemini 展示了 Daily Brief 这类主动式助手：在用户授权连接邮箱、日历和任务后，提前整理一天的重点并提出建议。",
      fact: "这代表一种产品模式变化：AI 的价值不止在回答，而在跨信息源归纳、排序、提醒和提出下一步。但它必须在用户明确授权的范围内工作。",
      boundary: "“主动”很容易变成打扰或越权。没有清楚的连接范围、预览、关闭入口和错误修正机制，用户不会把重要信息交给它。",
      relevanceText: "对手机 OS、相机和硬件都很有价值：系统级 AI 的核心问题变成“何时适合主动，何时必须沉默”。",
      tryTitle: "10 分钟拆解：设计一个不会冒犯用户的主动式建议",
      prompt: "请以运动相机为例，设计一个“主动提醒用户整理周末素材”的 AI 功能。输出：触发条件、用户看到的第一句话、它能读取的数据范围、用户能否拒绝或修改、哪些情况下绝对不应该打扰用户。请像产品经理一样写，不要只给营销文案。",
      source: { name: "Google：Gemini App 的主动式帮助", url: "https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/" }
    },
    {
      id: "agent-build",
      section: "实操工具",
      badge: "AI 编程 / Agent",
      time: "6 分钟",
      relevance: "今天就能试",
      title: "“让 AI 做事”正在从对话框，进入可持续运行的工作流",
      happened: "新的开发平台正在把模型的推理、工具调用、代码执行和隔离环境串起来，目标是让 Agent 能完成多步骤任务，而不是只给出建议。",
      fact: "对非工程背景的产品经理，最重要的变化是：你可以先用自然语言把流程、界面与规则做成原型，再逐步补上真实数据和模型。",
      boundary: "Agent 不是无人值守的可靠员工。它需要给定范围、工具权限、检查点与人工确认；涉及发布、删除、消费或隐私信息时尤其如此。",
      relevanceText: "这正是你可以实践的方向：把一个模糊产品想法变成可点击、可讨论的 Demo，而不是等完整研发资源。",
      tryTitle: "10 分钟体验：把一个想法交给 AI 编程工具做成页面",
      prompt: "请帮我生成一个手机优先的网页原型，主题是“AI 旅行素材整理助手”。页面需要：导入素材、AI 正在分析的状态、推荐的 3 个片段及理由、用户可以删除/调整/重新生成、清楚标识哪些是 AI 建议。只使用 HTML、CSS、JavaScript；不要接入真实账号或上传功能。",
      source: { name: "Google：Agent-first 开发工具更新", url: "https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/" }
    },
    {
      id: "hardware-os",
      section: "AI 硬件",
      badge: "软硬结合 / 语音",
      time: "6 分钟",
      relevance: "硬件视角",
      title: "硬件里的 AI 竞争，开始从“加一个助手”转向“理解设备上下文”",
      happened: "Google 正把 Gemini 引入搭载 Google 系统的车机，以更自然的对话处理导航、媒体和车辆相关问题，并让它可基于车主手册回答设备问题。",
      fact: "真正有价值的不是把聊天机器人塞进硬件，而是让它理解设备状态、可执行能力、说明书和当前场景，并在正确时机给出可控帮助。",
      boundary: "车机、相机等设备场景里，语音识别准确不等于操作安全。每一项动作都要评估误触发、确认成本、离线能力和失败后的恢复方式。",
      relevanceText: "你可以借它反推运动相机：什么能力可以自然对话，什么能力只能让用户确认后执行？",
      tryTitle: "10 分钟思考：给相机找一个“设备上下文”用法",
      prompt: "把“相机说明书问答”升级为真正懂设备上下文的 AI 助手。请列出它需要知道的设备状态、可以回答的问题、绝不能自行执行的操作、回答时应如何引用官方依据，以及离线时如何降级。",
      source: { name: "Google：Gemini 进入车机", url: "https://blog.google/products-and-platforms/platforms/android/cars-with-google-built-in-gemini-tips-2026/" }
    }
  ]
};

const capabilityGroups = [
  {
    id: "understand",
    icon: "◎",
    type: "理解",
    title: "读、看、听与总结",
    status: "已很实用",
    description: "长文档、图片、音频、视频中的信息提取与归纳，已经能显著减少“先看一遍再整理”的工作。",
    can: "整理会议、解释截图、检索素材、从长资料里找答案。",
    cannot: "不能保证每个细节正确；尤其不要让它把推测包装成事实。",
    work: "用它快速读竞品、用户反馈、评测资料与相机手册。",
    life: "把旅行、学习或兴趣资料变成路线与清单。",
    experiment: "拿一份你熟悉的文档或一张图片，要求 AI 区分“事实、推断、未知”。"
  },
  {
    id: "create",
    icon: "✦",
    type: "生成",
    title: "文字、图像、声音与视频创作",
    status: "正在快速变强",
    description: "从草稿、脚本、视觉灵感到视频包装，生成能力足以进入创作流程，但还需要人把关真实感、审美和版权。",
    can: "做概念稿、不同风格版本、标题、故事板与可讨论的视觉草图。",
    cannot: "不能自然获得品牌判断，也不能被默认为真实素材或原创事实。",
    work: "提前做概念体验、交互文案与产品演示。",
    life: "做旅行记录、兴趣视频、照片整理与个人表达。",
    experiment: "让 AI 为同一段运动素材设计三种风格的“真实素材剪辑方案”。"
  },
  {
    id: "voice",
    icon: "◌",
    type: "交互",
    title: "实时语音与自然对话",
    status: "适合试真实场景",
    description: "对话正在更自然，但开放环境中的噪声、上下文、延迟与隐私，决定它是否适合放进硬件。",
    can: "免手操作、解释设置、实时问答、语言练习。",
    cannot: "不能假设任何情况下都听得清，也不能省略对关键操作的确认。",
    work: "验证运动、驾驶、骑行等不便触屏时的交互价值。",
    life: "实时翻译、口语练习、陪你梳理想法。",
    experiment: "选一个不便触屏的任务，写 3 种用户自然会说的话和一次失败回退。"
  },
  {
    id: "act",
    icon: "↗",
    type: "行动",
    title: "Agent 与多步骤工作流",
    status: "要设置边界",
    description: "AI 可以规划、调用工具、生成文件或反复执行步骤。产品价值很大，但前提是它的权限、检查点和结果可见。",
    can: "整理资料、生成初稿、按步骤完成明确任务、搭建简单工作流。",
    cannot: "不能在没有监控和授权时，被当成可靠的自动执行者。",
    work: "把竞品扫描、需求初稿、知识问答串成流程。",
    life: "规划行程、整理材料、制作个人知识库。",
    experiment: "把一个工作任务拆成 5 步，标出 AI 能做、需要确认和必须由人做的环节。"
  },
  {
    id: "build",
    icon: "⌘",
    type: "创造工具",
    title: "AI 编程与原型制作",
    status: "你现在就能用",
    description: "用自然语言描述界面与逻辑，AI 可以生成可运行的网页、脚本或工具原型，是产品经理最值得亲手体验的能力之一。",
    can: "快速做内部工具、交互 Demo、数据处理脚本和产品展示页。",
    cannot: "不能免除需求判断、验收、数据安全与复杂工程质量责任。",
    work: "在资源投入前，把方案变成可讨论的体验。",
    life: "为自己的兴趣做一个小工具或网页。",
    experiment: "用 Codex 生成一个只验证核心流程的静态网页，再自己挑出 3 个问题。"
  },
  {
    id: "device",
    icon: "▣",
    type: "硬件系统",
    title: "端侧 AI 与端云协同",
    status: "硬件产品的关键选择",
    description: "端侧带来低延迟、离线和隐私；云端带来复杂理解与持续升级。优秀体验通常来自清晰的分工，而非“全端侧”或“全上云”。",
    can: "在终端完成轻量识别、唤醒、低延迟反馈或隐私敏感任务。",
    cannot: "不能无视功耗、散热、硬件代际、网络和服务成本。",
    work: "训练自己用时延、功耗、隐私、成本做产品取舍。",
    life: "理解为什么同一个 AI 功能在不同设备上表现不同。",
    experiment: "任选一个 AI 功能，分别写端侧、云端与端云协同三种方案。"
  }
];

const quickExperiments = [
  {
    tag: "工作",
    title: "把一条 AI 新闻变成产品判断",
    time: "10 分钟",
    description: "适合你每天读完精选后立刻做。训练的不是复述，而是把能力变成场景、风险与需求问题。",
    prompt: "请扮演我的 AI 产品搭档。基于下面这条 AI 新闻，不要复述新闻；请帮我回答：1）它新增的真实能力是什么；2）这个能力要达到什么前提才有价值；3）对消费硬件、手机系统或运动影像可能出现的一个机会；4）最容易被忽略的失败场景；5）我该向工程/算法团队追问什么。\n\n【粘贴新闻】"
  },
  {
    tag: "生活",
    title: "给一个现实问题找 AI 边界",
    time: "10 分钟",
    description: "用生活场景练判断会更轻松：旅行、运动计划、整理照片、学习新兴趣都可以。",
    prompt: "我想让 AI 帮我解决这个真实生活问题：____。请先不要直接给方案。先问我 3 个关键问题；然后把任务分成适合 AI 做、需要我决定、AI 不应碰的三类；最后给一个可在 15 分钟内验证的最小尝试。"
  },
  {
    tag: "兴趣",
    title: "体验一次 AI 创作，但保留你的审美",
    time: "15 分钟",
    description: "选一张照片、一个故事或一次运动经历，试着让 AI 提供 3 个方向，再由你选择和修改。",
    prompt: "我想围绕这个素材做一个有个人风格的小作品：____。请给我 3 个差异明显的创作方向。每个方向说明：适合的受众、可以由 AI 辅助完成的部分、我必须亲自决定的部分，以及第一步该怎么开始。不要生成俗套文案。"
  }
];

let liveIssue = seedIssue;
let issueStatus = "正在连接每日情报…";

function getIssue() { return liveIssue; }

async function loadLatestIssue() {
  try {
    const response = await fetch("./data/daily.json", { cache: "no-store" });
    if (!response.ok) throw new Error("brief unavailable");
    const data = await response.json();
    if (!data || !Array.isArray(data.briefs) || !data.briefs.length) throw new Error("invalid brief");
    liveIssue = data;
    issueStatus = data.updatedAt ? `已更新 · ${data.updatedAt}` : "已加载最新精选";
  } catch {
    issueStatus = "当前为离线样刊；连接网站后会自动加载最新精选";
  }
  render();
}

function defaultState() {
  return { saved: {}, read: {}, notes: [], selectedCapability: "understand", interests: { "模型与新能力": true, "AI 产品": true, "AI 硬件": true, "创作与影像": true, "生活与兴趣": true } };
}

function readState() {
  try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultState(); }
}

let state = readState();
const app = document.querySelector("#app");

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function route() { const target = window.location.hash.slice(1); return ["today", "capabilities", "try", "library"].includes(target) ? target : "today"; }
function savedCount() { return Object.values(state.saved).filter(Boolean).length; }
function readCount() { return Object.values(state.read).filter(Boolean).length; }

function interestChips() {
  return `<div class="interest-row">${Object.entries(state.interests).map(([name, active]) => `<button type="button" class="interest-chip ${active ? "active" : ""}" data-action="toggle-interest" data-interest="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}</div>`;
}

function briefCard(item) {
  const isSaved = Boolean(state.saved[item.id]);
  const isRead = Boolean(state.read[item.id]);
  return `<article class="brief-card ${isRead ? "read" : ""}">
    <header class="brief-meta"><span class="brief-section">${escapeHtml(item.section)}</span><span class="tag blue">${escapeHtml(item.badge)}</span><span class="brief-time">${escapeHtml(item.time)}</span></header>
    <div class="brief-title-row"><h2>${escapeHtml(item.title)}</h2>${item.relevance === "与你相关" ? `<span class="relevance">与你相关</span>` : ""}</div>
    <div class="brief-block"><b>发生了什么</b><p>${escapeHtml(item.happened)}</p></div>
    <div class="brief-block fact"><b>能力实际到了哪里</b><p>${escapeHtml(item.fact)}</p></div>
    <div class="brief-block boundary"><b>别高估它</b><p>${escapeHtml(item.boundary)}</p></div>
    <div class="relevance-box"><b>为什么你值得关注</b><p>${escapeHtml(item.relevanceText)}</p></div>
    <div class="try-inline"><span>✦</span><div><b>${escapeHtml(item.tryTitle)}</b><p>下方已准备好可直接复制的实践提示。</p></div></div>
    <div class="button-row"><button type="button" class="button" data-action="copy-prompt" data-prompt="${encodeURIComponent(item.prompt)}">马上试试</button><button type="button" class="button secondary" data-action="toggle-save" data-id="${item.id}">${isSaved ? "已收藏" : "收藏"}</button><button type="button" class="text-button" data-action="mark-read" data-id="${item.id}">${isRead ? "已读" : "标为已读"}</button><a class="text-button source-link" href="${item.source.url}" target="_blank" rel="noreferrer">原始来源 ↗</a></div>
  </article>`;
}

function todayPage() {
  const issue = getIssue();
  return `<section class="today-head">
    <div class="eyebrow">每日 AI 精选 · ${issue.date}</div>
    <h1>${escapeHtml(issue.title)}</h1>
    <p class="intro">${escapeHtml(issue.summary)}</p>
    <div class="dispatch-bar"><span class="dispatch-dot"></span><span><b>网站每天自动更新精选。</b>${escapeHtml(issueStatus)}<button class="inline-refresh" type="button" data-action="refresh-live">刷新</button></span></div>
  </section>
  <section class="section"><div class="section-heading"><h2>你关心什么，我就筛什么</h2><p>可随时调整</p></div>${interestChips()}</section>
  <section class="section pace-card"><div><span class="small-label">今天的 30 分钟</span><h2>先扫一遍，再挑一个真的去试。</h2></div><div class="pace-steps"><span><b>5'</b>快速扫读</span><span><b>10'</b>深读 1–2 条</span><span><b>10'</b>马上试</span><span><b>5'</b>记下一句判断</span></div></section>
  <section class="section"><div class="section-heading"><h2>今日精选</h2><p>${issue.briefs.length} 条 · 不是资讯洪流</p></div><div class="brief-list">${issue.briefs.map(briefCard).join("")}</div></section>
  <section class="section note-capture"><div><span class="small-label">把今天留下来</span><h2>你看到的哪一项能力，可能对工作、生活或兴趣有用？</h2><p>不必写长文，一句自己的判断就足够。它会进入“我的库”。</p></div><textarea id="daily-note" placeholder="例如：运动影像里的 AI 不应该替用户杜撰高光，但可以大胆帮助用户找回和包装真实瞬间。"></textarea><div class="button-row"><button class="button" type="button" data-action="save-note">保存这条判断</button><a class="button secondary" href="#library">去看我的库</a></div></section>`;
}

function capabilitiesPage() {
  const active = capabilityGroups.find((item) => item.id === state.selectedCapability) || capabilityGroups[0];
  return `<section><div class="eyebrow">长期能力建设</div><h1>能力发现</h1><p class="intro">这不是要你学完一套课程，而是一个会不断更新的“能力说明书”：它现在能做什么、在哪会错、你今天该怎样亲手判断它。</p></section>
  <section class="section capability-tabs">${capabilityGroups.map((item) => `<button type="button" class="capability-tab ${item.id === active.id ? "active" : ""}" data-action="select-capability" data-id="${item.id}"><span>${item.icon}</span><b>${escapeHtml(item.type)}</b><small>${escapeHtml(item.title)}</small></button>`).join("")}</section>
  <section class="section deep-capability"><div class="deep-capability-head"><span class="cap-icon">${active.icon}</span><div><span class="small-label">${escapeHtml(active.status)}</span><h2>${escapeHtml(active.title)}</h2><p>${escapeHtml(active.description)}</p></div></div><div class="truth-grid"><div><b>它能帮你做</b><p>${escapeHtml(active.can)}</p></div><div><b>它还不能替你做</b><p>${escapeHtml(active.cannot)}</p></div></div><div class="application-grid"><div><span>工作</span><p>${escapeHtml(active.work)}</p></div><div><span>生活 / 兴趣</span><p>${escapeHtml(active.life)}</p></div></div><div class="experiment-callout"><b>今天的最小实验</b><p>${escapeHtml(active.experiment)}</p><a class="button secondary" href="#try">去马上试</a></div></section>
  <section class="section panel"><div class="section-heading"><h2>怎样判断一项能力是否值得进入产品</h2><p>每次都问这 4 句</p></div><div class="question-grid"><div>它稳定解决的用户任务是什么？</div><div>它最常见、最伤信任的错误是什么？</div><div>用户怎样理解、纠正或拒绝它？</div><div>端侧、云端、成本与隐私怎样取舍？</div></div></section>`;
}

function tryCard(item, index) {
  return `<article class="try-card"><header><span class="try-number">0${index + 1}</span><span class="tag ${index === 0 ? "mint" : index === 1 ? "yellow" : "blue"}">${escapeHtml(item.tag)} · ${escapeHtml(item.time)}</span></header><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><div class="prompt-box">${escapeHtml(item.prompt)}</div><button class="button" type="button" data-action="copy-prompt" data-prompt="${encodeURIComponent(item.prompt)}">复制给 AI 工具</button></article>`;
}

function tryPage() {
  return `<section><div class="eyebrow">真正理解，来自亲手用过</div><h1>马上试</h1><p class="intro">不需要先懂所有技术。每次挑一个 10–15 分钟实验，带着真实问题去用，回来写下“它在哪有用、在哪不行”。</p></section>
  <section class="section quick-pick"><span class="small-label">今天的建议</span><h2>从“把一条 AI 新闻变成产品判断”开始。</h2><p>这是你把资讯真正变成职业能力的最快方式。选今天任意一条精选，复制提示词，和你熟悉的 AI 对话工具讨论。</p><button class="button" type="button" data-action="copy-prompt" data-prompt="${encodeURIComponent(quickExperiments[0].prompt)}">复制今天的提示词</button></section>
  <section class="section"><div class="section-heading"><h2>按你的状态选一个</h2><p>不必每天都做</p></div><div class="try-list">${quickExperiments.map(tryCard).join("")}</div></section>
  <section class="section panel"><div class="section-heading"><h2>实践的正确姿势</h2><p>先好奇，后判断</p></div><div class="route-grid"><div class="route-step"><span>01</span><b>带真实问题<br>不要空问</b></div><div class="route-step"><span>02</span><b>看它怎么错<br>别只看惊艳</b></div><div class="route-step"><span>03</span><b>换一个工具<br>做同题对比</b></div><div class="route-step"><span>04</span><b>留下你的<br>一句判断</b></div></div></section>`;
}

function libraryPage() {
  const saved = getIssue().briefs.filter((brief) => state.saved[brief.id]);
  return `<section><div class="eyebrow">你的长期情报与判断</div><h1>我的库</h1><p class="intro">每天精选会过去，但你真正留下的能力认知、工具体验和产品想法会越来越有价值。</p></section>
  <section class="section asset-summary"><div class="stat"><b>${readCount()}</b><span>条已读精选</span></div><div class="stat"><b>${saved.length}</b><span>条已收藏</span></div><div class="stat"><b>${state.notes.length}</b><span>条个人判断</span></div></section>
  <section class="section"><div class="section-heading"><h2>收藏的情报</h2><p>${saved.length ? "留待深读或实践" : "还没有收藏"}</p></div>${saved.length ? `<div class="saved-list">${saved.map((brief) => `<article class="saved-item"><span class="saved-mark">${escapeHtml(brief.section.slice(0, 1))}</span><div><span>${escapeHtml(brief.badge)} · ${escapeHtml(brief.time)}</span><h3>${escapeHtml(brief.title)}</h3><p>${escapeHtml(brief.relevanceText)}</p></div><a href="${brief.source.url}" target="_blank" rel="noreferrer">↗</a></article>`).join("")}</div>` : `<article class="empty-card"><span>☆</span><h3>把值得回看的东西放在这里</h3><p>今日精选中的“收藏”不是稍后再看清单，而是你准备继续理解、实践或带进工作的信号。</p><a href="#today" class="button">去看今日精选</a></article>`}</section>
  <section class="section"><div class="section-heading"><h2>我的判断</h2><p>${state.notes.length ? "你写下的观点" : "今天写一句就够"}</p></div>${state.notes.length ? `<div class="saved-list">${state.notes.slice().reverse().map((note) => `<article class="thought-item"><span>✎</span><p>${escapeHtml(note)}</p></article>`).join("")}</div>` : `<article class="empty-card"><span>✎</span><h3>不要让感受飘走</h3><p>你不需要每天写学习笔记。只要记录一句：这个能力为什么有价值，或者它为什么还不该进入产品。</p><a href="#today" class="button">记下第一句</a></article>`}</section>
  <section class="section panel"><span class="small-label">下一步会逐渐加入</span><h2>你的个人 AI 雷达</h2><p class="muted">把你收藏过的能力、工具和问题连接起来，慢慢形成“我已经会什么、接下来该试什么、哪些趋势与工作有关”的长期地图。</p></section>`;
}

function render() {
  const current = route();
  app.innerHTML = current === "capabilities" ? capabilitiesPage() : current === "try" ? tryPage() : current === "library" ? libraryPage() : todayPage();
  document.querySelectorAll("[data-route]").forEach((element) => element.classList.toggle("active", element.dataset.route === current));
}

function toast(message) {
  const template = document.querySelector("#toastTemplate");
  const toastElement = template.content.firstElementChild.cloneNode(true);
  toastElement.textContent = message;
  document.body.appendChild(toastElement);
  requestAnimationFrame(() => toastElement.classList.add("show"));
  window.setTimeout(() => { toastElement.classList.remove("show"); window.setTimeout(() => toastElement.remove(), 180); }, 2200);
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); }
  catch { const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); }
  toast("已复制。去问 AI，再回来写一句你的判断。");
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action } = target.dataset;
  if (action === "copy-prompt") copy(decodeURIComponent(target.dataset.prompt));
  if (action === "toggle-save") { state.saved[target.dataset.id] = !state.saved[target.dataset.id]; saveState(); render(); toast(state.saved[target.dataset.id] ? "已收藏到我的库。" : "已从收藏中移除。"); }
  if (action === "mark-read") { state.read[target.dataset.id] = !state.read[target.dataset.id]; saveState(); render(); }
  if (action === "toggle-interest") { const name = target.dataset.interest; state.interests[name] = !state.interests[name]; saveState(); render(); }
  if (action === "select-capability") { state.selectedCapability = target.dataset.id; saveState(); render(); }
  if (action === "refresh-live") { issueStatus = "正在刷新最新精选…"; render(); loadLatestIssue(); }
  if (action === "save-note") { const field = document.querySelector("#daily-note"); const note = field.value.trim(); if (!note) { toast("先写下一句自己的判断。 "); return; } state.notes.push(note); saveState(); field.value = ""; toast("这条判断已经进入你的库。 "); }
});

document.querySelector("#resetData").addEventListener("click", () => {
  if (!window.confirm("确定清空这台设备上的收藏与个人判断吗？")) return;
  state = defaultState(); saveState(); render(); toast("本地记录已清空。");
});

window.addEventListener("hashchange", render);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
render();
loadLatestIssue();
