# Notion連携セットアップガイド

HukuLog_T3StackでNotionデータベースと連携し、服とコーデのデータを保存する機能の設定方法を説明します。

## 📋 前提条件

- Notionアカウント
- Notion API統合の作成権限
- HukuLog_T3StackアプリへのNotionアカウントでのログイン

## 🚀 セットアップ手順

### 1. Notion統合の作成

1. [Notion Developers](https://developers.notion.com/)にアクセス
2. 「My integrations」 → 「Create new integration」をクリック
3. 統合情報を入力：
   - **Name**: `HukuLog T3 Stack`
   - **Associated workspace**: データを保存したいワークスペースを選択
   - **Type**: `Internal`

4. 作成後、以下の情報を記録：
   - **Integration Token** (Secrets タブ内)
   - **Client ID** (OAuth タブ内)
   - **Client Secret** (OAuth タブ内)

### 2. OAuth設定

OAuth タブで以下を設定：

- **Redirect URLs**: 
  - 開発環境: `http://localhost:3000/api/auth/callback/notion`
  - 本番環境: `https://yourdomain.com/api/auth/callback/notion`

- **Scopes**: 
  - ✅ `Read content`
  - ✅ `Update content`
  - ✅ `Insert content`

### 3. 環境変数の設定

`.env.local`ファイルに以下を追加：

```bash
# Notion OAuth設定
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

# Notionデータベース設定（後で設定）
NOTION_DATABASE_IDS=clothing_db_id,outfits_db_id
```

### 4. Notionワークスペースでデータベースを作成

#### 4.1 服データベース（Clothing Items）の作成

1. Notionで新しいページを作成
2. データベースを追加
3. 以下のプロパティを作成：

| プロパティ名 | タイプ | 設定 |
|-------------|--------|------|
| Name | Title | - |
| Brand | Rich Text | - |
| Color | Select | 任意の色オプション |
| Size | Select | XS, S, M, L, XL, XXL等 |
| Season | Multi-select | Spring, Summer, Fall, Winter, All Season |
| Price | Number | Format: Japanese yen |
| Purchase Date | Date | - |
| Notes | Rich Text | - |
| Tags | Multi-select | - |
| User ID | Rich Text | - |
| Image | Files & Media | - |

#### 4.2 コーデデータベース（Outfits）の作成

1. 新しいページでデータベースを作成
2. 以下のプロパティを作成：

| プロパティ名 | タイプ | 設定 |
|-------------|--------|------|
| Name | Title | - |
| Description | Rich Text | - |
| Clothing Items | Relation | 服データベースとの関連 |
| Occasion | Select | Casual, Work, Formal, Party, Date, Travel, Sports |
| Season | Multi-select | Spring, Summer, Fall, Winter, All Season |
| Rating | Select | ⭐, ⭐⭐, ⭐⭐⭐, ⭐⭐⭐⭐, ⭐⭐⭐⭐⭐ |
| Last Worn | Date | - |
| Tags | Multi-select | - |
| User ID | Rich Text | - |

### 5. データベースへの統合アクセス権付与

各データベースで：

1. データベースの「...」メニューをクリック
2. 「Add connections」を選択
3. 作成したHukuLog統合を選択して招待

### 6. データベースIDの取得

1. 各データベースのURLをコピー
2. URL末尾の32文字の文字列がデータベースID

```
https://notion.so/your-workspace/1234567890abcdef1234567890abcdef?v=...
                                ↑ここがデータベースID
```

### 7. 環境変数の完成

`.env.local`を更新：

```bash
# Notion OAuth設定
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

# Notionデータベース設定
NOTION_DATABASE_IDS=clothing_database_id,outfits_database_id
```

## 🔧 使用方法

### 1. Notionでログイン

1. HukuLogアプリでログイン画面にアクセス
2. 「Notionでログイン」ボタンをクリック
3. Notionでの認証を完了

### 2. 服データの保存

- 服追加フォームで「Notionに保存」オプションを選択
- データは自動的に設定されたNotionデータベースに保存

### 3. コーデデータの保存

- コーデ作成フォームで「Notionに保存」オプションを選択
- 関連する服データも自動的に関連付け

## 🔒 セキュリティとプライバシー

### データの分離

- `User ID`プロパティによりユーザーごとにデータを分離
- 他のユーザーのデータは表示・操作不可

### アクセス制御

- Notion統合は最小限の権限のみ付与
- データの読み取り・更新・挿入のみ可能
- データベース構造の変更は不可

### データの所有権

- すべてのデータはユーザーのNotionワークスペースに保存
- ユーザーが完全に制御可能
- HukuLogサーバーには一時的なアクセストークンのみ保存

## 🚨 トラブルシューティング

### よくある問題

#### 1. 「データベースが見つかりません」エラー

**原因**: 統合にデータベースへのアクセス権がない

**解決方法**:
1. Notionでデータベースの「...」メニューをクリック
2. 「Add connections」→ HukuLog統合を選択

#### 2. 「プロパティが見つかりません」エラー

**原因**: データベースのプロパティ名・タイプが仕様と異なる

**解決方法**:
1. 上記の表と完全に一致するようプロパティを修正
2. 特に大文字小文字、スペースに注意

#### 3. 「認証エラー」

**原因**: OAuth設定やトークンの問題

**解決方法**:
1. Notion Developersで統合設定を確認
2. Redirect URLが正しいか確認
3. 環境変数が正しく設定されているか確認

#### 4. データが表示されない

**原因**: User IDの不一致やフィルター設定

**解決方法**:
1. Notionでデータの User IDプロパティを確認
2. ログインユーザーのIDと一致しているか確認

## 📞 サポート

問題が解決しない場合：

1. [GitHub Issues](https://github.com/UtakataKyosui/HukuLog_T3Stack/issues)で報告
2. エラーメッセージと設定内容を詳細に記載
3. 可能であればスクリーンショットも添付

## 🔄 定期メンテナンス

### 月次チェック項目

- [ ] Notion統合の有効期限確認
- [ ] データベースのバックアップ
- [ ] 不要なデータの整理
- [ ] アクセス権限の見直し

### アップデート時の注意

- 新機能追加時はデータベーススキーマの更新が必要な場合があります
- アップデート前に必ずバックアップを取得してください

---

**最終更新**: 2025-06-25
**バージョン**: v1.0.0