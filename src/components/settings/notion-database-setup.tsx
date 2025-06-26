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

interface NotionDatabaseSetupProps {
  onDatabasesConfigured: (config: {
    clothingDatabaseId: string;
    outfitsDatabaseId: string;
  }) => void;
}

export function NotionDatabaseSetup({
  onDatabasesConfigured,
}: NotionDatabaseSetupProps) {
  const [clothingDatabaseId, setClothingDatabaseId] = useState("");
  const [outfitsDatabaseId, setOutfitsDatabaseId] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleSave = () => {
    if (!clothingDatabaseId.trim() || !outfitsDatabaseId.trim()) {
      alert("両方のデータベースIDを入力してください");
      return;
    }

    setIsConfiguring(true);
    onDatabasesConfigured({
      clothingDatabaseId: clothingDatabaseId.trim(),
      outfitsDatabaseId: outfitsDatabaseId.trim(),
    });
    setIsConfiguring(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Notionデータベース設定</CardTitle>
        <CardDescription>
          服とコーデを保存するNotionデータベースのIDを設定してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 設定手順の説明 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-3 font-medium text-blue-800">設定手順</h4>
          <ol className="space-y-2 text-blue-700 text-sm">
            <li>1. Notionで新しいページを作成</li>
            <li>2. 以下の2つのデータベースを作成：</li>
            <li className="ml-4">• 服データベース（Clothing Items）</li>
            <li className="ml-4">• コーデデータベース（Outfits）</li>
            <li>3. 各データベースのIDをURLから取得</li>
            <li>4. 下記のフィールドに入力して保存</li>
          </ol>
        </div>

        {/* データベーススキーマの説明 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-3 font-medium text-green-800">
              👕 服データベース必須プロパティ
            </h4>
            <ul className="space-y-1 text-green-700 text-xs">
              <li>• Name (Title)</li>
              <li>• Brand (Rich Text)</li>
              <li>• Color (Select)</li>
              <li>• Size (Select)</li>
              <li>• Season (Multi-select)</li>
              <li>• Price (Number)</li>
              <li>• Purchase Date (Date)</li>
              <li>• Notes (Rich Text)</li>
              <li>• Tags (Multi-select)</li>
              <li>• User ID (Rich Text)</li>
              <li>• Image (Files & Media)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 font-medium text-purple-800">
              👔 コーデデータベース必須プロパティ
            </h4>
            <ul className="space-y-1 text-purple-700 text-xs">
              <li>• Name (Title)</li>
              <li>• Description (Rich Text)</li>
              <li>• Clothing Items (Relation)</li>
              <li>• Occasion (Select)</li>
              <li>• Season (Multi-select)</li>
              <li>• Rating (Select)</li>
              <li>• Last Worn (Date)</li>
              <li>• Tags (Multi-select)</li>
              <li>• User ID (Rich Text)</li>
            </ul>
          </div>
        </div>

        {/* データベースID入力フィールド */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="clothing-db">👕 服データベースID</Label>
            <Input
              id="clothing-db"
              type="text"
              placeholder="例: 1234567890abcdef1234567890abcdef"
              value={clothingDatabaseId}
              onChange={(e) => setClothingDatabaseId(e.target.value)}
              className="mt-1"
            />
            <p className="mt-1 text-slate-600 text-xs">
              NotionのデータベースURL末尾にある32文字のID
            </p>
          </div>

          <div>
            <Label htmlFor="outfits-db">👔 コーデデータベースID</Label>
            <Input
              id="outfits-db"
              type="text"
              placeholder="例: abcdef1234567890abcdef1234567890"
              value={outfitsDatabaseId}
              onChange={(e) => setOutfitsDatabaseId(e.target.value)}
              className="mt-1"
            />
            <p className="mt-1 text-slate-600 text-xs">
              NotionのデータベースURL末尾にある32文字のID
            </p>
          </div>
        </div>

        {/* データベースIDの取得方法 */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="mb-2 font-medium text-yellow-800 text-sm">
            💡 データベースIDの取得方法
          </h4>
          <p className="text-yellow-700 text-xs">
            NotionでデータベースのURLを確認：<br />
            <code className="bg-yellow-100 px-1">
              https://notion.so/your-workspace/<strong>1234567890abcdef1234567890abcdef</strong>?v=...
            </code>
            <br />
            太字部分がデータベースIDです。
          </p>
        </div>

        {/* 保存ボタン */}
        <Button
          onClick={handleSave}
          disabled={
            isConfiguring || !clothingDatabaseId.trim() || !outfitsDatabaseId.trim()
          }
          className="w-full"
        >
          {isConfiguring ? "設定中..." : "📊 データベース設定を保存"}
        </Button>

        {/* 注意事項 */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 font-medium text-red-800 text-sm">⚠️ 重要な注意事項</h4>
          <ul className="space-y-1 text-red-700 text-xs">
            <li>• データベースにはNotionアプリケーションのアクセス権が必要です</li>
            <li>• プロパティ名とタイプは上記の仕様と完全に一致させてください</li>
            <li>• User IDプロパティはプライバシー保護のため重要です</li>
            <li>• 既存データがある場合は事前にバックアップを取ってください</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}