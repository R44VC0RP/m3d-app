"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignInFormProps extends React.ComponentProps<"div"> {}

export function SignInForm({ className, ...props }: SignInFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onGoogleSignIn() {
    setIsLoading(true)
    setError(null)
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch (err) {
      console.error(err)
      setError("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-4", className)} {...props}>
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      <Button 
        variant="secondary" 
        disabled={isLoading} 
        onClick={onGoogleSignIn}
        className="w-full"
        type="button"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
    </div>
  )
}
