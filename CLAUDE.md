# HukuLog_T3Stack - Claude Code開発ガイド

## プロジェクト概要
**HukuLog_T3Stack**は、服とコーディネートを効率的に管理できるWebアプリケーションです。

- **技術スタック**: Next.js T3 Stack (TypeScript + tRPC + Drizzle ORM)
- **認証**: Better Auth + SimpleWebAuthn (Passkey対応)
- **データベース**: PostgreSQL
- **UI**: TailwindCSS + Radix UI
- **目標**: 直感的で使いやすい服管理・コーディネートアプリの提供

## 📚 知見管理システム

このプロジェクトでは以下のファイルで知見を体系的に管理しています：

### `.claude/context.md`
- プロジェクトの背景、目的、制約条件
- T3 Stack選定理由と技術的制約
- ビジネス要件とユーザーストーリー

### `.claude/project-knowledge.md`
- T3 Stack実装パターンや設計決定の知見
- 認証システム（Passkey）のベストプラクティス
- Drizzle ORMとtRPCの効果的な組み合わせ方
- TailwindCSS + Radix UIのコンポーネント設計

### `.claude/project-improvements.md`
- 過去の試行錯誤の記録
- パフォーマンス改善の履歴
- UI/UX改善プロセスと結果
- 技術的課題の解決記録

### `.claude/common-patterns.md`
- 頻繁に使用するT3 Stackパターン
- tRPCルーターの定型実装
- Drizzleスキーマの作成パターン
- Radix UIコンポーネントのカスタマイズ

### `.claude/debug-log.md`
- 重要なデバッグ記録
- T3 Stack特有の問題と解決法
- Passkeyやブラウザ認証関連のトラブルシューティング

## 🎯 開発指針

### Claude Codeとの協働ルール
1. **新しい実装や重要な決定**を行った際は、該当するファイルを必ず更新
2. **問題解決に30分以上要した場合**は`debug-log.md`に記録
3. **機能実装前**に既存の知見ファイルを確認
4. **UI/UXの変更**は必ずアクセシビリティを考慮

### コミットルール
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント更新
- style: UIスタイル変更
- refactor: リファクタリング
- test: テスト追加・修正
- chore: 設定やツール変更

## 🔄 将来計画
Loco.rsバックエンドAPI移行計画については [Issue #2](https://github.com/UtakataKyosui/HukuLog_T3Stack/issues/2) で管理しています。

---

**重要**: Claude Codeでの開発時は、必ず該当する知見ファイルを参照し、新たな学びを記録してください。