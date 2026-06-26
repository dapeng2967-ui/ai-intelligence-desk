"""Build the public AI Daily Brief.

V2 focuses on one user job:
open the site, scan high-density AI signals, and convert important updates into
product-manager judgment. It still avoids paid APIs for now, so the "thinking"
layer is rule-based rather than model-generated.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json
import re
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "daily.json"
TZ_CN = timezone(timedelta(hours=8))
MAX_SIGNALS = 36
RECENT_DAYS = 45
CATEGORY_ORDER = ["模型/新能力", "AI 编程", "AI 产品", "影像/创作", "AI 硬件", "中文观察"]

TRACKS = [
    {
        "category": "模型/新能力",
        "badge": "模型迭代",
        "priority": 95,
        "queries": [
            "OpenAI GPT model agent multimodal update",
            "Anthropic Claude model agent update",
            "Google Gemini DeepMind model update",
            "DeepSeek Qwen Doubao AI model update",
        ],
    },
    {
        "category": "AI 编程",
        "badge": "开发工具",
        "priority": 92,
        "queries": [
            "OpenAI Codex app update coding agent",
            "Anthropic Claude Code update",
            "Cursor AI coding agent update",
            "GitHub Copilot coding agent Windsurf update",
        ],
    },
    {
        "category": "AI 产品",
        "badge": "应用更新",
        "priority": 84,
        "queries": [
            "ChatGPT app Gemini app Claude app AI assistant feature update",
            "Perplexity Notion AI Figma AI Canva AI update",
            "AI product assistant agent app launch",
        ],
    },
    {
        "category": "影像/创作",
        "badge": "图像 / 视频",
        "priority": 86,
        "queries": [
            "Sora Veo Runway Pika Kling AI video generator update",
            "Midjourney AI image video update",
            "ByteDance Seedance Jimeng Doubao AI video update",
        ],
    },
    {
        "category": "AI 硬件",
        "badge": "端侧 / 设备",
        "priority": 82,
        "queries": [
            "AI hardware on-device AI wearable smart glasses camera robot update",
            "edge AI chip NPU device AI assistant launch",
            "AI camera wearable glasses on-device assistant",
        ],
    },
    {
        "category": "中文观察",
        "badge": "中文媒体",
        "priority": 76,
        "queries": [
            "AI 模型 更新 豆包 Claude Code Codex 机器之心 量子位 新智元 雷峰网",
            "AI 应用 产品 更新 36氪 晚点 爱范儿 APPSO",
            "AI 视频 生成 工具 可灵 即梦 豆包 量子位",
        ],
    },
]

SOURCE_BONUS = {
    "OpenAI": 18,
    "Anthropic": 18,
    "Google": 16,
    "Google DeepMind": 18,
    "Microsoft": 14,
    "GitHub": 14,
    "Hugging Face": 14,
    "The Verge": 10,
    "TechCrunch": 10,
    "MIT Technology Review": 12,
    "VentureBeat": 9,
    "机器之心": 10,
    "量子位": 10,
    "新智元": 9,
    "雷峰网": 8,
    "36氪": 8,
    "爱范儿": 8,
    "APPSO": 8,
}

KEYWORD_BONUS = [
    ("codex", 12),
    ("claude code", 12),
    ("cursor", 10),
    ("copilot", 9),
    ("agent", 9),
    ("multimodal", 8),
    ("video", 8),
    ("sora", 9),
    ("veo", 9),
    ("doubao", 8),
    ("豆包", 8),
    ("qwen", 8),
    ("deepseek", 8),
    ("on-device", 8),
    ("端侧", 8),
    ("hardware", 7),
    ("camera", 7),
    ("相机", 7),
]

SENSATIONAL_PENALTY = [
    "底裤",
    "实锤",
    "干翻",
    "炸裂",
    "震撼",
    "全靠",
    "永久免费",
    "突发！",
    "deal",
    "coupon",
    "charges",
    "costs",
    "sale",
    "discount",
    "stock",
    "stocks",
    "agrees to buy",
    "融资",
    "估值",
    "股票",
]


def clean_text(value: str | None) -> str:
    text = re.sub(r"<[^>]+>", " ", value or "")
    text = re.sub(r"\s+", " ", unescape(text)).strip()
    return text


def normalize_key(value: str) -> str:
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]", "", value.lower())


def parse_pub_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(TZ_CN)
    except Exception:
        return None


def fetch_google_news(query: str, track: dict, seen: set[str], now: datetime, limit: int = 4) -> list[dict]:
    items: list[dict] = []
    for locale in locales_for_query(query):
        params = urlencode({"q": f"{query} when:{RECENT_DAYS}d", **locale})
        request = Request(
            f"https://news.google.com/rss/search?{params}",
            headers={"User-Agent": "AI-Intelligence-Desk/2.0"},
        )
        with urlopen(request, timeout=16) as response:
            root = ET.fromstring(response.read())

        for node in root.findall("./channel/item"):
            raw_title = clean_text(node.findtext("title"))
            if not raw_title:
                continue
            key = normalize_key(raw_title)
            if key in seen:
                continue
            seen.add(key)

            published_at = parse_pub_date(node.findtext("pubDate"))
            if published_at and (now - published_at).days > RECENT_DAYS:
                continue

            source = clean_text(node.findtext("source")) or guess_source(raw_title)
            items.append(
                {
                    "rawTitle": raw_title,
                    "title": strip_source_suffix(raw_title, source),
                    "description": clean_text(node.findtext("description")),
                    "source": {"name": source or "新闻来源", "url": clean_text(node.findtext("link"))},
                    "publishedAt": published_at,
                    "category": track["category"],
                    "badge": track["badge"],
                    "priority": track["priority"],
                }
            )
            if len(items) >= limit:
                return items
    return items


def locales_for_query(query: str) -> list[dict]:
    zh = {"hl": "zh-CN", "gl": "CN", "ceid": "CN:zh-Hans"}
    en = {"hl": "en-US", "gl": "US", "ceid": "US:en"}
    if re.search(r"[\u4e00-\u9fff]", query):
        return [zh]
    return [zh, en]


def guess_source(title: str) -> str:
    if " - " in title:
        return title.rsplit(" - ", 1)[-1].strip()
    return "新闻来源"


def strip_source_suffix(title: str, source: str) -> str:
    suffix = f" - {source}"
    if source and title.endswith(suffix):
        return title[: -len(suffix)].strip()
    return title


def score_item(item: dict, now: datetime) -> int:
    title = f"{item.get('title', '')} {item.get('description', '')}".lower()
    score = int(item["priority"])
    for source, bonus in SOURCE_BONUS.items():
        if source.lower() in item["source"]["name"].lower():
            score += bonus
    for keyword, bonus in KEYWORD_BONUS:
        if keyword in title:
            score += bonus
    for keyword in SENSATIONAL_PENALTY:
        if keyword.lower() in title:
            score -= 18
    published = item.get("publishedAt")
    if published:
        age_hours = max(0, (now - published).total_seconds() / 3600)
        if age_hours <= 24:
            score += 12
        elif age_hours <= 72:
            score += 6
        elif age_hours <= 24 * 14:
            score += 2
        else:
            score -= 8
    else:
        score -= 4
    return score


def viewpoint(item: dict) -> dict:
    text = f"{item.get('title', '')} {item.get('description', '')}".lower()
    category = item["category"]

    if category == "AI 编程" or any(token in text for token in ["codex", "claude code", "cursor", "copilot", "windsurf"]):
        return {
            "oneLine": "AI 编程工具继续从代码补全走向任务执行：理解目标、改文件、跑验证、解释过程会变成基本能力。",
            "judgment": "这类更新最值得产品经理关注，因为它能把需求讨论更快变成可演示原型；但也会放大错误执行、权限和验收问题。",
            "capability": "能力边界正在从“写一段代码”推进到“处理一个小任务”。真正要看的是它是否能稳定读懂上下文、定位文件、修改后自检。",
            "boundary": "不能把它当成无人值守研发。复杂架构、隐私数据、生产发布、删除操作仍需要明确权限、检查点和人工确认。",
            "pmInsight": "你可以开始把 PRD 写成可执行任务：目标、输入、验收条件、失败回退，而不是只写页面和功能点。",
            "askDev": "这个 Agent 最多能操作哪些文件/系统？每一步如何留痕？测试失败时会停止还是继续？人工确认点放在哪里？",
        }

    if category == "影像/创作" or any(token in text for token in ["video", "image", "sora", "veo", "runway", "kling", "midjourney", "seedance", "视频", "图像", "可灵", "即梦"]):
        return {
            "oneLine": "影像 AI 的重点正在从单次生成，转向围绕真实素材的整理、改写、包装和多版本创作。",
            "judgment": "对运动相机类产品，机会不是替用户虚构经历，而是帮用户更快找到真实高光、完成表达，并清楚标识 AI 参与部分。",
            "capability": "模型正在增强图像、视频、文字、声音之间的跨模态生成与编辑能力，适合做素材理解、风格化包装和故事板探索。",
            "boundary": "动作真实性、人物一致性、版权、商用授权和 AI 生成标识仍是高风险点。生成得好看不代表事实可信。",
            "pmInsight": "可以优先考虑“AI 剪辑助理 / 高光筛选 / 标题字幕 / 风格预览”，而不是一上来做完全自动生成大片。",
            "askDev": "我们能否保留真实素材与 AI 生成素材的链路？能否让用户关闭、回退或标识 AI 修改？弱网/端侧能做哪部分？",
        }

    if category == "AI 硬件" or any(token in text for token in ["hardware", "on-device", "wearable", "glasses", "robot", "chip", "camera", "端侧", "硬件", "眼镜", "机器人", "芯片"]):
        return {
            "oneLine": "AI 硬件的价值不在于塞一个聊天入口，而在于设备能理解状态、场景、传感器和可执行动作。",
            "judgment": "这是你软硬结合背景最该长期关注的方向：端侧、云端和设备上下文的分工，会直接决定体验是否可用。",
            "capability": "端侧模型、传感器理解、语音交互和云端复杂推理正在组合成新的设备体验。",
            "boundary": "功耗、散热、时延、离线、隐私、误触发和安全确认会限制真实落地，演示效果不能代表量产体验。",
            "pmInsight": "做硬件 AI 需求时，先定义场景触发、设备状态、用户确认和失败回退，再讨论模型能力。",
            "askDev": "哪些信息必须端侧处理？哪些可以上云？延迟预算是多少？误识别会造成什么后果？离线时如何降级？",
        }

    if category == "AI 产品" or any(token in text for token in ["app", "assistant", "feature", "product", "perplexity", "notion", "figma", "canva"]):
        return {
            "oneLine": "AI 应用更新的核心不是“加了 AI”，而是它替用户完成了哪一步、在什么时机介入、用户如何控制。",
            "judgment": "产品经理要看的是任务链路是否真的变短，而不是宣传里的一次成功演示。",
            "capability": "AI 正在进入搜索、写作、设计、会议、浏览器和办公流，把理解、生成、调用工具组合成体验。",
            "boundary": "如果用户不能理解输入范围、不能修改结果、不能拒绝主动建议，AI 功能很容易变成打扰或不可信。",
            "pmInsight": "拆解竞品时用四问：用户任务是什么、AI 替哪一步、失败怎么纠正、隐私和成本怎么交代。",
            "askDev": "这个功能依赖哪些用户数据？结果如何解释？用户能否编辑/撤回？成本是否支持高频使用？",
        }

    if category == "中文观察":
        return {
            "oneLine": "中文媒体能补足国内模型、应用和产业落地信息，适合用来观察本土生态节奏。",
            "judgment": "中文报道的价值在于案例密度和本土产品动态，但需要区分事实、转述和营销包装。",
            "capability": "国内模型和应用正在快速迭代，尤其在多模态、视频生成、办公、智能硬件和企业服务上竞争明显。",
            "boundary": "标题可能夸张，必须回到原始发布、可用入口、价格、地区、权限和真实体验验证。",
            "pmInsight": "把中文资讯当作竞品扫描入口：先记录能力点，再用真实任务验证是否可用。",
            "askDev": "这个能力是否已有国内可用 API/SDK？可用性、成本、合规和私有化方案如何？",
        }

    if category == "模型/新能力" or any(token in text for token in ["model", "gpt", "claude", "gemini", "deepseek", "qwen", "doubao", "agent", "multimodal", "模型", "智能体", "多模态"]):
        return {
            "oneLine": "这类动态的重点是模型能力边界是否变化：更会推理、更会用工具、更懂多模态，还是成本/速度发生变化。",
            "judgment": "模型新闻不要只看名字和榜单，要追问它新增了哪类真实任务能力，以及是否已经可用、可稳定复现。",
            "capability": "模型能力通常体现在上下文长度、推理、工具调用、多模态输入输出、代码能力、成本和延迟这些维度。",
            "boundary": "发布演示和真实产品可用性不是一回事；还要验证地区、价格、限流、幻觉率、失败恢复和数据安全。",
            "pmInsight": "你可以把模型更新翻译成需求假设：哪些原来做不了的任务现在可能可做？哪些体验可以从人工流程变成 AI 协助？",
            "askDev": "这个模型相对现有方案强在哪个指标？API 是否可用？成本/延迟能否支撑高频使用？失败时如何检测和兜底？",
        }

    return {
        "oneLine": "这条动态说明 AI 能力或应用边界正在变化，值得先记录信号，再决定是否深挖。",
        "judgment": "不要只看发布声量，要看它是否带来新的输入方式、输出质量、任务链路或成本结构变化。",
        "capability": "可能涉及模型理解、生成、工具调用、多模态或产品化能力的推进。",
        "boundary": "需要验证可用地区、价格、速度、稳定性、数据权限和失败场景。",
        "pmInsight": "把它转成一个具体用户任务，再判断是否值得进入产品规划。",
        "askDev": "如果要做类似能力，模型、数据、成本、延迟、隐私和验收标准分别是什么？",
    }


def refine_category(item: dict) -> tuple[str, str]:
    text = f"{item.get('title', '')} {item.get('description', '')}".lower()
    if any(token in text for token in ["codex", "claude code", "cursor", "copilot", "windsurf", "coding agent", "developer"]):
        return "AI 编程", "开发工具"
    if any(token in text for token in ["video", "image", "sora", "veo", "runway", "kling", "midjourney", "seedance", "pika", "视频", "图像", "可灵", "即梦"]):
        return "影像/创作", "图像 / 视频"
    if any(token in text for token in ["hardware", "on-device", "wearable", "glasses", "robot", "chip", "camera", "edge ai", "端侧", "硬件", "眼镜", "机器人", "芯片", "相机"]):
        return "AI 硬件", "端侧 / 设备"
    if any(token in text for token in ["app", "assistant", "feature", "product", "perplexity", "notion", "figma", "canva", "browser", "应用", "助手", "浏览器"]):
        return "AI 产品", "应用更新"
    if any(token in text for token in ["model", "gpt", "claude", "gemini", "deepseek", "qwen", "doubao", "anthropic", "openai", "模型", "多模态", "智能体"]):
        return "模型/新能力", "模型迭代"
    return item["category"], item["badge"]


def balanced_select(items: list[dict], limit: int) -> list[dict]:
    groups = {category: [] for category in CATEGORY_ORDER}
    for item in items:
        groups.setdefault(item["category"], []).append(item)
    for group in groups.values():
        group.sort(key=lambda value: value["score"], reverse=True)

    selected: list[dict] = []
    used: set[int] = set()

    for _ in range(3):
        for category in CATEGORY_ORDER:
            group = groups.get(category, [])
            while group and id(group[0]) in used:
                group.pop(0)
            if group and len(selected) < limit:
                item = group.pop(0)
                selected.append(item)
                used.add(id(item))

    for item in sorted(items, key=lambda value: value["score"], reverse=True):
        if len(selected) >= limit:
            break
        if id(item) not in used:
            selected.append(item)
            used.add(id(item))

    return selected


def build_signal(item: dict, index: int, now: datetime) -> dict:
    view = viewpoint(item)
    published = item.get("publishedAt")
    return {
        "id": f"{now.strftime('%Y%m%d')}-{index:02d}-{normalize_key(item['title'])[:18]}",
        "category": item["category"],
        "badge": item["badge"],
        "title": item["title"],
        "source": item["source"],
        "publishedAt": published.strftime("%Y-%m-%d %H:%M") if published else "",
        "score": item["score"],
        **view,
    }


def build_practices(signals: list[dict]) -> list[dict]:
    practices: list[dict] = []

    code_signal = first_by_category(signals, "AI 编程")
    if code_signal:
        practices.append(
            {
                "title": "把一条 AI 编程动态变成可执行需求",
                "time": "10 分钟",
                "why": "训练你把“工具更新”翻译成团队可讨论的任务边界、权限和验收条件。",
                "prompt": f"基于这条 AI 编程动态：{code_signal['title']}\n请不要复述新闻。请帮我输出：1）它代表的能力变化；2）一个产品经理可以写进 PRD 的功能点；3）需要工程确认的权限、数据、验证和回滚机制；4）一个 30 分钟内可做的原型验证任务。",
            }
        )

    creative_signal = first_by_category(signals, "影像/创作")
    if creative_signal:
        practices.append(
            {
                "title": "用真实素材验证一次影像 AI 边界",
                "time": "15 分钟",
                "why": "这能帮你区分 AI 适合做素材整理/包装，还是已经越界到虚构事实。",
                "prompt": f"基于这条影像 AI 动态：{creative_signal['title']}\n请以运动相机素材为例，设计一个最小体验：输入是什么、AI 输出什么、哪些地方必须标识 AI 参与、用户如何撤回或修改、哪些操作绝不能默认自动执行。",
            }
        )

    if not practices and signals:
        signal = signals[0]
        practices.append(
            {
                "title": "把今天最重要的一条情报转成产品判断",
                "time": "10 分钟",
                "why": "用固定框架训练你从资讯进入产品判断，而不是只知道发生了什么。",
                "prompt": f"基于这条 AI 情报：{signal['title']}\n请帮我判断：真实能力变化是什么、边界是什么、对产品经理有什么启发、如果推动团队做类似方向应该追问开发哪些问题。",
            }
        )

    return practices[:2]


def first_by_category(signals: list[dict], category: str) -> dict | None:
    return next((signal for signal in signals if signal["category"] == category), None)


def convert_existing_to_v2(existing: dict) -> dict | None:
    if Array := existing.get("signals"):
        if isinstance(Array, list) and Array:
            return existing
    briefs = existing.get("briefs")
    if not isinstance(briefs, list) or not briefs:
        return None
    signals = []
    for index, item in enumerate(briefs):
        signals.append(
            {
                "id": item.get("id", f"legacy-{index}"),
                "category": item.get("section", "AI 情报"),
                "badge": item.get("badge", "动态"),
                "title": item.get("title", ""),
                "oneLine": item.get("happened", ""),
                "judgment": item.get("relevanceText", ""),
                "capability": item.get("fact", ""),
                "boundary": item.get("boundary", ""),
                "pmInsight": item.get("relevanceText", ""),
                "askDev": "如果要做类似能力，先确认输入、输出、权限、成本、验收和失败回退。",
                "source": item.get("source", {"name": "来源", "url": "#"}),
            }
        )
    return {
        "version": 2,
        "label": "AI Daily Brief",
        "date": existing.get("date", ""),
        "updatedAt": existing.get("updatedAt", ""),
        "title": "今天值得关注的 AI 情报",
        "summary": "由旧版精选转换而来。",
        "signals": signals,
        "deepDives": signals[:3],
        "practices": build_practices(signals),
    }


def main() -> None:
    now = datetime.now(TZ_CN)
    try:
        existing = json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.exists() else {}
    except json.JSONDecodeError:
        existing = {}
    seen: set[str] = set()
    raw_items: list[dict] = []

    for track in TRACKS:
        for query in track["queries"]:
            try:
                raw_items.extend(fetch_google_news(query, track, seen, now))
            except Exception:
                continue

    for item in raw_items:
        item["category"], item["badge"] = refine_category(item)
        item["score"] = score_item(item, now)

    raw_items.sort(key=lambda item: item["score"], reverse=True)
    selected_items = balanced_select(raw_items, MAX_SIGNALS)
    signals = [build_signal(item, index, now) for index, item in enumerate(selected_items, start=1)]

    if len(signals) < 8:
        fallback = convert_existing_to_v2(existing)
        if fallback:
            OUTPUT.write_text(json.dumps(fallback, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return

    deep_dives = signals[:3]
    practices = build_practices(signals)

    payload = {
        "version": 2,
        "label": "AI Daily Brief",
        "date": now.strftime("%Y 年 %-m 月 %-d 日"),
        "updatedAt": now.strftime("%Y-%m-%d %H:%M（北京时间）"),
        "title": "今天值得关注的 AI 情报",
        "summary": "先扫快讯，再看重点判断。内容覆盖海外模型与产品、AI 编程、影像创作、AI 硬件和中文科技媒体信号。",
        "signals": signals,
        "deepDives": deep_dives,
        "practices": practices,
        "sourcePolicy": [
            "优先抓取官方、海外科技媒体、中文科技媒体和产品更新相关公开信源。",
            "微信文章不作为稳定自动抓取源；如果有关键文章，可以后续做手动收录入口。",
            "当前版本不接模型 API，观点层是规则化提炼；后续可升级为 LLM 二次筛选和总结。",
        ],
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
