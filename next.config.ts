import type { NextConfig } from "next";
import { withWorkflow } from 'workflow/next';

const config: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/js/script.js",
        destination: "https://datafa.st/js/script.js",
      },
      {
        source: "/api/datafast-events",
        destination: "https://datafa.st/api/events",
      },
    ];
  },
};

export default withWorkflow(config);
