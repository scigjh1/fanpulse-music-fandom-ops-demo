import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const appDir = join(__dirname, "app");
const port = Number(process.env.PORT || 4188);
const model = process.env.OPENAI_MODEL || "gpt-5.5";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const SCENES = {
  comeback: {
    label: "回归宣发",
    goal: "提升新歌预热、首日互动和站外扩散",
    platforms: ["微博", "小红书", "抖音", "X/Twitter", "TikTok"],
    colors: ["#ff4d8d", "#7c5cff", "#19d4ff", "#f7f1df"]
  },
  streaming: {
    label: "打歌/流媒任务",
    goal: "组织粉丝完成播放、收藏、评论和榜单任务",
    platforms: ["Spotify", "Apple Music", "YouTube", "微博", "Discord"],
    colors: ["#28e59f", "#45a3ff", "#f4d35e", "#10131f"]
  },
  concert: {
    label: "演唱会/巡演",
    goal: "围绕抢票、穿搭、应援物和现场内容做传播",
    platforms: ["小红书", "抖音", "Instagram", "TikTok", "微博"],
    colors: ["#ffb347", "#ff5f6d", "#362f78", "#f7f1df"]
  },
  daily: {
    label: "日常追星内容",
    goal: "维持粉丝日常活跃和轻量互动",
    platforms: ["小红书", "微博", "抖音", "X/Twitter", "Instagram"],
    colors: ["#8bd3ff", "#ffd166", "#ef476f", "#073b4c"]
  }
};

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function hashNumber(value, min, max) {
  const h = crypto.createHash("sha256").update(String(value)).digest();
  const n = h.readUInt32BE(0) / 0xffffffff;
  return min + n * (max - min);
}

function pick(list, seed) {
  return list[Math.floor(hashNumber(seed, 0, list.length - 0.0001))];
}

function normalizePlan(raw, payload, source = "openai") {
  const scene = SCENES[payload.scene] || SCENES.comeback;
  const seed = `${payload.artist}-${payload.scene}-${payload.platform}-${payload.fandom}-${payload.goal}`;
  const strategy = raw.strategy || {};
  const content = raw.content || {};
  const calendar = Array.isArray(raw.calendar) ? raw.calendar : [];
  const tasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  const review = raw.review || {};
  const risk = Array.isArray(raw.risk) ? raw.risk : [];

  return {
    source,
    generatedAt: new Date().toISOString(),
    campaign: {
      artist: payload.artist || "NovaWave",
      fandom: payload.fandom || "粉丝站",
      sceneId: payload.scene || "comeback",
      scene: scene.label,
      platform: payload.platform || "小红书",
      goal: payload.goal || scene.goal,
      tone: payload.tone || "热血但克制",
      colors: scene.colors
    },
    strategy: {
      coreInsight: strategy.coreInsight || "粉丝需要低门槛、可复制、能参与的内容任务，而不是只看官方物料。",
      positioning: strategy.positioning || `${payload.artist || "艺人"} ${scene.label} 的粉丝协作内容工作台。`,
      audience: strategy.audience || pick(["核心粉", "路人粉", "新入坑粉", "海外粉", "内容产出型粉丝"], seed + "audience"),
      hook: strategy.hook || pick(["一键生成多平台追星文案", "把回归任务拆成每日行动", "用数据复盘每条内容", "让粉丝站运营更像项目管理"], seed + "hook")
    },
    content: {
      title: content.title || `${payload.artist || "TA"} 回归期粉丝内容作战板`,
      xiaohongshu: content.xiaohongshu || `今天整理一份${payload.artist || "TA"} ${scene.label}追星任务：先收藏歌单，再准备安利图，评论区一起补充你的入坑瞬间。`,
      tiktok: content.tiktok || `3秒开头：如果你也在等这次回归，这份粉丝任务表直接拿走。`,
      twitter: content.twitter || `Fan mission board for ${payload.artist || "the artist"}: stream, save, comment, share, and bring one new listener today.`,
      hashtags: Array.isArray(content.hashtags) && content.hashtags.length ? content.hashtags.slice(0, 6) : ["#FanPulse", "#Kpop", "#PopMusic", "#Comeback", "#追星日常"],
      visualBrief: content.visualBrief || "高对比舞台光、音浪线条、榜单卡片、粉丝任务贴纸。"
    },
    calendar: calendar.length ? calendar.slice(0, 5) : [
      { day: "D-7", action: "发布回归预热选题库，收集粉丝入坑故事。" },
      { day: "D-3", action: "发布多平台安利模板，组织评论区互动。" },
      { day: "D-Day", action: "发布首日任务卡，提醒播放、收藏、评论、转发。" },
      { day: "D+1", action: "复盘首日数据，筛选高互动话题二次创作。" },
      { day: "D+7", action: "沉淀内容复盘和下轮任务模板。" }
    ],
    tasks: tasks.length ? tasks.slice(0, 6) : [
      "收藏歌曲并加入歌单",
      "发布一条入坑理由内容",
      "评论区留下最喜欢的歌词/舞台瞬间",
      "转发官方物料并补充个人安利",
      "记录曝光、点赞、收藏、评论数据"
    ],
    review: {
      metrics: {
        exposure: review.metrics?.exposure || `${Math.round(hashNumber(seed + "exp", 6, 48))}k`,
        engagementRate: review.metrics?.engagementRate || `${hashNumber(seed + "er", 6, 18).toFixed(1)}%`,
        saveRate: review.metrics?.saveRate || `${hashNumber(seed + "save", 3, 11).toFixed(1)}%`,
        commentRate: review.metrics?.commentRate || `${hashNumber(seed + "comment", 1, 7).toFixed(1)}%`
      },
      diagnosis: review.diagnosis || pick(["标题钩子强，但评论引导不够具体。", "视觉记忆点强，适合二次剪辑扩散。", "任务拆解清晰，适合粉丝站复制执行。", "内容偏核心粉，需要补路人粉入坑解释。"], seed + "diag"),
      nextIteration: review.nextIteration || "下一轮增加对路人粉更友好的背景解释，并把评论区问题设计得更具体。"
    },
    risk: risk.length ? risk.slice(0, 5) : [
      "避免使用未授权图片、音源和饭拍素材。",
      "避免引战、拉踩和诱导刷量表达。",
      "平台文案要区分安利、任务和复盘，降低账号风险。"
    ]
  };
}

function localPlan(payload) {
  const scene = SCENES[payload.scene] || SCENES.comeback;
  const seed = `${payload.artist}-${payload.scene}-${payload.platform}-${payload.fandom}-${payload.tone}`;
  return normalizePlan({
    strategy: {
      coreInsight: pick([
        "追星用户不是缺内容，而是缺可复制的任务节奏和多平台表达模板。",
        "回归期内容爆发很短，粉丝站需要把热情拆成可执行的内容动作。",
        "欧美/K-pop 粉丝横跨平台和语言，需要统一信息但适配不同平台语气。",
        "粉丝运营的关键不是喊口号，而是让普通粉丝知道今天具体做什么。"
      ], seed + "insight"),
      positioning: `${payload.artist || "艺人"} ${scene.label}的粉丝内容运营工作台。`,
      audience: pick(["核心粉", "路人粉", "新入坑粉", "海外粉", "内容产出型粉丝"], seed + "audience"),
      hook: pick(["今日追星任务表", "一条内容带路人入坑", "回归期粉丝作战板", "多平台安利模板"], seed + "hook")
    },
    content: {
      title: pick([
        `${payload.artist || "TA"} 回归期粉丝作战板`,
        `今天怎么安利 ${payload.artist || "TA"}？`,
        `${payload.artist || "TA"} 粉丝多平台内容模板`,
        `欧美/K-pop 追星内容运营复盘`
      ], seed + "title"),
      xiaohongshu: `如果你也在追 ${payload.artist || "TA"}，这份${scene.label}任务表可以直接用：先准备一个入坑瞬间，再配一张高记忆点封面，评论区用问题引导互动。`,
      tiktok: `开头3秒：${payload.artist || "TA"} 回归期，粉丝今天只做这3件事。画面切换：歌单收藏、安利文案、评论互动。结尾：你最想安利哪一秒？`,
      twitter: `${payload.artist || "Artist"} fan mission: save the track, share one favorite moment, invite one new listener, and reply with your entry point.`,
      hashtags: ["#FanPulse", "#Kpop", "#PopMusic", "#Comeback", "#追星日常", `#${(payload.artist || "Artist").replace(/\s+/g, "")}`],
      visualBrief: pick([
        "舞台聚光灯、音浪线条、银色贴纸、榜单数字卡片。",
        "暗色演唱会背景、荧光字幕、粉丝任务清单、倒计时组件。",
        "杂志拼贴风、歌词高亮、专辑色块、评论区截图框。",
        "欧美流行海报质感、霓虹渐变、播放按钮和社媒贴纸。"
      ], seed + "visual")
    }
  }, payload, "local");
}

function buildPrompt(payload) {
  const scene = SCENES[payload.scene] || SCENES.comeback;
  return `
你是音乐粉丝内容运营产品经理，服务欧美流行音乐和 K-pop 追星场景。
请为一个粉丝站/内容运营同学生成一套“追星内容运营方案”。
不要使用真实未授权素材，不要引导刷量、控评、拉踩或攻击其他艺人。

输入：
${JSON.stringify({ ...payload, sceneConfig: scene }, null, 2)}

必须只返回 JSON，不要 Markdown，不要解释：
{
  "strategy": {
    "coreInsight": "用户洞察，30-60个中文",
    "positioning": "产品/活动定位，20-45个中文",
    "audience": "目标用户分层，如 核心粉/路人粉/海外粉",
    "hook": "传播钩子，8-18个中文"
  },
  "content": {
    "title": "小红书/内容标题",
    "xiaohongshu": "小红书文案，80-140个中文",
    "tiktok": "短视频脚本，50-100个中文",
    "twitter": "英文 X/Twitter 文案",
    "hashtags": ["3-6个话题"],
    "visualBrief": "封面/视觉建议，20-50个中文"
  },
  "calendar": [
    {"day": "D-7", "action": "运营动作"},
    {"day": "D-3", "action": "运营动作"},
    {"day": "D-Day", "action": "运营动作"},
    {"day": "D+1", "action": "运营动作"},
    {"day": "D+7", "action": "运营动作"}
  ],
  "tasks": ["4-6个粉丝可执行任务"],
  "review": {
    "metrics": {
      "exposure": "如 24k",
      "engagementRate": "如 12.4%",
      "saveRate": "如 6.2%",
      "commentRate": "如 3.1%"
    },
    "diagnosis": "数据诊断，20-45个中文",
    "nextIteration": "下一轮迭代建议，25-50个中文"
  },
  "risk": ["3-5个合规/版权/社区风险提醒"]
}
`;
}

function extractText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  if (Array.isArray(data.output)) {
    return data.output.flatMap((item) => {
      if (typeof item.content === "string") return [item.content];
      if (Array.isArray(item.content)) return item.content.map((c) => c.text || c.value || "").filter(Boolean);
      return [];
    }).join("\n");
  }
  return "";
}

function parseLooseJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("Model did not return valid JSON");
  }
}

async function generatePlan(payload) {
  if (!process.env.OPENAI_API_KEY) {
    return { plan: localPlan(payload), warning: "未设置 OPENAI_API_KEY，已使用本地生成器。" };
  }
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: buildPrompt(payload),
        max_output_tokens: 1800
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { plan: localPlan(payload), warning: `OpenAI 调用失败，已切换本地生成器：${data.error?.message || response.status}` };
    }
    const raw = parseLooseJson(extractText(data));
    return { plan: normalizePlan(raw, payload, "openai") };
  } catch (error) {
    return { plan: localPlan(payload), warning: `OpenAI 调用失败，已切换本地生成器：${error.message}` };
  }
}

async function handleStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = normalize(join(appDir, pathname));
  if (!filePath.startsWith(appDir) || !existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const content = await readFile(filePath);
  res.writeHead(200, {
    "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  res.end(content);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/generate") {
      const payload = await readBody(req);
      json(res, 200, await generatePlan(payload));
      return;
    }
    if (req.method === "GET" && req.url === "/api/health") {
      json(res, 200, { ok: true, model, openai: Boolean(process.env.OPENAI_API_KEY), scenes: Object.keys(SCENES) });
      return;
    }
    await handleStatic(req, res);
  } catch (error) {
    json(res, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`FanPulse running at http://localhost:${port}`);
  console.log(process.env.OPENAI_API_KEY ? `OpenAI model: ${model}` : "OPENAI_API_KEY not set; local generator fallback enabled.");
});
