const $ = (id) => document.getElementById(id);

const SCENES = {
  comeback: { colors: ["#ff4d8d", "#7c5cff", "#19d4ff", "#f7f1df"] },
  streaming: { colors: ["#28e59f", "#45a3ff", "#f4d35e", "#10131f"] },
  concert: { colors: ["#ffb347", "#ff5f6d", "#362f78", "#f7f1df"] },
  daily: { colors: ["#8bd3ff", "#ffd166", "#ef476f", "#073b4c"] }
};

const state = {
  tone: "热血但克制",
  plan: null,
  particles: [],
  width: 0,
  height: 0,
  dpr: 1,
  busy: false
};

const canvas = $("waveCanvas");
const ctx = canvas.getContext("2d");

function hashNumber(value, min, max) {
  let hash = 2166136261;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const n = (hash >>> 0) / 4294967295;
  return min + n * (max - min);
}

function pick(list, seed) {
  return list[Math.floor(hashNumber(seed, 0, list.length - 0.0001))];
}

function currentPayload() {
  return {
    artist: $("artist").value.trim() || "NovaWave",
    fandom: $("fandom").value.trim() || "Global fanbase",
    scene: $("scene").value,
    platform: $("platform").value,
    tone: state.tone,
    goal: $("goal").value.trim()
  };
}

function localPlan(payload) {
  const scene = SCENES[payload.scene] || SCENES.comeback;
  const seed = `${payload.artist}-${payload.scene}-${payload.platform}-${payload.fandom}-${payload.tone}`;
  return {
    source: "local",
    campaign: {
      artist: payload.artist,
      fandom: payload.fandom,
      sceneId: payload.scene,
      scene: $("scene").selectedOptions[0].textContent,
      platform: payload.platform,
      goal: payload.goal,
      tone: payload.tone,
      colors: scene.colors
    },
    strategy: {
      coreInsight: pick([
        "追星用户不是缺内容，而是缺可复制的任务节奏和多平台表达模板。",
        "回归期内容爆发很短，粉丝站需要把热情拆成可执行的内容动作。",
        "欧美/K-pop 粉丝横跨平台和语言，需要统一信息但适配不同平台语气。",
        "粉丝运营的关键不是喊口号，而是让普通粉丝知道今天具体做什么。"
      ], seed + "insight"),
      positioning: `${payload.artist} ${$("scene").selectedOptions[0].textContent}的粉丝内容运营工作台。`,
      audience: pick(["核心粉", "路人粉", "新入坑粉", "海外粉", "内容产出型粉丝"], seed + "audience"),
      hook: pick(["今日追星任务表", "一条内容带路人入坑", "回归期粉丝作战板", "多平台安利模板"], seed + "hook")
    },
    content: {
      title: pick([
        `${payload.artist} 回归期粉丝作战板`,
        `今天怎么安利 ${payload.artist}？`,
        `${payload.artist} 粉丝多平台内容模板`,
        `欧美/K-pop 追星内容运营复盘`
      ], seed + "title"),
      xiaohongshu: `如果你也在追 ${payload.artist}，这份${$("scene").selectedOptions[0].textContent}任务表可以直接用：先准备一个入坑瞬间，再配一张高记忆点封面，评论区用问题引导互动。`,
      tiktok: `开头3秒：${payload.artist} 回归期，粉丝今天只做这3件事。画面切换：歌单收藏、安利文案、评论互动。结尾：你最想安利哪一秒？`,
      twitter: `${payload.artist} fan mission: save the track, share one favorite moment, invite one new listener, and reply with your entry point.`,
      hashtags: ["#FanPulse", "#Kpop", "#PopMusic", "#Comeback", "#追星日常", `#${payload.artist.replace(/\s+/g, "")}`],
      visualBrief: pick([
        "舞台聚光灯、音浪线条、银色贴纸、榜单数字卡片。",
        "暗色演唱会背景、荧光字幕、粉丝任务清单、倒计时组件。",
        "杂志拼贴风、歌词高亮、专辑色块、评论区截图框。",
        "欧美流行海报质感、霓虹渐变、播放按钮和社媒贴纸。"
      ], seed + "visual")
    },
    calendar: [
      { day: "D-7", action: "发布回归预热选题库，收集粉丝入坑故事。" },
      { day: "D-3", action: "发布多平台安利模板，组织评论区互动。" },
      { day: "D-Day", action: "发布首日任务卡，提醒播放、收藏、评论、转发。" },
      { day: "D+1", action: "复盘首日数据，筛选高互动话题二次创作。" },
      { day: "D+7", action: "沉淀内容复盘和下轮任务模板。" }
    ],
    tasks: ["收藏歌曲并加入歌单", "发布一条入坑理由内容", "评论区留下最喜欢的歌词/舞台瞬间", "转发官方物料并补充个人安利", "记录曝光、点赞、收藏、评论数据"],
    review: {
      metrics: {
        exposure: `${Math.round(hashNumber(seed + "exp", 6, 48))}k`,
        engagementRate: `${hashNumber(seed + "er", 6, 18).toFixed(1)}%`,
        saveRate: `${hashNumber(seed + "save", 3, 11).toFixed(1)}%`,
        commentRate: `${hashNumber(seed + "comment", 1, 7).toFixed(1)}%`
      },
      diagnosis: pick(["标题钩子强，但评论引导不够具体。", "视觉记忆点强，适合二次剪辑扩散。", "任务拆解清晰，适合粉丝站复制执行。", "内容偏核心粉，需要补路人粉入坑解释。"], seed + "diag"),
      nextIteration: "下一轮增加对路人粉更友好的背景解释，并把评论区问题设计得更具体。"
    },
    risk: ["避免使用未授权图片、音源和饭拍素材。", "避免引战、拉踩和诱导刷量表达。", "平台文案要区分安利、任务和复盘，降低账号风险。"]
  };
}

function resizeCanvas() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  seedParticles();
}

function seedParticles() {
  const plan = state.plan || localPlan(currentPayload());
  const seed = plan.campaign.artist + plan.campaign.scene;
  state.particles = Array.from({ length: 160 }, (_, i) => ({
    x: hashNumber(seed + i + "x", 0, state.width),
    y: hashNumber(seed + i + "y", 0, state.height),
    r: hashNumber(seed + i + "r", 1, 4),
    speed: hashNumber(seed + i + "s", 0.2, 1.7),
    phase: hashNumber(seed + i + "p", 0, Math.PI * 2),
    color: pick(plan.campaign.colors, seed + i + "c")
  }));
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, a) {
  const c = hexToRgb(hex);
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
}

function draw(t) {
  const plan = state.plan || localPlan(currentPayload());
  const colors = plan.campaign.colors;
  const g = ctx.createLinearGradient(0, 0, state.width, state.height);
  g.addColorStop(0, rgba(colors[0], 0.32));
  g.addColorStop(0.5, rgba(colors[1], 0.24));
  g.addColorStop(1, rgba(colors[2], 0.2));
  ctx.fillStyle = "#080912";
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let line = 0; line < 11; line += 1) {
    ctx.beginPath();
    const yBase = state.height * (0.18 + line * 0.07);
    for (let x = -30; x <= state.width + 30; x += 18) {
      const y = yBase + Math.sin(x * 0.014 + t * 0.0012 + line) * (14 + line * 1.8);
      if (x === -30) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(colors[line % colors.length], 0.13);
    ctx.lineWidth = 1 + line * 0.16;
    ctx.stroke();
  }

  state.particles.forEach((p) => {
    p.x += Math.cos(p.phase + t * 0.0003) * p.speed;
    p.y += Math.sin(p.phase + t * 0.0004) * p.speed - 0.08;
    if (p.x < -20) p.x = state.width + 20;
    if (p.x > state.width + 20) p.x = -20;
    if (p.y < -20) p.y = state.height + 20;
    if (p.y > state.height + 20) p.y = -20;
    ctx.fillStyle = rgba(p.color, 0.25);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  requestAnimationFrame(draw);
}

function applyTheme(plan) {
  const colors = plan.campaign.colors;
  document.documentElement.style.setProperty("--hot", colors[0]);
  document.documentElement.style.setProperty("--violet", colors[1]);
  document.documentElement.style.setProperty("--cyan", colors[2]);
  document.documentElement.style.setProperty("--gold", colors[3]);
}

function render(plan, warning = "") {
  state.plan = plan;
  applyTheme(plan);
  seedParticles();
  $("sourceBadge").textContent = warning ? "FALLBACK" : plan.source.toUpperCase();
  $("planTitle").textContent = plan.content.title;
  $("coreInsight").textContent = plan.strategy.coreInsight;
  $("audience").textContent = plan.strategy.audience;
  $("hook").textContent = plan.strategy.hook;
  $("positioning").textContent = plan.strategy.positioning;
  $("xiaohongshu").textContent = plan.content.xiaohongshu;
  $("tiktok").textContent = plan.content.tiktok;
  $("twitter").textContent = plan.content.twitter;
  $("hashtags").innerHTML = plan.content.hashtags.map((tag) => `<span>${tag}</span>`).join("");
  $("calendar").innerHTML = plan.calendar.map((item) => `<li><b>${item.day}</b>${item.action}</li>`).join("");
  $("tasks").innerHTML = plan.tasks.map((item) => `<li>${item}</li>`).join("");
  $("risk").innerHTML = plan.risk.map((item) => `<li>${item}</li>`).join("");
  $("diagnosis").textContent = plan.review.diagnosis;
  $("nextIteration").textContent = plan.review.nextIteration;
  $("exposure").textContent = plan.review.metrics.exposure;
  $("engagementRate").textContent = plan.review.metrics.engagementRate;
  $("saveRate").textContent = plan.review.metrics.saveRate;
  $("commentRate").textContent = plan.review.metrics.commentRate;
  if (warning) showToast(warning);
}

async function generate() {
  if (state.busy) return;
  state.busy = true;
  $("generateBtn").disabled = true;
  $("generateBtn").querySelector("span").textContent = "正在生成运营方案";
  const payload = currentPayload();
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.plan) throw new Error(data.error || "No plan");
    render(data.plan, data.warning || "");
  } catch (error) {
    render(localPlan(payload), "未连接后端，已使用浏览器本地生成。");
  } finally {
    state.busy = false;
    $("generateBtn").disabled = false;
    $("generateBtn").querySelector("span").textContent = "生成追星运营方案";
  }
}

function contentText(plan) {
  return [
    plan.content.title,
    `小红书：${plan.content.xiaohongshu}`,
    `TikTok/抖音：${plan.content.tiktok}`,
    `X/Twitter：${plan.content.twitter}`,
    `视觉建议：${plan.content.visualBrief}`,
    `话题：${plan.content.hashtags.join(" ")}`
  ].join("\n");
}

function reviewText(plan) {
  return [
    `${plan.campaign.artist} 内容复盘`,
    `曝光：${plan.review.metrics.exposure}`,
    `互动率：${plan.review.metrics.engagementRate}`,
    `收藏率：${plan.review.metrics.saveRate}`,
    `评论率：${plan.review.metrics.commentRate}`,
    `诊断：${plan.review.diagnosis}`,
    `下一步：${plan.review.nextIteration}`
  ].join("\n");
}

function copyText(text, message) {
  navigator.clipboard?.writeText(text).then(
    () => showToast(message),
    () => showToast("浏览器不允许复制，可以手动选中文案")
  );
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function bind() {
  $("planForm").addEventListener("submit", (event) => {
    event.preventDefault();
    generate();
  });
  $("toneChips").addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-tone]");
    if (!btn) return;
    state.tone = btn.dataset.tone;
    [...$("toneChips").querySelectorAll("button")].forEach((item) => item.classList.toggle("active", item === btn));
  });
  $("scene").addEventListener("change", () => render(localPlan(currentPayload())));
  $("copyContent").addEventListener("click", () => copyText(contentText(state.plan || localPlan(currentPayload())), "内容包已复制"));
  $("copyReview").addEventListener("click", () => copyText(reviewText(state.plan || localPlan(currentPayload())), "复盘已复制"));
  window.addEventListener("resize", resizeCanvas);
}

function init() {
  bind();
  resizeCanvas();
  render(localPlan(currentPayload()));
  requestAnimationFrame(draw);
}

init();
