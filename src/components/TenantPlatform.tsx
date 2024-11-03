"use client"

// Importing necessary hooks and components from React and other libraries -> components can be found in the project directories e.g. components/ui
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

// Defining types for user and submission data -> either tenant or employee
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

// Main component for the tenant platform
export default function TenantPlatform() {
  
  // Variables to manage component state
  const [currentStep, setCurrentStep] = useState(0) // Track the current step in the process
  const [email, setEmail] = useState("") // Store user email
  const [password, setPassword] = useState("") // Store user password
  const [streetName, setStreetName] = useState("") // Store street name
  const [apartmentNumber, setApartmentNumber] = useState("") // Store apartment number
  const [city, setCity] = useState("") // Store city
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Store selected file for upload
  const [isCameraActive, setIsCameraActive] = useState(false) // Track if the camera is active
  const [uploadProgress, setUploadProgress] = useState(0) // Track upload progress
  const [structuralDefects, setStructuralDefects] = useState(3) // Store structural defects rating
  const [decayMagnitude, setDecayMagnitude] = useState(3) // Store decay magnitude rating
  const [defectIntensity, setDefectIntensity] = useState(3) // Store defect intensity rating
  const [description, setDescription] = useState("") // Store additional description
  const [uploadedPhotosCount, setUploadedPhotosCount] = useState(0) // Count of uploaded photos
  const [userType, setUserType] = useState<UserType>(null) // Track user type (tenant or employee)
  const [submissions, setSubmissions] = useState<Submission[]>([]) // Store submissions
  const videoRef = useRef<HTMLVideoElement>(null) // Reference to video element for camera
  const canvasRef = useRef<HTMLCanvasElement>(null) // Reference to canvas element for capturing photos
  const { toast } = useToast() // Toast for notifications

  // Function to start the camera on a device
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

  // Function to stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      setIsCameraActive(false)
    }
  }

  // Function to capture a photo from the device camera
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
          }
        }, 'image/jpeg')
      }
    }
  }

  // Handling file selection for upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  // Simulating file upload progress
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

  // Handling user login
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()
    if (email === "tenant@gmail.com" && password === "qwerty123") {
      toast({
        title: "Login successful!",
        description: "Welcome to the KleurijkWonen tenant platform!",
      })
      setUserType('tenant')
      setCurrentStep(1) // Move to address input -> if the tenant logs in, they see then the fill in address pages
    } else if (email === "kevin@kw.com" && password === "kleurijkwonen") {
      toast({
        title: "Login successful!",
        description: "Welcome to the KleurijkWonen employee platform!",
      })
      setUserType('employee')
      setCurrentStep(9) // Move to employee dashboard -> if the employee logs in, then the next page is their dashborad, not what the tenants see
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handling address submission
  const handleAddressSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (streetName && apartmentNumber && city) {
      setCurrentStep(2) // Move to instructions
    } else {
      toast({
        title: "Missing information",
        description: "Please fill in all address details.",
        variant: "destructive",
      })
    }
  }

  // Calculating final score of assessment based on ratings
  const calculateFinalScore = () => {
    return Math.round((structuralDefects + decayMagnitude + defectIntensity) / 3)
  }

  // Determining reward level based on photo count (we can change the levels)
  const getRewardLevel = (photoCount: number) => {
    if (photoCount >= 10) return "Gold"
    if (photoCount >= 5) return "Silver"
    if (photoCount >= 1) return "Bronze"
    return "None"
  }

  // Handling submission of data
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
    setCurrentStep(8)
    simulateUpload()
  }

  // Definining steps for the user interface
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
      </CardContent>
      <CardFooter>
        <Button onClick={() => setCurrentStep(4)} className="w-full">
          Take Photo <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>,

    // Step 4: Photo Upload
    <Card key="upload" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Photo</CardTitle>
        <CardDescription>Take a photo or upload from your device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCameraActive ? (
          <div className="space-y-4">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <Button onClick={capturePhoto} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Capture Photo
            </Button>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden">
              <Image
                src={URL.createObjectURL(selectedFile)}
                alt="Uploaded photo"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <Button onClick={() => setSelectedFile(null)} variant="outline" 
              className="w-full">
              Remove Photo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <Button onClick={startCamera} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Open Camera
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(3)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => setCurrentStep(5)} disabled={!selectedFile}>
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>,

    // Step 5: Photo Comparison
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
          <Button variant="outline" onClick={() => setCurrentStep(4)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retake Photo
          </Button>
          <Button onClick={() => setCurrentStep(6)}>
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>,

    // Step 6: Condition Assessment
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
        <Button onClick={() => setCurrentStep(7)} className="w-full mt-4">
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>,

    // Step 7: Description Input (optional for tenants)
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

    // Step 8: Thank You (with rewards - we can add the whole rewards page)
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
              <Button onClick={() => setCurrentStep(0)} className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>,

    // Step 9: Employee Dashboard
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
        <Button onClick={() => setCurrentStep(0)} className="w-full">
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </CardFooter>
    </Card>,
  ]

  // Effect to fetch submissions when userType is 'employee'
  useEffect(() => {
    if (userType === 'employee') {
      // This effect runs when userType changes and is 'employee'
      const fetchSubmissions = async () => {
        // In a real app, you would fetch submissions here
        console.log('Fetching submissions for employee')
      }
      fetchSubmissions()
    }
  }, [userType])

  // Render the current step of the process
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-lg mx-auto">
        {steps[currentStep]}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} width={400} height={300} />
    </div>
  )
}