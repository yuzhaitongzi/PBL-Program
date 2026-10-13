# 电工技术 · 三旋翼 PBL 智能教学平台

上海工程技术大学《电工技术》课程模块化与三旋翼 PBL 智能体项目的网页原型。

## 运行

```bash
pnpm install
pnpm dev          # 开发模式，http://localhost:3100
pnpm build && pnpm start   # 生产模式
```

> 端口固定为 **3100**。请勿改用其他端口——教师端编辑的资源、题库、
> 诊断记录、快测与作业数据都保存在浏览器本地存储中，而本地存储是按
> 「地址 + 端口」隔离的，换端口会导致之前的数据看不到。

**最省事的启动方式**：直接双击项目根目录下的 `启动网页.command`，
它会在终端里执行 `pnpm dev` 并提示访问地址。

### 关闭服务

在运行中的终端窗口按 `Control + C`。

### 数据存在哪里

当前所有教师端的编辑（资源、题库）、诊断记录、课堂快测、预习任务、
作业与补练记录都保存在**浏览器本地存储**里，不会上传到服务器。

- 换浏览器或清除浏览器数据会导致这些内容丢失
- 换电脑、换端口同理
- 接入数据库后，这些数据改为服务端保存

## 目录

```
src/
  content/course.ts        课程内容结构：8 章 / 节 / 知识点层级、模块划分、专业变体、课程关系图
  content/resources/       44 节的四类资源（知识点标签 / 例题 / 易错点 / 案例）
  content/questions/       题库：87 道单选 / 判断 / 计算题
  components/app-state.tsx 全局状态：专业配置、当前专业、学习进度（浏览器本地存储）
  components/site-nav.tsx  顶部导航与视角切换
  components/agent-widget.tsx 学生端智能体悬浮窗
  components/agent-panel.tsx  通用对话面板（学生端 / 教师端共用）
  components/teacher-agent-widget.tsx 教师端教学助理悬浮窗
  app/api/chat/route.ts    对话接口（服务端持有 API Key，流式转发）
  app/api/teacher-chat/route.ts 教师端接口（注入学情摘要）
  app/student/layout.tsx   学生端布局，挂载智能体悬浮窗
  app/teacher/layout.tsx   教师端布局，挂载教学助理悬浮窗
  app/page.tsx             首页
  app/student/             学生端：课程地图、章节学习页
  app/student/diagnostic/  基础诊断测评（组卷、答题、判分、掌握图谱）
  app/student/profile/     我的学习状况
  app/student/quiz/        课堂快测（输入课堂码答题）
  app/student/resources/   分层资源推送（巩固 / 提升 / 拓展）
  app/student/tasks/       预习导航（任务、目标、完成标记、提问）
  app/student/homework/    作业作答、自动判分、错因分析与错题本
  app/student/practice/    个性化补练与效果追踪
  app/student/projects/    项目工坊：项目列表与工作台（PBL）
  app/teacher/             教师端：专业变体配置、模块划分、建设进度
  app/teacher/resources/   四类资源编辑
  app/teacher/questions/   题库管理（含拍照上传）
  app/teacher/diagnostics/ 诊断结果与学情
  app/teacher/quiz/        发起课堂快测、实时统计、投屏讲评
  app/teacher/push/        分层规则配置、覆盖统计、分层预览
  app/teacher/tasks/       发布预习任务、一键生成导学单、查看学生疑问
  app/teacher/homework/    布置作业、提交统计、错因分布、补练情况
  app/teacher/projects/    项目工坊：从模板创建项目、里程碑与进度
  lib/diagnostic.ts        抽题、判分与掌握度计算
  lib/quiz.ts              课堂快测：会话、实时同步、选项分布统计
  lib/push.ts              分层判定、知识点与资源匹配、覆盖统计
  lib/task.ts              预习任务、完成度、导学单生成
  lib/homework.ts          作业、自动判分、错因归因、补练生成
  lib/project.ts           项目工坊：项目、里程碑、进度、作品提交
  content/projects.ts      5 个电工技术项目模板
  lib/agent.ts             助教系统提示词与常见问题
  lib/knowledge.ts         课程知识库切分与关键词检索
  lib/agent-log.ts         学生提问留痕
  lib/teaching-digest.ts   学情摘要聚合
  lib/llm.ts               大模型调用与流式转发（含降级）
  app/courses/             课程关系图
```

## 当前已实现

- 课程内容骨架（前言 + 第 1–8 章，含节与子目）
- 五个模块的划分与三翼侧重标注
- 专业变体配置：为每个专业勾选可见章节，支持快捷范围（前 4/5/6/7/8 章）
- 学生端课程地图与章节学习页，含学习进度记录
- 四类资源内容：44 节全部内置初始内容，教师端可编辑
- 题库：87 道题（单选 47 / 判断 27 / 计算 13），覆盖 8 章
- 教师端题库管理：增删改题目，支持手机拍照上传题目配图
- 学生端章节页展示本节练习，可展开查看答案与解析
- 基础诊断测评：选章节范围自动组卷、答题、自动判分、知识点掌握图谱、错题回顾
- 学生端「我的学习状况」与教师端「诊断学情」视图
- 课堂快测：一键发起课堂码、学生作答、实时统计、选项分布、投屏讲评
- 分层资源推送：按掌握度分层匹配资源与练习，规则可在教师端配置
- 预习导航：任务发布、目标设定、导学单生成、学生完成标记与疑问回收
- 作业辅导：在线提交、自动判分、错因归因（知识性 / 方法性 / 粗心）、错题本
- 个性化补练：按错题知识点生成练习并追踪正确率变化
- 项目工坊（PBL）：驱动性问题 + 里程碑 + 探究记录 + 反思日志 + 作品提交
- 项目评价：按三翼设置评分点与权重的量规、学生自评、教师评分、三翼能力雷达图（自评与他评叠加对比）
- 学生端智能体：右下角悬浮窗，流式对话，回答基于课程资料并标出来源
- 教师端教学助理：归纳学生提问、定位易错点与薄弱知识点、找出错得最多的题、给出备课建议

## 大模型配置

学生端智能体需要配置一个大模型。在项目根目录的 `.env.local` 中填写：

```
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4/
LLM_API_KEY=你的Key
LLM_MODEL=glm-4.7-flash
LLM_MODEL_FALLBACKS=glm-4.5-flash,glm-4-flash
```

- 当前使用智谱 GLM 的免费模型，`glm-4.7-flash` 免费且能力最好。
- 免费模型高峰期可能返回 429，接口会自动降级到 `LLM_MODEL_FALLBACKS` 里的模型。
- `.env.local` 已被 `.gitignore` 忽略，Key 不会进入代码库；前端也拿不到 Key。
- 换成其他厂商只需改这三行（只要支持 OpenAI 兼容接口）。

## 部署到 Vercel

### 1. 推送到 GitHub

```bash
cd et-platform
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

`.env.local` 不会上传（已被忽略），Key 需要单独在 Vercel 里配置。

### 2. 在 Vercel 导入项目

打开 vercel.com → Add New → Project → 选择该仓库。
框架会被自动识别为 Next.js，构建命令和输出目录都不用改。

### 3. 配置环境变量

在项目的 Settings → Environment Variables 中添加：

| 名称 | 值 |
| --- | --- |
| `LLM_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4/` |
| `LLM_API_KEY` | 你的智谱 API Key |
| `LLM_MODEL` | `glm-4.7-flash` |
| `LLM_MODEL_FALLBACKS` | `glm-4.5-flash,glm-4-flash` |

添加后需要重新部署一次才会生效。

### 4. 部署

点击 Deploy，约一两分钟完成，会得到一个 `xxx.vercel.app` 的网址。

## 部署后的重要限制

本项目的数据（教师端编辑的资源与题库、诊断记录、课堂快测、预习任务、
作业与补练）目前保存在**浏览器本地存储**中，没有服务端数据库。部署到
Vercel 后依然如此，因此：

- 每个浏览器看到的是自己那一份数据，设备之间互不共享；
- 教师在电脑上改的内容，学生手机上不会出现；
- 课堂快测的实时统计只在**同一台电脑的不同标签页**之间同步，
  教师大屏和学生的手机之间不会互通。

结论：适合演示、单人试用和功能验收；要让真实班级使用，需要先把数据层
换成数据库（例如 Vercel Postgres / Neon / Supabase），再补上账号体系。

## 本地开发端口

本地请继续使用 `pnpm dev`（3100 端口）。换端口会导致浏览器本地存储对不上，
之前编辑的内容看起来会「消失」——数据还在，只是按地址和端口隔离存放。
- 课程关系图（前置 / 后续 / 相关，节点链接可后续配置）

## 待开发

见教师端「建设进度」面板，对应申报书图 2 的教学全流程：诊断测评、
任务与分层推送、小组讨论与课堂快测、作业与错题归因、实验复盘、个性化路径，
以及学生端与教师端两个智能体。

## 说明

- 资源与题库内容内置了一版初始材料，需由任课教师复核后使用。
- 教师端的修改目前保存在浏览器本地存储（localStorage），换设备不同步；后续接数据库时改为共享存储。
