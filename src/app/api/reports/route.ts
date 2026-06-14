import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOverallReport } from '@/lib/db/reports';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const monthStr = url.searchParams.get('month');
  const yearStr = url.searchParams.get('year');

  const month = monthStr ? parseInt(monthStr) : undefined;
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

  try {
    const report = await getOverallReport(month, year);
    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
