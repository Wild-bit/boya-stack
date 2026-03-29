# AI 翻译系统深度解析

> Token 优化 · 成本计算 · Prompt 工程 · AI 应用开发 · 面试实战

---

## 方案 A：面试问答速查

### Q1：你们项目里用了什么 AI？为什么选这个模型？

**标准答案：**

我们用的是阿里云的 Qwen（通义千问）`qwen-plus` 模型，通过 DashScope 的 OpenAI 兼容接口接入，SDK 层面直接复用 `openai` 包，只需要换 `baseURL` 和 `apiKey`。

选 Qwen 的原因有三点：
1. **中文理解能力强**：i18n 场景源语言以中文为主，Qwen 对中文语义、UI 文案风格的理解比 GPT 系列更贴近预期
2. **成本更低**：Qwen-Plus 单价约为 GPT-4o 的 1/10，高频翻译场景下成本优势明显
3. **数据合规**：阿里云国内节点，避免企业数据出境合规风险

**追问：有没有评估过其他模型？**

评估过 GPT-4o-mini，翻译质量接近，但欧洲语言（法语、德语）的表达更地道。所以理想方案是**按语言族路由**：中日韩用 Qwen，欧洲语言用 GPT-4o-mini，两者成本相近，质量各有优势。

---

### Q2：一次翻译大概消耗多少 Token？你有没有算过？

**标准答案（基于项目真实 Prompt 代码计算）：**

我算过。我们的 Prompt 模板固定部分约 **200 个 token**，变量部分根据文本长短和目标语言数量浮动。

以典型场景举例：

| 场景 | 源文本 | 目标语言数 | 输入 Token | 输出 Token | 总计 |
|------|--------|-----------|-----------|-----------|------|
| 短文本（按钮） | "保存"（2字） | 5种 | ~220 | ~30 | **~250** |
| 中等文本（提示语） | "确认要删除这条记录吗？"（13字） | 5种 | ~240 | ~70 | **~310** |
| 长文本（说明文字） | 一句完整说明（30字） | 10种 | ~300 | ~150 | **~450** |

**成本换算（Qwen-Plus 定价）：**

```
输入：约 ¥0.0008 / 1K tokens
输出：约 ¥0.002  / 1K tokens

一次翻译（300 token）≈ ¥0.0004（约 $0.00005）
1000 次翻译 ≈ ¥0.40
10000 次翻译 ≈ ¥4.00
```

**一句话总结**：单次成本极低，规模化后也便宜，真正的成本风险在于**没有缓存导致重复调用**，不在于单次 token 消耗。

---

### Q3：Token 怎么优化？你们做了哪些？

**标准答案（分层回答）：**

Token 优化分三个层次：**减少输入、减少输出、减少调用次数**。

**层次一：减少输入 Token（Prompt 压缩）**

我们现有 Prompt 有一个问题：所有规则写成一长串，中文约 200 token。可以优化为：

```
// 现在（约 200 token）
翻译规则：- 翻译应自然、简洁，符合软件 UI 文案习惯，保持语义准确，
不要过度意译，保留变量占位符，如 {name}、{{count}}、%s、%d 等，不要翻译，
如果包含 HTML 标签，请原样保留，不要添加任何解释说明，只返回 JSON...

// 优化后（约 60 token）
规则：UI文案风格，保留{占位符}和HTML标签，仅返回JSON。
```

仅此一项可减少 **30-40% 的固定输入 Token**。

**层次二：减少输出 Token（只翻译缺失的语言）**

现有逻辑是把所有目标语言都传给 AI。更好的做法是：

```typescript
// 调用 AI 前过滤掉已有翻译的语言
const missingLangs = targetLangs.filter(lang => !dto.translations[lang]?.trim())
if (missingLangs.length === 0) return { translations: dto.translations }
// 只让 AI 翻译 missingLangs
```

如果 10 种目标语言里已有 7 种，就只翻译 3 种，**输出 Token 直接减少 70%**。

**层次三：减少调用次数（翻译缓存）**

同一段文本（如 "保存"、"取消"、"确认"）在不同 key 下大概率翻译结果相同。可以用源文本做缓存 key：

```
cache_key = hash(sourceText + sourceLang + targetLangs.sort().join(','))
```

命中缓存直接返回，不调用 AI。对于 UI 组件库这类高度重复的场景，**缓存命中率可达 60-80%**。

---

### Q4：有没有做 Token 用量监控和成本告警？

**标准答案（诚实 + 有方案）：**

目前项目里没有做，这是一个我识别到的技术债。完整的监控体系应该包括：

1. **用量记录**：每次 AI 调用后，把 `completion.usage`（`prompt_tokens` + `completion_tokens`）写入数据库
2. **成本计算**：按模型单价换算成金额，关联到用户/项目维度
3. **异常告警**：单日消耗超过阈值时触发通知（邮件/飞书）
4. **可视化**：管理后台展示每个项目的 AI 用量趋势

OpenAI 兼容接口的响应里本身就带 `usage` 字段，实现成本极低：

```typescript
const completion = await this.openai.chat.completions.create({ ... })

// 直接从响应取用量，无需额外计算
const { prompt_tokens, completion_tokens, total_tokens } = completion.usage
```

---

### Q5：翻译质量怎么保证？

**标准答案：**

从三个角度保证：

**1. Prompt 层面**：通过 i18n Key 给 LLM 上下文。比如 key 是 `user.profile.delete_button`，LLM 能推断这是按钮文案，翻译会更简洁，不会翻成长句。

**2. 校验层面**：翻译完成后自动比对占位符，源文本有 `{name}`，翻译结果里必须也有，否则标记为待复查。

**3. 人工介入层面**：AI 翻译作为初稿，编辑角色可以手动修改，修改后的内容优先级高于 AI 结果，且不会被下次 AI 翻译覆盖。

---

## 方案 B：技术原理深度

### B1：Token 是什么？为什么中英文消耗不同？

Token 是 LLM 处理文本的最小单位，不等于字符，也不等于单词。

**Tokenization 原理（BPE 算法）**：

训练阶段，模型统计语料中的高频字符组合，把它们合并为单个 token。英文单词高频出现，整词往往是一个 token；中文字符的两两组合频率相对低，单字更常独立成 token。

```
英文示例（GPT tokenizer）：
"translation" → ["translation"]  = 1 token
"internationalization" → ["intern", "ation", "alization"] = 3 tokens

中文示例：
"保存" → ["保", "存"]     = 2 tokens（约 1字/token）
"翻译" → ["翻译"]         = 1 token（高频词合并）
"国际化" → ["国际", "化"] = 2 tokens
```

**实际换算经验值**：

| 语言 | 每 token 约等于 |
|------|----------------|
| 英文 | 4 个字符 / 0.75 个单词 |
| 中文 | 1~1.5 个汉字 |
| 日文 | 1~2 个字符 |
| 代码 | 3~4 个字符 |

**对项目的影响**：我们的 Prompt 以中文为主，中文 token 密度高，所以 200 个汉字大约消耗 150-200 token，而同等内容用英文写 Prompt 约消耗 100 token。

---

### B2：输入 Token vs 输出 Token，定价为什么不同？

**价格差异**：输出 token 通常比输入贵 2-5 倍。

**原因**：推理机制不同。

```
输入（Prefill 阶段）：
  所有 token 并行处理 → GPU 利用率高 → 成本低

输出（Decode 阶段）：
  逐个 token 生成（自回归）→ 每步只产出 1 个 token → GPU 利用率低 → 成本高
```

**对优化策略的影响**：减少输出 token 比减少输入 token 的性价比更高。要求 AI 直接返回 JSON（而不是"好的，以下是翻译结果：..."）能显著减少无效输出。我们的 Prompt 里 `response_format: { type: 'json_object' }` 就是这个作用。

---

### B3：上下文窗口（Context Window）

LLM 每次处理的最大 token 数，即"一次能看多少内容"。

```
Context Window = 输入 token + 输出 token ≤ 最大限制

Qwen-Plus:   128K tokens（约 10 万汉字）
GPT-4o:      128K tokens
Claude 3.5:  200K tokens
```

**对翻译项目的意义**：

- 单条翻译远不会触碰上下文限制（我们每次才 200-500 token）
- 但如果做**批量翻译**（一次请求翻译 100 个 key），就要注意：
  ```
  100 个 key × 平均 300 token = 30,000 token input
  100 个 key 翻译结果 × 5 语言 × 平均 10 token = 5,000 token output
  总计 35,000 token → 在 128K 限制内，可以批量处理
  ```
- 批量翻译可以大幅减少 API 调用次数（100次 → 1次），固定 Prompt 只发送一次

---

### B4：Temperature、Top-p 与翻译场景

这两个参数控制 LLM 输出的"随机性"。

```
Temperature = 0   → 完全确定性，每次输出相同
Temperature = 1   → 默认创意程度
Temperature = 2   → 极高随机性，经常胡说

Top-p = 0.1       → 只从概率最高的 10% token 里选
Top-p = 1.0       → 从所有 token 里选
```

**翻译场景的最佳实践**：

```
temperature: 0.1 ~ 0.3  （要稳定、可复现，不要每次翻译结果不同）
top_p: 0.9              （保留少量多样性，避免翻译太死板）
```

我们项目目前没有显式设置这两个参数，使用的是模型默认值。如果发现翻译结果不稳定（同一段文本多次翻译结果不同），应该显式设置 `temperature: 0.2`。

---

### B5：Structured Output / JSON Mode

LLM 默认输出自然语言，不保证格式。`response_format: { type: 'json_object' }` 强制模型输出合法 JSON。

**我们项目里的实现**：

```typescript
// translate.service.ts:96
const completion = await this.openai.chat.completions.create({
  model: 'qwen-plus',
  messages: [{ role: 'user', content: prompt }],
  response_format: { type: 'json_object' },  // ← 强制 JSON 输出
})
```

**为什么重要**：没有这个参数时，LLM 可能输出：

```
// 没有 json_object 约束时的风险
"好的，以下是翻译结果：\n\n```json\n{\"en\": \"Save\"}\n```"

// 有 json_object 约束时
{"en": "Save", "ja": "保存"}
```

**更强的方案：JSON Schema 约束**（OpenAI 新特性，Qwen 支持程度不同）：

```typescript
response_format: {
  type: 'json_schema',
  json_schema: {
    name: 'translations',
    schema: {
      type: 'object',
      properties: {
        en: { type: 'string' },
        ja: { type: 'string' },
      },
      required: ['en', 'ja'],
      additionalProperties: false,
    },
  },
}
```

这能确保 LLM 不会多输出或少输出字段，解析更稳定。

---

### B6：Streaming 流式输出

普通调用：等 LLM 生成完整响应后一次性返回（用户等待）。
流式调用：LLM 每生成一个 token 就推送给客户端（用户看到实时输出）。

```typescript
// 流式调用示例
const stream = await openai.chat.completions.create({
  model: 'qwen-plus',
  messages: [...],
  stream: true,  // ← 开启流式
})

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content
  if (delta) process.stdout.write(delta)  // 实时推送到前端
}
```

**翻译场景的取舍**：

| | 普通调用 | 流式调用 |
|---|---|---|
| 用户体验 | 等待后一次性显示 | 实时看到翻译结果 |
| 实现复杂度 | 简单 | 需要 SSE 或 WebSocket |
| JSON 解析 | 直接 JSON.parse | 需要累积 chunks 再解析 |
| 适合场景 | 短文本翻译（< 1秒） | 长文本、段落级翻译 |

我们项目做的是 UI 文案翻译（通常很短），不需要流式。但如果未来支持**文档批量翻译**，流式能明显提升体验。

---

## 方案 C：项目实战分析

### C1：你们现有 Prompt 的优缺点

**现有 Prompt（translate.prompt.ts:14）**：

```typescript
return `你是一位专业的国际化翻译专家。请将以下${sourceLang}文本翻译为目标语言。
原文（${sourceLang}）："${sourceText}"，上下文 Key：「${contextKey}」，目标语言：${targetList}，
翻译规则：- 翻译应自然、简洁，符合软件 UI 文案习惯，保持语义准确，不要过度意译，
保留变量占位符，如 {name}、{{count}}、%s、%d 等，不要翻译，如果包含 HTML 标签，
请原样保留，不要添加任何解释说明，只返回 JSON，请返回一个 JSON 对象，
以语言代码为 key，翻译后的文本为 value。示例：{"en": "Hello", "ja": "こんにちは"}`
```

**优点**：
- 包含角色设定（翻译专家）
- 提供 contextKey 作为上下文，帮助 LLM 理解文案用途
- 明确要求保留占位符（避免 LLM 翻译 `{name}` 成 "名字"）
- 强制 JSON 输出格式

**问题点**：

| 问题 | 说明 | 影响 |
|------|------|------|
| 规则连成一串 | 没有换行/编号，LLM 容易漏掉某条规则 | 偶发性违规 |
| 无 Few-shot 示例 | 示例只是 hello/こんにちは，没有体现 UI 文案风格 | 翻译可能过于书面化 |
| sourceLang 出现两次 | 重复信息浪费 token | 多约 3-5 token |
| 无 system message | 所有内容塞在 user message | 角色设定不够稳定 |

**优化后的 Prompt 结构**：

```typescript
// system message（固定，可复用）
{
  role: 'system',
  content: `你是专业的软件 UI 国际化翻译专家。
规则：
1. UI文案风格（简洁、非书面翻译腔）
2. 保留占位符 {name} {{count}} %s %d，不翻译
3. 保留HTML标签原样
4. 仅输出JSON，格式：{"en":"...","ja":"..."}`
}

// user message（每次变化）
{
  role: 'user',
  content: `源文本（${sourceLang}）："${sourceText}"
Key：${contextKey}
目标：${missingLangs.join(', ')}`
}
```

**Token 对比**：
- 原版 Prompt：约 220 token（全在 user message）
- 优化版：system 约 80 token + user 约 60 token = 140 token
- **节省约 36%** 的 token，且规则结构更清晰

---

### C2：翻译缓存设计（Translation Memory）

**当前问题**：
项目里 "保存"、"取消"、"确认" 这类高频词会被反复翻译，每次都调用 API，完全浪费。

**设计方案**：

```typescript
// 缓存 key 设计
function getCacheKey(sourceText: string, sourceLang: string, targetLangs: string[]): string {
  const normalizedText = sourceText.trim().toLowerCase()
  const sortedLangs = [...targetLangs].sort().join(',')
  return `tm:${sourceLang}:${sortedLangs}:${hash(normalizedText)}`
}

// 调用流程
async translate(dto: TranslateDto) {
  const cacheKey = getCacheKey(sourceText, sourceLang, targetLangs)

  // 1. 先查缓存
  const cached = await this.redis.get(cacheKey)
  if (cached) return { translations: JSON.parse(cached), fromCache: true }

  // 2. 未命中，调用 AI
  const result = await this.callAI(prompt)

  // 3. 写入缓存（TTL 7天，UI文案变化慢）
  await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 604800)

  return { translations: result, fromCache: false }
}
```

**预期效果**：
- 项目初始阶段（大量新 key）：缓存命中率约 10-20%
- 项目稳定后（增量新增）：缓存命中率约 70-80%
- **相当于 70-80% 的 AI 调用费用直接省掉**

---

### C3：Token 用量记录（你们现在没做的）

**实现只需 5 行代码**：

```typescript
// translate.service.ts 中，API 调用后
const completion = await this.openai.chat.completions.create({ ... })

// completion.usage 里已经有准确数字
const { prompt_tokens, completion_tokens, total_tokens } = completion.usage

// 写日志（异步，不影响响应速度）
this.prisma.aiUsageLog.create({
  data: {
    projectId: dto.projectId,
    model: 'qwen-plus',
    promptTokens: prompt_tokens,
    completionTokens: completion_tokens,
    totalTokens: total_tokens,
    cost: calculateCost('qwen-plus', prompt_tokens, completion_tokens),
    createdAt: new Date(),
  }
}).catch(err => this.logger.error('记录AI用量失败', err))  // 异步不阻塞
```

**数据库表设计**：

```sql
CREATE TABLE ai_usage_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES project(id),
  user_id     UUID REFERENCES user(id),
  model       VARCHAR(50),       -- 'qwen-plus'
  prompt_tokens    INT,
  completion_tokens INT,
  total_tokens     INT,
  cost_cny    DECIMAL(10, 6),    -- 人民币成本
  created_at  TIMESTAMP DEFAULT NOW()
);
```

**面试时能说出的数字**（拿到日志后）：
- "我们的平均每次翻译消耗 X token"
- "高峰期每天 AI 费用约 ¥X"
- "缓存上线后，费用下降了 X%"

---

### C4：批量翻译优化（当前架构的限制）

**现状**：每个 key 单独调用一次 AI，100 个 key = 100 次 API 调用

**优化方案：批量翻译**

```typescript
// 一次调用翻译多个 key
const batchPrompt = `
请翻译以下 ${items.length} 条 UI 文本，每条都翻译为：${targetList}。

${items.map((item, i) => `[${i}] Key: ${item.key}\n源文本: "${item.text}"`).join('\n\n')}

返回 JSON 数组：
[
  {"key": "user.save", "en": "Save", "ja": "保存"},
  ...
]`
```

**对比**：

| 方案 | API 调用次数 | 固定 token 开销 | 总 token |
|------|------------|---------------|---------|
| 逐条翻译（100条） | 100次 | 200 × 100 = 20,000 | ~50,000 |
| 批量翻译（1次） | 1次 | 200 × 1 = 200 | ~15,000 |
| **节省** | **99次** | **减少 99% 固定开销** | **节省约 70%** |

**批量的风险**：
- 某一条翻译失败时整批都要重试
- 输出 token 过多可能触碰模型输出限制
- **解决方案**：每批 20-30 条，超出分批处理

---

## 方案 D：AI 应用开发知识图谱

### D1：RAG（检索增强生成）

**是什么**：LLM 回答问题时，先从知识库检索相关内容，再结合这些内容生成回答。

```
用户问题 → Embedding → 向量检索 → 取出 TopK 相关文档
                                          ↓
                              构建 Prompt（问题 + 相关文档）
                                          ↓
                                     LLM 生成答案
```

**在 i18n 翻译项目的应用**：

```
场景：保证品牌词、专有名词翻译一致

术语库：{"Workspace": "工作区", "Project": "项目", "Key": "词条"}

翻译前：从术语库检索源文本中的专有名词
在 Prompt 中注入：
"注意：以下专有名词请使用指定译法：Workspace→工作区, Project→项目"

效果：LLM 不会把 "Workspace" 随机翻译成"空间"/"工作空间"/"协作区"
```

---

### D2：Embedding 与语义搜索

**Embedding**：把文本转换为高维向量，语义相似的文本，向量距离更近。

```typescript
// 生成 Embedding
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: '保存文件',
})
const vector = response.data[0].embedding  // 1536 维向量

// 存入向量数据库（pgvector / Qdrant）
// 查询时：找与"存储"语义最相近的已有翻译
```

**在 i18n 的价值**：
- "保存" 和 "存储" 语义相似 → 已有翻译可复用
- 避免同一语义的词条被翻译成不同结果
- 新词条入库前先语义搜索，命中则直接用，未命中才调用 AI

---

### D3：Fine-tuning vs Prompt Engineering

| | Prompt Engineering | Fine-tuning |
|---|---|---|
| 本质 | 用示例和指令引导通用模型 | 用数据训练专用模型 |
| 成本 | 低（调 API 即可） | 高（训练费 + 高质量数据） |
| 效果上限 | 受通用模型限制 | 可以超越通用模型 |
| 维护 | 改 Prompt 即可 | 数据变化需重新训练 |
| 适合场景 | 早期、数据少、快速迭代 | 大量高质量数据、高精度要求 |

**翻译项目的建议**：先做 Prompt Engineering，积累 1000+ 条高质量翻译数据后，可以考虑 Fine-tuning 专属翻译模型，提升特定术语和风格的一致性。

---

### D4：模型路由（Model Routing）

不同任务用不同模型，在成本和质量之间取最优解。

```
翻译请求
    ├── 文本长度 < 10字  AND  常见词   → 查缓存，命中直接返回
    ├── 文本长度 < 50字  AND  亚洲语言 → Qwen-Plus（便宜且中日韩质量好）
    ├── 文本长度 < 50字  AND  欧洲语言 → GPT-4o-mini（欧洲语言表达更地道）
    └── 文本长度 > 50字  AND  高优先级 → GPT-4o（质量优先）
```

**实现方式**：

```typescript
function selectModel(text: string, targetLangs: string[]): string {
  const hasAsianLang = targetLangs.some(l => ['ja', 'ko', 'zh-tw'].includes(l))
  const hasEuropeanLang = targetLangs.some(l => ['fr', 'de', 'es', 'it'].includes(l))

  if (text.length > 100) return 'gpt-4o'
  if (hasAsianLang && !hasEuropeanLang) return 'qwen-plus'
  return 'gpt-4o-mini'  // 默认欧洲语言
}
```

---

### D5：AI 可观测性（Observability）

生产环境 AI 应用必须有监控，否则出了问题完全黑盒。

**需要监控的指标**：

```
延迟指标：
  - P50/P95/P99 响应时间（翻译 API 通常 1-3秒）
  - 超时率

成本指标：
  - 每日/每月 token 消耗
  - 每个项目/用户的费用分摊
  - 缓存命中率（反映成本优化效果）

质量指标：
  - 占位符保留率（翻译后 {name} 是否还在）
  - 用户手动修改率（修改越多说明 AI 质量越差）
  - 错误率（JSON 解析失败、API 超时）
```

**常用工具**：

| 工具 | 定位 |
|------|------|
| LangSmith | LLM 专用追踪，看每次调用的输入输出 |
| Helicone | AI 网关，自动记录所有 LLM 调用 |
| OpenTelemetry | 通用可观测性，集成到现有 APM |
| 自建日志表 | 最轻量，适合初期（就是 C3 讲的方案） |

---

### D6：Rate Limiting 与错误处理

**LLM API 常见错误类型**：

```
429 Too Many Requests  → 触发限流，需要退避重试
500/503 Server Error   → 模型服务异常，重试 + 降级
408 Timeout            → 请求超时，重试
400 Bad Request        → Prompt 问题（token 超限等），不重试
```

**生产级错误处理**：

```typescript
async callWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await this.openai.chat.completions.create({ ... })
      return result.choices[0].message.content
    } catch (err) {
      if (err.status === 429) {
        // 指数退避：1s, 2s, 4s
        await sleep(Math.pow(2, attempt - 1) * 1000)
        continue
      }
      if (err.status === 400) throw err  // 客户端错误不重试
      if (attempt === maxRetries) throw err
    }
  }
}
```

**降级策略**：AI 翻译失败时，不应该让用户看到错误，而是返回空字符串让用户手填，并记录失败日志。

---

### D7：AI 应用架构演进路径

从简单到复杂，i18n 翻译系统的 AI 能力演进：

```
阶段 1（现状）：单点 AI 翻译
  └── 用户点击 → API → Qwen → 返回结果

阶段 2（近期可做）：
  └── + 缓存层（Translation Memory）
  └── + Token 用量监控
  └── + 只翻译缺失语言（减少输出）
  └── + 占位符校验

阶段 3（中期）：
  └── + 批量翻译（一次请求处理多个 key）
  └── + 术语库（RAG 注入专有名词）
  └── + 模型路由（按语言/长度选模型）
  └── + Streaming 前端实时展示

阶段 4（长期）：
  └── + Embedding 语义去重
  └── + 自动检测未翻译 key 并触发任务
  └── + Fine-tuning 专属翻译模型
  └── + AI Agent 自动完成整批翻译工作流
```

**面试时的表达方式**：
> "目前我们实现了阶段 1，识别到的技术债是缓存和监控，这是阶段 2 要做的。我了解到阶段 3 的术语库可以用 RAG 实现，能解决我们现在品牌词翻译不一致的问题。"

---

## 一页纸总结

```
核心公式：
  成本 = 调用次数 × (输入token × 输入单价 + 输出token × 输出单价)

降成本三板斧：
  1. 减少调用次数 → 缓存（Translation Memory）
  2. 减少输入 token → 压缩 Prompt、只传缺失语言
  3. 减少输出 token → JSON Mode、批量请求

你项目的真实数字：
  单次翻译：约 250-450 token
  单次成本：约 ¥0.0004（Qwen-Plus）
  1万次翻译：约 ¥4.00

面试时提升说服力的话：
  ❌ "我们用了 AI 翻译"
  ✅ "我们用 Qwen-Plus 做 AI 一键翻译，我算过每次约 300 token、不到 ¥0.001，
      识别到的优化点是加翻译缓存，高频词（保存/取消/确认）复用后能省 60-70% 的 AI 调用费用"
```
