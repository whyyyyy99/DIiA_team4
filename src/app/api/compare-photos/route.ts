import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image')
    const imageComp = formData.get('image_comp')

    if (!image || !imageComp) {
      return NextResponse.json({ error: 'Missing image or image_comp' }, { status: 400 })
    }

    // Create a new FormData object to send to the external API
    const apiFormData = new FormData()
    apiFormData.append('image', image)
    apiFormData.append('image_comp', imageComp)

    const response = await fetch('https://web-api-1012455642177.us-central1.run.app/photo-quality', {
      method: 'POST',
      body: apiFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      return NextResponse.json({ error: `API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in compare-photos:', error)
    return NextResponse.json(
      { error: 'Failed to process images: ' + (error instanceof Error ? error.message : String(error)) }, 
      { status: 500 }
    )
  }
}

