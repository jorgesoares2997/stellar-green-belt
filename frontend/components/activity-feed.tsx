'use client';

import { useEffect, useState } from 'react';
import { fetchLatestEvents, type ContractEvent } from '@/lib/events';

export default function ActivityFeed() {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncEvents = async () => {
      const latestEvents = await fetchLatestEvents();
      if (!isMounted) return;

      setEvents(latestEvents.slice(0, 6));
      setIsLoading(false);
    };

    syncEvents();
    const interval = window.setInterval(syncEvents, 15_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-white/40">Loading contract activity...</p>;
  }

  if (events.length === 0) {
    return <p className="text-sm text-white/40">No on-chain activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <ActivityItem key={event.id} user={event.user} amount={event.amount} type={event.type} />
      ))}
    </div>
  );
}

function ActivityItem({ user, amount, type }: { user: string; amount: string; type: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-mono">
          {user}
        </div>
        <span className="text-white/80 font-medium">{type}</span>
      </div>
      <span className="text-[#10b981] font-bold">{amount}</span>
    </div>
  );
}
