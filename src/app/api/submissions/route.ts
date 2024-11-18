import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'

// Create a single PrismaClient instance
const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Starting to fetch submissions...')

    const submissions = await prisma.submission.findMany({
      orderBy: { date: 'desc' },
      select: {
        id: true,
        type: true,
        streetName: true,
        apartmentNumber: true,
        city: true,
        structuralDefects: true,
        decayMagnitude: true,
        defectIntensity: true,
        description: true,
        photoUrl: true,
        date: true,
        submittedBy: true,
        latitude: true,
        longitude: true,
      },
    })

    console.log(`Successfully fetched ${submissions.length} submissions`)

    return NextResponse.json(submissions, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Failed to fetch submissions:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch submissions',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {
        status: 500,
      }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    const photo = formData.get('photo')
    if (!photo || !(photo instanceof File)) {
      return NextResponse.json({ error: 'No photo uploaded' }, { status: 400 })
    }

    const type = formData.get('type') as string
    const streetName = formData.get('streetName') as string
    const apartmentNumber = formData.get('apartmentNumber') as string
    const city = formData.get('city') as string
    const structuralDefects = parseInt(formData.get('structuralDefects') as string)
    const decayMagnitude = parseInt(formData.get('decayMagnitude') as string)
    const defectIntensity = parseInt(formData.get('defectIntensity') as string)
    const description = formData.get('description') as string
    const submittedBy = formData.get('submittedBy') as string | null
    
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null

    const blob = await put(`submissions/${Date.now()}_${photo.name}`, photo, {
      access: 'public',
    })

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

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
}