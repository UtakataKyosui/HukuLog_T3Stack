# HukuLog_T3Stack 技術知見集

## アーキテクチャ決定記録（ADR）

### 認証システム設計

#### Better Auth + SimpleWebAuthn構成
- **選択**: Better Auth をベースに SimpleWebAuthn でPasskey機能を追加
- **理由**: 
  - Better Auth: Next.js App Routerに最適化された現代的な認証ライブラリ
  - SimpleWebAuthn: WebAuthn実装の複雑さを抽象化
  - セッション管理とJWTの柔軟な使い分けが可能
- **学習**: 当初NextAuth.jsを検討したが、App Routerとの相性とPasskey対応でBetter Authを採用

#### セッション戦略
- **実装**: Cookie-based session + Redis cache
- **理由**: 
  - サーバーサイドでの確実なセッション管理
  - Passkeyとの相性（WebAuthnはステートフル）
  - スケーリング時のセッション共有が容易

### データベース設計パターン

#### Drizzle ORM最適化
- **スキーマ設計**: ファイル分割による管理性向上
  ```typescript
  // src/server/db/schema/
  ├── users.ts      // ユーザー関連
  ├── items.ts      // 服装アイテム
  ├── outfits.ts    // コーディネート
  └── index.ts      // エクスポート統合
  ```

- **リレーション定義**: 型安全な関連性管理
  ```typescript
  // 効果的なパターン
  export const itemsRelations = relations(items, ({ one, many }) => ({
    owner: one(users, {
      fields: [items.userId],
      references: [users.id],
    }),
    outfitItems: many(outfitItems),
  }));
  ```

#### クエリ最適化パターン
- **N+1問題の回避**: `with` によるeager loading
  ```typescript
  // 良い例
  const itemsWithUser = await db.query.items.findMany({
    with: {
      owner: true,
      outfitItems: {
        with: {
          outfit: true
        }
      }
    }
  });
  ```

- **パフォーマンス**: インデックス戦略
  - `userId` にインデックス（アイテム検索）
  - `createdAt` にインデックス（時系列ソート）
  - 複合インデックス `(userId, category)` で絞り込み高速化

### tRPC実装パターン

#### ルーター構成
```typescript
// src/server/api/root.ts
export const appRouter = createTRPCRouter({
  auth: authRouter,
  items: itemsRouter,
  outfits: outfitsRouter,
  upload: uploadRouter,
});
```

#### プロシージャパターン
- **認証付きプロシージャ**: `protectedProcedure` で統一
- **入力検証**: Zodスキーマの再利用
- **エラーハンドリング**: `TRPCError` での一貫したエラー応答

```typescript
// 効果的なパターン
export const itemsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const item = await ctx.db.insert(items).values({
          ...input,
          userId: ctx.session.user.id,
        }).returning();
        return item[0];
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'アイテムの作成に失敗しました',
        });
      }
    }),
});
```

### フロントエンド設計パターン

#### Radix UI + TailwindCSS統合
- **コンポーネント設計**: 合成パターンの活用
  ```typescript
  // src/components/ui/button.tsx
  const Button = React.forwardRef<
    React.ElementRef<typeof Primitive.button>,
    React.ComponentPropsWithoutRef<typeof Primitive.button> & VariantProps<typeof buttonVariants>
  >(({ className, variant, size, ...props }, ref) => (
    <Primitive.button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ));
  ```

####状態管理戦略
- **サーバー状態**: tRPC + TanStack Query
- **クライアント状態**: React state（useState, useReducer）
- **グローバル状態**: Zustand（必要に応じて）

### 画像処理・アップロード

#### ファイルアップロード戦略
- **フロントエンド**: `input type="file"` + プレビュー機能
- **バリデーション**: クライアント＋サーバー両方で実装
- **最適化**: WebP変換、圧縮処理

```typescript
// 画像最適化パターン
const optimizeImage = async (file: File): Promise<File> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // 圧縮・リサイズ処理
  return new File([blob], 'optimized.webp', { type: 'image/webp' });
};
```

## 実装ベストプラクティス

### TypeScript活用
- **型定義**: Zodスキーマからの型推論を活用
  ```typescript
  // schema.ts
  export const itemSchema = z.object({
    name: z.string().min(1),
    category: z.enum(['tops', 'bottoms', 'shoes', 'accessories']),
  });
  
  export type Item = z.infer<typeof itemSchema>;
  ```

### エラーハンドリング
- **統一的なエラー処理**: ErrorBoundaryとtoast通知
- **ユーザーフレンドリーなメッセージ**: 技術的エラーの翻訳
- **ログ収集**: 本番環境でのエラー追跡

### パフォーマンス最適化
- **画像遅延読み込み**: Next.js `Image` コンポーネント活用
- **コード分割**: 動的インポートによるバンドルサイズ削減
- **キャッシュ戦略**: SWRパターンでのデータキャッシュ

## 避けるべきパターン（アンチパターン）

### データベース
- ❌ **N+1クエリ**: リレーションの個別取得
- ❌ **大きなペイロード**: 不要なフィールドの取得
- ❌ **インデックス不足**: WHERE句で使用するカラムのインデックス漏れ

### React/Next.js
- ❌ **useEffect乱用**: 不必要な副作用処理
- ❌ **状態の過度な分割**: 関連する状態の分散管理
- ❌ **Client Componentの過用**: Server Componentで十分な箇所での無駄な使用

### tRPC
- ❌ **巨大なペイロード**: 大量データの一括取得
- ❌ **認証チェック漏れ**: protectedProcedureの使い忘れ
- ❌ **エラー情報の漏洩**: 本番環境での詳細エラーメッセージ

## ライブラリ選定基準

### 採用基準
- ✅ **TypeScript対応**: First-class TypeScript support
- ✅ **メンテナンス状況**: 活発な開発とコミュニティ
- ✅ **バンドルサイズ**: アプリケーション全体への影響
- ✅ **学習コスト**: チーム（個人）での習得容易性

### 現在の主要ライブラリ評価
- **状態管理**: Zustand > Redux Toolkit（軽量性重視）
- **テスト**: Playwright > Cypress（速度と安定性）
- **フォーム**: React Hook Form（パフォーマンス重視）
- **日付処理**: date-fns > moment.js（バンドルサイズ）

## セキュリティ考慮事項

### 認証・認可
- **Passkey実装**: ブラウザ対応状況の継続監視
- **セッション管理**: 適切な有効期限とローテーション
- **CSRF対策**: SameSite Cookieの活用

### データ保護
- **画像データ**: 個人特定可能情報の取り扱い注意
- **暗号化**: 保存時・転送時の暗号化
- **アクセス制御**: ユーザー間のデータ分離

### フロントエンド
- **XSS対策**: ユーザー入力のサニタイゼーション
- **CSP**: Content Security Policyの適切な設定
- **HTTPS**: 全通信の暗号化

## Notionデータベース連携システム

### アーキテクチャ設計

#### マルチデータベース対応アーキテクチャ
- **概念**: PostgreSQL と Notion DB の選択可能なハイブリッド構成
- **設計原理**: 
  - ユーザーが好みに応じてデータ保存先を選択
  - 統一されたAPIインターフェースによる透過的なデータアクセス
  - 動的ルーティングによる切り替え処理の自動化

#### 実装パターン

##### 1. ユニバーサルルーター設計
```typescript
// src/server/api/routers/universal-clothing.ts
export const universalClothingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createClothingItemSchema)
    .mutation(async ({ ctx, input }) => {
      const userConfig = await getUserStorageConfig(ctx.session.user.id);
      
      if (userConfig.storageType === "notion") {
        return createNotionClothingItem(userConfig, input);
      } else {
        return createPostgreSQLClothingItem(ctx.db, input);
      }
    }),
});
```

##### 2. Notion API統合パターン
```typescript
// src/lib/notion-api.ts
export class NotionAPIClient {
  async createDatabasesInPage(pageId: string) {
    // 自動データベース作成の実装
    const clothingDb = await this.createDatabase(pageId, clothingSchema);
    const outfitsDb = await this.createDatabase(pageId, outfitsSchema);
    return { clothingDb, outfitsDb };
  }
}
```

### データベーススキーマ設計

#### Notion プロパティマッピング
服データベース（Clothing Items）:
- `Name` (Title) → PostgreSQL: `name`
- `Brand` (Rich Text) → PostgreSQL: `brand`
- `Color` (Select) → PostgreSQL: `color`
- `Size` (Select) → PostgreSQL: `size`
- `Season` (Multi-select) → PostgreSQL: `season[]`
- `Price` (Number) → PostgreSQL: `price`
- `Purchase Date` (Date) → PostgreSQL: `purchaseDate`
- `User ID` (Rich Text) → PostgreSQL: `userId`

コーデデータベース（Outfits）:
- `Name` (Title) → PostgreSQL: `name`
- `Description` (Rich Text) → PostgreSQL: `description`
- `Clothing Items` (Relation) → PostgreSQL: `outfitItems`関連テーブル
- `Occasion` (Select) → PostgreSQL: `occasion`
- `Season` (Multi-select) → PostgreSQL: `season[]`

### 自動セットアップシステム

#### 自動データベース作成フロー
1. **ページアクセス検証**: 指定されたNotionページへの書き込み権限確認
2. **スキーマ定義**: 事前定義されたデータベーススキーマの適用
3. **データベース作成**: APIを使用した自動データベース生成
4. **関連設定**: リレーション設定とプロパティ構成
5. **設定保存**: ユーザー設定への自動反映

#### エラーハンドリング戦略
```typescript
// Notion API エラーの分類と対応
export const handleNotionError = (error: any) => {
  if (error.code === "unauthorized") {
    return "統合のアクセス権限を確認してください";
  }
  if (error.code === "object_not_found") {
    return "指定されたページまたはデータベースが見つかりません";
  }
  return "Notion APIエラーが発生しました";
};
```

### UI/UX設計パターン

#### 段階的セットアップワザード
```typescript
// storage-selection-enhanced.tsx のUIパターン
const [setupStep, setSetupStep] = useState<"select" | "notion-config" | "creating">("select");

// 自動セットアップ vs 手動セットアップの分岐
const [useAutoSetup, setUseAutoSetup] = useState(true);
```

#### 視覚的フィードバック設計
- **プログレス表示**: データベース作成の進行状況
- **検証フィードバック**: リアルタイムでの設定検証
- **エラー状態**: 分かりやすいエラーメッセージと解決案

### セキュリティ考慮事項

#### アクセストークン管理
- **暗号化保存**: データベース内でのトークン暗号化
- **スコープ制限**: 最小権限の原則（読み取り・更新・挿入のみ）
- **定期的な検証**: トークンの有効性確認

#### データ分離
- **User ID フィルタリング**: 全てのNotion操作でユーザーID条件付与
- **アクセス制御**: 他ユーザーのデータへの不正アクセス防止
- **監査ログ**: データアクセスの記録と監視

### パフォーマンス最適化

#### Notion API制限対応
- **レート制限**: 1秒あたり3リクエストの制限遵守
- **バッチ処理**: 複数操作の効率的な実行
- **キャッシュ戦略**: 頻繁にアクセスするデータのキャッシュ

#### レスポンス最適化
```typescript
// Notion APIレスポンスの最適化
const optimizeNotionResponse = (rawData: any) => {
  return {
    id: rawData.id,
    name: rawData.properties.Name.title[0]?.plain_text,
    // 必要なフィールドのみ抽出
  };
};
```

### 運用・保守

#### 設定変更フロー
1. **現在の設定確認**: ユーザーの現在のストレージ設定取得
2. **データ移行オプション**: PostgreSQL ↔ Notion 間のデータ移行
3. **設定更新**: 新しいストレージ設定の適用
4. **検証**: 変更後の動作確認

#### トラブルシューティング
- **接続テスト**: Notion APIへの接続確認機能
- **設定検証**: データベースIDとアクセス権限の確認
- **データ同期**: 不整合が発生した場合の修復機能

### 今後の拡張予定

#### 機能追加候補
- **データ同期**: PostgreSQL と Notion 間の双方向同期
- **バックアップ機能**: Notionデータの定期バックアップ
- **分析機能**: Notion の数式機能を活用した高度な分析
- **テンプレート**: 様々な用途に対応したデータベーステンプレート

この実装により、ユーザーは自分の好みや用途に応じてデータストレージを選択でき、それぞれの利点を活用できるようになりました。