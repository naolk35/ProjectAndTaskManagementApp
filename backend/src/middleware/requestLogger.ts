import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const done = () => {
    res.removeListener("finish", done);
    res.removeListener("close", done);
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationMs = Math.round(durationNs / 1_000_000);
    const status = res.statusCode;
    // eslint-disable-next-line no-console
    console.log(`${method} ${originalUrl} ${status} ${durationMs}ms`, { ip });
  };

  res.on("finish", done);
  res.on("close", done);
  next();
}









