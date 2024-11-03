"use client"

import { useState, useEffect } from "react"
import { LogOut, Eye, ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Defining types for employee view of tenant submissions
type Submission = {
  id: string;
  streetName: string;
  apartmentNumber: string;
  city: string;
  structuralDefects: number;
  decayMagnitude: number;
  defectIntensity: number;
  description: string;
  photoUrl: string;
  date: string;
};

// Main component for the employee platform
export default function EmployeePlatform() {
  
  const [currentStep, setCurrentStep] = useState(0)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Fetch submissions
  useEffect(() => {
    // Dummy data for now; replace with real API call to fetch submissions
    const fetchSubmissions = async () => {
      const dummySubmissions: Submission[] = [
        // Sample submission data
        {
          id: "1",
          streetName: "123 Main St",
          apartmentNumber: "12A",
          city: "Anytown",
          structuralDefects: 4,
          decayMagnitude: 3,
          defectIntensity: 5,
          description: "Cracks in the wall near the window.",
          photoUrl: "/images/sample-photo.jpg",
          date: "2024-11-03 12:00 PM",
        },
      ]
      setSubmissions(dummySubmissions)
    }
    fetchSubmissions()
  }, [])

  // Navigation handlers
  const goToNextSubmission = () => {
    const currentIndex = submissions.findIndex(sub => sub.id === selectedSubmission?.id)
    if (currentIndex < submissions.length - 1) {
      setSelectedSubmission(submissions[currentIndex + 1])
    }
  }

  const goToPreviousSubmission = () => {
    const currentIndex = submissions.findIndex(sub => sub.id === selectedSubmission?.id)
    if (currentIndex > 0) {
      setSelectedSubmission(submissions[currentIndex - 1])
    }
  }

  // Initialize the first submission when data is loaded
  useEffect(() => {
    if (submissions.length > 0) {
      setSelectedSubmission(submissions[0])
    }
  }, [submissions])

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-lg mx-auto">
        {selectedSubmission ? (
          <Card key={selectedSubmission.id} className="w-full">
            <CardHeader>
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/logo.png"
                  alt="KleurijkWonen Logo"
                  width={200}
                  height={80}
                  className="rounded-lg"
                />
              </div>
              <CardTitle>Employee Dashboard</CardTitle>
              <CardDescription>Reviewing submission for {selectedSubmission.streetName}, Apt {selectedSubmission.apartmentNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={selectedSubmission.photoUrl}
                  alt="Submitted photo"
                  width={400}
                  height={300}
                  className="w-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <p><strong>Address:</strong> {selectedSubmission.streetName}, Apt {selectedSubmission.apartmentNumber}, {selectedSubmission.city}</p>
                <p><strong>Submitted on:</strong> {selectedSubmission.date}</p>
                <p><strong>Description:</strong> {selectedSubmission.description || "No description provided"}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Structural Defects:</strong> {selectedSubmission.structuralDefects}/6</p>
                  <Slider value={[selectedSubmission.structuralDefects]} max={6} min={1} step={1} disabled />
                </div>
                <div className="space-y-2">
                  <p><strong>Decay Magnitude:</strong> {selectedSubmission.decayMagnitude}/6</p>
                  <Slider value={[selectedSubmission.decayMagnitude]} max={6} min={1} step={1} disabled />
                </div>
                <div className="space-y-2">
                  <p><strong>Defect Intensity:</strong> {selectedSubmission.defectIntensity}/6</p>
                  <Slider value={[selectedSubmission.defectIntensity]} max={6} min={1} step={1} disabled />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={goToPreviousSubmission} disabled={submissions[0].id === selectedSubmission.id}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={goToNextSubmission} disabled={submissions[submissions.length - 1].id === selectedSubmission.id}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => setCurrentStep(0)} className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <p>Loading submissions...</p>
        )}
      </div>
    </div>
  )
}
