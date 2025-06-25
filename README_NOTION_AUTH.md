# Notion認証機能実装ガイド

## 概要

BetterAuthの`genericOAuth`プラグインを使用して、Notionログイン機能を実装しました。

## 実装内容

### 1. 環境変数の追加

`.env.example`に以下を追加：

```bash
# Notion OAuth Provider (optional)
NOTION_CLIENT_ID=""
NOTION_CLIENT_SECRET=""
```

### 2. BetterAuth設定の更新

`src/lib/auth.ts`でNotionプロバイダーを追加：

```typescript
import { genericOAuth } from "better-auth/plugins/generic-oauth";

// plugins配列に追加
...(env.NOTION_CLIENT_ID && env.NOTION_CLIENT_SECRET
  ? [
      genericOAuth({
        config: [
          {
            providerId: "notion",
            clientId: env.NOTION_CLIENT_ID,
            clientSecret: env.NOTION_CLIENT_SECRET,
            authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
            tokenUrl: "https://api.notion.com/v1/oauth/token",
            userInfoUrl: "https://api.notion.com/v1/users/me",
            scopes: ["read"],
            pkce: false,
          },
        ],
      }),
    ]
  : []),
```

### 3. クライアント側プラグインの追加

`src/lib/auth-client.ts`に`genericOAuthClient`を追加：

```typescript
import { genericOAuthClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [anonymousClient(), passkeyClient(), genericOAuthClient()],
});
```

### 4. UI コンポーネントの更新

`src/components/auth/auth-form.tsx`にNotionログインボタンを追加：

```typescript
const handleNotionAuth = async () => {
  setIsLoading(true);
  try {
    await authClient.signIn.oauth2({
      providerId: "notion",
      callbackURL: "/setup-profile",
    });
  } catch (error) {
    console.error("Notion auth error:", error);
    alert("Notionでのログインに失敗しました。");
  } finally {
    setIsLoading(false);
  }
};
```

## Notion Integration設定

### 1. Notion Developer Dashboardでの設定

1. [Notion Integrations](https://www.notion.so/profile/integrations)にアクセス
2. 「New Integration」をクリック
3. 「Public」を選択
4. 以下の情報を設定：
   - **Name**: アプリケーション名
   - **Logo**: アプリケーションロゴ
   - **Description**: アプリケーションの説明
   - **Website**: アプリケーションのWebサイト
   - **Redirect URIs**: `http://localhost:3000/api/auth/callback/notion`

### 2. OAuth設定

Notionの認証フロー：

1. **Authorization URL**: `https://api.notion.com/v1/oauth/authorize`
2. **Token URL**: `https://api.notion.com/v1/oauth/token`
3. **User Info URL**: `https://api.notion.com/v1/users/me`
4. **Scopes**: `["read"]`

### 3. 必要なパラメータ

認証URL生成時に以下のパラメータが自動的に追加されます：

- `client_id`: Notion Client ID
- `redirect_uri`: リダイレクトURI
- `response_type`: `code`
- `owner`: `user`
- `state`: CSRF保護用ランダム文字列

## 使用方法

### 1. 環境変数の設定

`.env`ファイルを作成し、Notion OAuth認証情報を設定：

```bash
NOTION_CLIENT_ID="your_notion_client_id"
NOTION_CLIENT_SECRET="your_notion_client_secret"
```

### 2. アプリケーションの起動

```bash
npm run dev
```

### 3. ログインフローのテスト

1. `http://localhost:3000/auth`にアクセス
2. 「Notionで新規登録」または「Notionでログイン」をクリック
3. Notionの認証画面でワークスペースの選択と権限付与
4. 認証成功後、`/setup-profile`にリダイレクト

## トラブルシューティング

### よくある問題

1. **Redirect URI Mismatch**
   - Notion Integrationの設定でリダイレクトURIが正しく設定されているか確認
   - 開発環境: `http://localhost:3000/api/auth/callback/notion`

2. **Invalid Client**
   - `NOTION_CLIENT_ID`と`NOTION_CLIENT_SECRET`が正しく設定されているか確認

3. **Scope Error**
   - Notionで必要な権限が付与されているか確認

### デバッグ方法

開発者コンソールで認証フローのログを確認：

```javascript
// ブラウザのコンソールで確認
console.log("Notion auth error:", error);
```

## セキュリティ考慮事項

1. **環境変数の管理**
   - `.env`ファイルはGitにコミットしない
   - 本番環境では安全な方法で環境変数を設定

2. **HTTPS の使用**
   - 本番環境では必ずHTTPSを使用
   - Redirect URIもHTTPSで設定

3. **State パラメータ**
   - CSRFアタック防止のため、BetterAuthが自動的にstateパラメータを管理

## 参考資料

- [Better Auth - Generic OAuth](https://www.better-auth.com/docs/authentication/other-social-providers)
- [Notion API - Authorization](https://developers.notion.com/docs/authorization)
- [OAuth 2.0 仕様](https://oauth.net/2/)