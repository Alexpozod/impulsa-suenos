"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  Search,
  Eye,
} from "lucide-react";

export default function AffiliateDetailPage() {
  const params = useParams();

  const affiliateId = params.id as string;
  const [buyerModalOpen, setBuyerModalOpen] = useState(false);

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="space-y-5">

  <Link
    href="/admin/raffles/affiliates"
    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white"
  >
    <ArrowLeft className="h-4 w-4" />
    Volver
  </Link>

  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

    <div className="space-y-3">

      <div className="flex items-center gap-3">

        <h1 className="text-4xl font-bold">
          Influencer
        </h1>

        <span className="rounded-full bg-green-500/15 text-green-400 px-3 py-1 text-xs font-semibold border border-green-500/30">
          ACTIVO
        </span>

      </div>

      <div className="text-2xl font-semibold">

  LesLes

</div>

<div className="flex flex-wrap gap-3">

  <span className="rounded-full border px-3 py-1 text-xs">

    Affiliate

  </span>

  <span className="rounded-full border px-3 py-1 text-xs">

    Comisión 10%

  </span>

  <span className="rounded-full border px-3 py-1 text-xs">

    Código LESLES10

  </span>

</div>

<div className="font-mono text-sky-400 text-sm break-all">

  https://impulsasuenos.com/r/LESLES10

</div>

<div className="text-sm text-muted-foreground">

  Última venta:
  <span className="text-white ml-2">

    Hace 2 horas

  </span>

</div>

    </div>

    <div className="flex flex-wrap gap-3">

      <button className="border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/5">

        <Copy className="w-4 h-4" />

        Copiar Código

      </button>

      <button className="border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/5">

        <Copy className="w-4 h-4" />

        Copiar Link

      </button>

      <button
  onClick={() => setBuyerModalOpen(true)}
  className="border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/5"
>

  <Eye className="w-4 h-4" />

  Ver Modal

</button>

    </div>

  </div>

</div>

      {/* Información del influencer ya incluida en el Header */}

      {/* KPIs */}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">

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
          title="Comisión Generada"
          value="$0"
          icon={<DollarSign className="w-5 h-5" />}
        />

        <Card
          title="Pendiente Pago"
          value="$0"
          icon={<Clock className="w-5 h-5" />}
        />

        <Card
          title="Pagado"
          value="$0"
          icon={<Users className="w-5 h-5" />}
        />

        <Card
            title="CTR"
            value="0%"
            icon={<TrendingUp className="w-5 h-5" />}
            />

            <Card
            title="Conversión"
            value="0%"
            icon={<TrendingUp className="w-5 h-5" />}
            />

      </div>

      {/* Historial Comercial */}

<Section title="Historial Comercial">

  <div className="space-y-5">

    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">

      <div className="relative w-full lg:max-w-md">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <input
          placeholder="Buscar por nombre, correo, teléfono, Order o Payment..."
          className="w-full rounded-lg border bg-transparent pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary"
        />

      </div>

      <div className="flex flex-wrap gap-2">

        <button className="rounded-full border px-4 py-2 text-sm hover:bg-white/5">
          Todos
        </button>

        <button className="rounded-full border px-4 py-2 text-sm hover:bg-white/5">
          Pendientes
        </button>

        <button className="rounded-full border px-4 py-2 text-sm hover:bg-white/5">
          Pagados
        </button>

        <button className="rounded-full border px-4 py-2 text-sm hover:bg-white/5">
          Fallidos
        </button>

        <button className="rounded-full border px-4 py-2 text-sm hover:bg-white/5">
          Reembolsados
        </button>

      </div>

    </div>

    <div className="overflow-auto">

      <table className="w-full">

        <thead>

          <tr className="text-left text-sm text-muted-foreground border-b">

            <th className="pb-4">Fecha</th>

            <th className="pb-4">Comprador</th>

            <th className="pb-4">Email</th>

            <th className="pb-4">Teléfono</th>

            <th className="pb-4">Sorteo</th>

            <th className="pb-4">Tickets</th>

            <th className="pb-4">Compra</th>

            <th className="pb-4">Comisión</th>

            <th className="pb-4">Estado</th>

            <th className="pb-4 text-center">Ver</th>

          </tr>

        </thead>

        <tbody>

         <tr>

            <td
                colSpan={9}
                className="py-20 text-center"
            >

              <div className="flex flex-col items-center gap-4">

                <div className="text-5xl">
                  🧾
                </div>

                <div className="space-y-2">

                  <h3 className="text-lg font-semibold">

                    Todavía no existen compras
                    atribuidas a este influencer.

                  </h3>

                  <p className="text-muted-foreground max-w-md">

                    Cuando un cliente compre utilizando
                    su código comercial o su enlace de
                    seguimiento, el historial aparecerá
                    automáticamente aquí.

                  </p>

                </div>

              </div>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </div>

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

      {buyerModalOpen && (

        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">

          <div className="w-full max-w-3xl rounded-xl border bg-[#090d18] shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">

              <h2 className="text-xl font-semibold">

                Detalle del Comprador

              </h2>

              <button
                onClick={() => setBuyerModalOpen(false)}
                className="text-muted-foreground hover:text-white"
              >

                ✕

              </button>

            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">

              <Info label="Nombre" value="Carlos Morales" />
              <Info label="Email" value="carlos@email.com" />
              <Info label="Teléfono" value="+56 9 1111 1111" />
              <Info label="Sorteo" value="iPhone 17 Pro" />
              <Info label="Tickets" value="000124 · 000125 · 000126" />
              <Info label="Compra" value="$30.000" />
              <Info label="Comisión" value="$3.000" />
              <Info label="Order ID" value="ORD-000001" />
              <Info label="Payment ID" value="PAY-000001" />
              <Info label="Flow Payment" value="123456789" />
              <Info label="Commercial Code" value="LESLES10" />
              <Info label="Commercial Type" value="Affiliate" />

            </div>

          </div>

        </div>

      )}

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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (

    <div>

      <div className="text-sm text-muted-foreground">

        {label}

      </div>

      <div className="font-medium mt-1 break-all">

        {value}

      </div>

    </div>

  );
}