"use client";

import { useState, useMemo, useEffect } from "react";
import { Package, TrendingUp, UserCheck, Plus } from "lucide-react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import SearchBar from "@/components/SearchBar";
import EquipmentTable from "@/components/EquipmentTable";
import EquipmentModal from "@/components/EquipmentModal";
import { Button } from "@/components/ui/button";
import { Equipment } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";
import Progres from "@/components/Progres";
import { Grid } from "@mui/material";

/* ================= API ================= */
const API_URL = import.meta.env.DEV
  ? "/api"
  : "https://script.google.com/macros/s/AKfycbxdpPxqHw4eC_pndM5exhYIGKuSSpMJ-3CdyZYS3Agge35vBF9QvvP-DGjVs-zUf1Is/exec";

const STORAGE_KEY = "equipment_data_v1";

/* ================= UTILS ================= */
const isOnline = () => navigator.onLine;
const isSameData = (a: Equipment[], b: Equipment[]) =>
  JSON.stringify(a) === JSON.stringify(b);

/* ================= COMPONENT ================= */
const Index = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [responsableFilter, setResponsableFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingEquipment, setEditingEquipment] =
    useState<Equipment | null>(null);

  /* ================= LOAD LOCAL STORAGE ================= */
  useEffect(() => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        setEquipment(JSON.parse(localData));
      } catch (e) {
        console.error("Erreur parsing localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  /* ================= FETCH API ================= */
  const fetchData = async () => {
    if (!isOnline()) return;

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erreur réseau");

      const data: Equipment[] = await res.json();
      const reversedData = [...data].reverse();

      const localData = localStorage.getItem(STORAGE_KEY);
      const parsedLocal = localData ? JSON.parse(localData) : null;

      if (!parsedLocal || !isSameData(parsedLocal, reversedData)) {
        setEquipment(reversedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reversedData));

        toast({
          title: "Synchronisation",
          description: "Données mises à jour depuis le serveur",
        });
      }
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= ADD / EDIT ================= */
  const handleAddNew = () => {
    setEditingEquipment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setIsModalOpen(true);
  };

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = equipment.reduce(
      (acc, i) => acc + Number(i.totalQuantity || 0),
      0
    );

    const totalPret = equipment.reduce(
      (acc, i) => acc + Number(i.pret || 0),
      0
    );

    const totalEndommage = equipment.reduce(
      (acc, i) => acc + Number(i.endommagé || 0),
      0
    );

    return { total, totalPret, totalEndommage };
  }, [equipment]);

  /* ================= FILTER ================= */
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesResponsable =
        responsableFilter === "all" ||
        item.responsable === responsableFilter;

      return matchesSearch && matchesResponsable;
    });
  }, [equipment, searchTerm, responsableFilter]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
        <Progres show={show} />
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <Progres show={show} />

      <div className="min-h-screen bg-background gradient-hero">
        <Header />

        <main className="container mx-auto px-6 py-8">
          {/* Dashboard */}
          <section className="mb-12">
            <Grid container justifyContent="space-between" alignItems="center">
              <div>
                <h2 className="text-3xl font-bold mb-2">Tableau de bord</h2>
                <p className="text-muted-foreground">
                  Vue d'ensemble de votre inventaire
                </p>
              </div>

              <Button
                style={{ background: "#6B6C33" }}
                onClick={handleAddNew}
                disabled={!navigator.onLine}
                title={!navigator.onLine ? "Mode offline" : ""}
              >
                <Plus className="mr-2 h-4 w-4 text-white" />
                <span className="text-white">Ajouter un matériel</span>
              </Button>
            </Grid>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <StatCard
                title="Total matériel"
                value={stats.total}
                icon={Package}
                variant="success"
              />
              <StatCard
                title="Matériel en prêt"
                value={stats.totalPret}
                icon={TrendingUp}
                variant="warning"
              />
              <StatCard
                title="Matériel endommagé"
                value={stats.totalEndommage}
                icon={UserCheck}
                variant="error"
              />
            </div>
          </section>

          {/* Inventory */}
          <section>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              responsableFilter={responsableFilter}
              onResponsableChange={setResponsableFilter}
            />

            <EquipmentTable
              equipment={filteredEquipment}
              reload={fetchData}
              setShow={setShow}
              show={show}
              onEdit={handleEdit}
            />
          </section>
        </main>

        <EquipmentModal
          isOpen={isModalOpen}
          equipment={editingEquipment}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEquipment(null);
          }}
          reload={fetchData}
          setShow={setShow}
        />
      </div>
    </>
  );
};

export default Index;
