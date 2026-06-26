# 第七章 | 产品大脑：数据库与上下文记忆系统

一个只会在当前会话中工作的 AI 产品，关掉页面再打开就什么都忘了。有价值的产品会记住你是谁、你做过什么、你喜欢什么。数据库和上下文系统的作用就是让产品每次交互都比上一次更懂用户。

从最实际的问题出发：你的 AI 产品需要"记住"什么？然后用 Supabase + PostgreSQL 搭建一套轻量但完整的持久化系统。

#### 7.1 为什么产品需要"记忆"

##### 7.1.1 没有数据库的产品

想象一下：你做了一个AI写作助手，用户输入了一段文字，AI生成了回复。用户刷新页面，刚才的内容全没了。这样的产品能用多久？

数据库解决的核心问题就三个：

- 用户数据：你是谁、你的偏好、你的设置
- 产品状态：草稿存到哪了、完成了哪些任务
- 历史记录：过去做过什么、AI过去给过什么建议

这三样东西加在一起，就是产品的"记忆"。有了记忆，产品才能迭代、进化、越来越好用。

##### 7.1.2 产品大脑 = 数据库 + 上下文

产品大脑不是某个单一的技术组件，而是一个概念：

| 组件 | 作用 | 类比 |
|------|------|------|
| 数据库 | 长期记忆，永久存储 | 人的海马体 |
| 上下文工程 | 短期记忆，当前会话 | 人的工作记忆 |
| AI模型 | 推理和决策 | 人的前额叶皮层 |

数据库负责"记住"，上下文负责"理解当前在说什么"，AI负责"想清楚该怎么做"。三者缺一不可。

##### 7.1.3 轻量级方案的选择逻辑

很多开发者一提到数据库就想到 MySQL、PostgreSQL 自托管。对于个人项目和小型产品来说，这是过度设计。你需要的是：

- 零运维：不用管服务器、备份、扩容
- 低成本：个人项目基本免费
- 快速上手：API 直接调用，不需要写复杂的连接配置
- 功能够用：关系型数据库 + 认证 + 实时 + 存储，一站式解决

Supabase 恰好满足以上所有条件。它本质上是一个开源的 Firebase 替代方案，底层用 PostgreSQL，上层封装好了 API、认证、实时推送和文件存储。对 AI 产品开发者来说，最大的好处是：你可以用一行代码完成数据库操作，AI 也能理解并帮你生成 SQL。

#### 7.2 Token优化与Prompt缓存

##### 7.2.1 Token是什么

Token 是大语言模型处理文本的基本单位。中文里，一个汉字大约等于 0.2-0.4 个 Token；英文里，一个单词大约等于 0.7-0.8 个 Token。Token 就是 AI 读文章的"字数计量单位"。

| 文本类型 | 近似换算 |
|----------|----------|
| 1个中文字 | 0.2-0.4 Token |
| 1个英文单词 | 0.7-0.8 Token |
| 1段代码（JSON格式） | 约 1.5 Token/字符 |
| 1000 Token | 约 750 中文字或 600 英文单词 |

##### 7.2.2 Token成本

几乎所有主流 AI 模型都按 Token 计费。以 GPT-4o 为例：

- 输入：每 1M Token $2.50
- 输出：每 1M Token $10.00

如果你的产品每天处理 1000 个用户请求，每个请求平均发送 3000 Token、接收 500 Token，一个月下来仅 API 费用就超过 $200。如果用户量涨到 1 万，就是 $2000。

Token 成本是 AI 产品最大的可变成本之一。优化 Token 使用，就是在优化商业模式。

##### 7.2.3 Token优化策略

###### 策略一：精简 Prompt

不要把你的产品说明、功能列表、用户协议全部塞进 System Prompt。只放 AI 做决策必需的指令。

- 删除冗余描述：「你是一个专业的、经验丰富的、资深的」→ 「专业」就够了
- 用结构化格式代替长段落：用 YAML 或 JSON 定义规则，比自然语言节省 40% Token
- 分层 Prompt：基础指令放在 System Prompt（固定成本），动态信息放在用户消息（每次都要付钱）

###### 策略二：减少上下文长度

上下文窗口是有限且昂贵的。每次对话，历史消息都会占用 Token。

- 只保留最近的 N 条对话：超过一定数量的历史消息可以摘要后存入数据库
- 摘要旧对话：用 AI 把长篇对话压缩成 3-5 句摘要，存入数据库，需要时再加载
- 按需加载：只有用户明确要求查看历史记录时，才从数据库读取并注入上下文

###### 策略三：选择性加载

不是每次请求都需要完整上下文。根据场景决定加载多少：

| 场景 | 加载策略 | Token 节省 |
|------|----------|-----------|
| 日常对话 | 最近 5 轮 + 用户画像摘要 | 70% |
| 深度分析 | 完整对话历史 | 0% |
| 新用户首次 | 系统提示 + 引导模板 | 90% |
| 老用户回访 | 系统提示 + 用户偏好 + 最近 3 轮 | 80% |

##### 7.2.4 Prompt缓存

OpenAI、Anthropic 等主流 API 提供商都支持 Prompt 缓存。原理很简单：如果你发送给模型的 System Prompt 和上次几乎一样，服务商不会重新处理这部分 Token，而是直接复用缓存结果。

缓存生效的关键条件：

- System Prompt 的前缀完全一致（包括空格和换行）
- 使用支持缓存的模型版本（如 GPT-4o 的缓存感知版本）
- 缓存块大小至少 1024 Token 才有意义

实战建议：

1. 把不变的部分（角色定义、规则、格式要求）放在 System Prompt 的最前面
2. 把变化的部分（用户输入、动态数据）放在后面
3. 这样无论用户问什么，前面的缓存都能命中

缓存可以让固定 System Prompt 的成本降低到接近零。对于一个有大量重复指令的产品，这是最划算的优化。

##### 7.2.5 Token消耗计算

做一个简单的 Token 预算表：

| 指标 | 数值 |
|------|------|
| 日活跃用户数 | 100 |
| 每人日均请求次数 | 5 |
| 每次输入 Token | 2000 |
| 每次输出 Token | 800 |
| 月请求总量 | 100 x 5 x 30 = 15,000 |
| 月输入 Token | 15,000 x 2000 = 30M |
| 月输出 Token | 15,000 x 800 = 12M |
| 月 API 费用（GPT-4o） | 30M x $2.50/1M + 12M x $10/1M = $79.50 |

优化前后对比：

| 优化项 | 优化前 | 优化后 | 节省 |
|--------|--------|--------|------|
| 精简 Prompt | 2000 Token | 800 Token | 60% |
| 摘要旧对话 | 完整历史 | 摘要+近5轮 | 85% |
| 利用缓存 | 无 | System Prompt 命中 | 固定部分 ~0 |
| 合计月费用 | $79.50 | $22.00 | 72% |

72% 的 Token 节省意味着同样的预算可以服务三倍的用户量，或者把利润从 28% 提升到 65%。

#### 7.3 Supabase入门

##### 7.3.1 什么是Supabase

Supabase 是一个开源的后端即服务（BaaS）平台。核心定位：PostgreSQL 数据库，外加所有配套服务。

Supabase 提供的核心能力：

- 实时 PostgreSQL 数据库
- 自动生成 RESTful API（基于数据库 Schema）
- 用户认证系统（Auth）
- 实时订阅（Realtime）
- 文件存储（Storage）
- Edge Functions（服务端函数）
- AI 向量存储（pgvector）

##### 7.3.2 为什么推荐Supabase

| 对比维度 | Firebase | Supabase | 说明 |
|----------|----------|----------|------|
| 数据库 | NoSQL（Firestore） | PostgreSQL | SQL 更适合复杂关系 |
| 查询能力 | 有限 | 完整 SQL | 支持 JOIN、子查询、聚合 |
| 开源 | 否 | 是 | 可自行托管 |
| AI 集成 | 一般 | pgvector 原生支持 | 向量搜索直接可用 |
| 学习曲线 | 中等 | 低（SQL 通用） | AI 能帮你写 SQL |
| 免费额度 | 合理 | 更慷慨 | 个人项目完全够用 |

对 AI 产品开发者来说，Supabase 的最大优势是 AI 能帮你写 SQL。

用 Claude 或 GPT 做产品时，直接说「帮我创建一个用户表，包含名字、邮箱、注册时间」，它会生成正确的 PostgreSQL 语句。这个能力在 Supabase 上直接生效，不需要额外学习 ORM 或查询构建器。

##### 7.3.3 免费额度

Supabase 免费计划（Free Tier）提供：

- 500MB 数据库空间
- 每月 1GB 数据传输
- 50,000 条 MAU 认证
- 无限 Realtime 连接
- 5GB 文件存储

个人 AI 产品，这些额度足够用到开始赚钱的那一天。日活 5000 人，免费计划也撑得住。

##### 7.3.4 项目创建和初始化

第一步：注册 Supabase 账号

访问 https://supabase.com，用 GitHub 账号一键注册。

第二步：创建项目

1. 点击「New Project」
2. 选择免费计划
3. 填写项目名称、区域（选离用户最近的）、设置数据库密码
4. 等待 2-5 分钟

第三步：获取项目信息

进入项目 Dashboard，Settings → API，记录两个值：

- `Project URL`：类似 `https://xxxxxxxxxxxx.supabase.co`
- `anon public key`：类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

这两个值在后续代码中作为环境变量使用。

第四步：安装 Supabase JS 客户端

在前端项目中安装：

```bash
npm install @supabase/supabase-js
```

第五步：初始化客户端

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

应用现在可以连接到一个完整的云端数据库了。

##### 7.3.5 Supabase CLI

Supabase 提供了命令行工具，本地开发和线上一致。

安装：

```bash
npm install -g supabase
```

常用命令：

| 命令 | 作用 |
|------|------|
| `supabase login` | 登录 Supabase 账号 |
| `supabase init` | 初始化本地项目 |
| `supabase start` | 启动本地 Supabase 服务 |
| `supabase db push` | 将本地 Schema 推送到远程 |
| `supabase db reset` | 重置本地数据库 |
| `supabase gen types typescript --project-id xxx` | 生成 TypeScript 类型定义 |
| `supabase link --project-ref xxx` | 关联远程项目 |

本地开发流程：

1. `supabase init && supabase start` — 启动本地环境
2. 在 Studio（浏览器访问 http://localhost:54323）中设计表结构
3. `supabase gen types typescript --linked > src/types/supabase.ts` — 生成类型
4. `supabase db push` — 同步到线上
5. 代码中引用生成的类型，获得完整的 IDE 提示

CLI 让数据库版本的变更管理变得可追踪、可回滚，是团队协作的必要工具。

#### 7.4 PostgreSQL数据库基础

##### 7.4.1 SQL基本概念

PostgreSQL 是最先进的开源关系型数据库。理解它不需要成为数据库专家，掌握三个核心概念就够了：

- **表（Table）**：类似 Excel 的工作表，每一行是一条记录，每一列是一个字段
- **关系（Relationship）**：表与表之间的关联，通过外键连接
- **查询（Query）**：用 SQL 语言从表中读取、插入、更新或删除数据

##### 7.4.2 Schema设计

设计数据库的第一步是列出你的产品需要存储哪些数据。以一个 AI 笔记产品为例：

```
用户表 (users)
├── id (UUID, 主键)
├── email (text)
├── display_name (text)
├── avatar_url (text)
├── created_at (timestamp)

笔记表 (notes)
├── id (UUID, 主键)
├── user_id (UUID, 外键 → users.id)
├── title (text)
├── content (text)
├── ai_summary (text)
├── tags (text[])
├── created_at (timestamp)
└── updated_at (timestamp)
```

设计原则：

- 每个表有唯一的 ID（推荐 UUID）
- 时间戳用 `created_at` 和 `updated_at` 分开记录
- 一对多关系用外键表达
- 避免数据冗余

##### 7.4.3 数据类型选择

PostgreSQL 提供了丰富的数据类型。以下是 AI 产品中最常用的几种：

| 数据类型 | 用途 | 示例 |
|----------|------|------|
| `uuid` | 唯一标识符 | 用户 ID、笔记 ID |
| `text` | 任意长度的文本 | 用户名、笔记内容 |
| `integer` / `bigint` | 整数 | 点赞数、计数 |
| `boolean` | 真/假 | 是否已读、是否公开 |
| `timestamp with time zone` | 带时区的时间戳 | 创建时间、更新时间 |
| `jsonb` | 结构化 JSON 数据 | 用户偏好设置、AI 输出元数据 |
| `text[]` | 文本数组 | 标签列表 |
| `vector` | 向量（需安装 pgvector） | AI 嵌入向量 |

选型建议：

- 存纯文本用 `text`，不要用 `varchar(255)` 限制长度
- 存配置/偏好用 `jsonb`，灵活且可查询
- 时间一律用带时区的 `timestamp`，避免跨时区问题

##### 7.4.4 索引和性能

索引是数据库加速查询的利器，但滥用也会拖慢写入速度。

基本规则：

- 被频繁查询的列加索引（WHERE、JOIN、ORDER BY 中的列）
- 主键和外键默认就有索引
- 不要给所有列都加索引——写操作会变慢
- 复合索引要按查询频率排序（最常过滤的列放前面）

Supabase 控制台可以直接在表的 Indexes 标签页添加索引，无需写 SQL。

##### 7.4.5 AI生成SQL

Supabase 对 AI 产品开发者最大的红利：你不需要自己写 SQL，告诉 AI 你想要什么，它来生成。

示例对话：

> 用户：「帮我写一个 SQL，查询每个用户的笔记数量，按数量降序排列」

> AI 生成的 SQL：

```sql
SELECT u.id, u.display_name, COUNT(n.id) as note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.display_name
ORDER BY note_count DESC;
```

> 用户：「再帮我查一下上周创建的新用户」

> AI 生成的 SQL：

```sql
SELECT id, display_name, email, created_at
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

描述意图，AI 生成正确、可执行的 SQL。在 Supabase 的 SQL Editor 中粘贴运行即可。

#### 7.5 用户系统与认证

##### 7.5.1 为什么需要用户系统

没有用户系统的产品有几个问题：

- 无法区分不同用户的数据
- 无法做个性化体验
- 无法追踪用户行为
- 商业化时无法绑定付费账号

用户系统是产品从「玩具」变成「服务」的分水岭。

##### 7.5.2 Supabase Auth 配置

Supabase Auth 开箱即用，支持多种登录方式：

1. 在 Supabase Dashboard 进入 Authentication → Providers
2. 启用需要的登录方式
3. 前端调用 Auth API 即可完成登录

##### 7.5.3 邮箱/密码登录

最基础的登录方式，实现代码简单：

```javascript
// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
})

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()
```

##### 7.5.4 OAuth 登录

第三方登录大幅提升转化率。用户只需点击一次就能完成注册，不需要记新密码。

Supabase 配置步骤：

1. 在 Google Cloud Console 或 GitHub Developer Settings 创建 OAuth 应用
2. 获取 Client ID 和 Client Secret
3. 回到 Supabase Dashboard → Providers，填入凭证
4. 前端调用：

```javascript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // 或 'github'
})
```

用户会被重定向到 Google/GitHub 授权页面，授权后自动跳回你的应用。

##### 7.5.5 用户数据隐私和安全

用户数据不是小事，以下几点必须做到：

- 密码不要存到数据库里（Supabase Auth 自动做了哈希加密）
- 敏感信息不要在日志中打印
- 遵守 GDPR/个人信息保护法：提供数据导出和数据删除功能
- 用户注册后会自动创建 auth.users 记录，业务表通过 user_id 关联

##### 7.5.6 RLS（行级安全）

RLS 是 PostgreSQL 的核心安全特性，Supabase 让它变得极其易用。

传统做法：在应用代码里判断「这个用户能不能看这条数据」。代码有漏洞，数据就泄露了。

RLS 的做法：直接在数据库层面规定「只有自己的数据才能被自己访问」。代码出错，数据库也会拒绝非法请求。

配置 RLS 的步骤：

1. 进入 Supabase Dashboard → SQL Editor
2. 执行以下 SQL：

```sql
-- 开启 notes 表的 RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 规则：用户只能读写自己的笔记
CREATE POLICY "Users can view own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
ON notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);
```

RLS 的核心函数 `auth.uid()` 返回当前登录用户的 ID。Supabase 会自动把它和当前认证上下文关联起来，不需要每次查询手动传用户 ID。

RLS 配置完成后，数据库就是安全的。即使有人直接连接数据库，也无法越权访问其他用户的数据。

#### 7.6 数据存储与读写

##### 7.6.1 CRUD 操作的 Supabase 实现

Supabase JS 客户端让数据库操作简洁。四个基本操作：

**创建（Create）**

```javascript
const { data, error } = await supabase
  .from('notes')
  .insert({
    user_id: userId,
    title: '我的第一篇笔记',
    content: '这是一篇关于 AI 的思考',
    tags: ['AI', '思考']
  })
  .select()
```

**读取（Read）**

```javascript
const { data, error } = await supabase
  .from('notes')
  .select('id, title, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)
```

**更新（Update）**

```javascript
const { data, error } = await supabase
  .from('notes')
  .update({ title: '更新后的标题', updated_at: new Date() })
  .eq('id', noteId)
  .eq('user_id', userId)
  .select()
```

**删除（Delete）**

```javascript
const { error } = await supabase
  .from('notes')
  .delete()
  .eq('id', noteId)
  .eq('user_id', userId)
```

每个操作都加上 `eq('user_id', userId)` 作为双重保险。RLS 已经保证了安全性，应用层多做一层校验是好习惯。

##### 7.6.2 实时订阅

Supabase 的 Realtime 功能让你无需轮询就能知道数据变化。

```javascript
const channel = supabase
  .channel('notes-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notes' },
    (payload) => {
      console.log('新笔记创建:', payload.new)
    }
  )
  .subscribe()
```

应用场景：

- 多人协作编辑时，实时看到其他人的修改
- 聊天功能的消息推送
- 通知系统的新消息提醒

##### 7.6.3 文件存储

Supabase Storage 提供了类似 AWS S3 的对象存储服务，API 更简单。

```javascript
// 上传图片
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/profile.jpg`, file, { upsert: true })

// 获取公开 URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/profile.jpg`)

// 下载文件
const { data, error } = await supabase.storage
  .from('documents')
  .download(`${userId}/report.pdf`)
```

存储桶（Bucket）是文件的容器，类似于文件夹。Dashboard 中可以创建不同的桶来组织不同类型的文件。

##### 7.6.4 数据备份

Supabase 免费计划自动提供每日备份，保留 7 天。更长期的备份：

- Dashboard 的 Database → Backups 中手动触发备份
- 使用 `supabase db dump` 命令导出本地备份
- 定期导出 CSV 作为额外的数据保险

```bash
supabase db dump --data-only --table notes > notes_backup.sql
```

##### 7.6.5 性能监控

Supabase Dashboard 提供基本的性能数据：

- 数据库查询耗时
- API 响应时间
- 存储空间使用情况
- 月请求量统计

产品增长时，关注以下指标：

| 指标 | 正常范围 | 需要优化 |
|------|----------|----------|
| 单次查询响应 | < 50ms | > 200ms |
| 数据库空间使用 | < 200MB | > 400MB |
| API 月请求量 | < 100万 | > 500万 |
| 并发连接数 | < 20 | > 100 |

#### 7.7 上下文记忆系统设计

##### 7.7.1 产品记忆 vs AI 记忆

这是一个经常被混淆的概念：

- **AI 的记忆**：模型在上下文窗口中看到的对话历史。只在当前会话中存在，关闭就消失。
- **产品的记忆**：存储在数据库中的数据。永久存在，跨会话可用。

优秀的 AI 产品会结合两者：产品记忆作为长期知识，AI 记忆作为短期推理材料。

##### 7.7.2 用户行为历史

记录用户在产品中的行为，是构建个性化体验的基础。

```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,  -- 'view', 'create', 'like', 'share'
  target_type TEXT,             -- 'note', 'chat', 'template'
  target_id UUID,
  metadata JSONB,               -- 附加信息，如阅读时长、点赞原因
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

存储行为数据的价值：

- 分析用户最喜欢哪些功能，指导产品迭代
- 发现用户流失节点，优化体验
- 为个性化推荐提供数据基础

##### 7.7.3 对话记录

AI 产品的核心交互是对话。对话记录不仅要保存，还要结构化保存，方便后续检索和上下文组装。

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL,           -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

对话记录的结构化存储带来几个能力：

- 用户可以随时回溯历史对话
- 可以在对话之间切换，像聊天软件一样
- 可以统计每次对话的 Token 消耗，用于计费或分析
- 可以为每条消息添加元数据（模型版本、温度参数等）

##### 7.7.4 个性化推荐

产品积累了足够的用户数据和对话历史后，就可以开始做个性化推荐了。

推荐的核心逻辑：

1. 从数据库中读取用户的历史行为
2. 提取关键特征（喜欢的主题、常用功能、活跃时段）
3. 将这些特征作为上下文的一部分发送给 AI
4. AI 基于这些信息给出个性化建议

示例：

```javascript
// 读取用户的最近行为和偏好
const { data: activities } = await supabase
  .from('user_activities')
  .select('activity_type, target_type, metadata')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);

// 提取用户画像摘要
const userProfile = activities.reduce((acc, act) => {
  acc[act.activity_type] = (acc[act.activity_type] || 0) + 1;
  return acc;
}, {});

// 构建个性化 Prompt
const personalizedPrompt = `
你是一个AI助手。当前用户画像：${JSON.stringify(userProfile)}。
根据用户的历史行为，给出个性化的建议。
`;
```

这种方式不需要训练专门的推荐模型。把用户的历史数据喂给 AI，让它自己分析并给出建议。对个人产品和中小规模应用来说，这比传统的推荐系统简单得多，效果也不差。

##### 7.7.5 实战：AI 学习助手的记忆系统

假设做一个 AI 学习助手：用户输入学习内容，AI 总结要点、生成测验题。

这个产品的记忆系统需要回答三个问题：

**Q1：记住谁在用？**

- 用户表：ID、昵称、注册时间
- 学习偏好：偏好的学科、难度级别、学习目标
- 实现：`users` 表 + `user_preferences` 表

**Q2：记住用户学过什么？**

- 对话记录：每次学习的主题、AI 的总结、生成的题目
- 学习进度：已完成哪些章节、正确率如何
- 错题本：做错的题目和对应的知识点
- 实现：`conversations` + `messages` + `quiz_results` 表

**Q3：记住用户的成长轨迹？**

- 学习日历：哪天学了什么、学了多久
- 能力雷达图：各学科的掌握程度随时间的变化
- 学习报告：每周/每月的学习总结
- 实现：`learning_logs` + `weekly_summaries` 表

完整的记忆系统架构图：

```
用户层（Auth）
  ├── 登录/注册 ──→ auth.users
  └── 偏好设置 ──→ user_preferences

内容层（Data）
  ├── 对话记录 ──→ conversations + messages
  ├── 学习进度 ──→ quiz_results
  └── 错题本 ────→ quiz_results WHERE correct = false

分析层（Insight）
  ├── 学习日志 ──→ learning_logs
  ├── 周报 ──────→ weekly_summaries
  └── 用户画像 ──→ 从以上数据聚合生成

AI 层（Intelligence）
  ├── 每次对话加载用户画像 ──→ 个性化回答
  ├── 基于错题推荐复习 ──────→ 针对性练习
  └── 根据进度调整难度 ──────→ 自适应学习
```

设计这个记忆系统的核心思路：**数据分层存储，按需加载上下文**。

- 用户每次打开产品，先加载用户画像（轻量，几百字节）
- 进入具体对话时，加载最近 10 条消息（中等，几 KB）
- 查看历史记录时，才加载完整的对话全文（较重，按需）

分层策略既控制了每次 AI 调用的 Token 成本，又保证了用户体验的连贯性。

##### 7.7.6 记忆系统的演进路线

记忆系统不是一次性设计完就完了。它会随着产品发展而演进：

| 阶段 | 记忆深度 | 复杂度 | 适用场景 |
|------|----------|--------|----------|
| V1 | 只存对话记录 | 低 | 验证产品可行性 |
| V2 | 加上用户偏好和行为记录 | 中 | 开始做个性化 |
| V3 | 加入向量搜索和语义记忆 | 高 | 跨会话的智能回忆 |
| V4 | 多模态记忆（文本+图片+音频） | 很高 | 复杂场景的深度交互 |

大多数个人产品的记忆系统在 V2 阶段就已经足够了。不要一开始就追求完美的架构，先用最简单的方案跑通核心流程，然后根据真实用户反馈逐步迭代。

---

本章的核心信息：**让你的产品记住东西，而且记住的方式要聪明。**

数据库不是后端工程师的专属领域。有了 Supabase 和 AI 的帮助，任何人都能在几分钟内搭建起一个功能完整的持久化系统。关键是理解你需要记住什么、怎么存最合理、以及如何在 Token 成本和用户体验之间找到平衡。

下一章，讨论如何让产品持续改进——通过 Skill 体系和规范落地，让 AI 编程从「能跑就行」升级到「专业级交付」。
