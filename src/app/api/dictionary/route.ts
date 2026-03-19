import { NextRequest, NextResponse } from "next/server";

// Jisho API proxy to avoid CORS issues
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword");

  if (!keyword) {
    return NextResponse.json(
      { error: "Missing keyword parameter" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          "User-Agent": "NihoNote/1.0",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Jisho API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform and simplify the response
    const results = data.data?.slice(0, 5).map((item: JishoItem) => ({
      word: item.japanese?.[0]?.word || item.japanese?.[0]?.reading || "",
      reading: item.japanese?.[0]?.reading || "",
      jlpt: item.jlpt || [],
      isCommon: item.is_common || false,
      meanings: item.senses?.map((sense: JishoSense) => ({
        partOfSpeech: sense.parts_of_speech?.join(", ") || "",
        definitions: sense.english_definitions || [],
        tags: sense.tags || [],
        info: sense.info || [],
      })) || [],
    })) || [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Dictionary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dictionary data" },
      { status: 500 }
    );
  }
}

// Types for Jisho API response
interface JishoItem {
  japanese: { word?: string; reading?: string }[];
  senses: JishoSense[];
  jlpt: string[];
  is_common: boolean;
}

interface JishoSense {
  english_definitions: string[];
  parts_of_speech: string[];
  tags: string[];
  info: string[];
}
