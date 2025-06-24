import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	pgTableCreator,
	primaryKey,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `workspace_${name}`);

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);

export const users = createTable("user", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d.boolean().notNull().default(false),
	image: d.varchar({ length: 255 }),
	isAnonymous: d.boolean().notNull().default(false),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// BetterAuth tables
export const accounts = createTable("account", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	accountId: d.varchar({ length: 255 }).notNull(),
	providerId: d.varchar({ length: 255 }).notNull(),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id),
	accessToken: d.text(),
	refreshToken: d.text(),
	idToken: d.text(),
	accessTokenExpiresAt: d.timestamp({ withTimezone: true }),
	refreshTokenExpiresAt: d.timestamp({ withTimezone: true }),
	scope: d.varchar({ length: 255 }),
	password: d.varchar({ length: 255 }),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const sessions = createTable("session", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	expiresAt: d.timestamp({ withTimezone: true }).notNull(),
	token: d.varchar({ length: 255 }).notNull().unique(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	ipAddress: d.varchar({ length: 255 }),
	userAgent: d.text(),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id),
}));

export const verifications = createTable("verification", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	identifier: d.varchar({ length: 255 }).notNull(),
	value: d.varchar({ length: 255 }).notNull(),
	expiresAt: d.timestamp({ withTimezone: true }).notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Better Auth Passkey tables
export const passkeys = createTable("passkey", (d) => ({
	id: d.varchar({ length: 255 }).notNull().primaryKey(),
	name: d.varchar({ length: 255 }),
	publicKey: d.text().notNull(),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id),
	credentialID: d.varchar({ length: 255 }).notNull(),
	counter: d.integer().notNull(),
	deviceType: d.varchar({ length: 255 }).notNull(),
	backedUp: d.boolean().notNull(),
	transports: d.varchar({ length: 255 }),
	aaguid: d.varchar({ length: 255 }),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));

// Subscription plans
export const subscriptionPlans = createTable("subscription_plan", (d) => ({
	id: d.varchar({ length: 255 }).notNull().primaryKey(),
	name: d.varchar({ length: 255 }).notNull(),
	price: d.integer().notNull(), // in cents
	maxClothingItems: d.integer().notNull(),
	maxOutfits: d.integer().notNull(),
	canUploadImages: d.boolean().notNull().default(false),
	features: d.json().$type<string[]>().notNull().default([]),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));

// User subscriptions
export const userSubscriptions = createTable("user_subscription", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	planId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => subscriptionPlans.id),
	status: d.varchar({ length: 50 }).notNull().default("active"), // active, canceled, expired
	currentPeriodStart: d.timestamp({ withTimezone: true }).notNull(),
	currentPeriodEnd: d.timestamp({ withTimezone: true }).notNull(),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));

// Clothing categories
export const clothingCategories = createTable("clothing_category", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	name: d.varchar({ length: 100 }).notNull(),
	type: d.varchar({ length: 50 }).notNull(), // tops, bottoms, shoes, accessories, etc.
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
}));

// Clothing items
export const clothingItems = createTable(
	"clothing_item",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 255 }).notNull(),
		brand: d.varchar({ length: 255 }),
		color: d.varchar({ length: 100 }),
		size: d.varchar({ length: 50 }),
		categoryId: d
			.integer()
			.notNull()
			.references(() => clothingCategories.id),
		season: d.varchar({ length: 50 }), // spring, summer, fall, winter, all
		imageUrl: d.varchar({ length: 500 }),
		price: d.integer(), // in cents
		purchaseDate: d.date(),
		notes: d.text(),
		tags: d.json().$type<string[]>().notNull().default([]),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("clothing_user_idx").on(t.userId),
		index("clothing_user_created_idx").on(t.userId, t.createdAt),
		index("clothing_category_idx").on(t.categoryId),
		index("clothing_season_idx").on(t.season),
	],
);

// Outfits
export const outfits = createTable(
	"outfit",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		occasion: d.varchar({ length: 100 }), // casual, work, formal, party, etc.
		season: d.varchar({ length: 50 }), // spring, summer, fall, winter, all
		rating: d.integer(), // 1-5 stars
		lastWorn: d.date(),
		tags: d.json().$type<string[]>().notNull().default([]),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("outfit_user_idx").on(t.userId),
		index("outfit_user_created_idx").on(t.userId, t.createdAt),
		index("outfit_occasion_idx").on(t.occasion),
		index("outfit_season_idx").on(t.season),
	],
);

// Outfit items (many-to-many relationship between outfits and clothing items)
export const outfitItems = createTable(
	"outfit_item",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		outfitId: d
			.integer()
			.notNull()
			.references(() => outfits.id, { onDelete: "cascade" }),
		clothingItemId: d
			.integer()
			.notNull()
			.references(() => clothingItems.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [
		index("outfit_item_outfit_idx").on(t.outfitId),
		index("outfit_item_clothing_idx").on(t.clothingItemId),
	],
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	passkeys: many(passkeys),
	clothingItems: many(clothingItems),
	outfits: many(outfits),
	subscription: one(userSubscriptions, {
		fields: [users.id],
		references: [userSubscriptions.userId],
	}),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const passkeysRelations = relations(passkeys, ({ one }) => ({
	user: one(users, { fields: [passkeys.userId], references: [users.id] }),
}));

export const subscriptionPlansRelations = relations(
	subscriptionPlans,
	({ many }) => ({
		userSubscriptions: many(userSubscriptions),
	}),
);

export const userSubscriptionsRelations = relations(
	userSubscriptions,
	({ one }) => ({
		user: one(users, {
			fields: [userSubscriptions.userId],
			references: [users.id],
		}),
		plan: one(subscriptionPlans, {
			fields: [userSubscriptions.planId],
			references: [subscriptionPlans.id],
		}),
	}),
);

export const clothingCategoriesRelations = relations(
	clothingCategories,
	({ many }) => ({
		clothingItems: many(clothingItems),
	}),
);

export const clothingItemsRelations = relations(
	clothingItems,
	({ one, many }) => ({
		user: one(users, {
			fields: [clothingItems.userId],
			references: [users.id],
		}),
		category: one(clothingCategories, {
			fields: [clothingItems.categoryId],
			references: [clothingCategories.id],
		}),
		outfitItems: many(outfitItems),
	}),
);

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
	user: one(users, { fields: [outfits.userId], references: [users.id] }),
	outfitItems: many(outfitItems),
}));

export const outfitItemsRelations = relations(outfitItems, ({ one }) => ({
	outfit: one(outfits, {
		fields: [outfitItems.outfitId],
		references: [outfits.id],
	}),
	clothingItem: one(clothingItems, {
		fields: [outfitItems.clothingItemId],
		references: [clothingItems.id],
	}),
}));
