"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import BalanceCard from "@/components/BalanceCard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";

interface Transaction {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string;
  createdAt: string;
}

interface TransactionData {
  description: string;
  type: string;
  amount: number;
  date: string;
}

type AlertMessage = { type: "success" | "error"; text: string };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<AlertMessage | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTransactions(data);
    } catch {
      showAlert({ type: "error", text: "Errore nel caricamento dei movimenti" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchTransactions();
  }, [status, fetchTransactions]);

  const showAlert = (msg: AlertMessage) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddTransaction = async (data: TransactionData): Promise<boolean> => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        showAlert({ type: "error", text: json.error || "Errore nel salvataggio" });
        return false;
      }

      await fetchTransactions();
      setShowForm(false);
      showAlert({ type: "success", text: "Movimentazione salvata con successo!" });
      return true;
    } catch {
      showAlert({ type: "error", text: "Errore nel salvataggio. Riprova." });
      return false;
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Finanze</h1>
              <p className="text-xs text-gray-500">Benvenuto, {session?.user?.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-red-600 transition font-medium"
          >
            Esci
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <BalanceCard balance={balance} income={income} expense={expense} />

        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`font-semibold px-5 py-2.5 rounded-lg transition text-sm ${
              showForm
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            }`}
          >
            {showForm ? "Annulla" : "+ Nuova Movimentazione"}
          </button>
        </div>

        {showForm && <TransactionForm onSubmit={handleAddTransaction} />}

        <TransactionList
          title="Entrate"
          transactions={transactions.filter((t) => t.type === "income")}
          type="income"
        />
        <TransactionList
          title="Uscite"
          transactions={transactions.filter((t) => t.type === "expense")}
          type="expense"
        />
      </main>
    </div>
  );
}
