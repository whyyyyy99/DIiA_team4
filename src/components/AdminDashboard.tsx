'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LogOut, AlertCircle, FileSpreadsheet, Users, BarChart3, MapPin, Eye } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from 'next/image'

interface Submission {
  id: string
  type: string
  streetName: string
  apartmentNumber: string
  city: string
  structuralDefects: number
  decayMagnitude: number
  defectIntensity: number
  description: string
  photoUrl: string
  date: string
  submittedBy?: string
  latitude?: number
  longitude?: number
}

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/submissions')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      setError('Failed to fetch submissions. Please try again.')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const filteredSubmissions = submissions
    .filter(submission => {
      if (filter === 'all') return true
      return submission.type.toLowerCase() === filter.toLowerCase()
    })
    .filter(submission => {
      const searchString = `${submission.streetName} ${submission.apartmentNumber} ${submission.city}`.toLowerCase()
      return searchString.includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  const getAverageDefectScore = (submissions: Submission[]) => {
    if (submissions.length === 0) return 0
    const total = submissions.reduce((acc, sub) => 
      acc + (sub.structuralDefects + sub.decayMagnitude + sub.defectIntensity) / 3, 0
    )
    return Math.round((total / submissions.length) * 10) / 10
  }

  const getTenantReports = () => submissions.filter(s => s.type === 'tenant').length
  const getEmployeeReports = () => submissions.filter(s => s.type === 'employee').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and view all submissions</p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="text-sm font-medium">Total Submissions</span>
          </div>
          <p className="text-2xl font-bold">{submissions.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Tenant Reports</span>
          </div>
          <p className="text-2xl font-bold">{getTenantReports()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Employee Reports</span>
          </div>
          <p className="text-2xl font-bold">{getEmployeeReports()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Avg. Defect Score</span>
          </div>
          <p className="text-2xl font-bold">{getAverageDefectScore(submissions)}</p>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Submissions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="tenant">Tenant Only</SelectItem>
            <SelectItem value="employee">Employee Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Defect Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading submissions...</TableCell>
              </TableRow>
            ) : filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No submissions found matching your criteria</TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    {submission.streetName} {submission.apartmentNumber}, {submission.city}
                  </TableCell>
                  <TableCell className="capitalize">{submission.type}</TableCell>
                  <TableCell>{format(new Date(submission.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate" title={submission.description}>
                      {submission.description || 'No description provided'}
                    </p>
                  </TableCell>
                  <TableCell>
                    {submission.latitude && submission.longitude ? (
                      <div className="flex items-center gap-1" title={`${submission.latitude}, ${submission.longitude}`}>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {submission.latitude.toFixed(4)}, {submission.longitude.toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No location data</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {((submission.structuralDefects + submission.decayMagnitude + submission.defectIntensity) / 3).toFixed(1)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Submission Details</DialogTitle>
                          <DialogDescription>
                            Submitted on {format(new Date(submission.date), 'dd MMMM yyyy HH:mm')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-1">Location Details</h3>
                              <p className="text-sm">
                                {submission.streetName} {submission.apartmentNumber}
                                <br />
                                {submission.city}
                              </p>
                              {submission.latitude && submission.longitude && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-4 w-4 inline mr-1" />
                                  {submission.latitude}, {submission.longitude}
                                </p>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">Description</h3>
                              <p className="text-sm whitespace-pre-wrap">{submission.description}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">Defect Assessment</h3>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Structural</p>
                                  <p className="font-medium">{submission.structuralDefects}/5</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Decay</p>
                                  <p className="font-medium">{submission.decayMagnitude}/5</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Intensity</p>
                                  <p className="font-medium">{submission.defectIntensity}/5</p>
                                </div>
                              </div>
                            </div>
                            {submission.submittedBy && (
                              <div>
                                <h3 className="font-semibold mb-1">Submitted By</h3>
                                <p className="text-sm">{submission.submittedBy}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Photo</h3>
                            <div className="aspect-video relative rounded-lg overflow-hidden border">
                              <Image
                                src={submission.photoUrl}
                                alt="Submitted defect"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={false}
                              />
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}