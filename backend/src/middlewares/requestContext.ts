import { AsyncLocalStorage } from "async_hooks";
import { Request, Response, NextFunction } from "express";

/**
 * AsyncLocalStorage acts like "thread-local" storage for Node.js.
 * It allows us to store the current Express Request object and make it globally 
 * accessible to any deeply nested asynchronous function, without needing to manually 
 * pass the `req` object down the call chain.
 * 
 * We use this primarily to access HTTP cookies (like the user's phone number) inside 
 * Better Auth's internal database hooks, which do not natively provide the `req` context.
 */
export const requestContext = new AsyncLocalStorage<Request>();

/**
 * Express middleware that initializes the async context for each incoming request.
 * Any asynchronous code executed inside `requestContext.run()` will have access 
 * to the `req` object via `requestContext.getStore()`.
 */
export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  requestContext.run(req, () => {
    next();
  });
};
