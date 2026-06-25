"""Refresh the public AI Intelligence Desk issue from recent news feeds.

This script intentionally avoids subscriptions and API keys for the first online
version. It finds recent, category-balanced headlines from Google News RSS,
then writes the small JSON file consumed directly by the static site.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
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

TRACKS = [
    {
        "section": "新能力",
        "badge": "模型 / Agent",
        "query": "(OpenAI OR Anthropic OR Gemini OR Google DeepMind OR Claude) (model OR agent OR multimodal)",
        "relevance": "能力趋势",
        "fact": "先把它当作一项待验证的新能力：打开原始来源，确认它的可用地区、输入输出、价格与限制，而不是只看演示效果。",
        "boundary": "模型发布、基准分数和产品可用性不是一回事；真实任务的稳定性、速度和成本都值得单独验证。",
        "relevance_text": "它可能改变你对“AI 现在能做到什么”的判断，也可能成为下一个可亲手测试的工具。",
        "try_title": "10 分钟：把这条新闻变成能力判断",
        "prompt": "基于下面这条 AI 新闻，不要复述新闻。请帮我判断：新增的真实能力是什么、它在什么条件下才有价值、最可能失败的地方、我能用哪个小任务亲自测试它。\n\n【粘贴新闻】",
    },
    {
        "section": "AI 产品",
        "badge": "产品模式 / 体验",
        "query": "AI product assistant app agent feature launch",
        "relevance": "产品必看",
        "fact": "把它拆成具体的用户任务、触发时机、AI 输入与用户可见结果，才能看出它是新体验，还是旧功能换了说法。",
        "boundary": "产品宣传常常只呈现一次成功路径；要继续追问用户能否理解、纠正、关闭和信任这个功能。",
        "relevance_text": "这类产品案例可以直接训练你的 AI 功能需求和交互判断，不限于任何单一行业。",
        "try_title": "10 分钟：拆一个 AI 产品功能",
        "prompt": "请把这条 AI 产品新闻拆成：用户是谁、原来的任务是什么、AI 替用户做了哪一步、用户如何纠正它、失败时会发生什么。最后指出一个值得借鉴的产品机制。\n\n【粘贴新闻】",
    },
    {
        "section": "AI 硬件",
        "badge": "端侧 / 软硬结合",
        "query": "AI hardware on-device AI edge AI camera wearable robot launch",
        "relevance": "与你相关",
        "fact": "硬件 AI 的判断要同时看模型能力、端侧算力、联网依赖、功耗、时延、传感器和设备上下文，而不是只看“搭载了 AI”。",
        "boundary": "演示中的自然交互不代表在噪声、运动、弱网、隐私敏感或长时间使用时仍然可靠。",
        "relevance_text": "它与你的手机 OS 和运动影像背景直接相关：重点不是加一个聊天入口，而是设备何时理解场景并安全地帮助用户。",
        "try_title": "10 分钟：做一次端云取舍",
        "prompt": "基于这条 AI 硬件新闻，分析它的 AI 能力更适合端侧、云端还是端云协同。请按时延、功耗、联网、隐私、成本和用户可控性逐项说明，并类比一个运动相机或手机场景。\n\n【粘贴新闻】",
    },
    {
        "section": "创作与生活",
        "badge": "影像 / 通用实践",
        "query": "AI video image voice creative tool app launch",
        "relevance": "今天就能试",
        "fact": "创作类 AI 最适合拿真实素材亲测：它能否保留意图、节省步骤、给出新方向，以及最终结果是否仍然像你自己。",
        "boundary": "“生成得漂亮”不等于内容真实、可商用或符合你的审美；素材权利和 AI 生成标识不能省略。",
        "relevance_text": "它既可以成为影像产品的灵感，也可以直接服务你的旅行、运动记录和个人兴趣。",
        "try_title": "10 分钟：用真实素材体验一次 AI 创作",
        "prompt": "我想用 AI 围绕这个真实素材做一个小作品：____。请给我三种差异明显的方向，并分别说清 AI 可以辅助的部分、我必须亲自决定的部分，以及一个十分钟内就能开始的第一步。",
    },
]


def clean_text(value: str | None) -> str:
    text = re.sub(r"<[^>]+>", " ", value or "")
    text = re.sub(r"\s+", " ", unescape(text)).strip()
    return text


def fetch_headline(query: str, seen: set[str]) -> dict | None:
    params = urlencode({"q": query, "hl": "zh-CN", "gl": "CN", "ceid": "CN:zh-Hans"})
    request = Request(
        f"https://news.google.com/rss/search?{params}",
        headers={"User-Agent": "AI-Intelligence-Desk/1.0"},
    )
    with urlopen(request, timeout=20) as response:
        root = ET.fromstring(response.read())
    for item in root.findall("./channel/item"):
        title = clean_text(item.findtext("title"))
        key = re.sub(r"[^a-z0-9\u4e00-\u9fff]", "", title.lower())
        if not title or key in seen:
            continue
        seen.add(key)
        source = clean_text(item.findtext("source")) or "新闻来源"
        return {
            "title": title,
            "url": clean_text(item.findtext("link")),
            "source": source,
            "description": clean_text(item.findtext("description")),
        }
    return None


def build_item(track: dict, headline: dict, stamp: str) -> dict:
    description = headline["description"] or "该动态的公开摘要有限，请打开原始来源核实具体能力与可用范围。"
    return {
        "id": f"{track['section']}-{stamp}",
        "section": track["section"],
        "badge": track["badge"],
        "time": "5–7 分钟",
        "relevance": track["relevance"],
        "title": headline["title"],
        "happened": f"{headline['source']} 的近期报道：{description[:260]}",
        "fact": track["fact"],
        "boundary": track["boundary"],
        "relevanceText": track["relevance_text"],
        "tryTitle": track["try_title"],
        "prompt": track["prompt"],
        "source": {"name": headline["source"], "url": headline["url"]},
    }


def main() -> None:
    existing = json.loads(OUTPUT.read_text(encoding="utf-8"))
    now = datetime.now(TZ_CN)
    seen: set[str] = set()
    items = []
    for track in TRACKS:
        try:
            headline = fetch_headline(track["query"], seen)
            if headline:
                items.append(build_item(track, headline, now.strftime("%Y%m%d")))
        except Exception:
            # One unavailable source should not erase a usable existing issue.
            continue

    if len(items) < 3:
        return

    payload = {
        "label": "今日 AI 精选 · 自动筛选，原始来源已附",
        "date": now.strftime("%Y 年 %-m 月 %-d 日"),
        "updatedAt": now.strftime("%Y-%m-%d %H:%M（北京时间）"),
        "title": "今天，不用刷完 AI 世界。只看 4 件值得你知道的事。",
        "summary": "覆盖新能力、AI 产品、软硬结合与创作实践。先从标题发现信号，再回到原始来源和亲手体验建立判断。",
        "briefs": items,
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
