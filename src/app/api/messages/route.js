import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import ChatSession from '@/src/models/ChatSession';
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });

    const chat = await ChatSession.findOne({ chatId });
    
    if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

    return NextResponse.json({ success: true, messages: chat.messages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}