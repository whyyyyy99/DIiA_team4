import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

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

    // Upload photo to Vercel Blob Storage
    const blob = await put(`submissions/${Date.now()}-${photo.name}`, photo, {
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
        photoUrl: blob.url, // Store the Blob Storage URL
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