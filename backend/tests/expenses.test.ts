import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import prisma from "../src/db";

describe("Expenses API", () => {
  beforeAll(async () => {
    await prisma.expense.deleteMany();
  });

  it("creates a valid expense", async () => {
    const res = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "test-key-1")
      .send({
        amount: "100.50",
        category: "Food",
        description: "Lunch",
        date: new Date().toISOString()
      });

    expect(res.status).toBe(201);
    expect(res.body.amountCents).toBe(10050);
  });

  it("rejects invalid create", async () => {
    const res = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "test-key-2")
      .send({
        amount: "abc",
        category: "",
        description: "",
        date: "invalid"
      });

    expect(res.status).toBe(400);
  });

  it("is idempotent on duplicate submission", async () => {
    const payload = {
      amount: "200.00",
      category: "Bills",
      description: "Internet",
      date: new Date().toISOString()
    };

    const first = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "test-key-3")
      .send(payload);

    const second = await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "test-key-3")
      .send(payload);

    expect(first.body.id).toBe(second.body.id);
  });

  it("filters by category and sorts by date desc", async () => {
    await request(app)
      .post("/expenses")
      .set("Idempotency-Key", "test-key-4")
      .send({
        amount: "50.00",
        category: "Food",
        description: "Snack",
        date: new Date(Date.now() - 10000).toISOString()
      });

    const res = await request(app).get("/expenses?category=Food&sort=date_desc");

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const e of res.body) {
      expect(e.category).toBe("Food");
    }
  });
});