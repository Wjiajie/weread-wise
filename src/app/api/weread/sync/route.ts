import { NextResponse } from "next/server";
import { createWeReadConnector } from "@/lib/weread/connector";

export async function POST() {
  const connector = createWeReadConnector();
  const { books, stats } = await connector.syncLibrary();

  return NextResponse.json({
    source: process.env.WEREAD_API_KEY ? "agent-gateway" : "mock",
    books,
    stats
  });
}
