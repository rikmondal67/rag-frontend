import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import ChatSession from '@/src/models/ChatSession';



export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const chats = await ChatSession.find({ username }).sort({ createdAt: -1 });

    const formattedChats = chats.map((chat) => ({
      id: chat.chatId,
      name: chat.chatName,
      pdfUrl: chat.pdfUrl
    }));

    return NextResponse.json({ success: true, chats: formattedChats });

  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Delete the chat document from the database
    await ChatSession.findOneAndDelete({ chatId });

    return NextResponse.json({ success: true, message: 'Chat successfully deleted' });

  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}