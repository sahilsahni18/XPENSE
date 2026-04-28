import { Router } from "express";
import prisma from "../db";
import { expenseCreateSchema } from "../validation/expense";
import { parseAmountToCents } from "../utils/money";
import { logInfo } from "../utils/logger";

const router = Router();

router.get("/", async (req, res) => {
  const category = req.query.category?.toString();
  const sort = req.query.sort?.toString() || "date_desc";

  if (sort !== "date_desc") {
    return res.status(400).json({ error: "Invalid sort parameter" });
  }

  const expenses = await prisma.expense.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });

  res.json(expenses);
});

router.post("/", async (req, res) => {
  const idempotencyKey = req.headers["idempotency-key"]?.toString();

  if (!idempotencyKey || idempotencyKey.length < 8) {
    return res.status(400).json({ error: "Missing or invalid Idempotency-Key header" });
  }

  const parseResult = expenseCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request body", details: parseResult.error.flatten() });
  }

  try {
    const amountCents = parseAmountToCents(parseResult.data.amount);

    const created = await prisma.expense.create({
      data: {
        amountCents,
        category: parseResult.data.category,
        description: parseResult.data.description,
        date: new Date(parseResult.data.date),
        idempotencyKey
      }
    });

    logInfo("Expense created", { id: created.id });
    return res.status(201).json(created);
  } catch (err: any) {
    // Prisma unique constraint: idempotency key
    if (err?.code === "P2002") {
      const existing = await prisma.expense.findUnique({ where: { idempotencyKey } });
      if (existing) return res.status(200).json(existing);
    }
    return res.status(500).json({ error: "Failed to create expense" });
  }
});

export default router;