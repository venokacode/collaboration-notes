import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get item with tags
    const { data: item, error: itemError } = await supabase
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
      .eq('id', id)
      .single();

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 404 });
    }

    // Transform tags
    const transformedItem = {
      ...item,
      tags: item.item_tags?.map((it: any) => it.tags).filter(Boolean) || [],
      item_tags: undefined,
    };

    return NextResponse.json({ item: transformedItem });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update item
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.type_key !== undefined) updateData.type_key = body.type_key;
    if (body.status_key !== undefined) updateData.status_key = body.status_key;
    if (body.color !== undefined) updateData.color = body.color;

    const { data: item, error: itemError } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    // Update tags if provided
    if (body.tags !== undefined) {
      // Delete existing tags
      await supabase.from('item_tags').delete().eq('item_id', id);

      // Add new tags
      if (body.tags.length > 0) {
        const tagRelations = body.tags.map((tagId: string) => ({
          item_id: id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('item_tags')
          .insert(tagRelations);

        if (tagError) {
          console.error('Error updating tags:', tagError);
        }
      }
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete item (cascades to item_tags)
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
