import { NextResponse } from "next/server"
import { listColors } from "@/lib/repository"
import { Color } from "@/lib/types"

// ----------------------------- Types --------------------------------------------
// GET
export type RequestGET = {}
export type ResponseGET = Color[]
// ---------------------------------------------------------------------------------

export async function GET() {
  const res: ResponseGET = await listColors()
  return NextResponse.json(res)
}