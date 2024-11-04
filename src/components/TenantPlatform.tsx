"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, LogIn, LogOut, Gift, ChevronRight, ChevronLeft, Home, Info, Eye } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type UserType = 'tenant' | 'employee' | null;

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

export default function TenantPlatform() {
  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [streetName, setStreetName] = useState("")
  const [apartmentNumber, setApartmentNumber] = useState("")
  const [city, setCity] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [structuralDefects, setStructuralDefects] = useState(3)
  const [decayMagnitude, setDecayMagnitude] = useState(3)
  const [defectIntensity, setDefectIntensity] = useState(3)
  const [description, setDescription] = useState("")
  const [uploadedPhotosCount, setUploadedPhotosCount] = useState(0)
  const [userType, setUserType] = useState<UserType>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const startCamera = async () => {
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
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

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
            setCurrentStep(6)
          }
        }, 'image/jpeg')
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
      setCurrentStep(6)
    }
  }

  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 10
      })
    }, 500)
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
    } else if (email === "kevin@kw.com" && password === "kleurrijkwonen") {
      toast({
        title: "Login successful!",
        description: "Welcome to the KleurijkWonen employee platform!",
      })
      setUserType('employee')
      setCurrentStep(10)
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setEmail("")
    setPassword("")
    setUserType(null)
    setCurrentStep(0)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const handleAddressSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (streetName && apartmentNumber && city) {
      setCurrentStep(2)
    } else {
      toast({
        title: "Missing information",
        description: "Please fill in all address details.",
        variant: "destructive",
      })
    }
  }

  const calculateFinalScore = () => {
    return Math.round((structuralDefects + decayMagnitude + defectIntensity) / 3)
  }

  const getRewardLevel = (photoCount: number) => {
    if (photoCount >= 10) return "Gold"
    if (photoCount >= 5) return "Silver"
    if (photoCount >= 1) return "Bronze"
    return "None"
  }

  const handleSubmit = () => {
    const submissionDate = new Date().toLocaleString()
    const newSubmission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      streetName,
      apartmentNumber,
      city,
      structuralDefects,
      decayMagnitude,
      defectIntensity,
      description,
      photoUrl: selectedFile ? URL.createObjectURL(selectedFile) : '',
      date: submissionDate,
    }
    setSubmissions([...submissions, newSubmission])
    setUploadedPhotosCount(prev => prev + 1)
    setCurrentStep(9)
    simulateUpload()
  }

  useEffect(() => {
    if (currentStep === 5) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [currentStep])

  useEffect(() => {
    if (userType === 'employee') {
      const fetchSubmissions = async () => {
        console.log('Fetching submissions for employee')
      }
      fetchSubmissions()
    }
  }, [userType])

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
    </Card>,

    // Step 1: Address Input
    <Card key="address" className="w-full max-w-md mx-auto">
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
        <CardTitle>Your Address</CardTitle>
        <CardDescription>Please enter your address details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street_name">Street Name</Label>
            <Input
              id="street_name"
              type="text"
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              placeholder="Enter your street name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment Number</Label>
            <Input
              id="apartment"
              type="text"
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
              placeholder="Enter your apartment number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter your city"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <Home className="mr-2 h-4 w-4" /> Continue
          </Button>
        </form>
      </CardContent>
    </Card>,

    // Step 2: Instructions for tenants
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
        <h3 className="font-semibold mt-4">How to Take Photos:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Ensure good lighting in the room</li>
          <li>Stand 1-2 meters away from the subject</li>
          <li>Make sure the entire element is visible</li>
          <li>Take a clear, focused photo</li>
        </ol>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setCurrentStep(3)} className="w-full">
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>,

    // Step 3: Example Photo
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
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => setCurrentStep(4)} className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Upload Photo
          </Button>
          <Button onClick={() => setCurrentStep(5)} className="w-full">
            <Camera className="mr-2 h-4 w-4" /> Take Photo
          </Button>
        </div>
      </CardContent>
    </Card>,

    // Step 4: Upload Photo
    <Card key="upload" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Photo</CardTitle>
        <CardDescription>Select a photo from your device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p  className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(3)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </CardFooter>
    </Card>,

    // Step 5: Camera View
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
              setCurrentStep(3)
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

    // Step 6: Photo Comparison
    <Card key="comparison" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Compare Photos</CardTitle>
        <CardDescription>Please verify that your photo matches the example</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retake Photo
          </Button>
          <Button onClick={() => setCurrentStep(7)}>
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>,

    // Step 7: Condition Assessment
    <Card key="assessment" className="w-full max-w-md mx-auto">
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
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <Label>Final Score:</Label>
            <div className="text-2xl font-bold text-center">{calculateFinalScore()}/6</div>
          </div>
        </div>
        <Button onClick={() => setCurrentStep(8)} className="w-full mt-4">
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>,

    // Step 8: Description Input
    <Card key="description" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Additional Description</CardTitle>
        <CardDescription>Please provide any additional observations (optional)</CardDescription>
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
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Briefly explain your observations..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Submit <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>,

    // Step 9: Thank You
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
              <Button onClick={() => setCurrentStep(3)} className="w-full" variant="outline">
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

    // Step 10: Employee Dashboard
    <Card key="employeeDashboard" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Employee Dashboard</CardTitle>
        <CardDescription>View tenant submissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Recent Submissions</h3>
          {submissions.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {submissions.map((submission) => (
                <li key={submission.id} className="flex justify-between items-center">
                  <span>{submission.streetName}, Apt {submission.apartmentNumber}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                        <DialogDescription>
                          Submitted on {submission.date}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="rounded-lg overflow-hidden">
                          <Image
                            src={submission.photoUrl}
                            alt="Submitted photo"
                            width={400}
                            height={300}
                            className="w-full object-cover"
                          />
                        </div>
                        <div>
                          <p><strong>Address:</strong> {submission.streetName}, Apt {submission.apartmentNumber}, {submission.city}</p>
                          <p><strong>Structural Defects:</strong> {submission.structuralDefects}/6</p>
                          <p><strong>Decay Magnitude:</strong> {submission.decayMagnitude}/6</p>
                          <p><strong>Defect Intensity:</strong> {submission.defectIntensity}/6</p>
                          <p><strong>Description:</strong> {submission.description || "No description provided"}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </CardFooter>
    </Card>,
  ]

  useEffect(() => {
    if (currentStep === 5) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [currentStep]) // startCamera is stable (doesn't depend on any state/props)

  useEffect(() => {
    if (userType === 'employee') {
      const fetchSubmissions = async () => {
        console.log('Fetching submissions for employee')
      }
      fetchSubmissions()
    }
  }, [userType])

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-lg mx-auto">
        {steps[currentStep]}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} width={400} height={300} />
    </div>
  )
}