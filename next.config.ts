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
};

export default withWorkflow(config);
