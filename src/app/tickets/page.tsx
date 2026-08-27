import React from 'react';
import { getTicketsData } from '@/lib/supabase';
import { TicketDesk } from '@/components/TicketDesk';

export const revalidate = 10;

export default async function TicketsPage() {
  const tickets = await getTicketsData();

  return (
    <div className="w-full">
      <TicketDesk initialTickets={tickets} />
    </div>
  );
}
