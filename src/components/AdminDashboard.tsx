"use client"

import { useState, useEffect, useCallback } from "react"
import { LogOut, Eye, Users, Home, Building2, BarChart3, Search, Filter, Calendar } from 'lucide-react'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SubmissionType = 'tenant' | 'employee';

interface Submission {
  id: string;
  type: SubmissionType;
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
}

interface DashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: DashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<SubmissionType | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/submissions')
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch submissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.streetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         submission.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || submission.type === filterType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const stats = {
    total: submissions.length,
    tenant: submissions.filter(s => s.type === 'tenant').length,
    employee: submissions.filter(s => s.type === 'employee').length,
    averageDefectScore: submissions.length > 0 
      ? Math.round(submissions.reduce((acc, curr) => 
          acc + (curr.structuralDefects + curr.decayMagnitude + curr.defectIntensity) / 3, 0
        ) / submissions.length * 10) / 10
      : 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Manage and view all submissions</CardDescription>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tenant Reports</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.tenant}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employee Reports</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.employee}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Defect Score</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageDefectScore}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by address or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as SubmissionType | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="tenant">Tenant Reports</SelectItem>
                  <SelectItem value="employee">Employee Reports</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
              >
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submissions Table */}
            {isLoading ? (
              <div className="text-center py-6">Loading submissions...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Defect Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{`${submission.streetName}, ${submission.apartmentNumber}, ${submission.city}`}</TableCell>
                      <TableCell>
                        <Badge variant={submission.type === 'tenant' ? 'default' : 'secondary'}>
                          {submission.type === 'tenant' ? 'Tenant' : 'Employee'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(submission.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {((submission.structuralDefects + submission.decayMagnitude + submission.defectIntensity) / 3).toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Submission Details</DialogTitle>
        <DialogDescription>
          Submitted on {new Date(submission.date).toLocaleDateString()} at{' '}
          {new Date(submission.date).toLocaleTimeString()}
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden bg-muted">
            {submission.photoUrl ? (
              <Image
                src={submission.photoUrl}
                alt="Submitted photo"
                width={400}
                height={300}
                className="w-full object-cover"
                unoptimized // Add this for external URLs
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No photo available
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Structural Defects:</span>
              <Badge variant="outline">{submission.structuralDefects}/6</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Decay Magnitude:</span>
              <Badge variant="outline">{submission.decayMagnitude}/6</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Defect Intensity:</span>
              <Badge variant="outline">{submission.defectIntensity}/6</Badge>
            </div>
            <div className="pt-2">
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-sm text-muted-foreground">
                {submission.description || "No description provided"}
              </p>
            </div>
            {submission.submittedBy && (
              <div className="pt-2">
                <span className="font-medium">Submitted by:</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {submission.submittedBy}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {filteredSubmissions.length === 0 && !isLoading && (
              <div className="text-center py-6 text-muted-foreground">
                No submissions found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}