import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a building maintenance expert. Analyze the following description and provide a severity score (1-10), categorization, and repair suggestions in JSON format."
        },
        {
          role: "user",
          content: text
        }
      ],
    })

    const analysis = JSON.parse(completion.data.choices[0].message.content)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Text analysis error:', error)
    return NextResponse.json({ error: 'Error analyzing text' }, { status: 500 })
  }
}