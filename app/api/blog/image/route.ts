import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime";
import { db } from "@/db";
import { blogCoverImage } from "@/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 60; // Allow up to 60 seconds for image generation

/**
 * Generate a blog cover image using Gemini 3 Pro Image
 * Caches generated images in the database for future requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, slug, forceRegenerate = false } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // If slug is provided, check cache first (unless forcing regeneration)
    if (slug && !forceRegenerate) {
      const cached = await db
        .select()
        .from(blogCoverImage)
        .where(eq(blogCoverImage.slug, slug))
        .limit(1);

      if (cached.length > 0) {
        const { imageData, mimeType } = cached[0];
        const imageBuffer = Buffer.from(imageData, "base64");

        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Content-Length": imageBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Image-Source": "cache",
          },
        });
      }
    }

    // Not in cache, generate new image
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Load the reference style image from public folder
    const referenceImagePath = path.join(
      process.cwd(),
      "public",
      "reference-generation-image.png"
    );

    let referenceImagePart = null;
    try {
      const imageBuffer = await readFile(referenceImagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = mime.getType(referenceImagePath) || "image/png";
      referenceImagePart = {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      };
    } catch {
      console.warn(
        "Reference image not found at public/reference-generation-image.png, generating without style reference"
      );
    }

    const prompt = `Generate a blog cover image for the post title and description below. White background, black text (for the title only, don't generate a description.) with a clean, glasslike isomorphic representation of what the post is talking about. Use Inter font, and format/style it in the same way as the reference image provided.

Title: ${title}

Description: ${description}`;

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [];

    // Add reference image first if available
    if (referenceImagePart) {
      parts.push(referenceImagePart);
    }

    // Add the text prompt
    parts.push({ text: prompt });

    const config = {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K",
      },
      tools: [{ googleSearch: {} }],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      config,
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    // Extract the generated image from the response
    const candidate = response.candidates?.[0];
    const responseParts = candidate?.content?.parts;

    if (!responseParts) {
      return NextResponse.json(
        { error: "No response from image generation" },
        { status: 500 }
      );
    }

    // Find the image part in the response
    for (const part of responseParts) {
      if ("inlineData" in part && part.inlineData) {
        const { mimeType, data } = part.inlineData;

        if (data && mimeType) {
          // Save to database if slug is provided
          if (slug) {
            try {
              await db
                .insert(blogCoverImage)
                .values({
                  slug,
                  imageData: data,
                  mimeType,
                  title,
                  description,
                })
                .onConflictDoUpdate({
                  target: blogCoverImage.slug,
                  set: {
                    imageData: data,
                    mimeType,
                    title,
                    description,
                    updatedAt: new Date(),
                  },
                });
            } catch (dbError) {
              console.error("Failed to cache image in database:", dbError);
              // Continue anyway - return the image even if caching fails
            }
          }

          // Return the image as a binary response
          const imageBuffer = Buffer.from(data, "base64");

          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              "Content-Type": mimeType,
              "Content-Length": imageBuffer.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Image-Source": "generated",
            },
          });
        }
      }
    }

    // If we get here, no image was found in the response
    const textPart = responseParts.find((part) => "text" in part && part.text);
    const errorMessage =
      textPart && "text" in textPart
        ? textPart.text
        : "No image generated in response";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } catch (error) {
    console.error("Blog image generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({
    service: "blog-image-generator",
    status: hasApiKey ? "ready" : "missing_api_key",
    model: "gemini-3-pro-image-preview",
  });
}
