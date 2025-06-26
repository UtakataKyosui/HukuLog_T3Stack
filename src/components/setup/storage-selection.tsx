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

export function StorageSelection() {
  const router = useRouter();
  const [selectedStorage, setSelectedStorage] = useState<"postgresql" | "notion" | null>(null);
  const [notionConfig, setNotionConfig] = useState({
    accessToken: "",
    clothingDatabaseId: "",
    outfitsDatabaseId: "",
  });
  const [isConfiguring, setIsConfiguring] = useState(false);

  const setupStorageMutation = api.userStorage.setupInitialStorage.useMutation({
    onSuccess: () => {
      router.push("/");
    },
    onError: (error) => {
      alert(`設定エラー: ${error.message}`);
      setIsConfiguring(false);
    },
  });

  const validateNotionMutation = api.userStorage.validateNotionConfiguration.useMutation({
    onSuccess: () => {
      // 検証成功後、実際にセットアップを実行
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

  const handleNotionSetup = () => {
    if (!notionConfig.accessToken.trim() || !notionConfig.clothingDatabaseId.trim() || !notionConfig.outfitsDatabaseId.trim()) {
      alert("すべてのNotionフィールドを入力してください");
      return;
    }

    setIsConfiguring(true);
    // まずNotionの設定を検証
    validateNotionMutation.mutate(notionConfig);
  };

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
                    <span className="text-yellow-600">⚡</span>
                    <span>初期設定が必要</span>
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

          {/* Notion選択時の設定フォーム */}
          {selectedStorage === "notion" && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <h4 className="mb-4 font-medium text-purple-800">Notion 設定</h4>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notion-token">Notion アクセストークン</Label>
                  <Input
                    id="notion-token"
                    type="password"
                    placeholder="secret_xxxxxxxxxxxxx"
                    value={notionConfig.accessToken}
                    onChange={(e) => setNotionConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-purple-600 text-xs">
                    Notion統合のInternal Integration Tokenを入力
                  </p>
                </div>

                <div>
                  <Label htmlFor="clothing-db">服データベースID</Label>
                  <Input
                    id="clothing-db"
                    type="text"
                    placeholder="1234567890abcdef1234567890abcdef"
                    value={notionConfig.clothingDatabaseId}
                    onChange={(e) => setNotionConfig(prev => ({ ...prev, clothingDatabaseId: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="outfits-db">コーデデータベースID</Label>
                  <Input
                    id="outfits-db"
                    type="text"
                    placeholder="abcdef1234567890abcdef1234567890"
                    value={notionConfig.outfitsDatabaseId}
                    onChange={(e) => setNotionConfig(prev => ({ ...prev, outfitsDatabaseId: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-yellow-800 text-xs">
                    💡 <strong>事前準備が必要です：</strong><br />
                    1. Notion統合を作成<br />
                    2. 服とコーデのデータベースを作成<br />
                    3. 統合をデータベースに招待<br />
                    <br />
                    詳細は<a href="/setup-guide" className="underline">セットアップガイド</a>を参照してください。
                  </p>
                </div>

                <Button
                  onClick={handleNotionSetup}
                  disabled={isConfiguring || !notionConfig.accessToken.trim() || !notionConfig.clothingDatabaseId.trim() || !notionConfig.outfitsDatabaseId.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isConfiguring ? "設定中..." : "Notionで始める"}
                </Button>
              </div>
            </div>
          )}

          {/* 初期選択の説明 */}
          {!selectedStorage && (
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