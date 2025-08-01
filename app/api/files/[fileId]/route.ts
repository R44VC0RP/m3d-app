import { NextRequest, NextResponse } from "next/server"
import { files } from "@/lib/db"
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

function findFile(fileId: string) {
  return files.find((f) => f.id === fileId)
}

export async function GET(_req: NextRequest, { params }: { params: { fileId: string } }) {
  const file = findFile(params.fileId)
  if (!file) {
    const res: ResponseGET = { error: "File not found" }
    return NextResponse.json(res, { status: 404 })
  }
  const res: ResponseGET = file
  return NextResponse.json(res)
}

export async function DELETE(_req: NextRequest, { params }: { params: { fileId: string } }) {
  const index = files.findIndex((f) => f.id === params.fileId)
  if (index === -1) {
    const res: ResponseDELETE = { error: "File not found" }
    return NextResponse.json(res, { status: 404 })
  }
  files.splice(index, 1)
  const res: ResponseDELETE = { success: true }
  return NextResponse.json(res)
}