import { NextRequest } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'

interface RouteContext {
  params: { filename: string };
}

export async function GET(
  request: NextRequest,
  context: RouteContext // Strongly typed context
): Promise<Response> {
  const { filename } = context.params; // Safely destructure params
  const filePath = join(process.cwd(), 'public', 'reports', filename)

  try {
    const fileBuffer = await readFile(filePath)
    
    // Check if the file is actually a PDF
    if (!filename.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type')
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    
    if (error instanceof Error && error.message === 'Invalid file type') {
      return new Response('Invalid file type', { status: 400 })
    }
    
    return new Response('PDF not found', { status: 404 })
  }
}