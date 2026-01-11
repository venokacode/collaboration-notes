import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace
    const { data: workspaceMember, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (memberError || !workspaceMember) {
      return NextResponse.json(
        { error: 'No workspace found' },
        { status: 404 }
      );
    }

    // Get all tags in workspace
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .eq('workspace_id', workspaceMember.workspace_id)
      .order('name', { ascending: true });

    if (tagsError) {
      return NextResponse.json({ error: tagsError.message }, { status: 500 });
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace
    const { data: workspaceMember, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();

    if (memberError || !workspaceMember) {
      return NextResponse.json(
        { error: 'No workspace found' },
        { status: 404 }
      );
    }

    // Create tag
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .insert({
        workspace_id: workspaceMember.workspace_id,
        name: body.name,
        color: body.color,
      })
      .select()
      .single();

    if (tagError) {
      return NextResponse.json({ error: tagError.message }, { status: 500 });
    }

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
