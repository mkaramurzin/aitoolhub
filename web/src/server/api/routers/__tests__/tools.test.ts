process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
process.env.GOOGLE_CLIENT_SECRET = "x";
process.env.GOOGLE_CLIENT_ID = "x";
process.env.BETTER_AUTH_URL = "http://localhost";
process.env.AWS_ACCESS_KEY_ID = "x";
process.env.AWS_SECRET_ACCESS_KEY = "x";
process.env.OPENAI_API_KEY = "x";
process.env.RESEND_API_KEY = "x";
process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "http://localhost";
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost";
process.env.NEXT_PUBLIC_S3_IMAGE_URL = "http://localhost/image";
process.env.NEXT_PUBLIC_S3_BUCKET_NAME = "x";
process.env.NEXT_PUBLIC_S3_BUCKET_ENDPOINT = "http://localhost/s3";

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";

const { createCallerFactory } = await import("../../trpc");
const { toolsRouter } = await import("../tools");

vi.mock("@/lib/auth", () => ({
  auth: {
    api: { getSession: vi.fn().mockResolvedValue(null) },
  },
}));

vi.mock("ai", () => ({
  embed: vi.fn(async () => ({ embedding: "emb" })),
  generateText: vi.fn(async () => ({ text: "clarify?" })),
}));

import { generateText } from "ai";

const createCaller = createCallerFactory(toolsRouter);

describe("toolsRouter", () => {
  let db: any;
  let caller: any;

  beforeEach(() => {
    db = {
      $queryRaw: vi.fn(),
      searchHistory: { create: vi.fn() },
      tool: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
    } as unknown as PrismaClient;

    caller = createCaller({
      db,
      headers: new Headers(),
      user: undefined,
      session: undefined,
    });
  });

  it("asks clarification question when confidence low", async () => {
    db.$queryRaw.mockResolvedValueOnce([{ distance: 0.8 }]);
    const result = await caller.clarifySearch({ query: "test" });
    expect(result.question).toBe("clarify?");
    expect(result.confidence).toBeCloseTo(0.2, 5);
    expect(generateText).toHaveBeenCalled();
  });

  it("records original and refined queries on rerun", async () => {
    db.tool.findMany.mockResolvedValueOnce([]);
    db.tool.count.mockResolvedValueOnce(0);

    await caller.fetchAll({
      query: "foo bar",
      originalQuery: "foo",
      page: 1,
      take: 10,
      searchHistory: true,
      magicSearch: false,
    });

    expect(db.searchHistory.create).toHaveBeenCalledWith({
      data: {
        query: "foo bar",
        originalQuery: "foo",
        refinedQuery: "foo bar",
        userId: undefined,
        tags: [],
        pricing: "",
      },
    });
  });
});
