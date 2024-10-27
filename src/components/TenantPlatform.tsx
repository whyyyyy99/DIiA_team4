"use client"

import { useState } from "react"
import { Upload, Camera, Gift, Info, LogIn } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function TenantPlatform() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [roomType, setRoomType] = useState<string>("")
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedFile && roomType) {
      console.log("Submitting file:", selectedFile.name, "for room part:", roomType)
      toast({
        title: "Photo submitted successfully!",
        description: "Thank you for contributing to our maintenance efforts.",
      })
      setSelectedFile(null)
      setRoomType("")
    } else {
      toast({
        title: "Submission incomplete",
        description: "Please select a photo and room part before submitting.",
        variant: "destructive",
      })
    }
  }

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()
    toast({
      title: "Login successful!",
      description: "Welcome to the KleurijkWonen tenant platform!",
      variant: "success",
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
    <div className="flex justify-center mb-8">
      <Image
        src="/images/logo.png"
        alt="KleurijkWonen Logo"
        width={300}
        height={100}
        className="rounded-lg shadow-md w-full max-w-[200px] sm:max-w-[300px]"
      />
    </div>
        <Card className="shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-t-lg bg-gray-200">
              <TabsTrigger value="login" className="data-[state=active]:bg-white rounded-tl-lg">Login</TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-white">Upload Photo</TabsTrigger>
              <TabsTrigger value="instructions" className="data-[state=active]:bg-white rounded-tr-lg">Instructions</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Login to Your Account</CardTitle>
                <CardDescription className="text-center">Enter your credentials to access the tenant platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" required className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input id="password" type="password" required className="w-full" />
                  </div>
                  <Button type="submit" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" /> Log In
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            <TabsContent value="upload" className="p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Upload Interior Photo</CardTitle>
                <CardDescription className="text-center">Help us maintain your building and earn rewards!</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo-upload" className="text-sm font-medium">Upload Photo</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="photo-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                        </div>
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-sm text-green-600">Selected file: {selectedFile.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-type" className="text-sm font-medium">Room Part</Label>
                    <Select value={roomType} onValueChange={setRoomType}>
                      <SelectTrigger id="room-type">
                        <SelectValue placeholder="Select room part" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="living-room">Living Room</SelectItem>
                        <SelectItem value="bedroom">Bedroom</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="bathroom">Bathroom</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Photo
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-start space-y-4 bg-gray-50 rounded-b-lg mt-6 p-4">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <p className="text-sm text-gray-600">Your photos help us plan maintenance efficiently.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <p className="text-sm text-gray-600">Earn rewards like rent deductions or gift cards!</p>
                </div>
              </CardFooter>
            </TabsContent>
            <TabsContent value="instructions" className="p-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">How to Use This Platform</CardTitle>
                <CardDescription className="text-center">Learn why we need your photos and how to submit them</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Why We Need Your Photos</h3>
                  <p className="text-sm text-gray-600">
                    Your interior photos help us:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                    <li>Identify potential maintenance issues early</li>
                    <li>Plan renovations and improvements more effectively</li>
                    <li>Ensure the safety and comfort of all our tenants</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">How to Submit Photos</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Log in to your account using your email and password</li>
                    <li>Click on the "Upload Photo" tab</li>
                    <li>Click the upload area or drag and drop your photo</li>
                    <li>Select the room part from the dropdown menu</li>
                    <li>Click "Submit Photo"</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tips for Good Photos</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Ensure good lighting - open curtains or turn on lights</li>
                    <li>Take clear, focused shots of the entire room</li>
                    <li>Include close-ups of any areas of concern (e.g., cracks, leaks)</li>
                    <li>Avoid including personal items or people in the photos</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 rounded-b-lg mt-6 p-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-primary" />
                  <p className="text-sm text-gray-600">
                    If you need help, contact our support team at info@kleurrijkwonen.nl
                  </p>
                </div>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}