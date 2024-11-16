import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import axios from 'axios';
import sharp from 'sharp';
import FormData from 'form-data';

async function qualityCheck(image: Buffer): Promise<number> {
  const formData = new FormData();
  formData.append('media', image, { filename: 'photo.jpg' });
  formData.append('models', 'quality');
  formData.append('api_user', 'your_user_id');
  formData.append('api_secret', 'your_secret_key');

  const response = await axios.post('https://api.sightengine.com/1.0/check.json', formData, {
    headers: formData.getHeaders(),
  });
  return response.data.quality.score;
}

async function isBright(image: Buffer, dim: number = 10, threshold: number = 0.5): Promise<boolean> {
  const resizedImage = await sharp(image).resize(dim, dim).toBuffer();
  const { data } = await sharp(resizedImage).raw().toBuffer({ resolveWithObject: true });

  const totalBrightness = data.reduce((sum, value) => sum + value, 0);
  const averageBrightness = totalBrightness / (dim * dim * 3 * 255); // Assuming RGB channels
  return averageBrightness > threshold;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const description = formData.get('description') as string;
    const streetName = formData.get('streetName') as string;
    const apartmentNumber = formData.get('apartmentNumber') as string;
    const city = formData.get('city') as string;
    const structuralDefects = parseInt(formData.get('structuralDefects') as string);

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    // Convert File to Buffer for processing
    const photoBuffer = Buffer.from(await photo.arrayBuffer());

    // Quality check
    const qualityScore = await qualityCheck(photoBuffer);
    if (qualityScore < 0.5) {
      return NextResponse.json({ error: 'Photo quality is too low' }, { status: 400 });
    }

    // Brightness check
    const isImageBright = await isBright(photoBuffer);
    if (!isImageBright) {
      return NextResponse.json({ error: 'Photo is too dark' }, { status: 400 });
    }

    // TODO: Implement actual file storage (e.g., AWS S3, Google Cloud Storage)
    const photoUrl = `/placeholder-${Date.now()}.jpg`;

    const submission = await prisma.submission.create({
      data: {
        type: session.user.role === 'tenant' ? 'tenant' : 'employee',
        streetName,
        apartmentNumber,
        city,
        structuralDefects,
        description,
        photoUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Error uploading photo' }, { status: 500 });
  }
}
