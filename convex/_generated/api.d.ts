/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as ai_chatAssistant from "../ai/chatAssistant.js";
import type * as ai_generateTrip from "../ai/generateTrip.js";
import type * as chatMessages from "../chatMessages.js";
import type * as cronHandlers from "../cronHandlers.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as expenses from "../expenses.js";
import type * as studentDiscounts from "../studentDiscounts.js";
import type * as tripDays from "../tripDays.js";
import type * as tripMembers from "../tripMembers.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  "ai/chatAssistant": typeof ai_chatAssistant;
  "ai/generateTrip": typeof ai_generateTrip;
  chatMessages: typeof chatMessages;
  cronHandlers: typeof cronHandlers;
  crons: typeof crons;
  emails: typeof emails;
  expenses: typeof expenses;
  studentDiscounts: typeof studentDiscounts;
  tripDays: typeof tripDays;
  tripMembers: typeof tripMembers;
  trips: typeof trips;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
