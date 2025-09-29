import React, { useState } from 'react';

interface OffsetHistoryProps {
  program?: any;
  connection?: any;
}

export default function OffsetHistory({ program, connection }: OffsetHistoryProps) {
  const [offsetClaims] = useState([]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Offset History</h2>
      {offsetClaims.length === 0 ? (
        <p className="text-gray-600">No offset claims found.</p>
      ) : (
        <div>Offset claims will be displayed here</div>
      )}
    </div>
  );
}
