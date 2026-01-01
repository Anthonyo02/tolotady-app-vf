"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Package,
  TrendingUp,
  UserCheck,
  Plus,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
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
import { ToastSuccess } from "@/components/toast/toastS";

/* ================= API ================= */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwzATj2nIFTZb7Ptb60cXoWbjtVV0DHYQkUnnCLqhlNaps1yStrDxuk7Ql9Wx954oFY/exec";

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
  const [message, setMessage] = useState("Success");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );

  /* ===== Pull to Refresh states ===== */
  const startY = useRef(0);
  const pulling = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const MAX_PULL = 80;

  /* ================= LOAD LOCAL ================= */
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
      setShow(false);
      setMessage("Données mises à jour");

      if (!parsedLocal || !isSameData(parsedLocal, reversedData)) {
        setEquipment(reversedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reversedData));
        setShowSuccess(true);
        setShow(false);
        setMessage("Données mises à jour");
      }
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setShow(false);
      setIsRefreshing(false);
      setLoading(false);
      setShowSuccess(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= Pull To Refresh ================= */
  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current) return;

    const distance = e.touches[0].clientY - startY.current;
    if (distance > 0) {
      setPullDistance(Math.min(distance, MAX_PULL));
    }
  };

  const onTouchEnd = async () => {
    if (pullDistance >= 10) {
      setIsRefreshing(true);
      setShow(true);
      await fetchData();
    }

    setPullDistance(0);
    pulling.current = false;
  };

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const total = equipment.reduce(
      (acc, i) => acc + Number(i.totalQuantity || 0),
      0
    );
    const totalUse = equipment.reduce(
      (acc, i) => acc + Number(i.utiliser || 0),
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

    return { total, totalPret, totalEndommage, totalUse };
  }, [equipment]);

  /* ================= FILTER ================= */
  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesResponsable =
        responsableFilter === "all" || item.responsable === responsableFilter;

      return matchesSearch && matchesResponsable;
    });
  }, [equipment, searchTerm, responsableFilter]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
        <Progres show />
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <Progres show={show} />
      <ToastSuccess
        message={message}
        show={showSuccess}
        setShow={setShowSuccess}
      />
      {/* Pull to refresh icon */}
      <div
        className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none [z-index:99]"
        style={{
          transform: `translateY(${pullDistance - 50}px)`,
          transition: pulling.current ? "none" : "transform 0.3s ease",
        }}
      >
        <div className="bg-white shadow-lg rounded-full p-2">
          <RefreshCw
            className={`h-3 w-3 text-gray-600 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </div>
      </div>

      <div
        className="min-h-screen bg-background gradient-hero"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
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
                style={{
                  background: "#6B6C33",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#7C7D3D"; // couleur hover
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#929439ff"; // couleur normale
                }}
                onClick={() => {
                  setEditingEquipment(null);
                  setIsModalOpen(true);
                }}
                disabled={!navigator.onLine}
              >
                <Plus className="mr-2 h-4 w-4 text-white" />
                <span className="text-white">Ajouter un matériel</span>
              </Button>
            </Grid>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <StatCard
                title="Total matériel"
                value={stats.total}
                icon={Package}
                variant="yellow"
              />
              <StatCard
                title="Utiliser"
                value={stats.totalUse}
                icon={CheckCircle}
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
              onEdit={(item) => {
                setEditingEquipment(item);
                setIsModalOpen(true);
              }}
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
