import React, { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface PhotoComparisonProps {
  referenceImageSrc: string
  capturedImageSrc: string
  onComparisonComplete: (score: number) => void
}

export function PhotoComparison({ referenceImageSrc, capturedImageSrc, onComparisonComplete }: PhotoComparisonProps) {
  const [comparisonScore, setComparisonScore] = useState<number | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const referenceImageRef = useRef<HTMLImageElement>(null)
  const capturedImageRef = useRef<HTMLImageElement>(null)

  const compareImages = async () => {
    setIsComparing(true)
    if (referenceImageRef.current && capturedImageRef.current) {
      const referenceImage = tf.browser.fromPixels(referenceImageRef.current)
      const capturedImage = tf.browser.fromPixels(capturedImageRef.current)

      // Resize images to the same dimensions
      const targetSize = [224, 224]
      const resizedReference = tf.image.resizeBilinear(referenceImage, targetSize)
      const resizedCaptured = tf.image.resizeBilinear(capturedImage, targetSize)

      // Convert to grayscale
      const grayReference = tf.mean(resizedReference, 2)
      const grayCaptured = tf.mean(resizedCaptured, 2)

      // Normalize pixel values
      const normalizedReference = grayReference.div(tf.scalar(255))
      const normalizedCaptured = grayCaptured.div(tf.scalar(255))

      // Calculate Mean Squared Error (MSE)
      const mse = tf.mean(tf.square(tf.sub(normalizedReference, normalizedCaptured)))

      // Convert MSE to a similarity score (0-100)
      const similarityScore = 100 - (await mse.array() * 100)
      setComparisonScore(similarityScore)
      onComparisonComplete(similarityScore)

      // Clean up tensors
      tf.dispose([referenceImage, capturedImage, resizedReference, resizedCaptured, grayReference, grayCaptured, normalizedReference, normalizedCaptured, mse])
    }
    setIsComparing(false)
  }

  useEffect(() => {
    // Load TensorFlow.js
    tf.ready().then(() => {
      console.log('TensorFlow.js is ready')
    })
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Reference Image</h3>
          <img ref={referenceImageRef} src={referenceImageSrc} alt="Reference" className="w-full h-auto" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Photo</h3>
          <img ref={capturedImageRef} src={capturedImageSrc} alt="Captured" className="w-full h-auto" />
        </div>
      </div>
      <Button onClick={compareImages} disabled={isComparing}>
        {isComparing ? 'Comparing...' : 'Compare Images'}
      </Button>
      {comparisonScore !== null && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Similarity Score</h3>
          <Progress value={comparisonScore} className="w-full" />
          <p className="text-center mt-2">{comparisonScore.toFixed(2)}% similar</p>
        </div>
      )}
    </div>
  )
}