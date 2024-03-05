import { NextResponse } from "next/server";
import fs from "fs";
import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
  
export async function POST(req: Request) {
  const body = await req.json();
  const base64Audio = body.audio;
  console.log(base64Audio)
  const audio = Buffer.from(base64Audio, "base64");
  const filePath = "tmp/input.wav";

  try {
    fs.writeFileSync(filePath, audio);
    const readStream = fs.createReadStream(filePath);
    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });
    // Remove the file after use
    fs.unlinkSync(filePath);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.error();
  }
}