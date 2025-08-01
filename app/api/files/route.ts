import { NextRequest, NextResponse } from "next/server"
import { createFileRecord, getAllFiles } from "@/lib/repository"
import { File3D } from "@/lib/types"

// ----------------------------- Types --------------------------------------------
// GET
export type RequestGET = {}
export type ResponseGET = File3D[]
// POST
export interface RequestPOST {
  name: string
  filetype: string
  filename: string
  dimensions: { x: number; y: number; z: number }
  mass: number
  metadata?: Record<string, unknown>
}
export interface ResponsePOST extends File3D {}
// ---------------------------------------------------------------------------------

export async function GET() {
  const response: ResponseGET = await getAllFiles()
  return NextResponse.json(response)
}

export async function POST(req: NextRequest) {
  let body: RequestPOST
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const newFile = await createFileRecord({
    name: body.name,
    filetype: body.filetype,
    filename: body.filename,
    dimensions: body.dimensions,
    mass: body.mass,
    slicing_status: "pending",
    metadata: body.metadata ?? {},
  })

  const response: ResponsePOST = newFile
  return NextResponse.json(response, { status: 201 })
}