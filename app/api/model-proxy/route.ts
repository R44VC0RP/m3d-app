import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint to serve 3D model files with proper CORS headers
 * This is needed because three.js loaders can't directly fetch from UploadThing due to CORS
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }
  
  // Validate URL is from UploadThing
  if (!url.includes('ufs.sh') && !url.includes('uploadthing')) {
    return NextResponse.json({ error: 'Invalid URL source' }, { status: 400 });
  }
  
  try {
    // Fetch the file from UploadThing
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    // Get the file data as array buffer
    const data = await response.arrayBuffer();
    
    // Determine content type based on URL or response headers
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Try to detect content type from URL extension
    const urlLower = url.toLowerCase();
    if (urlLower.endsWith('.stl')) {
      contentType = 'model/stl';
    } else if (urlLower.endsWith('.obj')) {
      contentType = 'model/obj';
    } else if (urlLower.endsWith('.gltf')) {
      contentType = 'model/gltf+json';
    } else if (urlLower.endsWith('.glb')) {
      contentType = 'model/gltf-binary';
    } else if (urlLower.endsWith('.3mf')) {
      contentType = 'model/3mf';
    }
    
    // Return the file with proper headers
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': data.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error proxying model file:', error);
    return NextResponse.json(
      { error: 'Failed to proxy file' },
      { status: 500 }
    );
  }
}

