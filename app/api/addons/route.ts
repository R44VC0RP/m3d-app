import { NextResponse } from "next/server"
import { listAddons } from "@/lib/repository"
import { Addon } from "@/lib/types"

export type RequestGET = {}
export type ResponseGET = Addon[]

export async function GET() {
  const res: ResponseGET = await listAddons()
  return NextResponse.json(res)
}