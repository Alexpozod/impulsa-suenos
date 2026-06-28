"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function AffiliateDetailPage() {
  const params = useParams();

  const affiliateId = params.id as string;

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <Link
            href="/admin/raffles/affiliates"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          <h1 className="text-3xl font-bold">
            Influencer
          </h1>

          <p className="text-muted-foreground mt-2">
            ID: {affiliateId}
          </p>

        </div>

        <div className="flex gap-3">

          <button className="border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/5">
            <Copy className="w-4 h-4" />
            Copiar Código
          </button>

          <button className="border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/5">
            <Copy className="w-4 h-4" />
            Copiar Link
          </button>

        </div>

      </div>

      {/* Información */}

      <div className="rounded-xl border p-6">

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <div className="text-sm text-muted-foreground">
              Nombre
            </div>

            <div className="text-xl font-semibold mt-1">
              --
            </div>

          </div>

          <div>

            <div className="text-sm text-muted-foreground">
              Código Comercial
            </div>

            <div className="text-xl font-semibold mt-1">
              --
            </div>

          </div>

          <div>

            <div className="text-sm text-muted-foreground">
              Comisión
            </div>

            <div className="text-xl font-semibold mt-1">
              --
            </div>

          </div>

          <div>

            <div className="text-sm text-muted-foreground">
              Estado
            </div>

            <div className="text-xl font-semibold mt-1 text-green-400">
              Activo
            </div>

          </div>

        </div>

      </div>

      {/* KPIs */}

      <div className="grid gap-4 md:grid-cols-5">

        <Card
          title="Ventas"
          value="0"
          icon={<ShoppingCart className="w-5 h-5" />}
        />

        <Card
          title="Revenue"
          value="$0"
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <Card
          title="Comisión"
          value="$0"
          icon={<DollarSign className="w-5 h-5" />}
        />

        <Card
          title="Pendiente"
          value="$0"
          icon={<Clock className="w-5 h-5" />}
        />

        <Card
          title="Pagado"
          value="$0"
          icon={<Users className="w-5 h-5" />}
        />

      </div>

      {/* Historial Comercial */}

      <Section title="Historial Comercial">

        <EmptyTable
          columns={[
            "Fecha",
            "Orden",
            "Sorteo",
            "Comprador",
            "Tickets",
            "Compra",
            "Comisión",
            "Estado",
            "Acciones",
          ]}
        />

      </Section>

      {/* Ledger */}

      <Section title="Ledger Comercial">

        <EmptyTable
          columns={[
            "Fecha",
            "Movimiento",
            "Orden",
            "Monto",
            "Estado",
          ]}
        />

      </Section>

      {/* Pagos */}

      <Section title="Historial de Pagos">

        <EmptyTable
          columns={[
            "Fecha",
            "Monto",
            "Método",
            "Referencia",
            "Administrador",
          ]}
        />

      </Section>

    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-5">

      <div className="flex justify-between items-center">

        <div className="text-sm text-muted-foreground">
          {title}
        </div>

        {icon}

      </div>

      <div className="text-2xl font-bold mt-4">
        {value}
      </div>

    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border overflow-hidden">

      <div className="border-b px-6 py-4">

        <h2 className="font-semibold text-lg">
          {title}
        </h2>

      </div>

      <div className="p-6">

        {children}

      </div>

    </div>
  );
}

function EmptyTable({
  columns,
}: {
  columns: string[];
}) {
  return (
    <div className="overflow-auto">

      <table className="w-full">

        <thead>

          <tr>

            {columns.map((column) => (
              <th
                key={column}
                className="text-left text-sm font-medium text-muted-foreground pb-4"
              >
                {column}
              </th>
            ))}

          </tr>

        </thead>

        <tbody>

          <tr>

            <td
              colSpan={columns.length}
              className="py-10 text-center text-muted-foreground"
            >
              Sin información disponible
            </td>

          </tr>

        </tbody>

      </table>

    </div>
  );
}