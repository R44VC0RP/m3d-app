import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // GitHub OAuth configuration
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/github/callback`
    
    if (!clientId) {
      console.error('GitHub OAuth not configured: GITHUB_CLIENT_ID missing')
      return NextResponse.json(
        { error: 'GitHub authentication is not configured' }, 
        { status: 500 }
      )
    }

    // GitHub OAuth URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
    githubAuthUrl.searchParams.set('client_id', clientId)
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri)
    githubAuthUrl.searchParams.set('scope', 'user:email')
    githubAuthUrl.searchParams.set('state', 'random-state-string') // In production, use a proper state parameter

    return NextResponse.redirect(githubAuthUrl.toString())
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    )
  }
}