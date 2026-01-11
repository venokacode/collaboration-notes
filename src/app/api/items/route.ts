import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active' or 'done'

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

    // Build query
    let query = supabase
      .from('items')
      .select(
        `
        *,
        item_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `
      )
      .eq('workspace_id', workspaceMember.workspace_id)
      .order('created_at', { ascending: false });

    // Filter by status
    if (status === 'active') {
      query = query.neq('status_key', 'done');
    } else if (status === 'done') {
      query = query.eq('status_key', 'done');
    }

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Transform the data to flatten tags
    const transformedItems = items?.map((item) => ({
      ...item,
      tags:
        item.item_tags?.map((it: any) => it.tags).filter(Boolean) || [],
      item_tags: undefined,
    }));

    return NextResponse.json({ items: transformedItems });
  } catch (error) {
    console.error('Error fetching items:', error);
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

    // Create item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        workspace_id: workspaceMember.workspace_id,
        title: body.title,
        content: body.content || '',
        type_key: body.type_key || 'note',
        status_key: body.status_key || 'todo',
        color: body.color,
        created_by: user.id,
      })
      .select()
      .single();

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    // Add tags if provided
    if (body.tags && body.tags.length > 0) {
      const tagRelations = body.tags.map((tagId: string) => ({
        item_id: item.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('item_tags')
        .insert(tagRelations);

      if (tagError) {
        console.error('Error adding tags:', tagError);
      }
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
