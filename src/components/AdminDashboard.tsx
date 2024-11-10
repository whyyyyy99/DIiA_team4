import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [reports, setReports] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [type, setType] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchReports()
    }
  }, [session, type, startDate, endDate])

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams()
      if (type !== 'all') params.append('type', type)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data.submissions)
      setStatistics(data.statistics)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  if (!session || session.user.role !== 'admin') {
    return <div>Access Denied</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>View and manage submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <Button onClick={fetchReports}>Generate Report</Button>
          </div>

          {statistics && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total Submissions: {statistics.totalSubmissions}</p>
                <p>Average Structural Defects: {statistics.averageStructuralDefects.toFixed(2)}</p>
                <h4 className="font-bold mt-2">Submissions by City:</h4>
                <ul>
                  {Object.entries(statistics.byCity).map(([city, count]) => (
                    <li key={city}>{city}: {count}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Structural Defects</TableHead>
                <TableHead>Submitted By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{`${report.streetName}, ${report.apartmentNumber}, ${report.city}`}</TableCell>
                  <TableCell>{report.structuralDefects}</TableCell>
                  <TableCell>{report.user.name || report.user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}