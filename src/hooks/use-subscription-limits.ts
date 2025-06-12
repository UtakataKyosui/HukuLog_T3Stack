"use client";

import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export function useSubscriptionLimits() {
	const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
	const [promptType, setPromptType] = useState<
		"clothing_limit" | "outfit_limit" | "image_upload" | "general"
	>("general");

	const { data: limits } = api.subscription.checkLimits.useQuery();
	const { data: usage } = api.subscription.getUserUsage.useQuery();
	const { data: subscription } =
		api.subscription.getUserSubscription.useQuery();

	const checkCanAddClothing = () => {
		if (!limits || !usage) return false;

		if (!limits.canAddClothing) {
			setPromptType("clothing_limit");
			setShowUpgradePrompt(true);
			return false;
		}
		return true;
	};

	const checkCanAddOutfit = () => {
		if (!limits || !usage) return false;

		if (!limits.canAddOutfit) {
			setPromptType("outfit_limit");
			setShowUpgradePrompt(true);
			return false;
		}
		return true;
	};

	const checkCanUploadImage = () => {
		if (!limits) return false;

		if (!limits.canUploadImages) {
			setPromptType("image_upload");
			setShowUpgradePrompt(true);
			return false;
		}
		return true;
	};

	const dismissPrompt = () => {
		setShowUpgradePrompt(false);
	};

	const isNearClothingLimit = () => {
		if (!limits || !usage) return false;
		if (limits.limits.maxClothingItems === -1) return false;
		return usage.clothingItemsCount >= limits.limits.maxClothingItems * 0.8;
	};

	const isNearOutfitLimit = () => {
		if (!limits || !usage) return false;
		if (limits.limits.maxOutfits === -1) return false;
		return usage.outfitsCount >= limits.limits.maxOutfits * 0.8;
	};

	const isFreePlan = () => {
		return !subscription;
	};

	return {
		limits,
		usage,
		subscription,
		showUpgradePrompt,
		promptType,
		checkCanAddClothing,
		checkCanAddOutfit,
		checkCanUploadImage,
		dismissPrompt,
		isNearClothingLimit,
		isNearOutfitLimit,
		isFreePlan,
	};
}
