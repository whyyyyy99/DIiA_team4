import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const description = formData.get('description') as string
    const streetName = formData.get('streetName') as string
    const apartmentNumber = formData.get('apartmentNumber') as string
    const city = formData.get('city') as string
    const structuralDefects = parseInt(formData.get('structuralDefects') as string)

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    // TODO: Implement actual file storage
    const photoUrl = `/placeholder-${Date.now()}.jpg`

    const submission = await prisma.submission.create({
      data: {
        type: session.user.role === 'tenant' ? 'tenant' : 'employee',
        streetName,
        apartmentNumber,
        city,
        structuralDefects,
        description,
        photoUrl,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Error uploading photo' }, { status: 500 })
  }
}