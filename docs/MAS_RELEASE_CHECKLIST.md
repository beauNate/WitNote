# NurseStation App Store 上架清单

本文档记录 NurseStation 上架 Mac App Store 所需的开发者账号配置和准备工作。

## 1. 准备工作

- [x] Apple Developer Program 账号 (已续费)
- [x] Mac 电脑 (macOS 14+)
- [x] Xcode (15+)
- [x] 证书 (Certificates)
  - [x] Apple Distribution: hu Huambo (STWPBZG6S7)
  - [x] Mac Installer Distribution: hu Huambo (STWPBZG6S7)
  - [x] Developer ID Application: hu Huambo (STWPBZG6S7)

## 2. App Store Connect 配置

### 创建 App
- **Name**: NurseStation
- **Primary Language**: English
- **Bundle ID**: `com.nursestation.app` (Explicit)
- **SKU**: nursestation-mac
- **User Access**: Full Access

### 创建 App ID (Identifier)
1. 登录 [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Identifiers -> Blue "+"
3. App IDs -> App
4. Description: NurseStation
5. Bundle ID: `com.nursestation.app` (Explicit)
6. Capabilities:
   - [x] App Sandbox
   - [x] Hardened Runtime

### 创建 Provisioning Profile
1. Profiles -> Blue "+"
2. Mac App Store
3. App ID: `com.nursestation.app`
4. Certificates: Select "Apple Distribution"
5. Profile Name: `NurseStation MAS Distribution`
6. Download -> `build/embedded.provisionprofile`

## 3. 构建配置 (package.json)

确保 `build.mas` 配置正确：

```json
"mas": {
  "type": "distribution",
  "category": "public.app-category.productivity",
  "entitlements": "build/entitlements.mas.plist",
  "entitlementsInherit": "build/entitlements.mas.inherit.plist",
  "provisioningProfile": "build/embedded.provisionprofile"
}
```

## 4. 元数据准备 (Metadata)

- **Name**: NurseStation
- **Subtitle**: Clinical Documentation Assistant
- **Bundle ID**: com.nursestation.app
- **SKU**: nursestation-mac
- **Primary Category**: Productivity
- **Secondary Category**: Medical
- **Privacy Policy URL**: https://github.com/hooosberg/WitNote/blob/main/PRIVACY.md
- **Support URL**: https://github.com/hooosberg/WitNote/issues
- **Copyright**: 2025 NurseStation Team

## 5. 截图准备 (Screenshots)

尺寸: 1280 x 800 (16:10) 或 2880 x 1800

1. 主界面 (Main Interface)
2. 专注模式 (Focus Mode)
3. 设置界面 (Settings)
4. AI 对话 (AI Chat)

## 6. 构建与上传

### 6.1 放置 Provisioning Profile
下载 `NurseStation MAS Distribution.provisionprofile` 并重命名为 `embedded.provisionprofile`，放入 `build/` 目录。

```bash
cp ~/Downloads/NurseStation_MAS_Distribution.provisionprofile build/embedded.provisionprofile
```

### 6.2 构建 MAS 版本

```bash
npm run build:mas
```

输出文件:
- `release/mas/NurseStation.app`
- `release/mas/NurseStation-1.2.3.pkg`

### 6.3 上传到 App Store Connect

使用 `Transporter` 应用或 `xcrun altool`。

**使用 altool:**
```bash
xcrun altool --upload-app -f release/mas/NurseStation-*.pkg -t macos -u YOUR_APPLE_ID
# 需要 App-Specific Password
```

## 7. 常见问题 (Troubleshooting)

### "Provisioning profile failed qualification"
- 检查 Profile 是否包含 "Apple Distribution" 证书
- 检查 Bundle ID 是否匹配
- 检查 `entitlements.mas.plist` 是否包含 `com.apple.security.app-sandbox`

### "Invalid Signature"
- 检查是否使用了正确的证书签名
- 检查是否禁用了 `hardenedRuntime` (MAS 构建通常需要 Sandbox 但不需要 Hardened Runtime，或者两者都支持)

### "Asset validation failed"
- 检查 Icon 是否包含所有尺寸 (16, 32, 128, 256, 512)
- 检查 Info.plist 版本号是否递增)

