import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = await createClient();
    let query = supabase.from('properties').select('*', { count: 'exact' });
    const purpose = searchParams.get('purpose');
    if (purpose) query = query.eq('purpose', purpose);
    const type = searchParams.get('type');
    if (type) query = query.eq('type', type);
    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);
    const city = searchParams.get('city');
    if (city) query = query.ilike('city', `%${city}%`);
    const search = searchParams.get('search');
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;
    return NextResponse.json({ data, count, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    if (!body.slug) body.slug = body.title.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase();
    const { data, error } = await supabase.from('properties').insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
