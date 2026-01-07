export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'recruiter' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'recruiter' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'recruiter' | 'viewer'
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          locale: string
          updated_at: string
        }
        Insert: {
          user_id: string
          locale?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          locale?: string
          updated_at?: string
        }
      }
      tests: {
        Row: {
          id: string
          organization_id: string
          module_key: 'writing' | 'video_intro' | 'signature'
          title: string
          description: string | null
          prompt: string
          time_limit_minutes: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          module_key?: 'writing' | 'video_intro' | 'signature'
          title: string
          description?: string | null
          prompt: string
          time_limit_minutes?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          module_key?: 'writing' | 'video_intro' | 'signature'
          title?: string
          description?: string | null
          prompt?: string
          time_limit_minutes?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      test_links: {
        Row: {
          id: string
          test_id: string
          token: string
          expires_at: string | null
          max_attempts: number
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          token: string
          expires_at?: string | null
          max_attempts?: number
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          token?: string
          expires_at?: string | null
          max_attempts?: number
          created_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          organization_id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
      }
      attempts: {
        Row: {
          id: string
          test_link_id: string
          candidate_id: string | null
          started_at: string
          submitted_at: string | null
          content: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          test_link_id: string
          candidate_id?: string | null
          started_at?: string
          submitted_at?: string | null
          content?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          test_link_id?: string
          candidate_id?: string | null
          started_at?: string
          submitted_at?: string | null
          content?: string | null
          metadata?: Json
        }
      }
      reports: {
        Row: {
          id: string
          attempt_id: string
          organization_id: string
          score: Json | null
          feedback: string | null
          generated_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          organization_id: string
          score?: Json | null
          feedback?: string | null
          generated_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          organization_id?: string
          score?: Json | null
          feedback?: string | null
          generated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}
