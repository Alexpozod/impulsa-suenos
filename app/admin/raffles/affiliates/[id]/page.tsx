"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

const [dashboard, setDashboard] = useState<any>(null);

const [loading, setLoading] = useState(true);

const [selectedSale, setSelectedSale] = useState<any>(null);

const [selectedPayout, setSelectedPayout] = useState<any>(null);

useEffect(() => {

  async function loadDashboard() {

    try {

      const response =
        await fetch(
          `/api/admin/raffles/affiliates/${affiliateId}`
        );

      const json =
        await response.json();

      setDashboard(json);

      console.log(
  "Affiliate Dashboard",
  json
);

    }

    catch (error) {

      console.error(error);

    }

    finally {

      setLoading(false);

    }

  }

  loadDashboard();

}, [affiliateId]);

if (loading) {

  return (

    <div className="p-10">

      Cargando...

    </div>

  );

}

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

        <div className="flex items-center gap-3">

  <h1 className="text-4xl font-bold">

    {dashboard?.affiliate?.name}

  </h1>

  <span className="rounded-full bg-green-500/15 text-green-400 px-3 py-1 text-xs font-semibold border border-green-500/30">

    {dashboard?.affiliate?.active ? "ACTIVO" : "INACTIVO"}

  </span>

</div>

      </div>
      
<div className="flex flex-wrap gap-3">

  <span className="rounded-full border px-3 py-1 text-xs">

    Affiliate

  </span>

  <span className="rounded-full border px-3 py-1 text-xs">

    Comisión {dashboard?.affiliate?.commissionPercent}%

  </span>

  <span className="rounded-full border px-3 py-1 text-xs">

    Código {dashboard?.affiliate?.code}

  </span>

</div>

<div className="font-mono text-sky-400 text-sm break-all">

  {`https://sorteos.impulsasuenos.com/r/${dashboard?.affiliate?.code}`}

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

      {/* Botón temporal eliminado.
   El modal se abrirá desde la tabla de compras. */}

    </div>

  </div>

</div>

      {/* Información del influencer ya incluida en el Header */}

      {/* KPIs */}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">

        <Card
        title="Ventas"
        value={String(dashboard?.stats?.paidOrders ?? 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
        />

        <Card
            title="Revenue"
            value={`$${Number(
                dashboard?.stats?.revenue ?? 0
            ).toLocaleString("es-CL")}`}
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <Card
            title="Comisión Generada"
            value={`$${Number(
                dashboard?.stats?.estimatedCommission ?? 0
            ).toLocaleString("es-CL")}`}
          icon={<DollarSign className="w-5 h-5" />}
        />

        <Card
            title="Pendiente Pago"
            value={`$${Math.max(
                0,
                Number(dashboard?.stats?.estimatedCommission ?? 0) -
                Number(dashboard?.stats?.paidCommission ?? 0)
            ).toLocaleString("es-CL")}`}
          icon={<Clock className="w-5 h-5" />}
        />

        <Card
                title="Pagado"
                value={`$${Number(
                    dashboard?.stats?.paidCommission ?? 0
                ).toLocaleString("es-CL")}`}
          icon={<Users className="w-5 h-5" />}
        />

        <Card
                title="CTR"
                value={`${
                    dashboard?.stats?.clicks
                    ? Math.round(
                        (dashboard.stats.beginCheckout /
                            dashboard.stats.clicks) *
                            100
                        )
                    : 0
                }%`}
            icon={<TrendingUp className="w-5 h-5" />}
            />

            <Card
                title="Conversión"
                value={`${
                    dashboard?.stats?.clicks
                    ? Math.round(
                        (dashboard.stats.paidOrders /
                            dashboard.stats.clicks) *
                            100
                        )
                    : 0
                }%`}
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

            <th className="pb-4">Cliente</th>

            <th className="pb-4">Sorteo</th>

            <th className="pb-4">Tickets</th>

            <th className="pb-4">Compra</th>

            <th className="pb-4">Comisión</th>

            <th className="pb-4">Estado</th>

            <th className="pb-4 text-center">Ver</th>

          </tr>

        </thead>

        <tbody>

{dashboard?.sales?.map((sale: any) => (

<tr
  key={sale.id}
  className="border-b border-white/5 hover:bg-white/5 transition-colors"
>

<td className="py-4">

{new Date(sale.createdAt).toLocaleDateString("es-CL")}

</td>

<td>

<div className="space-y-1">

<div className="font-semibold">

{sale.buyerName}

</div>

<div className="text-sm text-muted-foreground">

{sale.buyerEmail}

</div>

<div className="text-xs text-muted-foreground">

{sale.buyerPhone}

</div>

</div>

</td>

<td>

{dashboard?.affiliate?.raffle?.title}

</td>

<td>

<span className="rounded-full border px-3 py-1 text-xs">

{sale.quantity} Tickets

</span>

</td>

<td className="font-medium">

{"$" + Number(sale.total).toLocaleString("es-CL")}

</td>

<td className="text-green-400 font-medium">

{"$" + Math.round(

sale.total *

dashboard.affiliate.commissionPercent /

100

).toLocaleString("es-CL")}

</td>

<td>

<span
className={`rounded-full px-3 py-1 text-xs ${
sale.paymentStatus === "paid" ||
sale.paymentStatus === "approved"
? "bg-green-500/15 text-green-400 border border-green-500/30"
: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
}`}
>

{sale.paymentStatus}

</span>

</td>

<td className="text-center">

<button
onClick={() => {

setSelectedSale(sale);

setBuyerModalOpen(true);

}}
className="rounded-lg border px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2"
>

<Eye className="w-4 h-4"/>

Detalles

</button>

</td>

</tr>

))}

</tbody>

      </table>

    </div>

  </div>

</Section>

          {/* Ledger */}

     <Section title="Ledger Comercial">

  <div className="overflow-auto">

    <table className="w-full">

      <thead>

        <tr className="border-b text-left text-sm text-muted-foreground">

          <th className="pb-4">Fecha</th>

          <th className="pb-4">Tipo</th>

          <th className="pb-4">Referencia</th>

          <th className="pb-4 text-right">Débito</th>

          <th className="pb-4 text-right">Crédito</th>

          <th className="pb-4">Estado</th>

          <th className="pb-4 text-center">Detalle</th>

        </tr>

      </thead>

      <tbody>

        {dashboard?.ledger?.length ? (

          dashboard.ledger.map((item: any) => (

            <tr
              key={item.id}
              className="border-b border-white/5 hover:bg-white/5"
            >

              <td className="py-4">

                {new Date(item.createdAt)
                  .toLocaleDateString("es-CL")}

              </td>

              <td className="capitalize">

                {item.type === "affiliate_commission"
                    ? "Comisión Afiliado"
                    : item.type === "referral_reward"
                    ? "Recompensa Referido"
                    : item.type === "payment"
                    ? "Pago"
                    : item.type === "payout"
                    ? "Retiro"
                    : String(item.type).replaceAll("_", " ")}

                </td>

              <td className="font-mono text-xs">

                {item.id?.slice(0, 8).toUpperCase() ?? "-"}

              </td>

              <td className="text-right text-red-400">

                {item.debit
                  ? `$${item.debit.toLocaleString("es-CL")}`
                  : "-"}

              </td>

              <td className="text-right text-green-400">

                {item.credit
                  ? `$${item.credit.toLocaleString("es-CL")}`
                  : "-"}

              </td>

              <td>

                <span
                    className={`rounded-full px-3 py-1 text-xs ${
                        item.status === "paid" ||
                        item.status === "confirmed"
                        ? "bg-green-500/15 text-green-400 border border-green-500/30"
                        : item.status === "pending"
                        ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                    >

                    {item.status === "confirmed"
                        ? "Confirmado"
                        : item.status === "paid"
                        ? "Pagado"
                        : item.status === "pending"
                        ? "Pendiente"
                        : item.status === "cancelled"
                        ? "Cancelado"
                        : item.status}

                    </span>

              </td>

              <td className="text-center">

                <button
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-white/5"
                >

                  Ver

                </button>

              </td>

            </tr>

          ))

        ) : (

          <tr>

            <td
              colSpan={7}
              className="py-12 text-center text-muted-foreground"
            >

              Sin movimientos

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

</Section>

            {/* Pagos */}

      <Section title="Historial de Pagos">

        <div className="overflow-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b text-left text-sm text-muted-foreground">

                <th className="pb-4">Fecha</th>

                <th className="pb-4">Período</th>

                <th className="pb-4 text-right">Monto</th>

                <th className="pb-4">Método</th>

                <th className="pb-4">Referencia</th>

                <th className="pb-4">Estado</th>

                <th className="pb-4 text-center">Comprobante</th>

              </tr>

            </thead>

            <tbody>

              {dashboard?.payouts?.length ? (

                    dashboard.payouts.map((payment:any)=>(

                    <tr
                    key={payment.id}
                    className="border-b border-white/5 hover:bg-white/5"
                    >

                    <td className="py-4">

                    {new Date(payment.createdAt)
                    .toLocaleDateString("es-CL")}

                    </td>

                    <td>

                    {new Date(payment.createdAt)
                    .toLocaleDateString("es-CL",{
                    month:"long",
                    year:"numeric"
                    })}

                    </td>

                    <td className="text-right font-semibold text-green-400">

                    {"$"+payment.amount.toLocaleString("es-CL")}

                    </td>

                    <td>

                    Transferencia

                    </td>

                    <td className="font-mono text-sm">

                    {payment.id.slice(0,8).toUpperCase()}

                    </td>

                    <td>

                    <span
                    className={`rounded-full px-3 py-1 text-xs ${
                    payment.status==="approved"
                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                    : payment.status==="pending"
                    ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                    : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                    >

                    {payment.status==="approved"
                    ? "Pagado"
                    : payment.status==="pending"
                    ? "Pendiente"
                    : payment.status==="rejected"
                    ? "Rechazado"
                    : payment.status}

                    </span>

                    </td>

                    <td className="text-center">

                    <button
                        onClick={()=>{
                        setSelectedPayout(payment)
                        }}
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-white/5"
                        >

                        Ver

                        </button>

                    </td>

                    </tr>

                    ))

                    ) : (

                    <tr>

                    <td
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground"
                    >

                    Sin solicitudes de pago

                    </td>

                    </tr>

                    )}

            </tbody>

          </table>

        </div>

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

              <Info
                label="Nombre"
                value={selectedSale?.buyerName ?? "-"}
                />

                <Info
                label="Email"
                value={selectedSale?.buyerEmail ?? "-"}
                />

                <Info
                label="Teléfono"
                value={selectedSale?.buyerPhone ?? "-"}
                />

                <Info
                label="Sorteo"
                value={selectedSale?.raffleTitle ?? "-"}
                />

                <Info
                label="Tickets"
                value={
                selectedSale?.tickets?.length
                ? selectedSale.tickets.join(" · ")
                : "-"
                }
                />

                <Info
                label="Compra"
                value={`$${Number(
                selectedSale?.total ?? 0
                ).toLocaleString("es-CL")}`}
                />

                <Info
                label="Comisión"
                value={`$${Math.round(
                (selectedSale?.total ?? 0) *
                dashboard?.affiliate?.commissionPercent /
                100
                ).toLocaleString("es-CL")}`}
                />

                <Info
                label="Order ID"
                value={
                    selectedSale?.id
                    ? selectedSale.id.substring(0, 8).toUpperCase()
                    : "-"
                }
                />

                <Info
                label="Fecha Compra"
                value={
                    selectedSale?.createdAt
                    ? new Date(selectedSale.createdAt).toLocaleString("es-CL")
                    : "-"
                }
                />

                <Info
                label="Proveedor"
                value={
                    selectedSale?.paymentProvider?.toUpperCase() ?? "-"
                }
                />

                <Info
                label="ID Pago Flow"
                value={selectedSale?.paymentReference ?? "-"}
                />

                <Info
                label="Estado"
                value={
                    selectedSale?.paymentStatus === "approved" ||
                    selectedSale?.paymentStatus === "paid"
                    ? "Pagado"
                    : selectedSale?.paymentStatus === "pending"
                    ? "Pendiente"
                    : selectedSale?.paymentStatus === "failed"
                    ? "Fallido"
                    : selectedSale?.paymentStatus ?? "-"
                }
                />

                <Info
                label="Código Comercial"
                value={dashboard?.affiliate?.code ?? "-"}
                />

            </div>

          </div>

        </div>

         )}

      {selectedPayout && (

        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">

          <div className="w-full max-w-xl rounded-xl border bg-[#090d18] shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-4">

              <h2 className="text-xl font-semibold">

                Detalle del Pago

              </h2>

              <button
                onClick={() => setSelectedPayout(null)}
                className="text-muted-foreground hover:text-white"
              >

                ✕

              </button>

            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">

              <Info label="ID" value={selectedPayout.id} />

              <Info
                label="Monto"
                value={`$${selectedPayout.amount.toLocaleString("es-CL")}`}
              />

              <Info
                    label="Estado"
                    value={
                    selectedPayout.status==="approved"
                    ? "Pagado"
                    : selectedPayout.status==="pending"
                    ? "Pendiente"
                    : selectedPayout.status==="rejected"
                    ? "Rechazado"
                    : selectedPayout.status
                    }
                    />

              <Info
                label="Solicitado"
                value={new Date(selectedPayout.createdAt).toLocaleString("es-CL")}
              />

              <Info
                label="Procesado por"
                value={selectedPayout.processedBy ?? "-"}
              />

              <Info
                label="Fecha proceso"
                value={
                  selectedPayout.processedAt
                    ? new Date(selectedPayout.processedAt).toLocaleString("es-CL")
                    : "-"
                }
              />

              <Info
                label="Motivo rechazo"
                value={selectedPayout.rejectionReason ?? "-"}
              />

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
    <div className="rounded-xl border p-5 hover:border-white/30 transition-colors">

      <div className="flex items-start justify-between">

        <div>

          <div className="text-xs uppercase tracking-wide text-muted-foreground">

            {title}

          </div>

          <div className="text-3xl font-bold mt-3">

            {value}

          </div>

        </div>

        <div className="text-muted-foreground">

          {icon}

        </div>

      </div>

      <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">

        <div className="h-full w-0 bg-green-500 rounded-full" />

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