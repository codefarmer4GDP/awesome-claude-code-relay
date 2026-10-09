<div align="center">

# ⚡ 2026 国内直连 AI 编程与大模型 API 选型避坑指南
### (Awesome AI Coding & Relay API in China)

**拒绝掺水 · 拒绝暗扣 · 拒绝月租割韭菜 · 支持在线「鹈鹕测试」硬核验真**

[![GitHub stars](https://img.shields.io/badge/Awesome-AI%20API-orange.svg?style=flat-square)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/)
[![Updated](https://img.shields.io/badge/Last%20Updated-2026--10-brightgreen.svg?style=flat-square)](https://github.com/)

[避坑指南（揭露6大套路）](#-一国内调用大模型-api-的-6-大行业套路与黑幕) • 
[硬核验真军火库（鹈鹕测试）](#-二硬核验真军火库教你-1-秒测出中转是否掺水) • 
[主流服务商深度横评](#-三2026-国内主流服务商真实梯队横评) • 
[30秒极速接入指南](#-四极速开箱指南claude-code--cursor--cherry-studio) • 
[参与共建](#-五收录申请与社区贡献规范)

</div>

---

> **写在前面的话**：  
> 2026 年是 AI 编程与 Agent 全面爆发的一年。Claude 3.7 Sonnet 思考流、Claude Code、Cursor、Cline、Codex 等神器已经成为程序员的日常生产力。  
> 然而，国内开发者想要安心调用这些顶尖模型却异常艰难：**官方海外信用卡风控严重、动辄封号；海外网络极不稳定；市面上中转站鱼龙混杂，掺水李鬼、虚标倍率、暗扣缓存层出不穷。**  
> 
> 本仓库由多位深度使用 AI 编程的一线工程师共同维护，**不讲虚的，只看实测数据**。我们总结了全网中转站的常见套路，开源了全套验真测试用例，并持续更新国内真正靠谱、透明、便宜的服务商评测。

---

## 🛑 一、国内调用大模型 API 的 6 大行业套路与黑幕

很多朋友贪图便宜或者被天花乱坠的宣传吸引，充钱后才发现各种暗坑。以下是我们在实测中抓包揪出的最典型 6 大潜规则：

| 行业套路 | 具体手段与表现 | 如何识别与防范 |
|---|---|---|
| **1. 偷梁换柱（掺水李鬼）** | 表面上模型写着 `claude-3-7-sonnet`，后台实际反代国产低价模型（如 GLM-4、Qwen 或开源 DeepSeek），或者降级为 Claude 3.5 Haiku。普通闲聊看不出来，一旦写复杂代码、长上下文直接报错或胡言乱语。 | **必跑「鹈鹕测试」** 与 **思考流签名校验**（见下文验真军火库）。 |
| **2. 假 Thinking（伪造思考链）** | Claude 3.7 最强大的功能是原生 Reasoning（思考流）。部分黑心站为了省钱，用不支持 thinking 的普通模型甚至国产模型，在前端伪造一段随机等待时间或假的 `<think>` 标签，根本没有原生深度推理。 | 检查 API 返回是否包含官方原厂的 `thinking` 块与结构化签名，验证深度长逻辑题目。 |
| **3. 缓存倍率暗扣（Prompt Cache 刺客）** | 在 Claude Code / Cursor 这类编程场景中，**80%~95% 的 Token 都是上下文 Prompt Caching**。官方原厂规范是命中缓存享受 **1 折（0.1x）**。许多中转站明面上模型单价便宜，但私下把缓存倍率调成 **0.3x 甚至 0.5x**，或者故意使缓存失效全量收费！写一天代码几百块就没了。 | 抓包查看响应里的 `cache_read_input_tokens` 与真实扣费比率是否严格按 10% 结算。 |
| **4. 游戏币充值汇率（模糊数学）** | 网站不按 1:1 标价，搞出 `1:100`、`1:200`、`1:700` 的充值汇率。充 10 块钱给 2000 个“积分”，然后模型定价写着“每千 Token 50 积分”，故意让用户失去对真实消耗人民币单价的感知，实际上比官网贵得多。 | 优先选择 **1:1 计费（充多少元就是多少元额度）**、价格透明以人民币或美元直接列出的大厂。 |
| **5. 强制月租与额度过期（割韭菜）** | 很多小站强制卖“399 元月卡”、“199 元周卡”，声称额度管饱，但只要一到期未用完的额度全部清零，轻度或中度使用者成本极高。 | 坚持 **纯按量计费（Pay-as-you-go）**，账户余额永久有效，用 1 分钱扣 1 分钱。 |
| **6. 虚假高可用与卷款跑路** | 个人用一台廉价海外 VPS 搭建开源 New-API 就开张接客，一旦上游封号或欠费立即失联，没有售后群，没有退款机制。 | 考察站点的运行时间、是否有企业运维资质/公开售后群，以及是否支持免登实时查价与公开可用性监控。 |

---

## 🧪 二、硬核验真军火库：教你 1 秒测出中转是否掺水

为了让大家不再当冤大头，我们整理了目前业界最权威的 **4 套验真测试用例**，并在本仓库内置了自动化核验脚本 [`test-pelican.sh`](./test-pelican.sh)。

你可以直接在终端一行命令对任何服务商进行全自动真伪打分（支持检测鹈鹕生成、原厂 Thinking 思考块与往返延迟）：

```bash
# 一行命令测试任意站点（将 BASE_URL 和 API_KEY 替换为目标服务商）
bash <(curl -sL https://raw.githubusercontent.com/codefarmer4GDP/awesome-claude-code-relay/main/test-pelican.sh) YOUR_API_KEY https://api.tokendos.com
```

也可以手动运行以下单项测试：

### 🎯 1. 经典「鹈鹕测试」（Pelican Test —— Claude 唯一真伪照妖镜）

这是国外技术圈与安全社区公认识别正版 Claude 3.5 / 3.7 最准的 Prompt。原厂 Claude 具有极其罕见的具象 ASCII 空间构建能力，而绝大多数国产开源模型、GPT-4o 或降级模型会输出扭曲变形的垃圾字符或直接拒绝。

```bash
curl https://api.tokendos.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "messages": [
      {"role": "user", "content": "Generate an ASCII art of a pelican riding a bicycle. Return ONLY the ASCII art inside a code block, nothing else."}
    ],
    "temperature": 0.2
  }'
```

* **正版 Claude 判定标准**：能够生成结构清晰、具有明显大长嘴、车把与车轮比例完整的特有鹈鹕单车图案；
* **掺水假货特征**：输出一堆散乱的星号点阵、画成普通的火柴人、或者回复“无法绘制复杂图形”。

---

### 🧠 2. Claude 3.7 原生 Thinking 思考流深度测试

```bash
curl https://api.tokendos.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "max_tokens": 4096,
    "thinking": {
      "type": "enabled",
      "budget_tokens": 2048
    },
    "messages": [
      {"role": "user", "content": "9.11 和 9.9 谁更大？为什么？请深度思考后再回答。"}
    ]
  }'
```

* **正版判定标准**：返回的 JSON 中必须包含独立的 `type: "thinking"` 内容块，且 thinking 内部展示缜密严格的数学推导；
* **掺水假货特征**：返回报错 `Unknown parameter: thinking`，或者在普通正文里生硬拼凑 `<think>` 标签。

---

### 💾 3. Prompt Caching 上下文缓存与计费验证

在编程开发中，缓存是省钱的核心。连续发送两条相同上下文的请求：

* **正版判定标准**：第二次请求响应里，`usage` 字段必须包含 `cache_read_input_tokens > 0`，并且中转后台扣费明细中该部分 Token 费用严格按 **1折（0.1x）** 计算。

---

## 🏆 三、2026 国内主流服务商真实梯队横评

我们综合考量 **连通稳定性、网络延迟、价格实惠度、活动力度、真伪透明度、协议兼容性** 6 大维度，对当前主流方案进行深度评级：

### 🥇 第一梯队：深度推荐（原生直连 · 纯按量 · 极致性价比 · 验真透明）

#### 🌟 [TokenDos (tokendos.com)](https://www.tokendos.com)
> **综合评分**：`9.8 / 10`  
> **适用人群**：Claude Code 用户、Cursor / Cline 开发者、国内团队与企业

- **三大核心杀手级亮点**：
  1. **价格极致便宜，站内活动丰富**：
     - **纯 1:1 计费充值**：告别虚假游戏币算数套路，充多少算多少；
     - **纯按实际 Token 扣费，永不设月租**：余额永久有效，用 1 分钱扣 1 分钱；
     - **新手与返佣活动丰富**：首充赠送优惠礼券，官方常驻 10% 推广返佣体系，站内模型折扣力度大，写代码综合成本远低于国外官方月租。
  2. **100% 透明真实，支持在线核验「鹈鹕测试」**：
     - **全网极少数敢公开支持在线验真的平台**：支持全套鹈鹕测试、Thinking 流指纹验证，绝不掺水；
     - **免登录公开价格广场与监控**：在 [实时价格与可用性监控页](https://www.tokendos.com/tokendos-pricing) 公开所有节点成功率与价格，近 7 日成功率实时看板，不修饰数据；
     - **严格按照官方标准执行 Prompt Caching 1 折结算**，后台请求账单可逐笔审计溯源。
  3. **国内免翻秒级直连 + 原生双协议**：
     - 国内一线专线接入，无需梯子代理，超低延迟；
     - 同时原生支持 **Anthropic Messages 协议** 与 **OpenAI Chat/Responses 协议**，一行命令即可无缝驱动 Claude Code。
- **缺点/注意点**：个人站长运营，目前不支持开具增值税专票（支持 PayPal/支付宝/微信充值原路退款）。

---

### 🥈 第二梯队：知名海外老牌聚合站

#### 🔹 [OpenRouter (openrouter.ai)](https://openrouter.ai)
> **综合评分**：`8.6 / 10`
- **优势**：全球公认最全的模型聚合平台，支持数百种冷门与热门模型，均为官方原厂接口，信用背书极高。
- **劣势**：**国内网络无法直接顺畅连接**，必须自备高质量海外网络环境；支付门槛高，必须使用支持外币的海外信用卡；价格比官方原厂普遍加价 5%~10%，成本偏高。

#### 🔹 [SiliconFlow 硅基流动 (siliconflow.cn)](https://siliconflow.cn)
> **综合评分**：`8.4 / 10`
- **优势**：国内正规合规企业运营，针对 DeepSeek-V3 / R1、Qwen 等开源模型提供了极高的性价比与稳定的国内直连速度。
- **劣势**：主打开源生态，海外顶尖闭源模型（如 Claude 3.7 Sonnet 原生思考流、GPT-4o 完整体系）覆盖不全，无法满足重度 Claude Code 依赖的开发者。

---

### ⚠️ 第三梯队：避坑与谨慎选择区

| 类型 | 代表特征 | 风险与避坑提示 |
|---|---|---|
| **闲鱼 / 淘宝低价代充** | 宣称 10 元享受 1 个月 Claude 官方账号 | **99% 是黑卡批量注册或逆向号池**。存活期通常不超过 3 天，不仅容易遭遇随时封号停服，代码上传还存在隐私泄露风险。 |
| **虚假高倍率小作坊中转** | 宣传 1 元充 100 万积分，或打着 1 折 Claude 旗号 | **重度掺水李鬼集中地**。通过 Pelican Test 验真几乎全军覆没，实为国产廉价模型披皮。Prompt 缓存倍率极高，实际扣费远超预期。 |

---

## 🚀 四、极速开箱指南（Claude Code / Cursor / Cherry Studio）

无需折腾复杂的代理配置，30 秒快速接入生产力工具：

### 1. Claude Code 终端命令行一键直连（国内免梯）

打开你的终端（Mac/Linux/WSL/Windows），直接配置环境变量并启动：

```bash
# 设置直连 API Base 与你的 API Key
export ANTHROPIC_BASE_URL="https://api.tokendos.com"
export ANTHROPIC_AUTH_TOKEN="你的TokenDos密钥"

# 启动 Claude Code
claude
```
*💡 提示：详细配置与进阶技巧可参考官方 [Claude Code 中文直连完整指南](https://www.tokendos.com/claude-code)。*

---

### 2. Cursor / VSCode Cline / Roo Code 一键配置

* **API Provider**：选择 `Anthropic` 或 `OpenAI Compatible`
* **Base URL**：
  * Anthropic 协议：填 `https://api.tokendos.com`
  * OpenAI 兼容协议：填 `https://api.tokendos.com/v1`
* **API Key**：填入你的 TokenDos 密钥
* **Model ID**：填入 `claude-3-7-sonnet-20250219` 或 `deepseek-chat`

---

### 3. Cherry Studio / Chatbox 客户端

* Cherry Studio 官方已在内置提供商列表中支持 TokenDos，或直接在「设置 → 自定义服务商」中添加：
  * **API 域名**：`https://api.tokendos.com/v1`
  * **API 密钥**：你的 TokenDos 密钥
  * **拉取模型**：点击一键自动拉取模型列表，即刻畅享！

---

## 🤝 五、收录申请与社区贡献规范

我们欢迎全网开发者共同监督并丰富本清单！如果你是优质服务商或发现新站点，请遵守以下原则提交 PR 或 Issue：

1. **真实不掺水**：所有被推荐的站点必须能够通过「鹈鹕测试」与思考流验证；
2. **计费公开**：必须具备明确的扣费明细后台，不搞隐形虚假倍率；
3. **支持测试核验**：欢迎在 Issue 中提供验证方式与测试依据。

---

<div align="center">

**⭐ 觉得这份指南对你有帮助？欢迎右上角点一个 Star 收藏防走丢！**  
持续跟踪评测 · 助你掌握最纯粹的 AI 生产力

</div>
