import { spawn } from "child_process";
import { checkSeedData } from "../src/server/db/check-seed";

async function runSeed() {
	console.log("🌱 Running database seed...");
	
	return new Promise<void>((resolve, reject) => {
		const seedProcess = spawn("npm", ["run", "db:seed"], {
			stdio: "inherit",
			shell: true,
		});

		seedProcess.on("close", (code) => {
			if (code === 0) {
				console.log("✅ Database seeding completed successfully");
				resolve();
			} else {
				console.error(`❌ Database seeding failed with exit code ${code}`);
				reject(new Error(`Seed process failed with code ${code}`));
			}
		});

		seedProcess.on("error", (error) => {
			console.error("❌ Error running seed:", error);
			reject(error);
		});
	});
}

async function startDevServer() {
	console.log("🚀 Starting development server...");
	
	const devProcess = spawn("next", ["dev"], {
		stdio: "inherit",
		shell: true,
	});

	// プロセス終了時のクリーンアップ
	const shutdownDevServer = (signal: string) => {
		console.log("\n🛑 Shutting down development server...");
		devProcess.kill(signal as NodeJS.Signals);
		process.exit(0);
	};

	process.on("SIGINT", () => shutdownDevServer("SIGINT"));
	process.on("SIGTERM", () => shutdownDevServer("SIGTERM"));
}

async function main() {
	try {
		console.log("🔄 Starting development with seed check...");
		
		// 初期データの存在をチェック
		const seedExists = await checkSeedData();
		
		if (!seedExists) {
			console.log("📦 Initial data not found. Running seed...");
			await runSeed();
		} else {
			console.log("✅ Initial data already exists. Skipping seed.");
		}
		
		// 開発サーバーを起動
		await startDevServer();
		
	} catch (error) {
		console.error("❌ Error in development startup:", error);
		process.exit(1);
	}
}

main();