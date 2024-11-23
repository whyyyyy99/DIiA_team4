import { NextRequest } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'

export async function GET(
  req: NextRequest,
  context: {
    params: { filename: string }
  }
): Promise<Response> {
  const { filename } = context.params
  const filePath = join(process.cwd(), 'public', 'reports', filename)

  try {
    const fileBuffer = await readFile(filePath)
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    return new Response('PDF not found', { status: 404 })
  }
}

