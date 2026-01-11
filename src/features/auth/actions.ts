'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type AuthResult = {
  success: boolean
  error?: string
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
    }

    // Validate input
    const validation = signUpSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const { email, password, name } = validation.data

    const supabase = await createClient()

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Failed to create user',
      }
    }

    // Note: user_settings will be created on first login
    // This avoids RLS issues during registration

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at && !data.session) {
      return {
        success: true,
        error: 'Please check your email to confirm your account before signing in.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error during sign up:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  try {
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    // Validate input
    const validation = signInSchema.safeParse(rawData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const { email, password } = validation.data

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      
      // Provide specific error messages
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
        }
      }
      
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Create user_settings if it doesn't exist (first login)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!existingSettings) {
        await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            locale: 'en',
          })
      }

      // Set active_workspace_id cookie to user's default workspace
      const { data: membership } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (membership?.workspace_id) {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        cookieStore.set('active_workspace_id', membership.workspace_id, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error during sign in:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
