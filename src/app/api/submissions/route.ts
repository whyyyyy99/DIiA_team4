import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)

    // Convert photo to base64
    const bytes = await photo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const photoUrl = `data:${photo.type};base64,${buffer.toString('base64')}`

    // Create the submission in the database
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
        latitude,
        longitude,
        date: new Date(),
      },
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

