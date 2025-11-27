import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime";
import { db } from "@/db";
import { blogCoverImage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPostBySlug } from "@/lib/blog";

export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/blog/image/[slug]
 * Returns the cached cover image for a blog post, or generates it on first request
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    console.log(`[Blog Image] Processing request for slug: ${slug}`);

    if (!slug) {
      console.error("[Blog Image] No slug provided in request");
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Check for force regenerate query param
    const forceRegenerate =
      request.nextUrl.searchParams.get("regenerate") === "true";
    console.log(`[Blog Image] Force regenerate: ${forceRegenerate}`);

    // Check cache first (unless forcing regeneration)
    if (!forceRegenerate) {
      console.log("[Blog Image] Checking cache for existing image");
      const cached = await db
        .select()
        .from(blogCoverImage)
        .where(eq(blogCoverImage.slug, slug))
        .limit(1);

      if (cached.length > 0) {
        console.log(`[Blog Image] Found cached image for slug: ${slug}`);
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
      } else {
        console.log(`[Blog Image] No cached image found for slug: ${slug}`);
      }
    }

    // Not cached - get blog post metadata to generate image
    let title: string;
    let description: string;

    console.log(`[Blog Image] Fetching blog post metadata for slug: ${slug}`);
    try {
      const { meta } = getPostBySlug(slug);
      title = meta.title;
      description = meta.description;
      console.log(`[Blog Image] Found post - Title: "${title}", Description: "${description.substring(0, 100)}..."`);
    } catch (error) {
      console.error(`[Blog Image] Blog post not found for slug: ${slug}`, error);
      return NextResponse.json(
        { error: `Blog post not found: ${slug}` },
        { status: 404 }
      );
    }

    // Generate the image
    if (!process.env.GEMINI_API_KEY) {
      console.error("[Blog Image] GEMINI_API_KEY environment variable not configured");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    console.log("[Blog Image] Initializing Google GenAI client");
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Load the reference style image
    const referenceImagePath = path.join(
      process.cwd(),
      "public",
      "reference-generation-image.png"
    );
    console.log(`[Blog Image] Loading reference image from: ${referenceImagePath}`);

    let referenceImagePart = null;
    try {
      const imageBuffer = await readFile(referenceImagePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = mime.getType(referenceImagePath) || "image/png";
      console.log(`[Blog Image] Reference image loaded successfully - Size: ${imageBuffer.length} bytes, MIME: ${mimeType}`);
      referenceImagePart = {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      };
    } catch (error) {
      console.warn("[Blog Image] Reference image not found, generating without style reference", error);
    }

    const prompt = `Generate a blog cover image for the post title and description below. White background, black text (for the title only, don't generate a description.) with a clean, glasslike isomorphic representation of what the post is talking about. Use Inter font, and format/style it in the same way as the reference image provided.

Title: ${title}

Description: ${description}`;

    console.log(`[Blog Image] Generated prompt for AI: ${prompt.substring(0, 200)}...`);

    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (referenceImagePart) {
      parts.push(referenceImagePart);
      console.log("[Blog Image] Added reference image to request parts");
    }
    parts.push({ text: prompt });

    const config = {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K",
      },
      tools: [{ googleSearch: {} }],
    };

    console.log("[Blog Image] Sending request to Gemini API for image generation");
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

    console.log("[Blog Image] Received response from Gemini API");
    const candidate = response.candidates?.[0];
    const responseParts = candidate?.content?.parts;

    if (!responseParts) {
      console.error("[Blog Image] No response parts found in Gemini API response");
      return NextResponse.json(
        { error: "No response from image generation" },
        { status: 500 }
      );
    }

    console.log(`[Blog Image] Processing ${responseParts.length} response parts`);

    // Find the image part
    for (const part of responseParts) {
      if ("inlineData" in part && part.inlineData) {
        const { mimeType, data } = part.inlineData;
        console.log(`[Blog Image] Found image part - MIME: ${mimeType}, Data length: ${data?.length || 0}`);

        if (data && mimeType) {
          // Save to database
          try {
            console.log(`[Blog Image] Saving generated image to database for slug: ${slug}`);
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
            console.log(`[Blog Image] Successfully cached image for slug: ${slug}`);
          } catch (dbError) {
            console.error(`[Blog Image] Failed to cache image for slug: ${slug}`, dbError);
          }

          const imageBuffer = Buffer.from(data, "base64");
          console.log(`[Blog Image] Returning generated image - Size: ${imageBuffer.length} bytes`);

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

    const textPart = responseParts.find((part) => "text" in part && part.text);
    const errorMessage =
      textPart && "text" in textPart
        ? textPart.text
        : "No image generated in response";

    console.error(`[Blog Image] No valid image found in response: ${errorMessage}`);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } catch (error) {
    console.error(`[Blog Image] Unexpected error processing request`, error);
    return NextResponse.json(
      {
        error: "Failed to get/generate image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/image/[slug]
 * Delete a cached cover image (useful for admin regeneration)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    console.log(`[Blog Image DELETE] Deleting cached image for slug: ${slug}`);

    await db.delete(blogCoverImage).where(eq(blogCoverImage.slug, slug));

    console.log(`[Blog Image DELETE] Successfully deleted cached image for slug: ${slug}`);
    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error(`[Blog Image DELETE] Failed to delete cached image`, error);
    return NextResponse.json(
      { error: "Failed to delete cached image" },
      { status: 500 }
    );
  }
}
