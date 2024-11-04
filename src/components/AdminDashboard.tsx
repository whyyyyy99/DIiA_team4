"use client"

import { useState } from "react"
import { LogOut, Eye, Users, Home, Building2, BarChart3, Search, Filter, Calendar } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SubmissionType = 'tenant' | 'employee';

interface DashboardProps {
  submissions: Array<{
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
  }>;
  onLogout: () => void;
}

export default function Component({ submissions = [], onLogout }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<SubmissionType | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const tenantSubmissions = submissions.filter(s => s.type === 'tenant')
  const employeeSubmissions = submissions.filter(s => s.type === 'employee')

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
    tenant: tenantSubmissions.length,
    employee: employeeSubmissions.length,
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

            {/* Submissions List */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Submissions</TabsTrigger>
                <TabsTrigger value="tenant">Tenant Reports</TabsTrigger>
                <TabsTrigger value="employee">Employee Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">
                              {submission.streetName}, {submission.apartmentNumber}
                            </CardTitle>
                            <CardDescription>{submission.city}</CardDescription>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={submission.type === 'tenant' ? 'default' : 'secondary'}>
                              {submission.type === 'tenant' ? 'Tenant Report' : 'Employee Report'}
                            </Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Submission Details</DialogTitle>
                                  <DialogDescription>
                                    Submitted on {new Date(submission.date).toLocaleDateString()} at{' '}
                                    {new Date(submission.date).toLocaleTimeString()}
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
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  {filteredSubmissions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No submissions found matching your criteria
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="tenant" className="mt-6">
                <div className="space-y-4">
                  {tenantSubmissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">
                              {submission.streetName}, {submission.apartmentNumber}
                            </CardTitle>
                            <CardDescription>{submission.city}</CardDescription>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Tenant Submission Details</DialogTitle>
                                <DialogDescription>
                                  Submitted on {new Date(submission.date).toLocaleDateString()} at{' '}
                                  {new Date(submission.date).toLocaleTimeString()}
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
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  {tenantSubmissions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No tenant submissions found
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="employee" className="mt-6">
                <div className="space-y-4">
                  {employeeSubmissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">
                              {submission.streetName}, {submission.apartmentNumber}
                            </CardTitle>
                            <CardDescription>{submission.city}</CardDescription>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Employee Inspection Details</DialogTitle>
                                <DialogDescription>
                                  Inspected on {new Date(submission.date).toLocaleDateString()} at{' '}
                                  {new Date(submission.date).toLocaleTimeString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="rounded-lg overflow-hidden">
                                  <Image
                                    src={submission.photoUrl}
                                    alt="Inspection photo"
                                    width={400}
                                    height={300}
                                    className="w-full object-cover"
                                  />
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
                                    <span className="font-medium">Inspector Notes:</span>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {submission.description || "No notes provided"}
                                    </p>
                                  </div>
                                  {submission.submittedBy && (
                                    <div className="pt-2">
                                      <span className="font-medium">Inspected by:</span>
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {submission.submittedBy}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  {employeeSubmissions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No employee submissions found
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}