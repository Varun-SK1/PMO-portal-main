import React from 'react';

export default function Dashboard() {
  return (
    <iframe
      title="PMO Dashboard"
      src="https://app.powerbi.com/reportEmbed?reportId=02fac42c-b28e-4b0f-9927-bf6959e5374b&autoAuth=true&ctid=8acbc2c5-c8ed-42c7-8169-ba438a0dbe2f"
      frameBorder="0"
      allowFullScreen={true}
      style={{ width: '100%', height: 'calc(100vh - 60px)', border: 'none' }}
    />
  );
}
