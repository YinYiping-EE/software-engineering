# 前端代码规范

主要参考来源：[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)，并结合 [Vue 单文件组件文档](https://vuejs.org/guide/scaling-up/sfc.html) 做项目适配。本项目采用以下规则，不宣称完整遵循 Google 规范的所有细节。

1. 使用 UTF-8、2 个空格缩进、ES 模块；JavaScript 普通字符串优先单引号，语句使用分号。
2. 变量和函数使用 lowerCamelCase，Vue 组件使用 PascalCase；样式类使用有意义的 kebab-case。
3. 使用 `const` 声明不重新赋值的绑定；状态通过 Vue `ref` 和 `computed` 管理。
4. 组件遵循 script、template 顺序，公共样式集中在样式文件。复杂模板和长属性应在后续修改时拆行以便阅读。
5. 计算请求只发送算式。前端不得计算最终答案、执行用户代码或以客户端缓存代替数据库。
6. 请求使用相对 `/api` 路径，检查 HTTP 状态，并呈现后端错误。禁用重复提交，异步列表更新以最近一次请求为准。
7. 为输入框和图标按钮提供可访问名称，保留键盘操作和焦点样式；桌面和手机布局均需检查。
8. 注释解释设计原因，避免重复逐行描述。配置、启动方式和接口变化同步更新 README。

项目适配：Vite 配置允许默认导出；Vue 模板可使用中文界面文案；SQL 等后端内容不属于此规范的范围。
