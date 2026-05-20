import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();
// console.error("t", TRPCError);
export const router = t.router;

export const publicProcedure = t.procedure;
