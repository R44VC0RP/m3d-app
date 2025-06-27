import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('GitHub OAuth error:', error)
      return NextResponse.redirect('/login?error=github_auth_failed')
    }

    if (!code) {
      return NextResponse.redirect('/login?error=no_code')
    }

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth not configured: missing client credentials')
      return NextResponse.redirect('/login?error=config_error')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('GitHub token exchange error:', tokenData.error)
      return NextResponse.redirect('/login?error=token_exchange_failed')
    }

    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const userData = await userResponse.json()

    // TODO: Here you would typically:
    // 1. Create or update user in your database
    // 2. Create a session or JWT token
    // 3. Set secure cookies
    
    console.log('GitHub user authenticated:', userData.login)

    // For now, just redirect to a success page
    return NextResponse.redirect('/?login=success')
  } catch (error) {
    console.error('GitHub OAuth callback error:', error)
    return NextResponse.redirect('/login?error=callback_failed')
  }
}