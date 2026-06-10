# Backend Source — Code Organization

## PURPOSE
Core backend source code — controllers handle business logic, routes define endpoints, middleware provides cross-cutting concerns.

## KEY FILES
| File | Purpose |
|------|---------|
| `index.js` | Entry point — Express app creation, middleware, route mounting, error handler |
| `config/supabase.js` | Supabase admin client (service_role) |
| `middleware/authMiddleware.js` | `verifyToken` + `isAdmin` middleware functions |
| `middleware/rateLimiter.js` | `voteLimiter`, `ideaLimiter`, `authLimiter` |

## CHILD DOCS
- `controllers/agents.md` — all request handler functions
- `routes/agents.md` — all route definitions
