// src/lib/validators/schemas.ts
// Zod v4 schemas for API request validation.
// NOTE: Zod v4 changed the error API: use `error` instead of `required_error`/`invalid_type_error`,
// and `.issues` instead of `.errors` on ZodError.

import { z } from "zod";

// ==========================================
// Auth Schemas
// ==========================================

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(50),
  type: z.enum(["stock", "crypto", "all"]).optional().default("all"),
});

// ==========================================
// Portfolio Schemas
// ==========================================

export const createPortfolioSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Portfolio name cannot be empty")
    .max(50, "Portfolio name cannot exceed 50 characters"),
});

export const updatePortfolioSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Portfolio name cannot be empty")
    .max(50, "Portfolio name cannot exceed 50 characters"),
});

// ==========================================
// Investment Schemas
// ==========================================

export const addInvestmentSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol cannot be empty")
    .max(10, "Symbol cannot exceed 10 characters")
    .transform((val) => val.toUpperCase()),

  assetType: z.enum(["stock", "crypto"]),

  transactionType: z.enum(["buy", "sell"]),

  shares: z
    .number({ error: "Shares must be a positive number" })
    .positive("Shares must be greater than 0")
    .max(1_000_000, "Shares cannot exceed 1,000,000"),

  purchasePrice: z
    .number({ error: "Purchase price must be a positive number" })
    .positive("Purchase price must be greater than 0")
    .max(1_000_000, "Purchase price cannot exceed $1,000,000"),

  purchaseDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
});

export const updateInvestmentSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(10)
    .transform((val) => val.toUpperCase())
    .optional(),
  assetType: z.enum(["stock", "crypto"]).optional(),
  transactionType: z.enum(["buy", "sell"]).optional(),
  shares: z.number().positive().max(1_000_000).optional(),
  purchasePrice: z.number().positive().max(1_000_000).optional(),
  purchaseDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
});

// ==========================================
// Helper: Format Zod errors for API response
// ==========================================

// Zod v4 uses `.issues` instead of `.errors`
export function formatZodErrors(error: z.ZodError): string {
  return error.issues.map((issue: z.ZodIssue) => issue.message).join(", ");
}

// Export types inferred from schemas
export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type AddInvestmentInput = z.infer<typeof addInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
