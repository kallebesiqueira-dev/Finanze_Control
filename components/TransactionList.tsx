interface Transaction {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string;
}

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  type: "income" | "expense";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function TransactionList({ title, transactions, type }: TransactionListProps) {
  const isIncome = type === "income";
  const accentColor = isIncome ? "bg-green-500" : "bg-red-500";
  const titleColor = isIncome ? "text-green-700" : "text-red-700";
  const amountColor = isIncome ? "text-green-600" : "text-red-600";
  const totalBg = isIncome ? "bg-green-50" : "bg-red-50";
  const totalColor = isIncome ? "text-green-700" : "text-red-700";
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${accentColor}`} />
          <h2 className={`font-semibold ${titleColor}`}>{title}</h2>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {transactions.length}{" "}
          {transactions.length === 1 ? "movimento" : "movimenti"}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">
            Nessuna {title.toLowerCase()} registrata
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {t.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.date)}</p>
                </div>
                <span className={`font-semibold text-sm ml-4 shrink-0 ${amountColor}`}>
                  {isIncome ? "+" : "-"} {formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
          <div
            className={`px-6 py-3 border-t border-gray-100 flex justify-between items-center ${totalBg}`}
          >
            <span className="text-xs font-medium text-gray-500">
              Totale {title.toLowerCase()}
            </span>
            <span className={`font-bold text-sm ${totalColor}`}>
              {formatCurrency(total)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
