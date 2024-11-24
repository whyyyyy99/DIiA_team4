'use server'

import { PrismaClient } from '@prisma/client'
import PDFDocument from 'pdfkit'
import { randomUUID } from 'crypto'

// Create a new PrismaClient instance
const prisma = new PrismaClient()

export async function generateNEN2767Report(submissionId: string): Promise<string> {
  console.log(`Generating report for submission ID: ${submissionId}`)
  
  try {
    // Ensure database connection
    await prisma.$connect()
    
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      console.error(`Submission not found for ID: ${submissionId}`)
      throw new Error('Submission not found')
    }

    console.log(`Found submission: ${JSON.stringify(submission)}`)

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait'
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<string>((resolve, reject) => {
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks)
        const fileName = `NEN2767-Report-${randomUUID()}.pdf`
        
        try {
          console.log(`Saving report to database: ${fileName}`)
          // Save the report to the database
          const report = await prisma.report.create({
            data: {
              filename: fileName,
              content: pdfBuffer,
              submissionId: submissionId,
            },
          })

          console.log(`Report saved successfully. Report ID: ${report.id}`)
          resolve(report.id)
        } catch (writeError) {
          console.error('Error saving PDF to database:', writeError)
          reject(writeError)
        }
      })

      doc.on('error', (error) => {
        console.error('Error generating PDF:', error)
        reject(error)
      })

      // PDF Content Generation
      doc.fontSize(20).text('NEN2767 Inspection Report', { align: 'center' })
      doc.moveDown(2)

      // Property Information
      doc.fontSize(14).text('Property Information')
      doc.fontSize(12)
      doc.text(`Address: ${submission.streetName} ${submission.apartmentNumber}`)
      doc.text(`City: ${submission.city}`)
      doc.text(`Inspection Date: ${submission.date.toLocaleDateString()}`)
      doc.moveDown()

      // Condition Assessment
      doc.fontSize(14).text('Condition Assessment')
      doc.fontSize(12)
      doc.text(`Structural Defects: ${submission.structuralDefects}/6`)
      doc.text(`Decay Magnitude: ${submission.decayMagnitude}/6`)
      doc.text(`Defect Intensity: ${submission.defectIntensity}/6`)
      doc.moveDown()

      // Description
      doc.fontSize(14).text('Description')
      doc.fontSize(12)
      doc.text(submission.description || 'No description provided')
      doc.moveDown()

      // Location Data
      if (submission.latitude && submission.longitude) {
        doc.fontSize(14).text('Location Data')
        doc.fontSize(12)
        doc.text(`Latitude: ${submission.latitude}`)
        doc.text(`Longitude: ${submission.longitude}`)
      }

      // Finalize the PDF
      doc.end()
    })

  } catch (error) {
    console.error('Error generating report:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

