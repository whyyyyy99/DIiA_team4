'use server'

import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export async function generateNEN2767Report(submissionId: string) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      throw new Error('Submission not found')
    }

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait'
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<string>(async (resolve, reject) => {
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks)
        const fileName = `NEN2767-Report-${randomUUID()}.pdf`
        
        try {
          // Save the report to the database
          const report = await prisma.report.create({
            data: {
              filename: fileName,
              content: pdfBuffer,
              submissionId: submissionId,
            },
          })

          resolve(report.id)
        } catch (writeError) {
          console.error('Error saving PDF to database:', writeError)
          reject(writeError)
        }
      })

      doc.on('error', reject)

      // Title
      doc.fontSize(20).text('NEN2767 Inspection Report', { align: 'center' })
      doc.moveDown(2)

      // Create two columns
      const startX = 50
      const startY = doc.y
      const width = doc.page.width - 100
      const columnGap = 20
      const leftColumnWidth = width * 0.6 // 60% for text
      const rightColumnWidth = width * 0.4 - columnGap // 40% for image

      // Left column - Text content
      doc.fontSize(14)
      
      // Property Information
      doc.text('Property Information', startX, startY)
      doc.fontSize(12)
      doc.text(`Address: ${submission.streetName} ${submission.apartmentNumber}`, { continued: false })
      doc.text(`City: ${submission.city}`)
      doc.text(`Inspection Date: ${submission.date.toLocaleDateString()}`)
      doc.moveDown()

      // Condition Assessment
      doc.fontSize(14)
      doc.text('Condition Assessment')
      doc.fontSize(12)
      doc.text(`Structural Defects: ${submission.structuralDefects}/6`)
      doc.text(`Decay Magnitude: ${submission.decayMagnitude}/6`)
      doc.text(`Defect Intensity: ${submission.defectIntensity}/6`)
      doc.moveDown()

      // Description
      doc.fontSize(14)
      doc.text('Description')
      doc.fontSize(12)
      doc.text(submission.description || 'No description provided')
      doc.moveDown()

      // Location Data
      if (submission.latitude && submission.longitude) {
        doc.fontSize(14)
        doc.text('Location Data')
        doc.fontSize(12)
        doc.text(`Latitude: ${submission.latitude}`)
        doc.text(`Longitude: ${submission.longitude}`)
      }

      // Right column - Photo
      if (submission.photoUrl && submission.photoUrl.includes('base64')) {
        try {
          const base64Data = submission.photoUrl.includes('data:image') 
            ? submission.photoUrl.split(';base64,')[1]
            : submission.photoUrl

          const imageBuffer = Buffer.from(base64Data, 'base64')
          
          // Calculate image position
          const imageX = startX + leftColumnWidth + columnGap
          
          // Add photo title
          doc.fontSize(14)
          doc.text('Inspection Photo', imageX, startY)
          doc.moveDown()

          // Add the image below the title
          doc.image(imageBuffer, imageX, doc.y, {
            fit: [rightColumnWidth, 300],
            align: 'center',
          })

        } catch (imageError) {
          console.error('Error embedding image:', imageError)
          doc.text('Error: Could not embed image in report')
        }
      }

      // Finalize the PDF
      doc.end()
    })

  } catch (error) {
    console.error('Error generating report:', error)
    throw error
  }
}

