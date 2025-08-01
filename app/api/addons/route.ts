import { NextResponse } from "next/server"
import { addons } from "@/lib/db"
import { Addon } from "@/lib/types"

export type RequestGET = {}
export type ResponseGET = Addon[]

export async function GET() {
  const res: ResponseGET = addons
  return NextResponse.json(res)
}