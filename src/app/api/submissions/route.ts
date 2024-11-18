import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Validate required fields
    const requiredFields = ['photo', 'type', 'streetName', 'apartmentNumber', 'city', 'structuralDefects']
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const photo = formData.get('photo') as File
    if (!photo || !(photo instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid or missing photo' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob with proper error handling
    let blob
    try {
      blob = await put(`submissions/${Date.now()}-${photo.name}`, photo, {
        access: 'public',
        addRandomSuffix: true,
      })
    } catch (error) {
      console.error('Blob storage error:', error)
      return NextResponse.json(
        { error: 'Failed to upload photo' },
        { status: 500 }
      )
    }

    // Create submission in database
    const submission = await prisma.submission.create({
      data: {
        type: formData.get('type') as string,
        streetName: formData.get('streetName') as string,
        apartmentNumber: formData.get('apartmentNumber') as string,
        city: formData.get('city') as string,
        structuralDefects: parseInt(formData.get('structuralDefects') as string),
        decayMagnitude: parseInt(formData.get('decayMagnitude') as string || '0'),
        defectIntensity: parseInt(formData.get('defectIntensity') as string || '0'),
        description: formData.get('description') as string || '',
        photoUrl: blob.url,
        submittedBy: formData.get('submittedBy') as string || '',
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

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: {
        date: 'desc',
      },
    })
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}