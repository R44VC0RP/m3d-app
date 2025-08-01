import { NextRequest, NextResponse } from "next/server"
import { findFileById } from "@/lib/repository"
import { File3D } from "@/lib/types"

// ----------------------------- Types --------------------------------------------
// GET
export interface RequestGET {
  params: { fileId: string }
}
export type ResponseGET = File3D | { error: string }
// DELETE
export interface RequestDELETE {
  params: { fileId: string }
}
export type ResponseDELETE = { success: true } | { error: string }
// ---------------------------------------------------------------------------------

export async function GET(_req: NextRequest, { params }: any) {
  const file = await findFileById(params.fileId)
  if (!file) {
    const res: ResponseGET = { error: "File not found" }
    return NextResponse.json(res, { status: 404 })
  }
  const res: ResponseGET = file
  return NextResponse.json(res)
}

export async function DELETE() {
  return NextResponse.json({ error: "Not implemented" }, { status: 501 })
}