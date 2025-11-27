import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Code2, Upload, Globe, CheckCircle2, XCircle, FileCode } from "lucide-react";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "Documentation for the Mandarin3D API. Learn how to integrate 3D file uploads and processing into your applications.",
  keywords: [
    "Mandarin3D API",
    "3D printing API",
    "file upload API",
    "remote submission API",
    "API documentation",
  ],
  openGraph: {
    title: "API Documentation | Mandarin3D",
    description:
      "Learn how to integrate Mandarin3D's 3D file processing into your applications.",
    url: "https://mandarin3d.com/docs",
  },
  alternates: {
    canonical: "https://mandarin3d.com/docs",
  },
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          API Documentation
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
          Integrate 3D File Processing
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground leading-relaxed">
            The Mandarin3D API allows you to programmatically submit 3D files for processing,
            receive instant quotes, and integrate custom 3D printing capabilities into your
            applications.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Quick Start
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <CardTitle>1. Choose Method</CardTitle>
                </div>
                <CardDescription>
                  Upload files directly or provide a URL to a 3D model
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <CardTitle>2. Make Request</CardTitle>
                </div>
                <CardDescription>
                  Send a POST request to /api/submit-remote with your file
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <CardTitle>3. Get Response</CardTitle>
                </div>
                <CardDescription>
                  Receive file ID and tracking URL for processing status
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          API Endpoints
        </h2>

        {/* Submit Remote Endpoint */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Submit Remote File</CardTitle>
                  <CardDescription className="text-base">
                    Upload a 3D file or provide a URL for processing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Endpoint Details */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-500/20">
                    POST
                  </span>
                  <code className="text-sm font-mono">
                    /api/submit-remote
                  </code>
                </div>
              </div>

              {/* Request Methods */}
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  Request Methods
                </h4>

                {/* Method 1: File Upload */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-primary" />
                    <h5 className="font-semibold">Method 1: File Upload</h5>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a file directly using multipart/form-data
                  </p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`Content-Type: multipart/form-data

Parameters:
  file              File      (required) The 3D model file
  external_source   String    (optional) Source identifier
                                         (default: "remote-submit")`}
                    </pre>
                  </div>
                </div>

                {/* Method 2: URL */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <h5 className="font-semibold">Method 2: File URL</h5>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Provide a URL to download the file from
                  </p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`Content-Type: application/json

{
  "file_url": "https://example.com/model.stl",
  "external_source": "my-app"  // optional
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Response */}
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  Response
                </h4>
                <div className="space-y-4">
                  {/* Success Response */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <h5 className="font-semibold">Success (200)</h5>
                    </div>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-xs leading-relaxed">
{`{
  "message": "File uploaded successfully",
  "url": "https://mandarin3d.com/file/abc-123-def",
  "fileid": "abc-123-def",
  "status": "slicing"
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Error Response */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <h5 className="font-semibold">Error (400/500)</h5>
                    </div>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-xs leading-relaxed">
{`{
  "status": "error",
  "message": "No file or file URL provided"
}

// Or for server errors:
{
  "error": "Internal server error",
  "details": "Error message details"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported File Types */}
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  Supported File Formats
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    '.stl', '.obj', '.ply', '.off', '.3mf',
                    '.gltf', '.glb', '.dae', '.x3d', '.wrl',
                    '.vrml', '.step', '.stp', '.iges', '.igs',
                    '.collada', '.blend'
                  ].map((format) => (
                    <div key={format} className="flex items-center gap-2 text-sm">
                      <FileCode className="w-3 h-3 text-muted-foreground" />
                      <code className="text-xs">{format}</code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Examples */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Code Examples
          </h2>

          <div className="space-y-8">
            {/* cURL Example */}
            <div>
              <h3 className="text-xl font-semibold mb-4">cURL</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">File Upload:</p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`curl -X POST https://mandarin3d.com/api/submit-remote \\
  -F "file=@/path/to/model.stl" \\
  -F "external_source=my-app"`}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">URL Submission:</p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`curl -X POST https://mandarin3d.com/api/submit-remote \\
  -H "Content-Type: application/json" \\
  -d '{
    "file_url": "https://example.com/model.stl",
    "external_source": "my-app"
  }'`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* JavaScript Example */}
            <div>
              <h3 className="text-xl font-semibold mb-4">JavaScript / TypeScript</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">File Upload:</p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('external_source', 'my-app');

const response = await fetch('https://mandarin3d.com/api/submit-remote', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log('File ID:', data.fileid);
console.log('Track at:', data.url);`}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">URL Submission:</p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`const response = await fetch('https://mandarin3d.com/api/submit-remote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file_url: 'https://example.com/model.stl',
    external_source: 'my-app'
  })
});

const data = await response.json();
console.log('File ID:', data.fileid);`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Python Example */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Python</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">File Upload:</p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`import requests

with open('model.stl', 'rb') as f:
    files = {'file': f}
    data = {'external_source': 'my-app'}

    response = requests.post(
        'https://mandarin3d.com/api/submit-remote',
        files=files,
        data=data
    )

    result = response.json()
    print(f"File ID: {result['fileid']}")
    print(f"Track at: {result['url']}")`}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">URL Submission:</p>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-xs leading-relaxed">
{`import requests

response = requests.post(
    'https://mandarin3d.com/api/submit-remote',
    json={
        'file_url': 'https://example.com/model.stl',
        'external_source': 'my-app'
    }
)

result = response.json()
print(f"File ID: {result['fileid']}")`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          Processing Flow
        </h2>

        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">1. File Submission.</strong> Your file
            is uploaded to our secure storage (UploadThing) and a database record is created.
          </p>

          <p>
            <strong className="text-foreground">2. Automatic Processing.</strong> The file
            is automatically sent to our slicing service which analyzes the 3D model, calculates
            dimensions, mass, and material requirements.
          </p>

          <p>
            <strong className="text-foreground">3. Status Updates.</strong> Processing
            typically takes 30-60 seconds. The status changes from "slicing" to "success" or
            "error" once complete.
          </p>

          <p>
            <strong className="text-foreground">4. Quote Generation.</strong> Once processed,
            the file page displays pricing based on actual material usage, build time, and
            selected options.
          </p>
        </div>
      </section>

      {/* Best Practices */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold tracking-tight mb-8">
            Best Practices
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>File Size Limits</CardTitle>
                <CardDescription>
                  Keep file sizes reasonable (typically under 100MB). Large files may take
                  longer to upload and process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Format Selection</CardTitle>
                <CardDescription>
                  STL and 3MF formats are recommended for best compatibility. These formats
                  are widely supported and process reliably.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Source Tracking</CardTitle>
                <CardDescription>
                  Use the external_source parameter to identify where submissions come from.
                  This helps with analytics and troubleshooting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Handling</CardTitle>
                <CardDescription>
                  Always handle both success and error responses. Check the status code and
                  provide appropriate feedback to users.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-6">
          Need Help?
        </h2>

        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Have questions about the API? Need help with integration? Want to discuss
          custom features or enterprise options? Get in touch.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/upload">
            <Button variant="primary" size="large">
              Try the API
            </Button>
          </Link>
          <a href="mailto:orders@mandarin3d.com">
            <Button variant="secondary" size="large">
              Contact Support
            </Button>
          </a>
        </div>
      </section>
    </main>
  );
}
