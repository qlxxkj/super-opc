#### 1. AI开发的致命问题：项目越写越崩

1.1 为什么AI编程的项目更容易失控

AI编程降低了开发门槛，但同时也放大了项目管理的问题。传统开发至少还有代码审查、分支管理、CI/CD这些工程实践的约束。AI开发中，一个人对着AI对话框敲需求，代码自动生成了，看起来很快，但问题会迅速累积：

- 对话太长，AI开始遗忘之前的关键设定
- 每次新对话都是从零开始，项目上下文丢失
- 没有版本控制意识，改了一个Bug，引入了三个新Bug
- 功能堆积，代码结构越来越不合理，但没人敢动
- 分支随便开随便合，最后不知道哪个版本是对的

1.2 上下文丢失：AI不记得你说过什么

这是AI编程最核心的痛点。Claude Code、Cursor、ChatGPT这些工具，都有一个上下文窗口的限制。对话超过一定长度后：

- 最早的PRD和Spec可能被截断
- 之前约定的编码规范被遗忘
- 已经做过的重要技术决策不被引用
- AI开始按照自己的理解"自由发挥"

你前一天让AI搭建的项目架构，第二天可能就被改成完全不同的样子。

1.3 代码质量下降：没有Review的自动生成

AI生成的代码有几个典型问题：

- 函数过长：一个函数塞了500行逻辑
- 重复代码：同样的逻辑在不同文件中写了三次
- 命名不一致：同一个变量在A文件叫userId，在B文件叫user_id
- 缺少错误处理：成功路径写得很好，失败路径直接return null
- 硬编码：API密钥、URL、配置参数直接写在代码里

这些问题在传统开发中会被Code Review拦截，但在AI开发中，生成完直接进了主分支。

1.4 分支混乱：feature堆积如山

没有规范的分支管理，项目会迅速变成这样：

- 每个功能都在main分支上直接改
- 临时实验性的改动没有独立分支
- 不知道当前代码是哪一天的版本
- 想回退到上周的状态，发现Git日志全是"fix bug"和"update"

1.5 "项目不死"的核心：版本控制 + 上下文工程

解决上述问题的核心思路很简单：

- 版本控制：每一次修改都有迹可循，随时可以回退
- 上下文工程：让AI在任何时候都能"记住"项目的关键信息
- 目录结构：让代码组织有序，AI更容易理解和修改
- 重构策略：定期清理技术债务，不让烂代码累积

这四个支柱构成了AI时代项目管理的底层能力。

#### 2. Git Worktree：多分支并行开发

2.1 什么是Git Worktree

Git Worktree允许你在同一个Git仓库下创建多个工作区。每个工作区可以checkout不同的分支，互不干扰。

传统模式下，你想同时开发两个功能，要么切分支（丢失未提交的代码），要么复制整个仓库（浪费磁盘空间且难以同步）。Worktree解决了这个问题：一个仓库，多个工作区，共享同一个.git目录，各自有不同的HEAD和暂存区。

2.2 为什么需要Worktree

AI开发场景下，Worktree的价值特别明显：

- 你正在让AI开发用户认证模块，同时在另一个分支让AI修复登录页面的Bug
- 你需要在main分支上部署测试，但不能中断其他分支的开发
- 你要对比两个不同技术方案的效果，但不想创建两个独立的仓库
- 你开了十几个实验性分支做不同的功能探索

2.3 实战：创建、切换、删除Worktree

创建Worktree：

```bash
# 在仓库根目录下执行
git worktree add ../myapp-feature-user-auth feature/user-auth
git worktree add ../myapp-fix-login-bug fix/login-bug
git worktree add ../myapp-experiment-nextjs experiment/nextjs-migration
```

切换到指定Worktree目录：

```bash
cd ../myapp-feature-user-auth
# 在这个目录下，git status显示的是feature/user-auth分支的状态
```

删除Worktree：

```bash
# 先切换到主仓库
cd ../myapp
# 删除Worktree并可选地删除关联分支
git worktree remove ../myapp-feature-user-auth
git worktree prune  # 清理无效的worktree记录
```

查看当前所有的Worktree：

```bash
git worktree list
# 输出类似：
# /Users/name/myapp   abc123d [main]
# /Users/name/myapp-feature-user-auth def456g [feature/user-auth]
# /Users/name/myapp-fix-login-bug     hij789k [fix/login-bug]
```

2.4 Worktree + AI协作的工作流

推荐的协作模式：

```
主仓库 myapp/          ← 存放.git，管理所有分支
├── ../myapp-main/    ← checkout main，用于部署和集成测试
├── ../myapp-feature-auth/  ← checkout feature/auth，AI在此分支开发
├── ../myapp-feature-pay/   ← checkout feature/pay，另一个功能并行开发
└── ../myapp-experiment-ui/ ← checkout experiment/ui，探索性开发
```

具体操作步骤：

1. 在主仓库创建好分支
2. 为每个分支创建对应的Worktree
3. 在每个Worktree目录中启动Claude Code或Cursor
4. AI在该分支上工作，互不影响
5. 功能完成后，在主仓库中merge

2.5 Worktree的命名规范

目录命名直接影响工作效率，建议遵循以下规则：

| 分支类型 | Worktree目录命名 | 示例 |
| --- | --- | --- |
| 功能分支 | myapp-feature-<功能名> | myapp-feature-user-auth |
| 修复分支 | myapp-fix-<问题描述> | myapp-fix-login-redirect |
| 实验分支 | myapp-explore-<方向> | myapp-explore-dark-mode |
| 重构分支 | myapp-refactor-<范围> | myapp-refactor-api-layer |
| 临时分支 | myapp-temp-<用途> | myapp-temp-performance-test |

2.6 Worktree的注意事项

- 不要在Worktree目录里执行init或clone，它们共享同一个.git
- 删除Worktree目录前先用git worktree remove清理记录
- 如果某个分支上的未提交改动太多，Worktree可能会报错，需要先commit或stash
- 磁盘占用比克隆多个仓库少得多，因为所有Worktree共享对象数据库

#### 3. 目录结构设计

3.1 项目的文件系统组织原则

好的目录结构有三个标准：

- AI友好：AI能快速找到相关文件，理解项目结构
- 人类可读：你自己也能在三个月后看懂
- 可扩展：加新功能时不需要推翻重来

3.2 推荐的目录结构

对于典型的Web应用项目，推荐以下结构：

```
myapp/
├── src/                    # 源代码根目录
│   ├── components/         # 可复用的UI组件
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.test.tsx
│   │   └── Modal/
│   ├── pages/              # 页面组件
│   │   ├── index.tsx       # 首页
│   │   └── dashboard.tsx
│   ├── lib/                # 工具和库函数
│   │   ├── api.ts          # API调用封装
│   │   └── utils.ts        # 通用工具函数
│   ├── hooks/              # 自定义React Hooks
│   ├── types/              # TypeScript类型定义
│   └── styles/             # 全局样式
├── app/                    # 后端应用（如果有）
│   ├── routes/             # 路由定义
│   ├── middleware/          # 中间件
│   └── controllers/        # 控制器逻辑
├── scripts/                # 构建和运维脚本
│   ├── deploy.sh
│   └── seed.ts
├── tests/                  # 测试文件
│   ├── unit/
│   ├── integration/
│   └── fixtures/           # 测试数据
├── docs/                   # 项目文档
│   ├── specs/              # Spec文件
│   ├── skills/             # Skill文件
│   └── decisions/          # 架构决策记录
├── public/                 # 静态资源
├── .env                    # 环境变量（不提交到Git）
├── .env.example            # 环境变量模板（提交到Git）
├── .gitignore
├── CLAUDE.md               # AI助手行为指南
├── README.md               # 项目说明
├── package.json
└── tsconfig.json
```

3.3 AI友好型目录设计

让AI更容易理解和修改代码的关键：

- 组件自包含：每个组件文件夹里放组件代码、样式、测试，AI修改时不用到处翻
- 命名一致：文件命名遵循 kebab-case 或 PascalCase，全项目统一
- 层级扁平：不要超过三层嵌套，AI找文件容易迷路
- 类型集中：TypeScript类型定义放在types/目录，AI生成代码时可以直接引用
- 工具函数独立：lib/目录里的函数应该是纯函数，不依赖外部状态

3.4 Spec和Skill的存放位置

Spec和Skill文件需要放在AI能自动加载的位置：

- Claude Code会自动读取项目根目录的CLAUDE.md
- Spec文件放在docs/specs/目录下，按版本号管理
- Skill文件放在docs/skills/目录下，按功能分类
- 也可以在项目根目录放一个context.md，汇总关键上下文

3.5 配置文件管理

必须提交到Git的配置：

- .gitignore：排除node_modules、.env、dist等
- .env.example：环境变量模板，不含真实值
- prettier.config.js / eslint.config.js：代码风格规则
- CLAUDE.md：AI助手的行为指南

绝对不能提交到Git的配置：

- .env：包含API密钥和数据库密码
- node_modules/：依赖包，通过package.json重建
- dist/ 或 build/：构建产物
- .DS_Store 和 Thumbs.db：操作系统垃圾文件

#### 4. Context工程：让AI记住项目

4.1 什么是Context工程

Context工程是指主动管理AI对项目上下文的认知。不是被动地等待AI"记住"，而是通过结构化的文件，让AI在任何时候都能快速了解项目的全貌。

类比：Context文件就是项目的"记忆外脑"。AI的对话窗口会清空，但文件不会。

4.2 README.md的AI优化写法

README.md不只是给人看的，更是给AI看的。优化的README应该包含以下结构：

```markdown
# 项目名称

## 一句话描述
这个项目是什么，解决什么问题。

## 技术栈
- 前端：React 18 + TypeScript + TailwindCSS
- 后端：Node.js + Express
- 数据库：PostgreSQL
- 部署：Vercel + Railway

## 项目结构
简要说明主要目录的作用。

## 快速开始
1. npm install
2. cp .env.example .env
3. npm run dev

## 核心功能
- 功能1：描述
- 功能2：描述

## 架构决策记录
- 为什么选React而不是Vue
- 为什么用PostgreSQL而不是MongoDB

## 已知问题和TODO
- 问题1：描述和当前状态
- 待办1：描述

## API文档
- GET /api/users - 获取用户列表
- POST /api/users - 创建用户
```

这份README的价值在于：任何AI工具打开这个项目，读一遍README就能快速进入状态。

4.3 CLAUDE.md：AI助手的行为指南

CLAUDE.md是Claude Code自动读取的项目级配置文件。它的内容直接影响AI在该项目中的行为。

```markdown
# Project Guidelines

## Tech Stack
- React 18, TypeScript, TailwindCSS
- Vite作为构建工具
- Vitest作为测试框架

## Code Style
- 组件使用PascalCase命名，文件用kebab-case
- 所有API调用通过lib/api.ts封装
- 错误处理：不使用console.log，用专门的logger
- 函数长度：单个函数不超过80行

## Project Structure
- src/components/ 下的每个组件必须包含对应的.test.tsx
- 新增页面需要在routes中注册
- 环境变量必须在.env.example中有对应模板

## Important Decisions
- 用户认证使用JWT，token有效期24小时
- 图片上传使用Cloudinary，不在本地存储
- 支付集成Stripe，仅支持美元

## Common Tasks
- 添加新页面：复制pages/_template.tsx，修改路由
- 修复Bug：先在tests/下写复现用例，再修代码
- 部署：npm run build && vercel --prod
```

4.4 上下文文件的标准格式

除了README.md和CLAUDE.md，还可以维护一个context.md文件，专门记录AI需要的动态上下文：

```markdown
# 项目上下文

## 当前状态
- 开发阶段：v1.2.0
- 最近完成：用户认证模块
- 正在进行：支付集成
- 下一个目标：仪表盘页面

## 技术约束
- 不能使用第三方UI库，全部手写组件
- 必须支持Chrome和Safari最新两个版本
- API响应时间不能超过500ms

## 数据模型
- User: { id, email, name, role, createdAt }
- Todo: { id, userId, title, completed, priority }

## 最近修改
- 2026-01-15：重构了API层，统一错误格式
- 2026-01-10：添加了用户角色权限系统

## 常见陷阱
- 不要直接调用stripe API，必须通过后端代理
- 数据库迁移必须在部署前执行
- 环境变量变更需要重启开发服务器
```

4.5 实战：为一个项目编写Context文件

以一个待办清单App为例，完整的Context文件：

```markdown
# QuickTodo - 项目上下文

## 项目概述
极简待办清单App，目标是让用户在10秒内完成一条待办的添加。

## 技术栈
- 前端：React 18 + TypeScript + Vite
- 样式：TailwindCSS
- 存储：IndexedDB（通过idb库）
- 测试：Vitest + React Testing Library

## 当前架构
- 页面层：pages/index.tsx（首页）, pages/settings.tsx（设置）
- 组件层：components/TodoItem.tsx, components/TodoList.tsx
- 数据层：lib/db.ts（IndexedDB封装）, lib/api.ts（预留）

## 关键决策
- 不使用localStorage，因为容量有限且不支持复杂查询
- IndexedDB是异步API，所有操作都用async/await
- 数据模型设计为扁平结构，避免嵌套查询

## 编码规范
- 组件文件放在components/目录下，每个组件一个文件
- 测试文件与源码同级，命名为*.test.tsx
- 禁止在组件内直接操作IndexedDB，必须通过lib/db.ts

## 已知问题
- 批量删除功能在iOS Safari上偶发崩溃
- 数据导入导出功能尚未实现

## 下一步计划
1. 实现标签系统
2. 添加数据导出为CSV功能
3. 支持深色模式
```

4.6 Context工程的维护节奏

| 时机 | 动作 |
| --- | --- |
| 每次新对话开始 | 让AI先读README.md和CLAUDE.md |
| 完成一个功能 | 更新context.md的"当前状态"和"最近修改" |
| 做出技术决策 | 立即写入README.md的"架构决策记录" |
| 发现常见陷阱 | 记录到context.md的"常见陷阱" |
| 每周回顾 | 清理已过时的TODO，更新技术栈信息 |

#### 5. 多工具上下文协同

5.1 不同AI工具的上下文隔离与共享

实际开发中，你可能同时使用多个AI工具：

- Claude Code：终端里的强力助手，适合大型代码修改
- Cursor：IDE内的AI编辑器，适合逐行编辑和即时预览
- ChatGPT / Copilot：快速问答和小片段生成
- Devin / 其他Agent：复杂任务的自主执行

这些工具的上下文是隔离的。Claude Code不知道你在Cursor里做了什么修改，反之亦然。解决方法：

- 用Git提交作为工具间的"同步点"：在一个工具做完修改后commit，另一个工具拉取最新代码
- 用Context文件作为共享记忆：无论用哪个工具，都读取相同的context.md
- 用Spec文件作为统一目标：所有工具基于同一个Spec工作

5.2 Claude Code的上下文窗口管理

Claude Code的上下文窗口虽然很大，但不是无限的。管理策略：

- 大文件分块处理：不要一次性让AI读整个文件，分模块讨论
- 及时提交：对话过长时，commit代码然后开新对话
- 利用CLAUDE.md：把最重要的规则写在文件里，不需要每次重复说
- 使用@符号引用文件：@filename让AI精确读取特定文件，而不是猜测

5.3 Cursor的上下文感知能力

Cursor的上下文感知机制与Claude Code不同：

- Cursor会根据你打开的文件自动推断相关代码
- 支持@符号引用任意文件或代码片段
- 对大型项目的感知不如Claude Code深入，但对当前文件的修改更精细

使用建议：

- 全局架构讨论用Claude Code
- 单文件或单组件的精细修改用Cursor
- 两个工具的代码通过Git同步

5.4 跨工具的Spec和Skill复用

Spec和Skill是跨工具通用的资产：

- Spec文件（docs/specs/*.yaml）：所有工具都能读取，定义一致的产品目标
- Skill文件（docs/skills/*.md）：定义了AI的行为规范，不绑定特定工具
- CLAUDE.md：Claude Code专用，但其中的规则也可以复制到Cursor的自定义指令中

建立一个统一的上下文标准：

| 文件 | 用途 | 适用工具 |
| --- | --- | --- |
| README.md | 项目概览 | 所有 |
| CLAUDE.md | Claude Code行为指南 | Claude Code |
| .cursorrules | Cursor行为指南 | Cursor |
| docs/specs/*.yaml | 功能规格 | 所有 |
| docs/skills/*.md | AI行为规范 | 所有 |
| context.md | 动态项目状态 | 所有 |

5.5 上下文同步的最佳实践

```
Claude Code工作流：
1. 读context.md，了解当前状态
2. 读对应Spec，确认功能目标
3. 执行代码修改
4. commit并写清晰的提交信息
5. 更新context.md

Cursor工作流：
1. 用@引用context.md和对应Spec
2. 打开需要修改的文件
3. 进行精细修改
4. commit
5. 回到Claude Code做全局Review
```

#### 6. 重构策略：在AI时代保持代码质量

6.1 什么时候需要重构：信号和指标

重构不是等代码烂到不能看才做。以下信号出现时就应该启动重构：

- 复制粘贴超过三次：同样的逻辑出现在三个以上的文件中
- 函数超过200行：AI生成的代码尤其容易写出超长函数
- 组件超过500行：一个组件承担了太多职责
- 命名不一致：同一个概念有多种叫法
- 测试覆盖率低于40%：改了代码不敢确定会不会出问题
- 新功能的开发时间越来越长：说明技术债务在累积
- 代码review时发现大量风格问题：说明没有统一的编码规范

6.2 AI辅助重构的方法论

AI在重构中的角色不是"帮我重写"，而是"帮我安全地重写"：

- 让AI识别代码异味：把文件丢给AI，问"这段代码有什么可改进的地方"
- 让AI拆分函数：一个500行的函数，让AI拆成80行的小函数
- 让AI统一命名：找出项目中不一致的命名模式，给出替换方案
- 让AI补测试：重构前先让AI写测试，确保重构不破坏现有功能
- 让AI做迁移：框架升级、API变更等重复性工作交给AI

6.3 渐进式重构 vs 大爆炸重构

| 维度 | 渐进式重构 | 大爆炸重构 |
| --- | --- | --- |
| 策略 | 每次改一个函数或一个模块 | 一次性重写整个子系统 |
| 风险 | 低，每次改动都可回退 | 高，可能引入大量新Bug |
| 速度 | 慢，融入日常开发 | 快，集中时间完成 |
| 适用场景 | 日常维护、小团队 | 技术债务严重、有测试保障 |
| AI协作方式 | 每次对话重构一小块 | 给AI完整的Spec，让它分批执行 |

推荐策略：80%的时间做渐进式重构，20%的时间做有计划的大爆炸重构。

渐进式重构的具体做法：

- 每次开发新功能时，顺手重构相邻的代码
- 修复Bug时，把相关的烂代码一并清理
- 每两周安排一个"重构日"，集中清理技术债务

6.4 测试驱动的重构：确保不改坏东西

重构的核心原则：不改行为，只改结构。测试是验证这一点的唯一可靠手段。

重构前的准备工作：

1. 给需要重构的代码区域补充测试
2. 如果已经有测试，确认全部通过
3. 让AI帮你生成缺失的测试用例

重构流程：

```
1. 确认现有测试全部通过
2. 制定重构计划：拆哪些函数、移哪些模块、改哪些命名
3. 让AI按步骤执行重构（一次一个步骤）
4. 每完成一步，运行测试确认没有破坏
5. 全部完成后，再做一次Code Review
```

6.5 重构的检查清单

每次重构完成后对照：

- [ ] 所有测试通过
- [ ] 代码风格与CLAUDE.md中的规范一致
- [ ] 没有引入新的依赖
- [ ] API接口保持不变（如果是内部重构）
- [ ] 相关文档已更新
- [ ] 提交信息清晰描述了重构的范围和目的
- [ ] 没有遗留TODO或FIXME注释

#### 7. 项目生命周期管理

7.1 从创建到维护的完整流程

一个AI项目的完整生命周期：

```
创建阶段（Day 1）
├── 初始化Git仓库
├── 创建目录结构
├── 编写README.md
├── 编写CLAUDE.md
├── 编写初始Spec
├── 创建第一个Worktree
└── 让AI生成初始代码

开发阶段（Week 1-4）
├── 每个功能在独立分支上开发
├── 功能完成后merge到main
├── 更新context.md
├── 每周Review代码质量
└── 渐进式重构

迭代阶段（Month 2-3）
├── 基于用户反馈调整Spec
├── 优化性能和用户体验
├── 补充测试覆盖
├── 更新Skill库
└── 技术债务清零

维护阶段（持续）
├── 定期更新依赖
├── 监控线上错误
├── 清理废弃代码
└── 沉淀新的Skill
```

7.2 定期审查和清理

建议的审查节奏：

| 频率 | 审查内容 | 耗时 |
| --- | --- | --- |
| 每日 | 提交代码，更新context.md | 5分钟 |
| 每周 | Code Review，清理未使用的分支 | 30分钟 |
| 每两周 | 重构日，集中清理技术债务 | 2小时 |
| 每月 | 回顾Spec和PRD，确认方向正确 | 1小时 |
| 每季度 | 全面审计：依赖更新、安全扫描、性能测试 | 半天 |

7.3 备份和恢复策略

- Git远程仓库本身就是最好的备份：GitHub/GitLab/Gitee，推送到远端
- .env文件绝不提交到Git，本地妥善保管
- 数据库定期导出备份
- 构建产物（dist/）不提交，需要时重新构建
- 重要配置用.env.example模板化，方便恢复

恢复场景演练：

```bash
# 场景1：本地代码损坏
git clone https://github.com/yourname/myapp.git
cd myapp
npm install
npm run dev

# 场景2：误删了未提交的修改
git reflog  # 查看所有操作历史
git checkout <commit-hash>  # 恢复到某个版本
```

7.4 团队协作的Git工作流

即使是单人项目，也应该建立规范的Git工作流。多人协作时在此基础上扩展：

```
main          ← 始终可部署的稳定版本
├── feature/user-auth     ← 用户认证功能
├── feature/payment       ← 支付功能
├── fix/login-bug         ← 紧急修复
└── experiment/new-ui     ← 探索性开发
```

分支命名规范：

| 前缀 | 含义 | 示例 |
| --- | --- | --- |
| feature/ | 新功能开发 | feature/dashboard |
| fix/ | Bug修复 | fix/token-expiry |
| refactor/ | 代码重构 | refactor/api-layer |
| experiment/ | 探索性开发 | experiment/graphql |
| release/ | 发布准备 | release/v1.2.0 |

提交信息规范（Conventional Commits）：

```
feat: 添加用户认证模块
fix: 修复登录页面重定向循环
docs: 更新README中的API文档
refactor: 拆分utils.ts中的工具函数
test: 添加Todo组件的单元测试
chore: 升级依赖包版本
```

7.5 实战案例：一个AI项目的完整生命周期

项目：一个AI翻译工具

Day 1 - 项目创建：

```bash
mkdir ai-translator && cd ai-translator
git init
# 创建目录结构
mkdir -p src/{components,pages,lib,hooks,types}
mkdir -p tests/unit tests/integration
mkdir -p docs/{specs,skills,decisions}
mkdir -p scripts
# 创建基础文件
touch README.md CLAUDE.md .gitignore .env.example
touch context.md
# 创建初始Spec
git worktree add ../ai-translator-dev dev
cd ../ai-translator-dev
# 启动Claude Code，让AI根据Spec生成初始代码
```

Week 1 - 核心功能开发：

```bash
# 功能1：文本翻译
git checkout -b feature/text-translation
# Claude Code生成翻译组件和API调用
git add . && git commit -m "feat: 添加文本翻译功能"
git checkout dev && git merge feature/text-translation

# 功能2：翻译历史记录
git checkout -b feature/history
# Claude Code生成历史记录功能
git add . && git commit -m "feat: 添加翻译历史记录"
git checkout dev && git merge feature/history

# 功能3：批量翻译
git checkout -b feature/batch-translate
git add . && git commit -m "feat: 添加批量翻译功能"
git checkout dev && git merge feature/batch-translate
```

Week 2 - 第一轮Review：

- 运行测试，发现批量翻译在长文本时有性能问题
- 让AI添加分页处理逻辑
- 更新context.md，记录"长文本翻译需要分页处理"
- 清理experiment/分支，合并有用的改动到dev

Week 3 - 重构：

- 发现lib/translate.ts有500行，让AI拆分成多个模块
- 统一API响应格式，之前有的返回{data}，有的返回{result}
- 补充单元测试，覆盖率从35%提升到72%

Month 2 - 上线和维护：

- 部署到Vercel
- 接入Google Analytics
- 收集用户反馈，调整Spec
- 每周清理一次未使用的分支

Month 3 - 迭代：

- 添加语音翻译功能（新分支feature/voice-translation）
- 更新Skill库，沉淀翻译类功能的开发规范
- 季度审计：升级依赖，检查安全漏洞

7.6 关键洞察

- 项目管理的核心不是工具，而是纪律：每天提交、每周Review、每月重构
- Context文件是AI项目的生命线：没有它，AI就是一个失忆的程序员
- Git Worktree是并行开发的利器：一个仓库，多个方向，互不干扰
- 目录结构决定了项目的可维护性：好的结构让AI和你自己都轻松
- 重构不是可选项：AI生成的代码质量会随时间递减，不重构就是在还债
