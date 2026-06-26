# 第八章 | AI工程化实战：Skill体系与规范落地

前面七章，你已经学会了怎么用AI写代码、做产品、接数据库、搞部署、管版本。但这一切都有一个共同的前提：**你在一个人做，而且每次都是从零开始对话。**

当你开始同时维护多个项目、带团队、或者想让一个产品持续迭代半年以上时，问题就来了：

- 换了个AI工具，之前的经验全得重新教
- 项目越来越大，AI开始"忘记"架构决策
- 新成员加入，没有人能告诉他这个项目是怎么建的
- 同样的功能做了三次，每次生成的代码风格都不一样

**工程化的本质，就是把个人经验变成可复用的资产。**

这一章不讲新工具，不讲新框架。我们讲怎么把前面学过的所有东西——PRD、Spec、Skill、Git、Context——串成一套能持续运转的系统。

## 1. 从"能跑"到"可靠"：工程化三原则

### 1.1 原则一：让AI的输出可预测

AI编程最大的不确定性不是"能不能做出来"，而是"每次做出来的是不是一样的"。

一个可预测的系统，核心特征是：**给定相同的输入和上下文，产出结构一致的输出。**

怎么做？三个层次：

| 层次 | 手段 | 解决的问题 |
|------|------|-----------|
| 输入层 | PRD + Spec | 告诉AI"做什么"，而不是"怎么做" |
| 过程层 | Skill + Harness | 告诉AI"怎么做"，固化最佳实践 |
| 输出层 | 规范 + 验收 | 告诉AI"做到什么程度算合格" |

三层叠加，AI的输出就从"随机生成"变成了"确定性产出"。

**实际例子：**

没有规范时，你告诉AI"帮我加一个用户登录页面"，它可能用HTML、可能用React、可能把样式写在行内、可能把逻辑写在组件里、也可能把API调用混在UI代码中。

有了规范后，你在Skill里写清楚：

> 登录页面必须放在 `/src/pages/auth/login.tsx`，使用 Tailwind CSS 样式，API 调用封装在 `/src/lib/api/auth.ts`，表单验证使用 zod schema。

同样的指令，输出的结构每次都一样。

### 1.2 原则二：经验必须可复用

个人经验如果不被记录下来，就永远是个人的。

什么叫"被记录下来"？不是记在笔记软件里，而是**直接编码到项目里，让AI每次加载项目时自动读到。**

这就是 Skill 文件存在的意义。一个 Skill 文件本质上是一段 markdown，但它有两个关键属性：

1. **项目内可被发现**：放在约定的目录下，AI 工具会自动扫描并加载
2. **可被 AI 理解**：用结构化格式描述规则、模板、示例，AI 能直接执行

对比两种方式：

| 方式 | 优点 | 缺点 |
|------|------|------|
| 口头告诉AI（对话中） | 即时、灵活 | 每次重聊都要重新说、说不清楚、容易遗漏 |
| 写成Skill文件 | 一次写入、永久复用、可版本管理 | 需要花一点时间整理 |

**什么时候值得写 Skill？**

- 同一个指令你说了超过 3 次
- 这个指令涉及超过 5 个要点
- 新成员（包括未来的你自己）需要理解项目的开发规范
- 这个规范你希望跨项目复用

### 1.3 原则三：规范必须可执行

规范如果不能被强制执行，就只是一份"建议"。好的工程化系统，规范应该是**机器可检查的**。

举个例子：

> "所有 API 调用必须封装在 lib 目录下" —— 这是一条建议。

> "运行 `npx eslint` 会检查是否有 api 调用出现在非 lib 目录下" —— 这是一条可执行的规范。

可执行的规范有三层：

1. **自动检查**：Lint、类型检查、格式化工具自动拦截违规
2. **流程约束**：CI/CD 流水线阻止不符合规范的代码合并
3. **人工审计**：Code Review 清单，确保机器检查不到的地方有人看

对于独立开发者，第一层最重要。后面的两层在有团队或项目达到一定规模后再加。

## 2. Harness Engineer：你的AI架构师角色

### 2.1 什么是 Harness Engineer

在传统软件工程里，有一个角色叫"架构师"——他不一定写代码，但他的工作是设计系统的结构、制定规范、确保各个模块能正确协作。

在AI编程时代，这个角色变成了 **Harness Engineer**。

Harness Engineer 做的事情：

- 设计项目的 Skill 结构和目录规范
- 编写和维护 Skill 文件，把经验编码化
- 制定 Spec 模板，确保需求可以被结构化表达
- 配置 MCP 工具连接，让AI能访问必要的资源
- 建立验收标准，确保AI产出的代码符合预期

**关键区别：** 传统架构师设计的是"代码怎么组织"，Harness Engineer 设计的是"AI 怎么被引导"。

### 2.2 Harness Engineer 的工作流

```
项目启动 → 定义 Skill 结构 → 编写初始 Skill → 创建 Spec 模板
    → 开发过程中迭代 Skill → 定期审计规范有效性 → 持续优化
```

每一步的具体操作：

**Step 1：定义 Skill 结构**

在项目根目录下建立 `skills/` 目录，按功能模块划分：

```
skills/
├── project-overview.md      # 项目总览：这是什么、怎么跑起来
├── coding-standards.md      # 编码规范：文件命名、目录结构、样式约定
├── auth-flow.md             # 认证流程：登录/注册/权限的实现规范
├── api-patterns.md          # API 模式：请求/响应/错误的处理规范
└── deployment.md            # 部署流程：构建/部署/监控的操作手册
```

**Step 2：编写初始 Skill**

每个 Skill 文件遵循统一结构：

```markdown
---
name: <skill名称>
description: <一句话描述这个Skill做什么>
trigger: <什么情况下应该触发这个Skill>
---

## 概述
[2-3句话说明这个规范的目的]

## 规则
1. [规则1]
2. [规则2]
3. [规则3]

## 模板
[可复用的代码模板或文件结构]

## 示例
[一个完整的例子，展示正确用法]

## 禁忌
[常见的错误做法和为什么不应该这么做]
```

**Step 3：在开发中迭代**

Skill 不是一次写好的，而是在实际使用中不断完善的。每次发现AI犯了某个错误，就问自己：

> "我能不能把这个教训写成一个Skill，让下次AI不再犯？"

如果答案是"能"，花5分钟写下来。三个月后，你会拥有一个越来越强大的规范库。

### 2.3 Harness Engineer 的日常工作清单

每次开始一个新项目或新模块时：

- [ ] 读取项目已有的 Skill 文件，了解现有规范
- [ ] 确认是否需要新增 Skill（检查清单：同类问题是否出现过2次以上）
- [ ] 阅读 Spec 文件，理解当前需求和架构决策
- [ ] 检查 MCP 工具配置，确保AI能访问必要的服务和数据源
- [ ] 开发完成后，运行自动检查工具（lint、类型检查等）
- [ ] 记录本次开发中发现的新规范，补充到 Skill 文件中

## 3. Skill 标准化：从随意到专业

### 3.1 Skill 文件的黄金结构

一个高质量的 Skill 文件，应该能让一个完全不了解项目的人（或AI）在5分钟内理解并执行。以下是经过实战验证的结构：

```markdown
# Skill: [名称]

> 一句话描述：这个Skill解决什么问题，在什么场景下使用。

## 何时使用

列出触发条件。例如：
- 创建新页面时
- 修改API路由时
- 添加新功能时

## 核心规则

按优先级排列的规则列表。每条规则包含：
- **规则名称**：简短描述
- **为什么**：这条规则的原因（不解释原因的规则不会被遵守）
- **怎么做**：具体的操作步骤

## 文件结构

展示正确的目录结构和文件命名约定。

## 代码模板

可直接复制使用的代码片段。模板应该：
- 包含必要的注释
- 标注需要替换的部分
- 展示完整的上下文

## 反模式（不要这样做）

列出常见错误，附带正确做法的对比。

## 相关 Skill

链接到其他相关的 Skill 文件，形成知识网络。
```

### 3.2 Skill 编写的三个层次

**Level 1：规则清单**

最简单，就是一堆"应该这样做"的列表。

```markdown
## 规则
- 所有组件使用函数组件
- 样式使用 Tailwind CSS
- API 调用使用 fetch
```

问题：没有上下文，没有示例，AI 可能理解偏差。

**Level 2：规则 + 示例**

增加了"怎么做"和"长什么样"。

```markdown
## 规则
- 所有组件使用函数组件

## 示例
// 正确
function UserProfile({ userId }) {
  return <div>{/* ... */}</div>;
}

// 错误
class UserProfile extends React.Component {
  render() { return <div>{/* ... */}</div>; }
}
```

好多了，但还不够。

**Level 3：规则 + 示例 + 模板 + 反模式 + 原因**

完整的 Skill 文件，包含所有层次的信息。

```markdown
## 规则
- 所有组件使用函数组件，不使用 class 组件

## 为什么
Class 组件需要 `this` 绑定，容易出错，且与 React Hooks 生态系统不兼容。函数组件 + Hooks 是当前 React 的标准写法，AI 工具对它的理解和生成质量也更高。

## 模板
function [ComponentName]({ [props] }) {
  // 1. 状态声明
  const [state, setState] = useState(initialValue);

  // 2. 副作用
  useEffect(() => {
    // ...
  }, [dependencies]);

  // 3. 渲染
  return <div>{/* ... */}</div>;
}

## 示例
function UserProfile({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <LoadingSpinner />;
  return <div>{user.name}</div>;
}

## 反模式
❌ class UserProfile extends React.Component { ... }
❌ 在组件内部定义 API 调用函数
❌ 使用内联 style 对象

## 相关 Skill
- [API Patterns](./api-patterns.md)
- [Coding Standards](./coding-standards.md)
```

### 3.3 Skill 的组织策略

随着项目增长，Skill 文件会越来越多。怎么组织？

**按功能模块划分（推荐）**

```
skills/
├── auth/
│   ├── login-flow.md
│   ├── registration.md
│   └── permission-model.md
├── data/
│   ├── api-patterns.md
│   ├── database-schema.md
│   └── caching-strategy.md
├── ui/
│   ├── component-library.md
│   ├── layout-system.md
│   └── design-tokens.md
└── devops/
    ├── deployment.md
    └── monitoring.md
```

**按开发阶段划分（适合小项目）**

```
skills/
├── 01-project-setup.md    # 项目初始化
├── 02-frontend.md         # 前端开发
├── 03-backend.md          # 后端开发
├── 04-testing.md          # 测试
└── 05-deployment.md       # 部署上线
```

**混合模式（推荐中等以上项目）**

```
skills/
├── standards/             # 全局规范（不分模块）
│   ├── coding-standards.md
│   ├── file-naming.md
│   └── git-workflow.md
├── features/              # 按功能模块
│   ├── auth.md
│   ├── payments.md
│   └── notifications.md
└── processes/             # 按开发流程
    ├── prd-template.md
    ├── spec-template.md
    └── deployment-checklist.md
```

### 3.4 Skill 的维护机制

Skill 文件不是写完就完了的。它会老化、过时、变得矛盾。

**维护频率：**

| 活动 | 频率 | 内容 |
|------|------|------|
| 增量更新 | 每次开发时 | 发现新规范就写进去 |
| 一致性检查 | 每月一次 | 检查 Skill 之间有没有矛盾 |
| 全面复审 | 每季度一次 | 删除过时的，合并重复的，补充遗漏的 |

**删除过时 Skill 的信号：**

- 对应的技术栈已经升级（如 React 17 → 18，规则变了）
- 项目中已经不再使用某种模式（如 class 组件已绝迹）
- 多条 Skill 说的是同一件事（合并而非保留多条）

## 4. Spec 结构化：JSON/YAML 的力量

### 4.1 为什么 Spec 需要结构化

PRD 用自然语言写，适合表达"想要什么"。但自然语言有歧义——同一个描述，不同的人（或AI）可能有不同理解。

Spec 的作用就是把模糊的需求变成精确的规格说明。用 JSON 或 YAML 格式，核心优势：

1. **无歧义**：字段类型、必填/选填、取值范围都明确定义
2. **可验证**：可以用 schema 校验，不合格的 Spec 直接被拒绝
3. **可复用**：同一套模板用于不同项目，只需填不同的值
4. **可工具化**：可以写脚本自动从 Spec 生成代码骨架

### 4.2 Spec 模板设计

一个典型的 AI 开发 Spec 模板：

```yaml
# spec.yaml
version: 1
project:
  name: my-app
  framework: nextjs
  language: typescript
  styling: tailwind

features:
  - name: user-auth
    priority: p0
    description: "用户登录和注册功能"
    endpoints:
      - method: POST
        path: /api/auth/login
        request:
          email: string (required)
          password: string (required)
        response:
          token: string
          user: UserObject
      - method: POST
        path: /api/auth/register
        request:
          email: string (required)
          password: string (required, min: 8)
          name: string (required)
        response:
          user: UserObject
    database:
      table: users
      columns:
        - id: uuid (primary)
        - email: string (unique)
        - password_hash: string
        - name: string
        - created_at: timestamp
        - updated_at: timestamp
    validation:
      email: "valid email format"
      password: "min 8 characters, 1 uppercase, 1 number"
    error_handling:
      invalid_credentials: "401 Unauthorized"
      email_taken: "409 Conflict"
      server_error: "500 Internal Server Error"
```

### 4.3 Spec 驱动开发的流程

```
1. 写 PRD（自然语言，描述业务需求）
2. 将 PRD 转化为 Spec（结构化，定义技术规格）
3. AI 读取 Spec，生成代码骨架
4. AI 根据 Spec 中的 validation/error_handling 填充业务逻辑
5. 生成测试用例（从 Spec 的 endpoints 和 validation 推导）
6. 运行测试，验证是否符合 Spec
7. 测试通过后，提交代码
```

**关键点：** Spec 是 PRD 和代码之间的桥梁。它不描述 UI 细节（那是 PRD 的事），也不描述具体实现（那是代码的事），它描述的是**接口契约**——输入是什么、输出是什么、边界条件是什么。

### 4.4 Spec 的版本管理

Spec 文件也应该纳入 Git 管理：

```
specs/
├── v1/
│   ├── auth.yaml
│   └── payments.yaml
├── v2/
│   ├── auth.yaml
│   └── payments.yaml
└── current/
    ├── auth.yaml          # 当前正在开发的版本
    └── payments.yaml
```

每次 Spec 变更，创建新版本目录，保留历史。这样你可以：

- 回溯某个功能当初是怎么设计的
- 对比不同版本的差异
- 在 Spec 文件中记录变更理由（commit message）

## 5. Codex 沙箱：安全的自主开发环境

### 5.1 为什么需要沙箱

当你让AI自主开发一个功能时，最大的风险是：**AI可能会破坏现有代码。**

即使是最靠谱的AI，也可能在修改A功能时不小心改了B功能的代码。在生产环境中，这是不可接受的。

沙箱的作用就是提供一个隔离的开发环境，让AI可以在里面自由试错，而不影响主项目。

### 5.2 Codex 沙箱的工作方式

OpenAI Codex 的云沙箱提供了以下能力：

1. **隔离执行**：在独立的容器中运行AI生成的代码
2. **自动测试**：运行测试套件，验证功能正确性
3. **安全限制**：限制网络访问、文件系统权限、CPU/内存使用
4. **结果回传**：测试通过后，将代码合并回主项目

### 5.3 沙箱的最佳实践

**实践一：始终先跑测试**

在沙箱中，让AI先写测试，再写实现。测试通过才算完成。

```
AI 收到指令："实现用户注册功能"
→ AI 先生成测试用例（注册成功、邮箱重复、密码过短等）
→ AI 再实现功能
→ 运行测试，全部通过
→ 代码合并到主项目
```

**实践二：小步提交**

不要一次性让AI实现整个功能。拆成小步骤：

```
Step 1: 创建数据库表结构 → 跑迁移测试
Step 2: 实现 API 路由 → 跑接口测试
Step 3: 实现前端表单 → 跑UI测试
Step 4: 集成联调 → 跑端到端测试
```

每一步都是独立的提交，出问题可以回退到上一步。

**实践三：人工审查关键路径**

AI 可以自主开发的范围：

- 新增功能（有完整测试覆盖）
- Bug 修复（有回归测试）
- 重构（有测试保护）

需要人工审查的范围：

- 数据库 Schema 变更
- API 接口变更（影响下游）
- 安全相关代码（认证、授权、数据加密）
- 依赖包升级

## 6. 风险避坑：工程化路上的常见陷阱

### 6.1 过度工程化

**症状：** 还没开始写代码，先花了三天写 Skill 文档和 Spec 模板。

**原因：** 把工程化当成了目的，而不是手段。

**对策：** 遵循 **Just-in-Time 规范化**原则——只在问题出现后才建立规范。

| 时机 | 做法 |
|------|------|
| 第一次犯某个错误 | 记住教训 |
| 第二次犯同样的错误 | 口头提醒AI |
| 第三次犯同样的错误 | 写进 Skill 文件 |
| 同一个 Skill 被引用超过5次 | 考虑提炼为通用模板 |

**记住：** 一个项目的 Skill 文件应该在项目生命周期内自然生长出来，而不是预先设计好。

### 6.2 Skill 文件变成"废纸"

**症状：** Skill 文件写了很长，但AI根本不读，或者读了也不遵守。

**原因：**
- 文件太长，AI 的上下文窗口放不下，只读到了一半
- 规则太多，没有优先级，AI 不知道哪些重要
- 没有示例，AI 不理解规则的实际含义

**对策：**

1. **精简**：每个 Skill 文件不超过 200 行。超过就拆分
2. **排序**：最重要的规则放最前面。AI 对前面的内容关注度更高
3. **示例驱动**：每条规则配一个"正确 vs 错误"的代码对比
4. **可检查**：尽可能把规则变成自动检查（lint、类型检查）

### 6.3 Spec 与代码脱节

**症状：** Spec 写得很好，但代码实现和 Spec 不一致，没人维护 Spec。

**原因：** Spec 被视为"一次性文档"，而不是"持续更新的契约"。

**对策：**

- 把 Spec 视为代码的一部分，代码变更时 Spec 必须同步更新
- 在 CI 流程中加入 Spec 校验：检查代码实现是否符合 Spec
- 使用工具自动生成 Spec 的草案（从代码反推），人工审核后作为基准

### 6.4 工具链过于复杂

**症状：** 装了十几个工具，配了各种 MCP 服务器，结果大部分时间不用。

**原因：** 工具的价值不在于数量，而在于是否真正解决了痛点。

**对策：**

| 阶段 | 推荐工具 | 说明 |
|------|---------|------|
| 个人项目初期 | 1个AI工具 + Git | 够用就行 |
| 项目有一定规模 | + Skill文件 + Spec | 开始规范化 |
| 多人协作 | + MCP工具链 + CI/CD | 需要自动化和协作 |
| 产品上线运营 | + 监控 + 日志 | 关注稳定性 |

**不要一开始就上全套。** 工具链应该随着项目复杂度自然增长。

### 6.5 忽视上下文窗口限制

**症状：** 项目越来越大，AI 的对话越来越长，AI 开始"遗忘"早期的架构决策。

**原因：** 没有意识到 AI 的上下文窗口是有限的，对话越长，早期信息被稀释得越严重。

**对策：**

1. **把关键信息外置**：架构决策、API 约定、数据库 Schema 等核心信息，不要只存在于对话历史中，要写入 Skill 文件和 Spec 文件
2. **分段对话**：每次只让AI处理一个模块，而不是整个项目
3. **定期清理对话**：长对话中，定期总结已完成的工作，清空已解决的讨论
4. **使用项目索引**：在 Skill 文件中维护一个"项目地图"，列出所有模块的位置和职责，AI 每次只加载需要的部分

### 6.6 规范与灵活性失衡

**症状：** 规范太严，AI 不敢创新，生成的代码千篇一律；规范太松，又回到了"随机生成"的状态。

**原因：** 规范应该是护栏，不是牢笼。

**对策：**

- **核心规范不可协商**：目录结构、文件命名、API 约定——这些必须严格遵守
- **实现细节可以灵活**：具体的算法选择、UI 组件实现方式——让 AI 根据上下文决定
- **规范本身可以迭代**：如果发现某条规范阻碍了开发，修改它，而不是绕过它

## 7. 实战：为一个真实项目建立工程化体系

### 7.1 项目背景

假设你正在做一个 SaaS 产品：一个面向独立开发者的 AI 代码生成平台。

项目已经完成了 MVP，有基本的用户注册、代码生成、项目保存功能。现在需要：

- 增加团队协作功能
- 完善错误处理和日志
- 建立可持续迭代的开发流程

### 7.2 第一步：盘点现状

先看看项目现在的状态：

```
my-ai-platform/
├── src/
│   ├── pages/          # 页面组件
│   ├── components/     # UI 组件
│   ├── lib/            # 工具函数
│   └── api/            # API 路由
├── prd/                # PRD 文档（有一些，但不完整）
├── specs/              # 没有
├── skills/             # 没有
└── tests/              # 有一些，但不完整
```

问题很明显：**没有 Spec、没有 Skill、测试不完整。**

### 7.3 第二步：建立基础规范

首先创建 `skills/standards/` 目录，写入最基础的规范：

**skills/standards/file-structure.md**

```markdown
# Skill: 项目文件结构

> 定义项目的目录结构和文件命名约定。

## 目录结构

```
src/
├── pages/           # 页面组件（按功能模块分组）
│   ├── auth/        # 认证相关页面
│   ├── dashboard/   # 仪表盘页面
│   └── project/     # 项目管理页面
├── components/      # 可复用 UI 组件
│   ├── ui/          # 基础 UI 组件（按钮、输入框等）
│   ├── layout/      # 布局组件（Header、Sidebar等）
│   └── feature/     # 功能组件（代码编辑器、预览面板等）
├── lib/             # 工具函数和业务逻辑
│   ├── api/         # API 客户端
│   ├── hooks/       # 自定义 React Hooks
│   └── utils/       # 通用工具函数
├── types/           # TypeScript 类型定义
└── styles/          # 全局样式和 Tailwind 配置
```

## 文件命名

- 组件：PascalCase，如 `UserProfile.tsx`
- 工具函数：camelCase，如 `formatDate.ts`
- 类型定义：PascalCase，如 `user.ts`
- 测试文件：与源文件同名，加 `.test.ts` 后缀

## 为什么

一致的命名和目录结构让AI和人类开发者都能快速定位代码，减少认知负担。
```

**skills/standards/api-convention.md**

```markdown
# Skill: API 约定

> 定义 API 的请求/响应格式、错误处理和认证方式。

## 请求格式

所有 API 请求使用 JSON 格式：

```typescript
// 请求
POST /api/projects
{
  "name": "我的项目",
  "description": "这是一个测试项目"
}

// 响应（成功）
{
  "id": "proj_xxx",
  "name": "我的项目",
  "description": "这是一个测试项目",
  "created_at": "2026-01-15T10:30:00Z"
}

// 响应（错误）
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "项目名称不能为空",
    "fields": ["name"]
  }
}
```

## 错误码规范

| 错误码 | HTTP 状态码 | 含义 |
|--------|-----------|------|
| VALIDATION_ERROR | 400 | 参数校验失败 |
| UNAUTHORIZED | 401 | 未认证 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突（如重复注册） |
| RATE_LIMITED | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 为什么

统一的 API 格式让前后端协作更高效，AI 生成代码时也有明确的参考标准。
```

### 7.4 第三步：创建 Spec 模板

**specs/templates/feature.yaml**

```yaml
version: 1
feature:
  name: ""                    # 功能名称
  description: ""             # 功能描述
  priority: p0 | p1 | p2      # 优先级
  owner: ""                   # 负责人（可选）

requirements:
  - type: functional
    description: ""
    acceptance_criteria: ""
  - type: non-functional
    description: ""
    metric: ""

api:
  endpoints:
    - method: ""
      path: ""
      request_schema: {}
      response_schema: {}
      error_codes: []

database:
  tables: []
  migrations: []

frontend:
  pages: []
  components: []
  states: []

testing:
  unit_tests: []
  integration_tests: []
  e2e_tests: []
```

### 7.5 第四步：为新功能写 Spec

假设现在要实现"团队协作"功能。按照流程：

1. 先写 PRD（自然语言描述业务需求）
2. 基于 PRD 填写 Spec 模板
3. 让AI读取 Spec，生成代码

**Spec 示例（团队协作功能）：**

```yaml
version: 1
feature:
  name: team-collaboration
  description: "项目团队成员管理：邀请、移除、权限分配"
  priority: p0

requirements:
  - type: functional
    description: "项目所有者可以邀请新成员加入项目"
    acceptance_criteria: "邀请邮件发送成功，接收者点击链接后自动加入"
  - type: functional
    description: "项目所有者可以移除团队成员"
    acceptance_criteria: "被移除者立即失去项目访问权限"
  - type: functional
    description: "支持两种角色：Owner 和 Member"
    acceptance_criteria: "Owner 有全部权限，Member 只有编辑权限"
  - type: non-functional
    description: "邀请链接有效期24小时"
    metric: "过期链接拒绝加入请求，返回410 Gone"

api:
  endpoints:
    - method: POST
      path: /api/projects/:projectId/invite
      request_schema:
        email: string (required)
        role: "owner" | "member" (default: "member")
      response_schema:
        invitation_id: string
        expires_at: timestamp
      error_codes:
        - 400: 邮箱格式无效
        - 409: 该用户已在项目中
        - 403: 当前用户不是项目所有者
    - method: DELETE
      path: /api/projects/:projectId/members/:userId
      response_schema:
        success: boolean
      error_codes:
        - 404: 成员不存在
        - 403: 不能移除项目所有者
    - method: GET
      path: /api/projects/:projectId/members
      response_schema:
        members:
          - user_id: string
            email: string
            role: "owner" | "member"
            joined_at: timestamp

database:
  tables:
    - name: project_members
      columns:
        - project_id: uuid (FK → projects.id)
        - user_id: uuid (FK → users.id)
        - role: enum("owner", "member")
        - invited_at: timestamp
        - joined_at: timestamp
      unique_constraints:
        - [project_id, user_id]
  migrations:
    - create_table: project_members
    - add_index: project_id
    - add_index: user_id

frontend:
  pages:
    - path: /projects/:projectId/settings/team
      components:
        - TeamInviteForm: 邀请成员表单
        - MemberList: 成员列表
        - RoleSelector: 角色选择器
  states:
    - invite_form: { email: string, role: string, submitting: boolean }
    - member_list: { members: Array, loading: boolean, error: string | null }

testing:
  unit_tests:
    - "邀请邮箱格式校验"
    - "角色枚举值验证"
    - "邀请链接过期逻辑"
  integration_tests:
    - "POST /invite 成功创建邀请"
    - "POST /invite 重复邀请返回409"
    - "DELETE /members/:userId 移除成员"
    - "GET /members 返回正确列表"
  e2e_tests:
    - "作为项目所有者，邀请新用户并确认其加入"
    - "尝试移除项目所有者，验证被拒绝"
```

### 7.6 第五步：让AI执行

有了完整的 Spec 后，告诉AI：

> "请阅读 specs/current/team-collaboration.yaml，按照 Spec 实现团队协作功能。请先创建数据库迁移，然后实现 API 路由，最后实现前端页面。每一步完成后运行相应的测试。"

AI 会按照 Spec 的结构化信息，逐步生成代码。因为 Spec 已经定义了：
- 数据库表结构和迁移
- API 端点和错误码
- 前端页面和组件
- 测试用例

AI 的输出就有了明确的边界和标准。

### 7.7 第六步：审计与迭代

功能上线后，回顾整个过程：

- Spec 中有哪些定义不够清晰，导致AI理解偏差？
- 有没有遇到 Spec 中没有覆盖的边缘情况？
- 哪些规则可以抽象成通用的 Skill？

把这些发现更新到 Skill 文件和 Spec 模板中，完成闭环。

## 8. 从独立开发者到一人公司：工程化体系的全局视角

### 8.1 一个人如何管理多个项目

当你的项目从1个增长到5个、10个时，工程化体系的价值就显现出来了：

```
~/projects/
├── ai-code-platform/       # 项目A：AI代码生成平台
│   ├── skills/             # 项目A的规范
│   ├── specs/              # 项目A的Spec
│   └── ...
├── saas-dashboard/         # 项目B：SaaS仪表盘
│   ├── skills/
│   ├── specs/
│   └── ...
├── shared-skills/          # 共享Skill（跨项目复用）
│   ├── api-convention.md   # 统一的API约定
│   ├── auth-pattern.md     # 认证模式
│   └── testing-guide.md    # 测试指南
└── project-template/       # 项目脚手架
    ├── skills/
    ├── specs/
    └── ...
```

**共享 Skill 的价值：**

你在项目A中积累的规范，可以直接复用到项目B。比如 API 约定、认证模式、测试指南——这些是跨项目的通用知识。

**项目模板的价值：**

新项目启动时，从模板复制 Skill 和 Spec 结构，只需针对具体项目定制，不需要从零开始。

### 8.2 工程化体系的成熟度模型

| 阶段 | 特征 | 规范程度 | 典型场景 |
|------|------|---------|---------|
| L0：原始模式 | 直接对话，无任何规范 | 0% | 学习AI编程的前几天 |
| L1：有意识 | 开始记录笔记和模板 | 10% | 发现重复问题后 |
| L2：Skill化 | 经验写入 Skill 文件 | 30% | 同一个问题出现3次以上 |
| L3：Spec驱动 | 需求结构化，代码可验证 | 50% | 项目开始有复杂度 |
| L4：自动化 | CI/CD + 自动检查 | 70% | 多人协作或产品上线 |
| L5：体系化 | 共享Skill + 项目模板 + 工具链 | 90% | 一人公司 / 小型团队 |

**从 L2 到 L3 是最大的质变。** L2 解决了"AI不犯错"，L3 解决了"AI做对的事"。

### 8.3 下一步

工程化不是一蹴而就的。它始于你第三次告诉AI"不要用class组件"的那一刻，成长于你把教训写进Skill文件的那5分钟，成熟于你发现项目A的经验可以直接复用到项目B的那个瞬间。

**最好的开始时间是现在，次好的时间是上次犯错之后。**

回顾你前面所有章节的实践：

- 第1-2章：你学会了用什么工具
- 第3-4章：你学会了怎么做出产品
- 第5-6章：你学会了怎么让产品跑起来并持续管理
- 第7章：你学会了给产品装上"记忆"
- **第8章：你学会了让整个系统可靠地运转**

下一章，我们将进入实战冲刺——用AI在2小时内生成一个微信小程序，并完成审核上线。那是工程化体系的一次集中检验。
