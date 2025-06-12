import { getServerSession } from "@/server/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession();

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// ファイルサイズ制限 (5MB)
		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ error: "File too large. Max size is 5MB." },
				{ status: 400 },
			);
		}

		// ファイルタイプ制限
		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{ error: "Only image files are allowed" },
				{ status: 400 },
			);
		}

		// 本来はS3やCloudinaryなどにアップロードするが、
		// ここではbase64エンコードしてデータベースに保存する簡易実装
		const bytes = await file.arrayBuffer();
		const base64 = Buffer.from(bytes).toString("base64");
		const dataUrl = `data:${file.type};base64,${base64}`;

		return NextResponse.json({
			url: dataUrl,
			message: "Image uploaded successfully",
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
