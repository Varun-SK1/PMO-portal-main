import React from 'react';

export default function Dashboard() {
  return (
    <iframe
      title="PMO Dashboard"
      src="https://app.powerbi.com/reportEmbed?reportId=e705019d-e9cf-4908-9af3-2631964803e2&autoAuth=true&ctid=8acbc2c5-c8ed-42c7-8169-ba438a0dbe2f"
      frameBorder="0"
      allowFullScreen={true}
      style={{ width: '100%', height: 'calc(100vh - 60px)', border: 'none' }}
    />
  );
}
