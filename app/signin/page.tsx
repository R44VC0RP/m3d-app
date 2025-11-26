import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { SignInForm } from "@/components/sign-in-form"
import { Wordmark } from "@/components/wordmark"

export const metadata: Metadata = {
  title: "Sign In | Mandarin3D",
  description: "Sign in to your account",
}

export default function SignInPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
         <div className="absolute inset-0">
            <Image 
                src="/customerShowcase/tower.jpeg" 
                alt="3D Print Showcase"
                fill
                className="object-cover opacity-50"
                priority
            />
         </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center">
             <Wordmark className="w-[140px] h-auto" color="white" />
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;High quality 3D printing services with instant quotes.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 h-full flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] px-4">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in with a magic link
            </p>
          </div>
          <SignInForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

