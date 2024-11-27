import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    console.log('Submission request received')
    const formData = await req.formData()
    
    const photo = formData.get('photo')
    if (!photo || !(photo instanceof File)) {
      console.error('No photo uploaded')
      return NextResponse.json({ error: 'No photo uploaded' }, { status: 400 })
    }

    const type = formData.get('type') as string
    const streetName = formData.get('streetName') as string
    const apartmentNumber = formData.get('apartmentNumber') as string
    const city = formData.get('city') as string
    
    // Handle nullable number fields
    const parseNullableInt = (value: FormDataEntryValue | null): number | null => {
      if (value === null || value === '') return null;
      const parsed = parseInt(value as string, 10);
      return isNaN(parsed) ? null : parsed;
    };

    const structuralDefects = parseNullableInt(formData.get('structuralDefects')) ?? 3;
    const decayMagnitude = parseNullableInt(formData.get('decayMagnitude')) ?? 3;
    const defectIntensity = parseNullableInt(formData.get('defectIntensity')) ?? 3;
    
    const description = formData.get('description') as string
    const submittedBy = formData.get('submittedBy') as string | null
    
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null

    console.log('Parsed form data:', { 
      type, 
      streetName, 
      apartmentNumber, 
      city, 
      structuralDefects, 
      decayMagnitude, 
      defectIntensity, 
      description, 
      submittedBy, 
      latitude, 
      longitude 
    })

    // Validate required fields
    if (!type || !streetName || !apartmentNumber || !city) {
      console.error('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Uploading photo to blob storage')
    const blob = await put(`submissions/${Date.now()}_${photo.name}`, photo, {
      access: 'public',
    })
    console.log('Photo uploaded successfully:', blob.url)

    console.log('Creating submission in database')
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
        photoUrl: blob.url,
        submittedBy,
        latitude,
        longitude,
      },
    })
    console.log('Submission created successfully:', submission)

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Submission error:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { 
        error: 'Failed to submit',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

