#!/usr/bin/env bun
/**
 * MDX Linting Script
 * Checks MDX files for common issues that cause build failures
 */

import { readdir, readFile } from "fs/promises";
import { join } from "path";

const CONTENT_DIR = "content/blog";

interface LintError {
  file: string;
  line: number;
  message: string;
  suggestion?: string;
}

const rules = [
  {
    name: "html-comment",
    pattern: /<!--[\s\S]*?-->/g,
    message: "HTML comments are not supported in MDX",
    suggestion: "Use JSX comments instead: {/* comment */}",
  },
  {
    name: "unclosed-jsx-expression",
    pattern: /\{[^}]*$/gm,
    message: "Potentially unclosed JSX expression",
    suggestion: "Make sure all { are closed with }",
  },
  {
    name: "html-entity",
    pattern: /&(?:nbsp|amp|lt|gt|quot|apos);/g,
    message: "HTML entities may cause issues in MDX",
    suggestion: "Use the actual character or Unicode escape",
  },
];

async function getMdxFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await getMdxFiles(fullPath)));
      } else if (entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return files;
}

function checkFile(content: string, filePath: string): LintError[] {
  const errors: LintError[] = [];
  const lines = content.split("\n");
  
  // Check if we're in frontmatter
  let inFrontmatter = false;
  let frontmatterCount = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Track frontmatter boundaries
    if (line.trim() === "---") {
      frontmatterCount++;
      inFrontmatter = frontmatterCount === 1;
      if (frontmatterCount === 2) inFrontmatter = false;
      return;
    }
    
    // Skip frontmatter content
    if (inFrontmatter) return;
    
    // Apply rules
    for (const rule of rules) {
      const matches = line.match(rule.pattern);
      if (matches) {
        errors.push({
          file: filePath,
          line: lineNum,
          message: `${rule.message}: "${matches[0]}"`,
          suggestion: rule.suggestion,
        });
      }
    }
  });
  
  return errors;
}

async function main() {
  console.log("🔍 Checking MDX files for common issues...\n");
  
  const files = await getMdxFiles(CONTENT_DIR);
  
  if (files.length === 0) {
    console.log("No MDX files found in", CONTENT_DIR);
    process.exit(0);
  }
  
  console.log(`Found ${files.length} MDX file(s)\n`);
  
  let totalErrors = 0;
  
  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const errors = checkFile(content, file);
    
    if (errors.length > 0) {
      totalErrors += errors.length;
      console.log(`\n❌ ${file}`);
      
      for (const error of errors) {
        console.log(`   Line ${error.line}: ${error.message}`);
        if (error.suggestion) {
          console.log(`   💡 ${error.suggestion}`);
        }
      }
    } else {
      console.log(`✅ ${file}`);
    }
  }
  
  console.log("\n" + "─".repeat(50));
  
  if (totalErrors > 0) {
    console.log(`\n❌ Found ${totalErrors} error(s) in MDX files`);
    process.exit(1);
  } else {
    console.log("\n✅ All MDX files passed checks!");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Error running MDX check:", err);
  process.exit(1);
});

