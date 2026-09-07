import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import ChatSession from '@/src/models/ChatSession';

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, query, chatId } = body;

    if (!username || !query || !chatId) {
      return NextResponse.json({ reply: "Error: Missing required chat information." });
    }

    await dbConnect();

    
    await ChatSession.findOneAndUpdate(
      { chatId },
      { $push: { messages: { sender: 'user', text: query } } }
    );

    let aiText = "";

    const rag_ask_url = `${process.env.RAG_URL}/api/v1/ask`;
    // console.log(rag_ask_url)

    try {
      const ragResponse = await fetch(rag_ask_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, username: username }),
      });

      if (!ragResponse.ok) {
        console.error("❌ RAG Server Error:", await ragResponse.text());
        aiText = "Sorry, the AI server is currently unavailable or processing too many requests. Please try again.";
      } else {
        const data = await ragResponse.json();
        aiText = data.answer || data.response || data.reply || data.message || "I couldn't generate a response.";
      }
    } catch (networkError) {
      console.error("❌ Network Error:", networkError);
      aiText = "Sorry, I could not connect to the AI server. It might be offline or starting up.";
    }

    
    await ChatSession.findOneAndUpdate(
      { chatId },
      { $push: { messages: { sender: 'ai', text: aiText } } }
    );

 
    return NextResponse.json({ reply: aiText });

  } catch (error) {
    console.error("Chat API Critical Error:", error);
    return NextResponse.json({ reply: "An internal server error occurred." });
  }
}