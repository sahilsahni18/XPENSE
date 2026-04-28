import express from "express";
import cors from "cors";
import helmet from "helmet";
import expensesRouter from "./routes/expenses";
import { errorHandler } from "./middleware/error";
import { requestIdMiddleware } from "./middleware/requestId";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(requestIdMiddleware);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/expenses", expensesRouter);

app.use(errorHandler);

export default app;