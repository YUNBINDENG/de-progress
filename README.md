# DE进度

一个适合 iPhone 主屏幕使用的沉浸式进度面板 PWA，用来记录年度进度、Working Holiday 进度、集签数据、税后薪资和每周工时。

线上地址：

https://dedddee.github.io/de-progress/

## 功能

- 年度进度与自定义项目进度追踪
- 项目可新增、编辑、删除、折叠显示
- 支持自定义图标、日期、颜色和今日呼吸提示
- 主题效果：Universe、Love、Rainy、Connect、Wormhole、Turbulence
- Data Statistics 数据统计区
- 集签进度、税后薪资、每周工时可添加和删除数据
- 图表按最新数据从左到右显示，并支持横向滑动查看
- 集签目标可自定义
- 总收入与总工时自动计算
- 支持添加到 iPhone 主屏幕后作为 App 使用

## 使用方式

1. 打开线上地址。
2. 点击右上角 `+` 添加新项目。
3. 点击项目卡片进入编辑。
4. 在 Data Statistics 中用 `+` 添加数据，用 `-` 删除最新数据。
5. 在 Safari 中选择“分享” -> “添加到主屏幕”，即可像 App 一样打开。

## 数据保存

数据保存在浏览器本地存储中，不需要登录账号，也不会上传到服务器。更换浏览器、清理 Safari 网站数据、删除主屏幕 App 后，本地数据可能会丢失。

## PWA 缓存说明

如果主屏幕版本没有及时更新，可以先关闭主屏幕 App，再用 Safari 打开线上地址刷新一次。如果仍然显示旧版本，删除主屏幕图标后重新添加即可。

## 文件结构

- `index.html`：应用结构
- `styles.css`：界面、主题、动效和响应式样式
- `app.js`：项目编辑、统计数据、图表和本地保存逻辑
- `service-worker.js`：PWA 离线缓存与更新逻辑
- `manifest.webmanifest`：主屏幕 App 配置

## 当前状态

这是一个静态 PWA 项目，部署在 GitHub Pages。
