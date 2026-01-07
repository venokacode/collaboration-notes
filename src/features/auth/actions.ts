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

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: data.user.id,
        locale: 'en',
      })

    if (settingsError) {
      console.error('Failed to create user settings:', settingsError)
      // Don't fail the sign up if settings creation fails
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
      return {
        success: false,
        error: 'Invalid email or password',
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
