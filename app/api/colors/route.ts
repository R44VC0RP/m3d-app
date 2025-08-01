import { NextResponse } from "next/server"
import { colors } from "@/lib/db"
import { Color } from "@/lib/types"

// ----------------------------- Types --------------------------------------------
// GET
export type RequestGET = {}
export type ResponseGET = Color[]
// ---------------------------------------------------------------------------------

export async function GET() {
  const res: ResponseGET = colors
  return NextResponse.json(res)
}