import { useState } from 'react';
import { useAnalytics, type TimeRange } from './hooks/useAnalytics';
import { Dashboard } from './components/Dashboard';

const SITE_ID = 'test-store';

export default function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR' | 'sats'>('GBP');
  const data = useAnalytics(SITE_ID, timeRange);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Dashboard
        data={data}
        siteId={SITE_ID}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        currency={currency}
        onCurrencyChange={setCurrency}
      />
    </div>
  );
}