"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function StorageSettings() {
	const [selectedStorage, setSelectedStorage] = useState<
		"postgresql" | "notion" | null
	>(null);
	const [notionConfig, setNotionConfig] = useState({
		accessToken: "",
		clothingDatabaseId: "",
		outfitsDatabaseId: "",
	});
	const [isConfiguring, setIsConfiguring] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	const { data: storagePreferences, refetch: refetchPreferences } =
		api.userStorage.getStoragePreferences.useQuery();

	const updateStorageTypeMutation =
		api.userStorage.updateStorageType.useMutation({
			onSuccess: () => {
				setHasUnsavedChanges(false);
				setIsConfiguring(false);
				refetchPreferences();
				alert("データ保存方法を変更しました");
			},
			onError: (error) => {
				alert(`設定エラー: ${error.message}`);
				setIsConfiguring(false);
			},
		});

	const updateNotionConfigMutation =
		api.userStorage.updateNotionConfiguration.useMutation({
			onSuccess: () => {
				setHasUnsavedChanges(false);
				setIsConfiguring(false);
				refetchPreferences();
				alert("Notion設定を更新しました");
			},
			onError: (error) => {
				alert(`Notion設定エラー: ${error.message}`);
				setIsConfiguring(false);
			},
		});

	const validateNotionMutation =
		api.userStorage.validateNotionConfiguration.useMutation({
			onSuccess: () => {
				// 検証成功後、実際に設定を更新
				updateNotionConfigMutation.mutate(notionConfig);
			},
			onError: (error) => {
				alert(`Notion設定検証エラー: ${error.message}`);
				setIsConfiguring(false);
			},
		});

	const resetNotionMutation =
		api.userStorage.resetNotionConfiguration.useMutation({
			onSuccess: () => {
				setSelectedStorage("postgresql");
				setNotionConfig({
					accessToken: "",
					clothingDatabaseId: "",
					outfitsDatabaseId: "",
				});
				setHasUnsavedChanges(false);
				setIsConfiguring(false);
				refetchPreferences();
				alert("Notion設定をリセットしました");
			},
			onError: (error) => {
				alert(`リセットエラー: ${error.message}`);
				setIsConfiguring(false);
			},
		});

	useEffect(() => {
		if (storagePreferences) {
			setSelectedStorage(storagePreferences.storageType);
			if (storagePreferences.storageType === "notion") {
				setNotionConfig({
					accessToken: storagePreferences.notionAccessToken || "",
					clothingDatabaseId: storagePreferences.notionClothingDatabaseId || "",
					outfitsDatabaseId: storagePreferences.notionOutfitsDatabaseId || "",
				});
			}
		}
	}, [storagePreferences]);

	const handleStorageTypeChange = (newType: "postgresql" | "notion") => {
		if (newType !== selectedStorage) {
			setSelectedStorage(newType);
			setHasUnsavedChanges(true);
		}
	};

	const handleNotionConfigChange = (
		field: keyof typeof notionConfig,
		value: string,
	) => {
		setNotionConfig((prev) => ({ ...prev, [field]: value }));
		setHasUnsavedChanges(true);
	};

	const handleSavePostgreSQL = () => {
		setIsConfiguring(true);
		updateStorageTypeMutation.mutate({ storageType: "postgresql" });
	};

	const handleSaveNotion = () => {
		if (
			!notionConfig.accessToken.trim() ||
			!notionConfig.clothingDatabaseId.trim() ||
			!notionConfig.outfitsDatabaseId.trim()
		) {
			alert("すべてのNotionフィールドを入力してください");
			return;
		}

		setIsConfiguring(true);
		// まずNotionの設定を検証
		validateNotionMutation.mutate(notionConfig);
	};

	const handleResetNotion = () => {
		if (
			confirm(
				"Notion設定をリセットし、PostgreSQLに切り替えますか？\n\n注意: Notionのデータは削除されませんが、このアプリからはアクセスできなくなります。",
			)
		) {
			setIsConfiguring(true);
			resetNotionMutation.mutate();
		}
	};

	const getCurrentStorageDisplay = () => {
		if (!storagePreferences) return "読み込み中...";

		switch (storagePreferences.storageType) {
			case "postgresql":
				return "🐘 PostgreSQL (アプリ内データベース)";
			case "notion":
				return "📝 Notion (外部データベース)";
			default:
				return "未設定";
		}
	};

	const getNotionAuthStatus = () => {
		if (!storagePreferences || storagePreferences.storageType !== "notion") {
			return {
				status: "inactive",
				message: "Notionストレージを使用していません",
			};
		}

		const hasToken = !!storagePreferences.notionAccessToken;
		const hasClothingDb = !!storagePreferences.notionClothingDatabaseId;
		const hasOutfitsDb = !!storagePreferences.notionOutfitsDatabaseId;

		if (hasToken && hasClothingDb && hasOutfitsDb) {
			return {
				status: "complete",
				message: "Notion認証が完了しています",
			};
		}

		const missing = [];
		if (!hasToken) missing.push("アクセストークン");
		if (!hasClothingDb) missing.push("服データベースID");
		if (!hasOutfitsDb) missing.push("コーデデータベースID");

		return {
			status: "incomplete",
			message: `未設定項目: ${missing.join(", ")}`,
		};
	};

	const authStatus = getNotionAuthStatus();

	return (
		<div className="space-y-6">
			{/* Notion認証状態の警告表示 */}
			{storagePreferences?.storageType === "notion" &&
				authStatus.status === "incomplete" && (
					<Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
						<AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
						<AlertDescription className="text-amber-800 dark:text-amber-200">
							<strong>Notion認証が不完全です</strong>
							<br />
							{authStatus.message}
							<br />
							<span className="text-sm">
								服やコーディネートの追加・編集機能を使用するには、下記の設定を完了してください。
							</span>
						</AlertDescription>
					</Alert>
				)}

			{/* 現在の設定表示 */}
			<Card>
				<CardHeader>
					<CardTitle>現在のデータ保存設定</CardTitle>
					<CardDescription>現在使用しているデータ保存方法</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<p className="font-medium text-blue-800">
							{getCurrentStorageDisplay()}
						</p>
						{storagePreferences?.storageType === "notion" && (
							<div className="mt-2 space-y-2">
								<div className="space-y-1 text-blue-700 text-sm">
									<p>
										• 服DB:{" "}
										{storagePreferences.notionClothingDatabaseId || "未設定"}
									</p>
									<p>
										• コーデDB:{" "}
										{storagePreferences.notionOutfitsDatabaseId || "未設定"}
									</p>
								</div>

								{/* 認証状態インジケーター */}
								<div className="flex items-center gap-2">
									{authStatus.status === "complete" ? (
										<>
											<CheckCircle className="h-4 w-4 text-green-600" />
											<span className="font-medium text-green-700 text-sm">
												認証完了
											</span>
										</>
									) : authStatus.status === "incomplete" ? (
										<>
											<XCircle className="h-4 w-4 text-red-600" />
											<span className="font-medium text-red-700 text-sm">
												認証不完全
											</span>
										</>
									) : (
										<>
											<AlertCircle className="h-4 w-4 text-gray-600" />
											<span className="font-medium text-gray-700 text-sm">
												非アクティブ
											</span>
										</>
									)}
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* ストレージ選択 */}
			<Card>
				<CardHeader>
					<CardTitle>データ保存方法の変更</CardTitle>
					<CardDescription>
						データをどこに保存するかを変更できます
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* PostgreSQL オプション */}
					<div
						className={`cursor-pointer rounded-lg border p-4 transition-all ${
							selectedStorage === "postgresql"
								? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
								: "border-gray-200 hover:border-gray-300"
						}`}
						onClick={() => handleStorageTypeChange("postgresql")}
					>
						<div className="flex items-center space-x-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
								🐘
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">PostgreSQL</h3>
								<p className="text-gray-600 text-sm">
									アプリ内のデータベース（推奨）
								</p>
							</div>
							{selectedStorage === "postgresql" && (
								<div className="text-blue-600">✓</div>
							)}
						</div>

						{selectedStorage === "postgresql" && (
							<div className="mt-4 space-y-2 text-xs">
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
							</div>
						)}
					</div>

					{/* Notion オプション */}
					<div
						className={`cursor-pointer rounded-lg border p-4 transition-all ${
							selectedStorage === "notion"
								? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
								: "border-gray-200 hover:border-gray-300"
						}`}
						onClick={() => handleStorageTypeChange("notion")}
					>
						<div className="flex items-center space-x-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
								📝
							</div>
							<div className="flex-1">
								<h3 className="font-semibold">Notion</h3>
								<p className="text-gray-600 text-sm">
									自分のNotionワークスペース
								</p>
							</div>
							{selectedStorage === "notion" && (
								<div className="text-purple-600">✓</div>
							)}
						</div>

						{selectedStorage === "notion" && (
							<div className="mt-4 space-y-4">
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
								</div>

								{/* Notion設定フォーム */}
								<div className="space-y-3 border-t pt-4">
									<div>
										<Label htmlFor="notion-token-settings">
											アクセストークン
										</Label>
										<Input
											id="notion-token-settings"
											type="password"
											placeholder="secret_xxxxxxxxxxxxx"
											value={notionConfig.accessToken}
											onChange={(e) =>
												handleNotionConfigChange("accessToken", e.target.value)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="clothing-db-settings">
											服データベースID
										</Label>
										<Input
											id="clothing-db-settings"
											type="text"
											placeholder="1234567890abcdef1234567890abcdef"
											value={notionConfig.clothingDatabaseId}
											onChange={(e) =>
												handleNotionConfigChange(
													"clothingDatabaseId",
													e.target.value,
												)
											}
											className="mt-1"
										/>
									</div>

									<div>
										<Label htmlFor="outfits-db-settings">
											コーデデータベースID
										</Label>
										<Input
											id="outfits-db-settings"
											type="text"
											placeholder="abcdef1234567890abcdef1234567890"
											value={notionConfig.outfitsDatabaseId}
											onChange={(e) =>
												handleNotionConfigChange(
													"outfitsDatabaseId",
													e.target.value,
												)
											}
											className="mt-1"
										/>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* 保存ボタン */}
					{hasUnsavedChanges && (
						<div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
							<p className="mb-4 text-orange-800 text-sm">
								💡 変更を保存するには下のボタンをクリックしてください
							</p>

							{selectedStorage === "postgresql" && (
								<Button
									onClick={handleSavePostgreSQL}
									disabled={isConfiguring}
									className="w-full bg-blue-600 hover:bg-blue-700"
								>
									{isConfiguring ? "変更中..." : "PostgreSQLに変更"}
								</Button>
							)}

							{selectedStorage === "notion" && (
								<div className="space-y-2">
									<Button
										onClick={handleSaveNotion}
										disabled={
											isConfiguring ||
											!notionConfig.accessToken.trim() ||
											!notionConfig.clothingDatabaseId.trim() ||
											!notionConfig.outfitsDatabaseId.trim()
										}
										className="w-full bg-purple-600 hover:bg-purple-700"
									>
										{isConfiguring ? "設定中..." : "Notionに変更"}
									</Button>

									{storagePreferences?.storageType === "notion" && (
										<Button
											onClick={handleResetNotion}
											disabled={isConfiguring}
											variant="outline"
											className="w-full border-red-300 text-red-600 hover:bg-red-50"
										>
											Notion設定をリセット
										</Button>
									)}
								</div>
							)}
						</div>
					)}

					{/* 注意事項 */}
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
						<h4 className="mb-2 font-medium text-sm text-yellow-800">
							⚠️ 重要な注意事項
						</h4>
						<ul className="space-y-1 text-xs text-yellow-700">
							<li>
								•
								データ保存方法を変更しても、既存のデータは自動的に移行されません
							</li>
							<li>
								•
								PostgreSQL→Notionに変更した場合、既存の服・コーデデータは表示されなくなります
							</li>
							<li>• Notion→PostgreSQLに変更した場合も同様です</li>
							<li>
								• データを移行したい場合は、専用の移行機能をご利用ください
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
