import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const type = formData.get('type') as string
    const streetName = formData.get('streetName') as string
    const apartmentNumber = formData.get('apartmentNumber') as string
    const city = formData.get('city') as string
    const structuralDefects = parseInt(formData.get('structuralDefects') as string)
    const decayMagnitude = parseInt(formData.get('decayMagnitude') as string)
    const defectIntensity = parseInt(formData.get('defectIntensity') as string)
    const description = formData.get('description') as string
    const submittedBy = formData.get('submittedBy') as string

    // Here you would typically upload the photo to a storage service
    // and get back a URL. For this example, we'll use a placeholder URL.
    const photoUrl = '/placeholder.jpg'

    const submission = await prisma.submission.create({
      data: {
        type,
        streetName,
        apartmentNumber,
        city,
        structuralDefects,
        decayMagnitude,
        defectIntensity,
        description,
        photoUrl,
        submittedBy,
        date: new Date(),
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}