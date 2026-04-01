"use client";

import { useEffect, useState } from "react";

type Profile = {
  full_name: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  address: string;
  profile_image_url?: string;
};

type KYC = {
  document_type: string;
  document_front_url?: string;
  document_back_url?: string;
  proof_of_address_url?: string;
  bank_name?: string;
  bank_account?: string;
  account_type?: string;
  account_owner?: string;
  is_international?: boolean;
  swift?: string;
  iban?: string;
  status?: string;
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
    country: "",
    region: "",
    city: "",
    address: "",
  });

  const [kyc, setKyc] = useState<KYC>({
    document_type: "",
    is_international: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
        if (data.kyc) setKyc(data.kyc);
        setLoading(false);
      });
  }, []);

  const uploadFile = async (file: File, bucket: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  const handleSave = async () => {
    // 🔴 VALIDACIONES
    if (!profile.full_name) return alert("Nombre obligatorio");
    if (!profile.phone) return alert("Teléfono obligatorio");
    if (!profile.address) return alert("Dirección obligatoria");
    if (!kyc.document_type) return alert("Selecciona tipo documento");

    setSaving(true);

    await fetch("/api/account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profile, kyc }),
    });

    setSaving(false);
    alert("Guardado correctamente");
  };

  if (loading) return <div className="p-10">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold">Mi Cuenta</h1>

      {/* 🔥 ESTADO KYC */}
      <div className="p-4 rounded-xl bg-yellow-100 text-yellow-800">
        Estado KYC: <strong>{kyc?.status || "pendiente"}</strong>
      </div>

      {/* 👤 PERFIL */}
      <div className="border p-4 rounded-xl space-y-2">
        <h2 className="font-semibold mb-4">Perfil</h2>

        <input placeholder="Nombre completo" className="input"
          value={profile.full_name}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
        />

        <input placeholder="Teléfono" className="input"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />

        <input placeholder="País" className="input"
          value={profile.country}
          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
        />

        <input placeholder="Región" className="input"
          value={profile.region}
          onChange={(e) => setProfile({ ...profile, region: e.target.value })}
        />

        <input placeholder="Ciudad" className="input"
          value={profile.city}
          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
        />

        <input placeholder="Dirección" className="input"
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
        />
      </div>

      {/* 🪪 KYC */}
      <div className="border p-4 rounded-xl space-y-3">
        <h2 className="font-semibold mb-4">Verificación (KYC)</h2>

        <select className="input"
          value={kyc.document_type}
          onChange={(e) => setKyc({ ...kyc, document_type: e.target.value })}
        >
          <option value="">Tipo documento</option>
          <option value="dni">DNI</option>
          <option value="ci">Cédula</option>
          <option value="passport">Pasaporte</option>
        </select>

        <div>
          <label>Documento frontal</label>
          <input type="file"
            onChange={async (e) => {
              const url = await uploadFile(e.target.files![0], "kyc-documents");
              setKyc({ ...kyc, document_front_url: url });
            }}
          />
        </div>

        <div>
          <label>Documento trasero</label>
          <input type="file"
            onChange={async (e) => {
              const url = await uploadFile(e.target.files![0], "kyc-documents");
              setKyc({ ...kyc, document_back_url: url });
            }}
          />
        </div>

        <div>
          <label>Comprobante de domicilio</label>
          <input type="file"
            onChange={async (e) => {
              const url = await uploadFile(e.target.files![0], "kyc-documents");
              setKyc({ ...kyc, proof_of_address_url: url });
            }}
          />
        </div>
      </div>

      {/* 💳 BANCO */}
      <div className="border p-4 rounded-xl space-y-2">
        <h2 className="font-semibold mb-4">Datos de pago</h2>

        <label>
          <input type="checkbox"
            checked={kyc.is_international}
            onChange={(e) =>
              setKyc({ ...kyc, is_international: e.target.checked })
            }
          />
          Cuenta internacional
        </label>

        {!kyc.is_international ? (
          <>
            <input placeholder="Banco" className="input"
              value={kyc.bank_name || ""}
              onChange={(e) => setKyc({ ...kyc, bank_name: e.target.value })}
            />

            <input placeholder="Número de cuenta" className="input"
              value={kyc.bank_account || ""}
              onChange={(e) => setKyc({ ...kyc, bank_account: e.target.value })}
            />

            <input placeholder="Titular" className="input"
              value={kyc.account_owner || ""}
              onChange={(e) => setKyc({ ...kyc, account_owner: e.target.value })}
            />
          </>
        ) : (
          <>
            <input placeholder="IBAN" className="input"
              value={kyc.iban || ""}
              onChange={(e) => setKyc({ ...kyc, iban: e.target.value })}
            />

            <input placeholder="SWIFT" className="input"
              value={kyc.swift || ""}
              onChange={(e) => setKyc({ ...kyc, swift: e.target.value })}
            />
          </>
        )}
      </div>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-6 py-3 rounded-xl"
        disabled={saving}
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}