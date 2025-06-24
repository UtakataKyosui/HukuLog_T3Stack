import { AuthForm } from "@/components/auth/auth-form";
import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const session = await getServerSession();

	if (session) {
		redirect("/outfits");
	}

	return <AuthForm />;
}
