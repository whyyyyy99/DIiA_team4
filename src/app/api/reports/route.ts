import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'

export async function GET(
  request: NextRequest,
  context: { params: { filename: string } }
) {
  const filename = context.params.filename
  const filePath = join(process.cwd(), 'public', 'reports', filename)

  try {
    const fileBuffer = await readFile(filePath)
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    return new NextResponse('PDF not found', { status: 404 })
  }
}

