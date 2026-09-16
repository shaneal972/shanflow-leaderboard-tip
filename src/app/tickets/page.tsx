import React from 'react';
import { getTicketsData, getAllApprenantsAdmin, getAllTicketResolutionsAdmin } from '@/lib/supabase';
import { TicketDesk } from '@/components/TicketDesk';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TicketsPage() {
  const [tickets, students, resolutions] = await Promise.all([
    getTicketsData(),
    getAllApprenantsAdmin(),
    getAllTicketResolutionsAdmin(),
  ]);

  return (
    <div className="w-full">
      <TicketDesk 
        initialTickets={tickets} 
        students={students}
        initialResolutions={resolutions}
      />
    </div>
  );
}

