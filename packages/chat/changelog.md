# changelog

## 0.7.1

- feat(chat): 重新开放注册
- feat(chat): 重新启用所有用户
- feat(chat): 支持设置使用 gpt4 模型

不再提供免费 key 的说明

最初这是一个兴趣驱动的个人项目，但至今为止成本已经太过高昂，每月超过了 $80，对接 GPT-4 之后成本至少上升 15 倍，这对于一个业余项目不再能接受。所以目前开放注册，但 OpenAI api key 必须自行在客户端设置才能使用，服务端不再包含默认的 api key。即便如此，如果有人对自托管感兴趣，仍然可以自行部署并在服务端设置 api key，这样其他使用者（例如家人）就不需要在客户端设置 api key 了。

## 0.7.0

- feat(chat): 要求指定 OpenAI api key 才能使用
- feat(chat-admin): 后台管理添加管理消息的功能

## 0.6.3

- docs: update error message for user disabled

## 0.6.2

- feat: 实现基本的用户管理后台页面

## 0.6.1

- chore: docker 镜像发布名称更新为 [rxliuli/chat](https://hub.docker.com/r/rxliuli/chat)
- feat: 增加 [更新日志页面](http://chat.ai-assist.moe/#/setting/changelog)
- fix: 修复 chatgpt api 请求错误的问题

## 0.6.0

- feat: 禁止开放注册，后续将仅允许在后台添加用户

## 0.5.7

- perf: 尝试不缓存 OpenAI client 实例，避免 context 过长（超过 150k）-- 等待下周验证
- fix: 修复 textarea 输入抖动问题
- fix: 修复输入框回车后没有重新计算高度的错误
- fix: 修正一些数据库查询的问题
- style: 禁止选中会话文字

## 0.5.4

- feat: 实现同步本地会话到远端
- perf: 返回会话、消息列表时删除无用的字段
- docs: update build config
- docs: 更新开发文档

## 0.5.3

- feat: 在注册页面给出更好的提示信息
- feat: 实现重置密码的功能

## 0.5.2

- fix: 修复会话时返回第一条消息很慢的问题
- feat: 支持同步会话、消息和 prompt
- perf: 使用缓存提升 token 校验相关的性能
- refactor: 实现会话、消息同步(wip)

## 0.5.1

- feat: 更新 i18n 配置
- refactor: 将系统消息放到 message 中而不是绑定到 session
- chore: 调整 docker 构建脚本及原生依赖的配置

## 0.5.0

- feat: 实现用户系统

## 0.4.8

- feat: 添加设置中的 openai api key 的本地化说明

## 0.4.7

- fix: 修复样式问题

## 0.4.6

- fix: 网络失败后允许重新生成
- feat: 支持自定义 openai key
- feat: 支持中断输出，支持重新开始输出
- chore: remove service worker
- fix: 修复一些细节性的 ui 错误
- chore: 调整发布脚本

## 0.4.0

- feat: 支持自定义提示语
- feat: 添加 google 分析，记录每一条消息消耗的 tokens（非消息内容），以供后续与 openai 的使用量进行对比

## 0.3.6

- feat: 更换消息提示的模式，将提示消息作为系统消息

## 0.3.5

- feat: 添加 google 分析功能的使用频率，避免无限制的增加 feature

## 0.3.2

- fix: 修复用户消息没有存储的错误
- fix: 修复提示词列表样式错误

## 0.3.1

- fix: 修复操作按钮列没有正确出现横向滚动条的问题

## 0.3.0

- feat: 支持导入导出会话
- feat: 快捷提示语支持虚拟无限滚动
- feat: 支持主动切换语言
- feat: 快捷提示语支持搜索英文 -- 替换为英文优先
- fix: 需要阻止并发发送消息
