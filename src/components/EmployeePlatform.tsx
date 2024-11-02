
// "use client"

// import { useState } from "react"
// import Image from "next/image"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Eye, LogOut } from "lucide-react"

// type Submission = {
//   id: string;
//   streetName: string;
//   apartmentNumber: string;
//   city: string;
//   structuralDefects: number;
//   decayMagnitude: number;
//   defectIntensity: number;
//   description: string;
//   photoUrl: string;
//   date: string;
// };

// interface EmployeePlatformProps {
//   onLogout: () => void;
// }

// export default function EmployeePlatform({ onLogout }: EmployeePlatformProps) {
//   const [submissions, setSubmissions] = useState<Submission[]>([])

//   return (
//     <div className="min-h-screen bg-background py-8 px-4">
//       <div className="container max-w-lg mx-auto">
//         <Card className="w-full max-w-md mx-auto">
//           <CardHeader>
//             <CardTitle>Employee Dashboard</CardTitle>
//             <CardDescription>View tenant submissions</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="bg-muted p-4 rounded-lg">
//               <h3 className="font-semibold mb-2">Recent Submissions</h3>
//               {submissions.length === 0 ? (
//                 <p>No submissions yet.</p>
//               ) : (
//                 <ul className="space-y-2">
//                   {submissions.map((submission) => (
//                     <li key={submission.id} className="flex justify-between items-center">
//                       <span>{submission.streetName}, Apt {submission.apartmentNumber}</span>
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button variant="outline" size="sm">
//                             <Eye className="h-4 w-4 mr-2" /> View
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>Submission Details</DialogTitle>
//                             <DialogDescription>
//                               Submitted on {submission.date}
//                             </DialogDescription>
//                           </DialogHeader>
//                           <div className="space-y-4">
//                             <div className="rounded-lg overflow-hidden">
//                               <Image
//                                 src={submission.photoUrl}
//                                 alt="Submitted photo"
//                                 width={400}
//                                 height={300}
//                                 className="w-full object-cover"
//                               />
//                             </div>
//                             <div>
//                               <p><strong>Address:</strong> {submission.streetName}, Apt {submission.apartmentNumber}, {submission.city}</p>
//                               <p><strong>Structural Defects:</strong> {submission.structuralDefects}/6</p>
//                               <p><strong>Decay Magnitude:</strong> {submission.decayMagnitude}/6</p>
//                               <p><strong>Defect Intensity:</strong> {submission.defectIntensity}/6</p>
//                               <p><strong>Description:</strong> {submission.description || "No description provided"}</p>
//                             </div>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </CardContent>
//           <CardFooter>
//             <Button onClick={onLogout} className="w-full">
//               <LogOut className="mr-2 h-4 w-4" /> Sign Out
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   )
// }