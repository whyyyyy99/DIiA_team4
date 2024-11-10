import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const usersCount = await prisma.user.count()
      res.status(200).json({ message: 'Database connection successful', usersCount })
    } catch (error) {
      console.error('Database connection error:', error)
      res.status(500).json({ message: 'Error connecting to the database' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}