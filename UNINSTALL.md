# 紧急卸载插件指南

如果插件导致 Chrome 无法使用，请按照以下步骤操作：

## 方法 1：通过 Chrome 扩展页面卸载（推荐）

1. **打开 Chrome 扩展管理页面**：
   - 在地址栏输入：`chrome://extensions/`
   - 或者：菜单 → 更多工具 → 扩展程序

2. **找到"下载管理器"插件**：
   - 在扩展列表中找到"下载管理器"
   - 或者查找显示为"已解压的扩展程序"的项目

3. **卸载插件**：
   - 点击插件卡片右下角的"移除"按钮
   - 确认删除

## 方法 2：安全模式启动 Chrome（如果 Chrome 无法正常打开）

### macOS:
```bash
# 在终端中运行以下命令，以安全模式启动 Chrome（禁用所有扩展）
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-extensions
```

然后访问 `chrome://extensions/` 卸载插件。

### Windows:
```cmd
# 在命令提示符中运行
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-extensions
```

## 方法 3：手动删除扩展文件（macOS）

如果以上方法都不行，可以手动删除扩展文件：

```bash
# 1. 关闭 Chrome 浏览器（完全退出）

# 2. 删除扩展文件夹（替换 YOUR_PROFILE 为你的用户配置文件夹名，通常是 Default）
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Extensions/YOUR_EXTENSION_ID

# 3. 或者删除所有已解压的扩展（更安全）
# 查找包含你项目路径的扩展
grep -r "/Users/yanzzp/CodeProjects/yanzzp/chrome_plugins" ~/Library/Application\ Support/Google/Chrome/Default/Extensions/Preferences
```

## 方法 4：重置 Chrome（最后手段）

如果 Chrome 完全无法使用：

```bash
# macOS: 备份并删除用户数据（会清除所有扩展、书签、历史等）
mv ~/Library/Application\ Support/Google/Chrome ~/Library/Application\ Support/Google/Chrome.backup
```

⚠️ **警告**：这会删除所有 Chrome 数据（书签、历史、密码等），请谨慎使用！

## 快速查找扩展 ID

```bash
# 查找包含你项目路径的扩展
grep -r "download-manager\|下载管理器" ~/Library/Application\ Support/Google/Chrome/Default/Extensions/Preferences 2>/dev/null
```

## 预防措施

1. **开发时使用测试配置文件**：
   ```bash
   # 创建独立的 Chrome 测试配置
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/chrome-test-profile
   ```

2. **定期备份 Chrome 数据**

3. **在开发插件时，先测试基本功能再添加复杂特性**

## 联系支持

如果以上方法都无法解决问题，请：
1. 检查 Chrome 的错误日志
2. 尝试使用其他浏览器
3. 考虑重新安装 Chrome



