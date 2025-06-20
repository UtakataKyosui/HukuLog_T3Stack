# HukuLog_T3Stack 🎯

> **服管理アプリ - Next.js T3 Stack Edition**

[![GitHub Issues](https://img.shields.io/github/issues/UtakataKyosui/HukuLog_T3Stack)](https://github.com/UtakataKyosui/HukuLog_T3Stack/issues)
[![GitHub Stars](https://img.shields.io/github/stars/UtakataKyosui/HukuLog_T3Stack)](https://github.com/UtakataKyosui/HukuLog_T3Stack/stargazers)

服とコーディネートを効率的に管理できるWebアプリケーションです。

## 📋 リポジトリ統合履歴

このリポジトリは複数の服管理アプリプロジェクトを統合したものです：

### 統合戦略 (2025-06-20 完了)
- ✅ **HukuLog (元)** → [アーカイブ済み](https://github.com/UtakataKyosui/HukuLog)
- ✅ **ClaudeCoded-DigitalCloset** → **HukuLog_T3Stack** にリネーム
- ✅ **DigitalCloset-WebApp** → 削除済み

### 移植済み要素
- ✅ GitHub Actions ワークフロー
- ✅ Issue/PR テンプレート
- ✅ データベーススキーマ設計（参考）
- ✅ WebAuthn認証実装の知見

## 🚀 技術スタック

### 現在の構成 (T3 Stack)
- **フレームワーク**: Next.js 15.2.3
- **言語**: TypeScript 5.8.2
- **スタイリング**: TailwindCSS 4.0.15
- **API**: tRPC 11.0.0
- **データベースORM**: Drizzle ORM 0.41.0
- **認証**: Better Auth + SimpleWebAuthn
- **データベース**: PostgreSQL

### 開発ツール
- **リンター**: Biome 1.9.4
- **テスト**: Playwright
- **UI Components**: Radix UI
- **バリデーション**: Zod

## 📱 主な機能

### 🧥 服の管理
- **服の登録・編集・削除** - 写真、ブランド、色、サイズ、購入価格などの詳細情報を記録
- **カテゴリ分類** - トップス、ボトムス、アウター、靴、アクセサリーなどで分類
- **季節管理** - 春夏秋冬、オールシーズンでの季節分け
- **タグ機能** - 自由なタグ付けで検索や整理が簡単
- **メモ機能** - 着こなしのコツや思い出を記録

### 👗 コーディネート管理
- **コーデ作成** - 登録した服を組み合わせてコーディネートを作成
- **シーン設定** - カジュアル、フォーマル、デート、仕事などのシーン分け
- **評価システム** - 5段階の星評価でお気に入り度を記録
- **着用履歴** - 最後に着用した日付を記録して重複を防止
- **コーデ検索** - タグやシーンで簡単に検索

### 🔐 セキュリティ
- **Google認証** - Googleアカウントで簡単ログイン
- **Passkey対応** - パスワードレスでより安全な認証
- **プライベート** - あなたのデータは他の人からは見えません

## 🛠️ 開発環境

### 前提条件
- Node.js 20+
- PostgreSQL
- Docker (推奨)

### セットアップ

```bash
# リポジトリクローン
git clone https://github.com/UtakataKyosui/HukuLog_T3Stack.git
cd HukuLog_T3Stack

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .env ファイルを編集

# データベース起動 (Docker)
./start-database.sh

# データベースマイグレーション
npm run db:push

# 開発サーバー起動
npm run dev
```

### 利用可能なスクリプト

```bash
# 開発
npm run dev          # 開発サーバー起動
npm run dev:turbo    # Turbopack使用

# ビルド・デプロイ
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動

# データベース
npm run db:generate  # マイグレーションファイル生成
npm run db:migrate   # マイグレーション実行
npm run db:push      # スキーマ同期
npm run db:studio    # Drizzle Studio起動

# コード品質
npm run check        # Biome チェック
npm run check:write  # Biome 自動修正
npm run typecheck    # TypeScript チェック

# テスト
npm run test         # Playwright テスト実行
npm run test:ui      # テストUI起動
```

## 🔮 将来の計画

### Phase 1: T3 Stack開発継続 (現在)
- 🟢 現在のNext.js フルスタック構成での機能開発に集中
- 服管理・コーディネート機能の充実
- UIコンポーネントの改善

### Phase 2: Loco.rs移行検討 (将来)
- 🟡 パフォーマンス・スケーラビリティが必要になった場合
- バックエンドAPIをRust (Loco.rs) で実装
- フロントエンドとバックエンドの分離

詳細な移行計画は [Issue #2](https://github.com/UtakataKyosui/HukuLog_T3Stack/issues/2) で管理しています。

## 📞 サポート

### Contributing
Issue や Pull Request をお待ちしています！

### お問い合わせ
- **GitHub Issues**: [新しいIssueを作成](https://github.com/UtakataKyosui/HukuLog_T3Stack/issues/new/choose)
- **開発者**: [@UtakataKyosui](https://github.com/UtakataKyosui)

## 📄 ライセンス

このプロジェクトはMITライセンスのもとで公開されています。

---

**👔 素敵なコーディネートライフをお楽しみください！**