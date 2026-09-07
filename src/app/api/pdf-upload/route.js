import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import ChatSession from '@/src/models/ChatSession';

export async function POST(req) {
  try {
    const body = await req.json();
    const { chatId, cloudinaryUrl, chatName, username } = body;

   
    if (!chatId || !cloudinaryUrl || !chatName || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

  
    console.log("PDF successfully received on server!");
    console.log("Cloudinary URL:", cloudinaryUrl);
  

    await dbConnect();
    
    // 3. Save to MongoDB
    await ChatSession.create({
      chatId,
      chatName,
      username,
      pdfUrl: cloudinaryUrl,
      
      extractedText: "Delegated to external RAG server.", 
    });
    
    console.log(`✅ Chat saved to MongoDB for user: ${username}`);

    
    const ragUrl = process.env.RAG_URL;
    console.log(ragUrl)
    if (!ragUrl) {
      console.warn("RAG_URL is not defined in .env.local! Skipping RAG upload.");
    } else {
      console.log(`Sending document info to RAG server at ${ragUrl}/upload...`);
      
      
      const formData = new FormData();
      formData.append('username', username);
      formData.append('file_url', cloudinaryUrl);

      const ragResponse = await fetch(`${ragUrl}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!ragResponse.ok) {
        const errorText = await ragResponse.text();
        console.error("RAG Server Error:", errorText);
        throw new Error(`External RAG server rejected the upload: ${ragResponse.statusText}`);
      }

      console.log("Successfully registered with RAG server!");
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Process completed. PDF saved and registered with RAG.' 
    });

  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: error.message || 'Server failure' }, { status: 500 });
  }
}