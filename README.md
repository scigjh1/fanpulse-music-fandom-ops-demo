# FanPulse - 欧美/K-pop 音乐追星内容运营工作台

FanPulse 是一个面向欧美流行音乐、K-pop 追星场景的 AI 内容运营产品 Demo。

GitHub：https://github.com/scigjh1/fanpulse-music-fandom-ops-demo

它不是二次元项目，也不是普通文案生成器，而是把粉丝站/内容运营的真实工作拆成：

```text
运营场景 -> 内容策略 -> 多平台文案 -> 发布日历 -> 粉丝任务 -> 数据复盘 -> 下一轮迭代
```

## 项目定位

面向音乐粉丝、粉丝站、内容运营和社区运营同学，帮助他们在回归宣发、流媒打歌、演唱会、日常追星内容中快速生成可执行的内容运营方案。

## 核心功能

- 选择运营场景：回归宣发、打歌/流媒任务、演唱会/巡演、日常追星内容。
- 选择主平台：小红书、抖音、TikTok、X/Twitter、Instagram、微博。
- 生成内容策略：用户洞察、目标用户、传播钩子、活动定位。
- 生成多平台文案：小红书、短视频脚本、英文 X/Twitter 文案。
- 生成发布日历：D-7、D-3、D-Day、D+1、D+7。
- 生成粉丝任务：收藏、分享、评论、安利、数据记录。
- 生成复盘建议：曝光、互动率、收藏率、评论率、诊断和下一步迭代。
- 风险提醒：版权、社区氛围、平台规则。

## 如何运行

```powershell
npm start
```

打开：

```text
http://localhost:4188
```

## 接入大模型

```powershell
$env:OPENAI_API_KEY="你的 API Key"
$env:OPENAI_MODEL="gpt-5.5"
npm start
```

没有 API Key 时，项目会自动使用本地生成器兜底。

## 文件结构

```text
fanpulse_music_fandom_ops_demo/
  app/
    index.html
    styles.css
    app.js
  docs/
    PRD.md
    产品运营方案.md
    指标体系.md
    迭代路线图.md
  resume/
    简历项目段.md
  server.mjs
  package.json
```

## 和 ScentSoul 的区别

- ScentSoul：品牌产品、购买后体验、数字 IP、会员运营。
- FanPulse：内容运营、音乐粉丝社区、追星传播、多平台数据复盘。

两个项目组合可以覆盖：

- 产品经理：用户场景、功能设计、流程拆解、技术方案。
- 产品运营：内容选题、用户分层、活动节奏、数据复盘、增长闭环。
