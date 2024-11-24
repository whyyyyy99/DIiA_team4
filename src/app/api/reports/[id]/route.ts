import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  try {
    const { id } = context.params
    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return new Response('Report not found', { status: 404 })
    }

    return new Response(report.content, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    return new Response('Error retrieving the report', { status: 500 })
  }
}

