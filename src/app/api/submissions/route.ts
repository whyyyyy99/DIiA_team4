import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Check if we have the required environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('Missing BLOB_READ_WRITE_TOKEN environment variable')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!process.env.DATABASE_URL) {
      console.error('Missing DATABASE_URL environment variable')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    
    // Validate required fields with detailed error messages
    const requiredFields = ['photo', 'type', 'streetName', 'apartmentNumber', 'city', 'structuralDefects']
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const photo = formData.get('photo') as File
    if (!photo || !(photo instanceof File)) {
      console.error('Invalid or missing photo')
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
        { error: 'Failed to upload photo. Please try again.' },
        { status: 500 }
      )
    }

    // Create submission in database with error handling
    try {
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
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission to database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('Missing DATABASE_URL environment variable')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

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