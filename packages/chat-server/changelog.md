# changelog

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
