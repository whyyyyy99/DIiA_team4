import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { BlobServiceClient } from "@azure/storage-blob"
import { prisma } from '@/lib/prisma'
import { analyzeText } from '@/lib/ai'

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME)

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File
    const type = formData.get('type') as string
    const streetName = formData.get('streetName') as string
    const apartmentNumber = formData.get('apartmentNumber') as string
    const city = formData.get('city') as string
    const structuralDefects = parseInt(formData.get('structuralDefects') as string)
    const decayMagnitude = formData.get('decayMagnitude') ? parseInt(formData.get('decayMagnitude') as string) : null
    const defectIntensity = formData.get('defectIntensity') ? parseInt(formData.get('defectIntensity') as string) : null
    const description = formData.get('description') as string

    // Upload file to Azure Blob Storage
    const blobName = `${Date.now()}-${file.name}`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    await blockBlobClient.uploadData(await file.arrayBuffer())
    const photoUrl = blockBlobClient.url

    // Create the submission
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
        userId: session.user.id
      }
    })

    // If there's a description, analyze it with Azure AI
    if (description) {
      const analysis = await analyzeText(description)
      await prisma.aIAnalysis.create({
        data: {
          submissionId: submission.id,
          severity: analysis.severity,
          category: analysis.category,
          suggestions: analysis.suggestions
        }
      })
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where = {
      ...(type && { type }),
      ...(search && {
        OR: [
          { streetName: { contains: search } },
          { city: { contains: search } }
        ]
      }),
      ...(session.user.role === 'tenant' && { userId: session.user.id })
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        submittedBy: {
          select: {
            email: true,
            role: true
          }
        },
        aiAnalysis: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Fetch submissions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}