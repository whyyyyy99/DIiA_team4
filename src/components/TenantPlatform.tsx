"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Camera, LogIn, LogOut, Gift, ChevronRight, ChevronLeft, Info } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import AdminDashboard from "./AdminDashboard"
import { PhotoComparison } from './PhotoComparison'

type UserType = 'tenant' | 'employee' | 'admin' | null;

type Submission = {
  id: string;
  type: 'tenant' | 'employee';
  streetName: string;
  apartmentNumber: string;
  city: string;
  structuralDefects: number;
  decayMagnitude: number;
  defectIntensity: number;
  description: string;
  photoUrl: string;
  date: string;
  submittedBy?: string;
};

export default function Component() {
  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [structuralDefects, setStructuralDefects] = useState(3)
  const [decayMagnitude, setDecayMagnitude] = useState(3)
  const [defectIntensity, setDefectIntensity] = useState(3)
  const [description, setDescription] = useState("")
  const [uploadedPhotosCount, setUploadedPhotosCount] = useState(0)
  const [userType, setUserType] = useState<UserType>(null)
  const [_submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedAddress, setSelectedAddress] = useState({ street: "", number: "", city: "" })
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const [showPhotoComparison, setShowPhotoComparison] = useState(false)
  const [comparisonScore, setComparisonScore] = useState<number | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred while accessing camera'
      
      toast({
        title: "Camera Error",
        description: `Unable to access camera: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }, [toast])

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }, [])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })
            setSelectedFile(file)
            stopCamera()
            setCurrentStep(currentStep + 1)
          }
        }, 'image/jpeg')
      }
    }
  }

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()
    if (email === "tenant@gmail.com" && password === "qwerty123") {
      toast({
        title: "Login successful!",
        description: "Welcome to the KleurijkWonen tenant platform!",
      })
      setUserType('tenant')
      setCurrentStep(1)
    } else if (email === "employee@kw.com" && password === "employee") {
      toast({
        title: "Login successful!",
        description: "Welcome to the KleurijkWonen employee platform!",
      })
      setUserType('employee')
      setCurrentStep(10)
    } else if (email === "kevin@kw.com" && password === "admin") {
      toast({
        title: "Login successful!",
        description: "Welcome to the KleurijkWonen admin platform!",
      })
      setUserType('admin')
      setCurrentStep(20)
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }
    setDescription("")
  }

  const handleLogout = () => {
    setEmail("")
    setPassword("")
    setUserType(null)
    setCurrentStep(0)
    setDescription("")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const getRewardLevel = (photoCount: number) => {
    if (photoCount >= 10) return "Gold"
    if (photoCount >= 5) return "Silver"
    if (photoCount >= 1) return "Bronze"
    return "None"
  }

  const resetAssessment = () => {
    setStructuralDefects(3)
    setDecayMagnitude(3)
    setDefectIntensity(3)
    setDescription("")
    setSelectedFile(null)
    setShowPhotoComparison(false)
    setComparisonScore(null)
  }

  const handleComparisonComplete = (score: number) => {
    setComparisonScore(score)
    if (score >= 80) {
      toast({
        title: "Great job!",
        description: "Your photo is very similar to the reference. You can proceed with the submission.",
        variant: "default",
      })
    } else {
      toast({
        title: "Photo might need adjustment",
        description: "Try to match the angle and framing of the reference photo more closely.",
        variant: "warning",
      })
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please capture a photo before submitting.",
        variant: "destructive",
      })
      return
    }
  
    setUploadProgress(0)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 500)
  
    try {
      const formData = new FormData()
      
      formData.append('photo', selectedFile)
      formData.append('type', userType === 'tenant' ? 'tenant' : 'employee')
      formData.append('streetName', userType === 'tenant' ? "Topstraat" : selectedAddress.street)
      formData.append('apartmentNumber', userType === 'tenant' ? "55" : selectedAddress.number)
      formData.append('city', userType === 'tenant' ? "Tiel" : selectedAddress.city)
      formData.append('structuralDefects', structuralDefects.toString())
      formData.append('decayMagnitude', decayMagnitude.toString())
      formData.append('defectIntensity', defectIntensity.toString())
      formData.append('description', description)
      formData.append('submittedBy', userType === 'employee' ? email : '')
  
      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit the assessment')
      }
  
      clearInterval(progressInterval)
      setUploadProgress(100)
  
      setSubmissions(prevSubmissions => [...prevSubmissions, data])
      setUploadedPhotosCount(prev => prev + 1)
      
      resetAssessment()
  
      toast({
        title: "Submission Successful",
        description: "Your assessment has been submitted.",
        variant: "default",
      })
  
      if (userType === 'tenant') {
        setTimeout(() => setCurrentStep(6), 1000)
      } else if (userType === 'employee') {
        setTimeout(() => {
          setCurrentStep(10)
        }, 1500)
      }
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      
      console.error('Submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit the assessment. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const [debouncedDescription, setDebouncedDescription] = useState(description)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Use debouncedDescription here if needed
      console.log("Debounced description:", description)
    }, 300)

    return () => clearTimeout(timer)
  }, [description])

  useEffect(() => {
    if ((currentStep === 3 && userType === 'tenant') || (currentStep === 12 && userType === 'employee')) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [currentStep, userType, startCamera, stopCamera])

  const tenantSteps = [
    // Step 1: Instructions
    <Card key="instructions" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Instructions & Information</CardTitle>
        <CardDescription>Help us improve your living space</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Why We Need Your Help
          </h3>
          <p className="text-sm text-muted-foreground">
            By submitting photos and assessments of your living space, you help us:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
            <li>Identify areas that need maintenance</li>
            <li>Prioritize repairs and improvements</li>
            <li>Ensure the safety and comfort of all tenants</li>
          </ul>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center">
            <Gift className="mr-2 h-4 w-4" />
            What You Can Gain
          </h3>
          <p className="text-sm text-muted-foreground">
            As a thank you for your participation, you can earn rewards based on the number of photos you submit:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
            <li>Bronze level: 1-4 photos</li>
            <li>Silver level: 5-9 photos</li>
            <li>Gold level: 10+ photos</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setCurrentStep(2)} className="w-full">
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>,
    // Step 2: Example Photo
    <Card key="example" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Example Photo</CardTitle>
        <CardDescription>This is how your photo should look</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg overflow-hidden">
          <Image
            src="/images/window-frame1.png"
            alt="Example window frame"
            width={400}
            height={300}
            className="w-full object-cover"
          />
        </div>
        <Button onClick={() => setCurrentStep(3)} className="w-full">
          <Camera className="mr-2 h-4 w-4" /> Take Photo
        </Button>
      </CardContent>
    </Card>,
    // Step 3: Camera View
    <Card key="camera" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Take Photo</CardTitle>
        <CardDescription>Position the camera to capture the area clearly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            Cancel
          </Button>
          <Button onClick={capturePhoto}>
            Capture Photo
          </Button>
        </div>
      </CardContent>
    </Card>,
    // Step 4: Photo Comparison (updated for tenant)
    <Card key="comparison" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compare Photos</CardTitle>
        <CardDescription>Please verify that your photo matches the example</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showPhotoComparison ? (
          <PhotoComparison
            referenceImageSrc="/images/window-frame1.png"
            capturedImageSrc={selectedFile ? URL.createObjectURL(selectedFile) : ''}
            onComparisonComplete={handleComparisonComplete}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Example Photo</Label>
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/window-frame1.png"
                  alt="Example window frame"
                  width={200}
                  height={150}
                  className="w-full object-cover"
                />
              </div>
            </div>
            <div>
              <Label>Your Photo</Label>
              {selectedFile && (
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src={URL.createObjectURL(selectedFile)}
                    alt="Your uploaded photo"
                    width={200}
                    height={150}
                    className="w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retake Photo
          </Button>
          {showPhotoComparison ? (
            <Button onClick={() => setCurrentStep(5)} disabled={comparisonScore === null || comparisonScore < 80}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setShowPhotoComparison(true)}>
              Compare Photos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>,
    // Step 5: Condition Assessment (updated for tenant)
    <Card key="assessment" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Assess the Condition</CardTitle>
        <CardDescription>Please rate the following aspect on a scale of 1-6</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedFile && (
          <div className="rounded-lg overflow-hidden mb-6">
            <Image
              src={URL.createObjectURL(selectedFile)}
              alt="Uploaded photo"
              width={400}
              height={300}
              className="w-full object-cover"
            />
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Are there defects to the structural element?</Label>
            <Slider
              value={[structuralDefects]}
              onValueChange={(value) => setStructuralDefects(value[0])}
              max={6}
              min={1}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-center">{structuralDefects}/6</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Additional Comments (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional observations..."
              value={description}
              onChange={(e) => {
                const value = e.target.value
                requestAnimationFrame(() => {
                  setDescription(value)
                })
              }}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <Button onClick={handleSubmit} className="w-full mt-4">
          Submit <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>,
    // Step 6: Thank You and Rewards
    <Card key="thankyou" className="w-full max-w-md mx-auto">
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
        <CardTitle>Thank You!</CardTitle>
        <CardDescription>Your submission has been received</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadProgress < 100 ? (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center text-muted-foreground">
              Processing submission... {uploadProgress}%
            </p>
          </div>
        ) : (
          <>
            {selectedFile && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt="Uploaded photo"
                  width={400}
                  height={300}
                  className="w-full object-cover"
                />
              </div>
            )}
            <div className="bg-muted p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Your Reward Level</h3>
              <p className="text-2xl font-bold">{getRewardLevel(uploadedPhotosCount)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Total photos submitted: {uploadedPhotosCount}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setCurrentStep(2)} className="w-full" variant="outline">
                Submit Another Photo
              </Button>
              <Button onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>,
  ]

  const employeeSteps = [
    // Step 10: Employee Dashboard
    <Card key="employeeDashboard" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Employee Dashboard</CardTitle>
        <CardDescription>Select a tenant address to inspect</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => {
          setSelectedAddress({ street: "Topstraat", number: "55", city: "Tiel" });
          setCurrentStep(11);
        }} className="w-full">
          Topstraat 55, Tiel
        </Button>
        <Button onClick={() => {
          setSelectedAddress({ street: "Kerkstraat", number: "23/4B", city: "Tiel" });
          setCurrentStep(11);
        }} className="w-full">
          Kerkstraat 23/4B, Tiel
        </Button>
        <Button onClick={() => {
          setSelectedAddress({ street: "Schoolstraat", number: "15", city: "Boxtel" });
          setCurrentStep(11);
        }} className="w-full">
          Schoolstraat 15, Boxtel
        </Button>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </CardFooter>
    </Card>,
    // Step 11: Example Photo
    <Card key="employeeExample" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Example Photo</CardTitle>
        <CardDescription>This is how your photo should look</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg overflow-hidden">
          <Image
            src="/images/door-handle.png"
            alt="Example window frame"
            width={400}
            height={300}
            className="w-full object-cover"
          />
        </div>
        <Button onClick={() => setCurrentStep(12)} className="w-full">
          <Camera className="mr-2 h-4 w-4" /> Take Photo
        </Button>
      </CardContent>
    </Card>,
    // Step 12: Camera View
    <Card key="employeeCamera" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Take Photo</CardTitle>
        <CardDescription>Position the camera to capture the area clearly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => setCurrentStep(11)}>
            Cancel
          </Button>
          <Button onClick={capturePhoto}>
            Capture Photo
          </Button>
        </div>
      </CardContent>
    </Card>,
    // Step 13: Photo Comparison (new step for employee)
    <Card key="employeeComparison" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compare Photos</CardTitle>
        <CardDescription>Please verify that your photo matches the example</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showPhotoComparison ? (
          <PhotoComparison
            referenceImageSrc="/images/door-handle.png"
            capturedImageSrc={selectedFile ? URL.createObjectURL(selectedFile) : ''}
            onComparisonComplete={handleComparisonComplete}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Example Photo</Label>
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/door-handle.png"
                  alt="Example door handle"
                  width={200}
                  height={150}
                  className="w-full object-cover"
                />
              </div>
            </div>
            <div>
              <Label>Your Photo</Label>
              {selectedFile && (
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src={URL.createObjectURL(selectedFile)}
                    alt="Your uploaded photo"
                    width={200}
                    height={150}
                    className="w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(12)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retake Photo
          </Button>
          {showPhotoComparison ? (
            <Button onClick={() => setCurrentStep(14)} disabled={comparisonScore === null || comparisonScore < 80}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setShowPhotoComparison(true)}>
              Compare Photos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>,
    // Step 14: Condition Assessment (unchanged for employee)
    <Card key="employeeAssessment" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Assess the Condition</CardTitle>
        <CardDescription>Please rate the following aspects on a scale of 1-6</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedFile && (
          <div className="rounded-lg overflow-hidden mb-6">
            <Image
              src={URL.createObjectURL(selectedFile)}
              alt="Uploaded photo"
              width={400}
              height={300}
              className="w-full object-cover"
            />
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Are there defects to the structural element?</Label>
            <Slider
              value={[structuralDefects]}
              onValueChange={(value) => setStructuralDefects(value[0])}
              max={6}
              min={1}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-center">{structuralDefects}/6</div>
          </div>
          <div className="space-y-2">
            <Label>What is the magnitude of the decay?</Label>
            <Slider
              value={[decayMagnitude]}
              onValueChange={(value) => setDecayMagnitude(value[0])}
              max={6}
              min={1}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-center">{decayMagnitude}/6</div>
          </div>
          <div className="space-y-2">
            <Label>What is the intensity of the defects?</Label>
            <Slider
              value={[defectIntensity]}
              onValueChange={(value) => setDefectIntensity(value[0])}
              max={6}
              min={1}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-center">{defectIntensity}/6</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Additional Information</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed observations..."
              value={description}
              onChange={(e) => {
                const value = e.target.value
                requestAnimationFrame(() => {
                  setDescription(value)
                })
              }}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <Button onClick={handleSubmit} className="w-full mt-4">
          Submit
        </Button>
      </CardContent>
    </Card>,
    // Step 15: Upload Progress
  <Card key="employeeUploadProgress" className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Uploading Submission</CardTitle>
    <CardDescription>Please wait while we process your submission</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="space-y-2">
      <Progress value={uploadProgress} />
      <p className="text-sm text-center text-muted-foreground">
        Processing submission... {uploadProgress}%
      </p>
    </div>
    {uploadProgress === 100 && (
      <div className="text-center">
        <p className="font-semibold text-green-600">Upload Complete!</p>
        <p className="text-sm text-muted-foreground mt-2">Returning to dashboard...</p>
      </div>
    )}
  </CardContent>
</Card>,
]

  const adminSteps = [
    // Step 20: Admin Dashboard
    <AdminDashboard
      key="adminDashboard"
      onLogout={handleLogout}
    />,
  ]

  const loginStep = (
    <Card key="login" className="w-full max-w-md mx-auto">
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
        <CardTitle>Login to Your Account</CardTitle>
        <CardDescription>Enter your credentials to access the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <LogIn className="mr-2 h-4 w-4" /> Log In
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-lg mx-auto">
        {currentStep === 0 ? loginStep :
         userType === 'tenant' ? tenantSteps[currentStep - 1] :
         userType === 'employee' ? employeeSteps[currentStep - 10] :
         userType === 'admin' ? adminSteps[currentStep - 20] :
         null}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} width={400} height={300} />
    </div>
  )
}