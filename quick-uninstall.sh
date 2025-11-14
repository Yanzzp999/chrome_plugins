#!/bin/bash

# Chrome 插件快速卸载脚本
# 使用方法：在终端运行：bash quick-uninstall.sh

echo "========================================="
echo "Chrome 插件紧急卸载工具"
echo "========================================="
echo ""

# 检查 Chrome 是否在运行
if pgrep -x "Google Chrome" > /dev/null; then
    echo "⚠️  检测到 Chrome 正在运行"
    echo "请先完全退出 Chrome（Cmd+Q），然后重新运行此脚本"
    echo ""
    read -p "是否要强制关闭 Chrome？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        killall "Google Chrome"
        sleep 2
        echo "✅ Chrome 已关闭"
    else
        echo "请手动关闭 Chrome 后重新运行此脚本"
        exit 1
    fi
fi

CHROME_PREFS="$HOME/Library/Application Support/Google/Chrome/Default/Preferences"

if [ ! -f "$CHROME_PREFS" ]; then
    echo "❌ 找不到 Chrome 配置文件"
    exit 1
fi

echo "正在查找已解压的扩展..."
echo ""

# 查找包含项目路径的扩展
if grep -q "/Users/yanzzp/CodeProjects/yanzzp/chrome_plugins" "$CHROME_PREFS" 2>/dev/null; then
    echo "✅ 找到包含项目路径的扩展"
    echo ""
    echo "正在备份并清理扩展配置..."
    
    # 备份 Preferences 文件
    cp "$CHROME_PREFS" "$CHROME_PREFS.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ 已备份配置文件"
    
    # 使用 Python 或 Node.js 清理 JSON（如果安装了的话）
    # 这里提供一个简单的 sed 方法（可能不够精确）
    echo ""
    echo "⚠️  需要手动编辑 Preferences 文件来移除扩展"
    echo ""
    echo "方法 1：使用文本编辑器"
    echo "   打开文件：$CHROME_PREFS"
    echo "   搜索 'download-manager' 或项目路径"
    echo "   删除包含该路径的整个扩展配置块"
    echo ""
    echo "方法 2：使用 Chrome 安全模式"
    echo "   运行命令："
    echo "   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --disable-extensions"
    echo "   然后访问 chrome://extensions/ 卸载插件"
    echo ""
else
    echo "ℹ️  未在配置文件中找到项目路径"
    echo "   扩展可能已经卸载，或者使用了不同的加载方式"
fi

echo ""
echo "========================================="
echo "建议操作："
echo "1. 使用安全模式启动 Chrome："
echo "   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --disable-extensions"
echo ""
echo "2. 访问 chrome://extensions/ 手动卸载"
echo ""
echo "3. 如果 Chrome 完全无法启动，考虑重置："
echo "   mv ~/Library/Application\\ Support/Google/Chrome ~/Library/Application\\ Support/Google/Chrome.backup"
echo "========================================="



