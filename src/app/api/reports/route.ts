import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where = {
      ...(type && { type }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const statistics = {
      totalSubmissions: submissions.length,
      averageStructuralDefects: submissions.reduce((acc, curr) => acc + curr.structuralDefects, 0) / submissions.length,
      byCity: submissions.reduce((acc, curr) => {
        acc[curr.city] = (acc[curr.city] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json({
      submissions,
      statistics,
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Error generating report' }, { status: 500 })
  }
}