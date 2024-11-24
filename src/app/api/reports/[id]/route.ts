import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  console.log(`Fetching report with ID: ${params.id}`)
  
  try {
    await prisma.$connect()
    
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      console.log(`Report not found for ID: ${params.id}`)
      return new Response('Report not found', { status: 404 })
    }

    console.log(`Report found: ${report.filename}`)

    return new Response(report.content, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.filename}"`,
      },
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    return new Response('Error retrieving the report', { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

