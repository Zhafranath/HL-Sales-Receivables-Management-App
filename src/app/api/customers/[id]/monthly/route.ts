import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomerMonthlyData } from '@/lib/db/reports';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const month = parseInt(url.searchParams.get('month') || '1');
  const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

  try {
    const data = await getCustomerMonthlyData(id, month, year);
    return NextResponse.json({
      transactions: data.transactions.map((tx) => {
        const computed = (() => {
          const txAny = tx as unknown as Record<string, unknown>;
          const customer = txAny.customer as unknown as {
            id: string;
            diskon_lm: number[];
            diskon_br: number[];
          } | undefined;
          const items = (txAny.items || []) as Array<{
            id: string;
            product_id: string;
            quantity: number;
            product?: { id: string; nama: string; harga_modal: number; harga_base: number; tipe: string };
          }>;

          if (!customer || !items.length) {
            return {
              amountOwed: tx.ongkir,
              omzet: 0,
              laba: 0,
              omzetLM: 0,
              omzetBR: 0,
            };
          }

          if (tx.is_bonus) {
            return {
              amountOwed: 0,
              omzet: 0,
              laba: 0,
              omzetLM: 0,
              omzetBR: 0,
            };
          }

          let totalOmzet = 0;
          let totalLaba = 0;
          let omzetLM = 0;
          let omzetBR = 0;

          for (const item of items) {
            const product = item.product;
            if (!product) continue;

            const discountSteps = product.tipe === 'LM' ? customer.diskon_lm : customer.diskon_br;
            let price = product.harga_base;
            for (const d of discountSteps) {
              price *= 1 - d / 100;
            }
            const lineOmzet = price * item.quantity;
            const lineLaba = (price - product.harga_modal) * item.quantity;
            totalOmzet += lineOmzet;
            totalLaba += lineLaba;
            if (product.tipe === 'LM') omzetLM += lineOmzet;
            else omzetBR += lineOmzet;
          }

          return {
            amountOwed: totalOmzet + tx.ongkir,
            omzet: totalOmzet,
            laba: totalLaba,
            omzetLM,
            omzetBR,
          };
        })();

        return {
          id: tx.id,
          tanggal: tx.tanggal,
          nomor_bon: tx.nomor_bon,
          status: tx.status,
          ongkir: tx.ongkir,
          is_bonus: tx.is_bonus,
          amountOwed: computed.amountOwed,
          omzet: computed.omzet,
          laba: computed.laba,
          omzetLM: computed.omzetLM,
          omzetBR: computed.omzetBR,
        };
      }),
      totalPiutang: data.totalPiutang,
      totalDibayar: data.totalDibayar,
      totalOmzetLM: data.totalOmzetLM,
      totalOmzetBR: data.totalOmzetBR,
      totalOmzet: data.totalOmzet,
      totalLaba: data.totalLaba,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
