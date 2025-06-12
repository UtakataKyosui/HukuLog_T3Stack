# 服管理アプリ - 開発者向けドキュメント

## 概要

このプロジェクトは、服とコーディネートの管理を効率的に行うWebアプリケーションです。T3 Stackをベースとして構築されており、モダンなWeb開発技術を活用しています。

## 技術スタック

### フロントエンド
- **Next.js 15** - React フレームワーク（App Router使用）
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS v4** - スタイリング
- **Biome** - リンティング・フォーマッティング

### バックエンド
- **tRPC** - 型安全なAPI層
- **Drizzle ORM** - データベースORM
- **PostgreSQL** - データベース
- **NextAuth.js** - 認証システム（Google OAuth + Passkey対応）

### PWA・機能
- **Service Worker** - オフライン対応
- **Web Push通知** - プッシュ通知機能
- **PWA対応** - アプリライクな体験

### テスト
- **Playwright** - E2Eテスト

## セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL
- npm または yarn

### インストール手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd wardrobe-manager
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wardrobe_db"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App Settings
NEXT_PUBLIC_APP_NAME="服管理アプリ"
NEXT_PUBLIC_APP_DESCRIPTION="服とコーディネートを効率的に管理"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Push Notifications (Optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
```

4. **データベースのセットアップ**
```bash
# データベースの起動（Docker使用の場合）
./start-database.sh

# マイグレーションの生成と実行
npm run db:generate
npm run db:migrate

# 初期データの投入（オプション）
npm run db:seed
```

5. **開発サーバーの起動**
```bash
npm run dev
```

## 開発コマンド

### 基本コマンド
```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm run start

# プレビュー（ビルド + 起動）
npm run preview
```

### コード品質
```bash
# Biomeチェック（リント + フォーマット）
npm run check

# 自動修正
npm run check:write

# 危険な修正も含む
npm run check:unsafe

# TypeScriptの型チェック
npm run typecheck
```

### データベース
```bash
# マイグレーション生成
npm run db:generate

# マイグレーション実行
npm run db:migrate

# スキーマ直接プッシュ（開発時のみ）
npm run db:push

# Drizzle Studio（データベースGUI）
npm run db:studio
```

### テスト
```bash
# Playwrightテスト実行
npm run test:e2e

# Playwrightテスト（ヘッドレスモード）
npm run test:e2e:headless

# Playwrightレポート表示
npm run test:e2e:report
```

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── _components/        # アプリ共通コンポーネント
│   ├── api/               # API Routes
│   ├── login/             # ログインページ
│   ├── outfits/           # コーディネート機能
│   ├── settings/          # 設定ページ
│   ├── subscription/      # サブスクリプション機能
│   ├── wardrobe/          # 服管理機能
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx          # ホームページ
├── components/            # 再利用可能コンポーネント
│   ├── auth/             # 認証関連
│   ├── providers/        # Context Providers
│   └── ui/               # UIコンポーネント
├── lib/                  # ユーティリティ
├── server/               # サーバーサイドコード
│   ├── api/              # tRPC API
│   ├── auth.ts           # 認証設定
│   └── db/               # データベース設定
├── styles/               # グローバルスタイル
├── trpc/                 # tRPCクライアント設定
└── env.js               # 環境変数バリデーション
```

## データベース設計

### 主要テーブル

#### workspace_user
ユーザー情報を管理
- id, name, email, image, createdAt, updatedAt

#### workspace_clothing_category
服のカテゴリ（トップス、ボトムスなど）
- id, name, type, userId, createdAt

#### workspace_clothing_item
個別の服のデータ
- id, name, brand, color, size, categoryId, season, imageUrl, price, purchaseDate, notes, tags, userId, createdAt, updatedAt

#### workspace_outfit
コーディネート情報
- id, name, description, occasion, season, rating, lastWorn, tags, userId, createdAt, updatedAt

#### workspace_outfit_item
コーディネートと服の関連
- outfitId, clothingItemId

## 認証システム

### 対応認証方式
1. **Google OAuth** - Googleアカウントでのログイン
2. **Passkey** - WebAuthn を使用したパスワードレス認証

### セキュリティ機能
- セッション管理
- CSRF保護
- 入力値のバリデーション
- SQLインジェクション対策（Drizzle ORM）

## API設計

tRPCを使用した型安全なAPI設計を採用。

### 主要ルーター
- `clothing` - 服管理（CRUD操作）
- `outfit` - コーディネート管理
- `passkey` - パスキー認証
- `subscription` - サブスクリプション管理

### 使用例
```typescript
// クライアントサイド
const { data: clothes } = api.clothing.getAll.useQuery();
const createClothing = api.clothing.create.useMutation();

// サーバーサイド
const clothes = await api.clothing.getAll();
```

## PWA機能

### Service Worker
- オフラインキャッシュ
- バックグラウンド同期
- プッシュ通知受信

### Manifest
- インストール可能なアプリ
- アプリアイコン設定
- 画面向き設定

## 環境設定

### 開発環境
- ホットリロード対応
- 詳細なエラー表示
- 開発用データベース

### 本番環境
- コード最適化
- 静的アセット配信
- セキュリティヘッダー

## デプロイ

### Vercel デプロイ
```bash
# Vercelにデプロイ
npm run build
npx vercel deploy
```

### Docker デプロイ
```bash
# Dockerイメージビルド
docker build -t wardrobe-manager .

# コンテナ実行
docker run -p 3000:3000 wardrobe-manager
```

## トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   - DATABASE_URLが正しく設定されているか確認
   - PostgreSQLサーバーが起動しているか確認

2. **認証エラー**
   - BETTER_AUTH_SECRETが設定されているか確認
   - Google OAuth の設定が正しいか確認

3. **ビルドエラー**
   - 型エラーがないか `npm run typecheck` で確認
   - Biomeエラーがないか `npm run check` で確認

### ログ確認
```bash
# 開発サーバーログ
npm run dev -- --verbose

# データベースログ（Drizzle Studio）
npm run db:studio
```

## コントリビューション

1. フィーチャーブランチを作成
2. コードの変更
3. テストの実行と確認
4. コードレビュー用のPR作成

### コーディング規約
- TypeScript strict モードを使用
- Biome設定に従ったフォーマッティング
- tRPCの型安全性を活用
- E2Eテストの追加

## パフォーマンス最適化

### フロントエンド
- Next.js App Router による自動最適化
- React 19 の concurrent features
- 画像最適化（next/image）
- Bundle サイズ最適化

### バックエンド
- データベースインデックス最適化
- tRPC による効率的なデータフェッチ
- キャッシング戦略

## セキュリティ考慮事項

- 入力値のサニタイゼーション
- XSS攻撃対策
- CSRF攻撃対策
- SQLインジェクション対策
- セキュリティヘッダーの設定