"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function StorageSelectionEnhanced() {
  const router = useRouter();
  const [selectedStorage, setSelectedStorage] = useState<"postgresql" | "notion" | null>(null);
  const [notionConfig, setNotionConfig] = useState({
    accessToken: "",
    pageId: "",
    useAutoSetup: true,
    // 手動設定用
    clothingDatabaseId: "",
    outfitsDatabaseId: "",
  });
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [setupStep, setSetupStep] = useState<"select" | "notion-config" | "creating">("select");

  const setupStorageMutation = api.userStorage.setupInitialStorage.useMutation({
    onSuccess: () => {
      router.push("/");
    },
    onError: (error) => {
      alert(`設定エラー: ${error.message}`);
      setIsConfiguring(false);
      setSetupStep("notion-config");
    },
  });

  const autoSetupMutation = api.notionSetup.setupWithDatabaseCreation.useMutation({
    onSuccess: (result) => {
      alert(`成功！ページ「${result.pageTitle}」にデータベースを作成しました`);
      router.push("/");
    },
    onError: (error) => {
      alert(`自動セットアップエラー: ${error.message}`);
      setIsConfiguring(false);
      setSetupStep("notion-config");
    },
  });

  const validateNotionMutation = api.userStorage.validateNotionConfiguration.useMutation({
    onSuccess: () => {
      setupStorageMutation.mutate({
        storageType: "notion",
        notionAccessToken: notionConfig.accessToken,
        notionClothingDatabaseId: notionConfig.clothingDatabaseId,
        notionOutfitsDatabaseId: notionConfig.outfitsDatabaseId,
      });
    },
    onError: (error) => {
      alert(`Notion設定検証エラー: ${error.message}`);
      setIsConfiguring(false);
    },
  });

  const handlePostgreSQLSetup = () => {
    setIsConfiguring(true);
    setupStorageMutation.mutate({
      storageType: "postgresql",
    });
  };

  const handleNotionAutoSetup = () => {
    if (!notionConfig.accessToken.trim() || !notionConfig.pageId.trim()) {
      alert("アクセストークンとページIDを入力してください");
      return;
    }

    setIsConfiguring(true);
    setSetupStep("creating");
    autoSetupMutation.mutate({
      notionAccessToken: notionConfig.accessToken,
      pageId: notionConfig.pageId,
    });
  };

  const handleNotionManualSetup = () => {
    if (!notionConfig.accessToken.trim() || !notionConfig.clothingDatabaseId.trim() || !notionConfig.outfitsDatabaseId.trim()) {
      alert("すべてのNotionフィールドを入力してください");
      return;
    }

    setIsConfiguring(true);
    validateNotionMutation.mutate({
      notionAccessToken: notionConfig.accessToken,
      notionClothingDatabaseId: notionConfig.clothingDatabaseId,
      notionOutfitsDatabaseId: notionConfig.outfitsDatabaseId,
    });
  };

  const handleNotionConfigChange = (field: keyof typeof notionConfig, value: string | boolean) => {
    setNotionConfig(prev => ({ ...prev, [field]: value }));
  };

  if (setupStep === "creating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-theme-surface to-theme-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
              <h3 className="font-semibold text-lg">Notionデータベースを作成中...</h3>
              <p className="text-gray-600 text-sm">しばらくお待ちください</p>
            </div>
            <div className="space-y-2 text-left text-sm text-gray-600">
              <p>✓ ページアクセスの確認</p>
              <p>⏳ 服データベースの作成</p>
              <p>⏳ コーデデータベースの作成</p>
              <p>⏳ 設定の保存</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-theme-surface to-theme-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-bold text-2xl text-theme-text">
            🗄️ データ保存方法の選択
          </CardTitle>
          <CardDescription className="text-theme-text-secondary">
            服とコーデのデータをどこに保存するかを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {setupStep === "select" && (
            <>
              {/* ストレージ選択肢 */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedStorage === "postgresql" 
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedStorage("postgresql")}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        🐘
                      </div>
                      <h3 className="font-semibold text-lg">PostgreSQL</h3>
                      <p className="text-gray-600 text-sm">
                        アプリ内のデータベース
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span>高速なパフォーマンス</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span>追加設定不要</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span>完全な機能サポート</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span>初心者におすすめ</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedStorage === "notion" 
                      ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedStorage("notion")}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                        📝
                      </div>
                      <h3 className="font-semibold text-lg">Notion</h3>
                      <p className="text-gray-600 text-sm">
                        自分のNotionワークスペース
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span>データを完全に所有</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span>Notionで自由に編集</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span>他のツールと連携</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600">🚀</span>
                        <span>自動セットアップ対応</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* PostgreSQL選択時の説明 */}
              {selectedStorage === "postgresql" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-800">PostgreSQL を選択しました</h4>
                  <p className="mb-4 text-blue-700 text-sm">
                    アプリ内のデータベースにデータを保存します。設定不要で今すぐ使い始められます。
                  </p>
                  <Button
                    onClick={handlePostgreSQLSetup}
                    disabled={isConfiguring}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isConfiguring ? "設定中..." : "PostgreSQLで始める"}
                  </Button>
                </div>
              )}

              {/* Notion選択時のボタン */}
              {selectedStorage === "notion" && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <h4 className="mb-2 font-medium text-purple-800">Notion を選択しました</h4>
                  <p className="mb-4 text-purple-700 text-sm">
                    2つの方法でNotionの設定ができます：
                  </p>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => setSetupStep("notion-config")}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      🚀 自動セットアップ（推奨）
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setNotionConfig(prev => ({ ...prev, useAutoSetup: false }));
                        setSetupStep("notion-config");
                      }}
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      ⚙️ 手動設定
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {setupStep === "notion-config" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setSetupStep("select")}
                  variant="outline"
                  size="sm"
                >
                  ← 戻る
                </Button>
                <h3 className="font-semibold text-lg">
                  {notionConfig.useAutoSetup ? "🚀 Notion自動セットアップ" : "⚙️ Notion手動設定"}
                </h3>
              </div>

              {notionConfig.useAutoSetup ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h4 className="mb-2 font-medium text-green-800">自動セットアップについて</h4>
                    <ul className="space-y-1 text-green-700 text-sm">
                      <li>• 指定したNotionページに自動でデータベースを作成</li>
                      <li>• 必要なプロパティとオプションを全て設定</li>
                      <li>• 手動でのデータベース作成は不要</li>
                    </ul>
                  </div>

                  <div>
                    <Label htmlFor="notion-token-auto">Notion アクセストークン</Label>
                    <Input
                      id="notion-token-auto"
                      type="password"
                      placeholder="secret_xxxxxxxxxxxxx"
                      value={notionConfig.accessToken}
                      onChange={(e) => handleNotionConfigChange("accessToken", e.target.value)}
                      className="mt-1"
                    />
                    <p className="mt-1 text-purple-600 text-xs">
                      Notion統合のInternal Integration Tokenを入力
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notion-page-id">Notionページ ID</Label>
                    <Input
                      id="notion-page-id"
                      type="text"
                      placeholder="1234567890abcdef1234567890abcdef"
                      value={notionConfig.pageId}
                      onChange={(e) => handleNotionConfigChange("pageId", e.target.value)}
                      className="mt-1"
                    />
                    <p className="mt-1 text-purple-600 text-xs">
                      データベースを作成したいNotionページのID
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <h4 className="mb-2 font-medium text-blue-800 text-sm">📋 事前準備</h4>
                    <ol className="space-y-1 text-blue-700 text-xs">
                      <li>1. Notion統合を作成</li>
                      <li>2. 空のNotionページを作成</li>
                      <li>3. 統合をそのページに招待</li>
                      <li>4. ページIDを上記に入力</li>
                    </ol>
                  </div>

                  <Button
                    onClick={handleNotionAutoSetup}
                    disabled={isConfiguring || !notionConfig.accessToken.trim() || !notionConfig.pageId.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isConfiguring ? "セットアップ中..." : "🚀 自動セットアップを開始"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <h4 className="mb-2 font-medium text-yellow-800">手動設定について</h4>
                    <p className="text-yellow-700 text-sm">
                      事前にNotionでデータベースを作成し、そのIDを入力する方法です。
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="notion-token-manual">Notion アクセストークン</Label>
                    <Input
                      id="notion-token-manual"
                      type="password"
                      placeholder="secret_xxxxxxxxxxxxx"
                      value={notionConfig.accessToken}
                      onChange={(e) => handleNotionConfigChange("accessToken", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="clothing-db-manual">服データベースID</Label>
                    <Input
                      id="clothing-db-manual"
                      type="text"
                      placeholder="1234567890abcdef1234567890abcdef"
                      value={notionConfig.clothingDatabaseId}
                      onChange={(e) => handleNotionConfigChange("clothingDatabaseId", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="outfits-db-manual">コーデデータベースID</Label>
                    <Input
                      id="outfits-db-manual"
                      type="text"
                      placeholder="abcdef1234567890abcdef1234567890"
                      value={notionConfig.outfitsDatabaseId}
                      onChange={(e) => handleNotionConfigChange("outfitsDatabaseId", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleNotionManualSetup}
                    disabled={isConfiguring || !notionConfig.accessToken.trim() || !notionConfig.clothingDatabaseId.trim() || !notionConfig.outfitsDatabaseId.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isConfiguring ? "設定中..." : "⚙️ 手動設定で始める"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {setupStep === "select" && !selectedStorage && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-800">どちらを選ぶべき？</h4>
              <div className="space-y-2 text-gray-700 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">🐘</span>
                  <div>
                    <strong>PostgreSQL</strong>: 今すぐ使いたい・設定が面倒・初心者の方におすすめ
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">📝</span>
                  <div>
                    <strong>Notion</strong>: データを自分で管理したい・Notionユーザー・柔軟性を重視する方におすすめ
                  </div>
                </div>
              </div>
              
              <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
                <p className="text-blue-800 text-xs">
                  ℹ️ 後から設定画面で変更できますので、迷ったらPostgreSQLを選択してください。
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}