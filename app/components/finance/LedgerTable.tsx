export default function LedgerTable({ ledger }: { ledger: any[] }) {
  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-bold mb-4">Ledger Audit</h2>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Campaign</th>
          </tr>
        </thead>

        <tbody>
          {ledger.map((tx) => (
            <tr key={tx.id} className="border-t">
              <td>{new Date(tx.created_at).toLocaleDateString()}</td>
              <td>{tx.type}</td>
              <td>${tx.amount}</td>
              <td>{tx.status}</td>
              <td>{tx.campaign_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
