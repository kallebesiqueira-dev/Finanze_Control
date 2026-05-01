interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
      <p className="text-indigo-200 text-sm font-medium mb-1">Saldo Attuale</p>
      <p className={`text-4xl font-bold mb-6 ${balance < 0 ? "text-red-300" : ""}`}>
        {formatCurrency(balance)}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-indigo-200 text-xs font-medium mb-1">Entrate Totali</p>
          <p className="text-lg font-bold text-green-300">{formatCurrency(income)}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-indigo-200 text-xs font-medium mb-1">Uscite Totali</p>
          <p className="text-lg font-bold text-red-300">{formatCurrency(expense)}</p>
        </div>
      </div>
    </div>
  );
}
