"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, LogIn, LogOut, Gift, ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress" 

export default function TenantPlatform() {
  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (isCameraActive) {
        stopCamera()
      }
    }
  }, [isCameraActive])
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      // Properly type the error and provide a fallback message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred while accessing camera';
      
      toast({
        title: "Camera Error",
        description: `Unable to access camera: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" })
            setSelectedFile(file)
            stopCamera()
            simulateUpload(file)
          }
        }, 'image/jpeg')
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSelectedFile(file)
      simulateUpload(file)
    }
  }

  const simulateUpload = (file: File) => {
    setUploadProgress(0)
  console.log('Starting upload of:', file.name)
  const interval = setInterval(() => {
    setUploadProgress(prev => {
      if (prev >= 100) {
        clearInterval(interval)
        setCurrentStep(4)
        return 100
      }
      return prev + 10
    })
  }, 200)
}

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()
    if (email === "test@gmail.com" && password === "qwerty123") {
      toast({
        title: "Login successful!",
        description: "Welcome to the KleurijkWonen tenant platform!",
      })
      setCurrentStep(1)
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = () => {
    stopCamera()
    setCurrentStep(0)
    setEmail("")
    setPassword("")
    setSelectedFile(null)
    setUploadProgress(0)
    toast({
      title: "Signed out successfully",
      description: "Thank you for using our platform!",
    })
  }

  const handleClaimReward = () => {
    toast({
      title: "Reward claimed!",
      description: "Your reward will be processed shortly.",
    })
  }

  const steps = [
    // Step 0: Login
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
        <CardDescription>Enter your credentials to access the tenant platform</CardDescription>
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
              placeholder="test@gmail.com"
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
              placeholder="qwerty123"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <LogIn className="mr-2 h-4 w-4" /> Log In
          </Button>
        </form>
      </CardContent>
    </Card>,

    // Step 1: Instructions
    <Card key="instructions" className="w-full max-w-md mx-auto">
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
        <CardTitle>How to Take Photos</CardTitle>
        <CardDescription>Follow these guidelines to help us maintain your building</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Why We Need Your Photos</h3>
          <p className="text-sm text-muted-foreground">
            Your photos help us identify maintenance needs and ensure the safety and comfort of all tenants.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Photo Guidelines</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Ensure good lighting</li>
            <li>Take clear, focused shots</li>
            <li>Include the entire area of concern</li>
            <li>Avoid including personal items</li>
          </ul>
        </div>
        <Button onClick={() => setCurrentStep(2)} className="w-full">
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>,

    // Step 2: Example Photo
    <Card key="example" className="w-full max-w-md mx-auto">
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
        <CardTitle>Example Photo</CardTitle>
        <CardDescription>Your photo should look similar to this example</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg overflow-hidden">
          <Image
            src="/images/window-frame.png"
            alt="Example window frame"
            width={400}
            height={300}
            className="w-full object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => {
            setCurrentStep(3)
            startCamera()
          }} className="w-full" variant="outline">
            <Camera className="mr-2 h-4 w-4" /> Take Photo
          </Button>
          <label className="w-full">
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button className="w-full" variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" /> Upload Photo
              </span>
            </Button>
          </label>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(1)}
          className="mr-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </CardFooter>
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
          <Button
            variant="outline"
            onClick={() => {
              stopCamera()
              setCurrentStep(2)
            }}
          >
            Cancel
          </Button>
          <Button onClick={capturePhoto}>
            Capture Photo
          </Button>
        </div>
      </CardContent>
    </Card>,

    // Step 4: Thank You
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
        <CardDescription>Your photo has been submitted successfully</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadProgress < 100 ? (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center text-muted-foreground">
              Uploading photo... {uploadProgress}%
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
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleClaimReward} className="w-full" variant="outline">
                <Gift className="mr-2 h-4 w-4" /> Claim Reward
              </Button>
              <Button onClick={handleSignOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>,
  ]

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-lg mx-auto">
        {steps[currentStep]}
      </div>
    </div>
  )
}