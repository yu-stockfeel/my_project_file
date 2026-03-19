import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing YouTube URL parameter" },
      { status: 400 }
    );
  }

  try {
    // Determine the video ID from various YouTube URL formats
    let videoId = "";
    
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.trim().length === 11) {
      // Just the ID passed directly
      videoId = url.trim();
    }

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Try fetching transcript (prefer Japanese if specified in future)
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Filter or adjust if needed, but YoutubeTranscript returns { text, duration, offset }
    const formattedTranscript = transcript.map((item) => ({
      text: item.text,
      startTime: item.offset / 1000, // convert ms to seconds
      endTime: (item.offset + item.duration) / 1000,
    }));

    return NextResponse.json({ 
      videoId,
      transcript: formattedTranscript 
    });

  } catch (error: any) {
    console.error("YouTube Transcript error:", error);
    
    let errorMessage = "Failed to fetch YouTube transcript";
    if (error.message?.includes("Transcript is disabled")) {
      errorMessage = "此影片的字幕功能已被關閉";
    } else if (error.message?.includes("No transcripts are available")) {
      errorMessage = "此影片沒有可用的字幕";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
