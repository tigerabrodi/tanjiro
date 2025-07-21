/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as chats_actions from "../chats/actions.js";
import type * as chats_helpers from "../chats/helpers.js";
import type * as chats_mutations from "../chats/mutations.js";
import type * as chats_queries from "../chats/queries.js";
import type * as edits_mutations from "../edits/mutations.js";
import type * as http from "../http.js";
import type * as lib_utils from "../lib/utils.js";
import type * as users_actions from "../users/actions.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "chats/actions": typeof chats_actions;
  "chats/helpers": typeof chats_helpers;
  "chats/mutations": typeof chats_mutations;
  "chats/queries": typeof chats_queries;
  "edits/mutations": typeof edits_mutations;
  http: typeof http;
  "lib/utils": typeof lib_utils;
  "users/actions": typeof users_actions;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
