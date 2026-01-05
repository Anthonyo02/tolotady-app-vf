"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Package,
  TrendingUp,
  UserCheck,
  Plus,
  RefreshCw,
  CheckCircle,
  Map,
} from "lucide-react";
import { SplashScreen } from "@capacitor/splash-screen";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import SearchBar from "@/components/SearchBar";
import EquipmentTable from "@/components/EquipmentTable";
import EquipmentModal from "@/components/EquipmentModal";
import EquipmentTableTerrain from "@/components/EquipmentTableTerrain";
import { Button } from "@/components/ui/button";
import {
  Equipment,
  RESPONSABLES,
  TerrainItem,
  EquipementSelected,
} from "@/types/inventory";
import Progres from "@/components/Progres";
import { ToastSuccess } from "@/components/toast/toastS";
import { Grid } from "@mui/material";
import { set } from "date-fns";
import EquipmentModalTerrain from "@/components/EquipmentModalTerrain";

/* ================= API ================= */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwzATj2nIFTZb7Ptb60cXoWbjtVV0DHYQkUnnCLqhlNaps1yStrDxuk7Ql9Wx954oFY/exec";
const TERRAIN_URL =
  "https://script.google.com/macros/s/AKfycbw6lWC7cRT6C-a65sf5Mb-XCKUsqWCdqdZeymX0ZrNPfaAoIcyfaJWhe0MgbFzcjBiz7w/exec";

const STORAGE_KEY_EQUIP = "equipment_data_v1";
const STORAGE_KEY_TERRAIN = "terrain_data_v1";
const STORAGE_KEY_TERRAINV2 = "terrain_data_v2";

/* ================= UTILS ================= */
const isOnline = () => navigator.onLine;
const isSameDataMateriel = (a: any[], b: any[]) =>
  JSON.stringify(a) === JSON.stringify(b);

const isSameDataTerrain = (a: unknown[], b: unknown[]) => {
  if (a.length !== b.length) return false;
  return a.every((item, i) => JSON.stringify(item) === JSON.stringify(b[i]));
};

/* ================= COMPONENT ================= */
const Index = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [terrain, setTerrain] = useState<TerrainItem[]>([]);
  const [localData, setLocalData] = useState<TerrainItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [responsableFilter, setResponsableFilter] = useState("all");
  const [isSortieModalOpen, setIsSortieModalOpen] = useState(false);
  const [message, setMessage] = useState("Success");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );
  const [editingTerrain, setEditingTerrain] = useState<TerrainItem | null>(
    null
  );

  const startY = useRef(0);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const MAX_PULL = 80;

  /* ================= SPLASH SCREEN ================= */
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hide(), 6000);
    return () => clearTimeout(timer);
  }, []);

  /* ================= LOAD LOCAL ================= */

  useEffect(() => {
    try {
      const localEquip = localStorage.getItem(STORAGE_KEY_EQUIP);
      if (localEquip)
        setEquipment(JSON.parse(localEquip)),
          setLocalData(JSON.parse(localEquip));

      const localTerrain = localStorage.getItem(STORAGE_KEY_TERRAIN);
      if (localTerrain) setTerrain(JSON.parse(localTerrain));
      setTerrain(JSON.parse(localTerrain));
    } catch (err) {
      console.error("Erreur parsing localStorage", err);
    } finally {
      setShow(false);
      setLoading(false);
    }
  }, []);

  /* ================= FETCH INVENTAIRE ================= */
  const fetchData = async () => {
    if (!isOnline()) return;

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erreur réseau");

      const data: Equipment[] = await res.json();
      const reversedData = [...data].reverse();

      const localData = localStorage.getItem(STORAGE_KEY_EQUIP);
      const parsedLocal = localData ? JSON.parse(localData) : null;

      if (!parsedLocal || !isSameDataMateriel(parsedLocal, reversedData)) {
        setEquipment(reversedData);
        localStorage.setItem(STORAGE_KEY_EQUIP, JSON.stringify(reversedData));
        setMessage("Données inventaire mises à jour");
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Erreur fetch inventaire:", err);
    } finally {
      setShow(false);
      setIsRefreshing(false);
      setLoading(false);
    }
  };
  const fetchDataTerrainV2 = async () => {
    if (!isOnline()) return;

    try {
      const res = await fetch(TERRAIN_URL);
      if (!res.ok) throw new Error("Erreur réseau");

      const data: TerrainItem[] = await res.json();
      const reversedData = [...data].reverse();

      const localData = localStorage.getItem(STORAGE_KEY_TERRAIN);
      const parsedLocal = localData ? JSON.parse(localData) : null;
      if (!parsedLocal || !isSameDataTerrain(parsedLocal, reversedData)) {
        setTerrain(reversedData);
        localStorage.setItem(STORAGE_KEY_TERRAIN, JSON.stringify(reversedData));
        setMessage("Données terrain mises à jour");
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Erreur fetch terrain:", err);
    } finally {
      setShow(false);
      setIsRefreshing(false);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    fetchDataTerrainV2();
  }, []);
  // useEffect(() => {
  //   setEditingTerrain(null);
  //   // console.log(editingTerrain);
    
  // }, [isSortieModalOpen]);

  /* ================= PULL TO REFRESH ================= */
  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current) return;
    const distance = e.touches[0].clientY - startY.current;
    if (distance > 0) setPullDistance(Math.min(distance, MAX_PULL));
  };

  const onTouchEnd = async () => {
    if (pullDistance >= 10) {
      setIsRefreshing(true);
      setShow(true);
      await fetchData();
      await fetchDataTerrainV2();
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
    return { total, totalUse, totalPret, totalEndommage };
  }, [equipment]);

  /* ================= FILTER ================= */
  const filteredEquipment = useMemo(
    () =>
      equipment.filter((item) => {
        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesResponsable =
          responsableFilter === "all" || item.responsable === responsableFilter;
        return matchesSearch && matchesResponsable;
      }),
    [equipment, searchTerm, responsableFilter]
  );

  /* ================= LOADING ================= */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
        <Progres show />
      </div>
    );

  /* ================= RENDER ================= */
  return (
    <>
      <Progres show={show} />
      <ToastSuccess
        message={message}
        show={showSuccess}
        setShow={setShowSuccess}
      />

      {/* Pull to refresh */}
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
              <Grid container columnSpacing={2}>
                <Button
                  onClick={() => {
                    setEditingEquipment(null);
                    setIsModalOpen(true);
                  }}
                  disabled={!navigator.onLine}
                  size="sm"
                  className={`flex items-center px-4 py-2 rounded text-white font-medium transition-colors duration-300 ${
                    navigator.onLine
                      ? "bg-[#6B6C33] hover:bg-[#7C7D3D]"
                      : "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                  }`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {navigator.onLine ? "Ajouter un matériel" : "Hors ligne"}
                </Button>
              </Grid>
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
          <Grid container justifyContent={"end"} my={3}>
            <Button
              size="sm"
              onClick={() =>{ setIsSortieModalOpen(true);setEditingTerrain(null);}}
              variant="default"
              disabled={!navigator.onLine}
              className={`flex items-center px-4 py-2 rounded text-white font-medium transition-colors duration-300 ${
                navigator.onLine
                  ? "bg-[#6B6C33] hover:bg-[#7C7D3D]"
                  : "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
              }`}
            >
              <Map className="mr-2 h-4 w-4" />
              Sortie terrain
            </Button>
          </Grid>
          <section>
            <EquipmentTableTerrain
              data={terrain}
              reload={fetchDataTerrainV2}
              setShow={setShow}
              show={show}
              onEditTerrain={(item) => {
                setEditingTerrain(item);
                setIsSortieModalOpen(true);
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

        <EquipmentModalTerrain
          open={isSortieModalOpen}
          equipement={equipment}
          idEditTerrain={editingTerrain}
          onClose={() => setIsSortieModalOpen(false)}
          local={localData}
          reLoad={fetchDataTerrainV2}
          setShow={setShow}
        />
      </div>
    </>
  );
};

export default Index;
