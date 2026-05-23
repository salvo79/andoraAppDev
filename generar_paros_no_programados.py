#!/usr/bin/env python3
"""
=======================================================================
  anDora – Paros No Programados + Cumplimiento de Mantenimiento
          2020-01-01 → 2025-12-31
=======================================================================
  Colecciones que CREA:
    paros_no_programados      – eventos aleatorios de paro por planta,
                                tanque y sistema logístico
    cumplimiento_mantenimiento – registro del 75 % de cumplimiento del
                                programa de mantenimiento preventivo

  Colecciones REALES que ACTUALIZA (impacto cascada):
    resumen_produccion_diaria_planta  → reduce cantidad en días con paro
    balance_materia_almacen           → ajusta pf_producido_kg y balance_ok
    inventario                        → reduce produccion_kg / stock_final_kg
    resumen_operaciones_almacen       → reduce produccion_pf_ton
    cierres_diarios                   → ajusta produccion_kg / ingresos / margen
    resumen_diario_ordenes            → reduce ventas_ton / ingresos

  Lógica de cumplimiento:
    • Cada evento de programa_mantenimiento tiene 75 % de probabilidad de
      haberse ejecutado (random con seed 77).
    • Un mantenimiento NO ejecutado eleva la probabilidad de paro no
      programado en esa planta durante los siguientes 30 días.

  Ejecutar:
      cd ~/Desktop/anDora_v3.4
      python3 generar_paros_no_programados.py
=======================================================================
"""

import random, sys, math
from datetime import datetime, timedelta, timezone, date
from collections import defaultdict
from bson import ObjectId
from pymongo import MongoClient, UpdateOne

SEED_PAROS = 77          # semilla fija → resultados reproducibles
PROB_BASE_PLANTA = 0.03  # 3 % de días → paro en planta
PROB_BASE_TANQUE = 0.02  # 2 % de días → paro en tanque
PROB_BASE_LOGIS  = 0.015 # 1.5% de días → falla en sistema logístico
PROB_EXTRA_SKIP  = 0.025 # +2.5 % si el mantenimiento fue omitido en <30 días
CUMPLIMIENTO_PCT = 0.75  # 75 % de mantenimientos preventivos ejecutados

# ── Conexión ──────────────────────────────────────────────────────────
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    client.server_info()
except Exception as e:
    sys.exit(f"❌  No se pudo conectar a MongoDB: {e}")

db = client["andoraDB"]
print("✅  Conectado a andoraDB")

# ── Leer catálogos ────────────────────────────────────────────────────
print("\n📚  Leyendo catálogos y datos existentes...")
plantas      = list(db.cat_plantas_proceso.find())
tanques_cat  = list(db.tanques.find())
bombas_cat   = list(db.bombas_despachadoras.find())
sites_cat    = list(db.cat_sites.find())
company      = db.company.find_one() or {}
prog_mant    = list(db.programa_mantenimiento.find())   # plan preventivo

company_id = company.get("_id", ObjectId())
site_id    = sites_cat[0]["_id"] if sites_cat else ObjectId()

# Si no hay tanques en catálogo, construir lista sintética por planta
if not tanques_cat:
    tanques_cat = []
    for pl in plantas[:min(len(plantas), 5)]:
        pk = pl.get("planta_clave") or pl.get("clave", "PLT")
        for t in range(1, 3):
            tanques_cat.append({
                "_id":    ObjectId(),
                "codigo": f"TQ-{pk}-{t:02d}",
                "nombre": f"Tanque {t} – {pl.get('nombre','Planta')}",
                "planta_id": pl["_id"],
            })

# Sistemas logísticos: bombas o, si no existen, lista sintética
if not bombas_cat:
    bombas_cat = []
    for i, pl in enumerate(plantas[:min(len(plantas), 4)]):
        bombas_cat.append({
            "_id":    ObjectId(),
            "codigo": f"SL-{i+1:03d}",
            "nombre": f"Sistema Logístico {i+1}",
            "planta_id": pl["_id"],
        })

print(f"   programa_mantenimiento : {len(prog_mant):,} eventos")
print(f"   Plantas                : {len(plantas)}")
print(f"   Tanques                : {len(tanques_cat)}")
print(f"   Sist. logísticos       : {len(bombas_cat)}")

# ── Causas y parámetros por tipo de activo ────────────────────────────
CAUSAS_PLANTA = [
    ("falla_mecanica",      0.30, 4,  16),  # (causa, prob, h_min, h_max)
    ("falla_electrica",     0.20, 2,   6),
    ("falla_instrumental",  0.18, 1,   4),
    ("falla_proceso",       0.15, 2,   8),
    ("escasez_mp",          0.10, 8,  24),
    ("accidente_leve",      0.07, 4,  12),
]
CAUSAS_TANQUE = [
    ("fuga_sello",          0.30, 3,  10),
    ("contaminacion",       0.25, 6,  20),
    ("falla_instrumento",   0.20, 1,   4),
    ("sobrellenado",        0.15, 2,   8),
    ("corrosion",           0.10, 8,  24),
]
CAUSAS_LOGIS = [
    ("falla_bomba",         0.40, 2,   8),
    ("falla_valvula",       0.25, 1,   4),
    ("obstruccion_linea",   0.20, 3,  12),
    ("falla_electrica",     0.15, 2,   6),
]

def elegir_causa(causas):
    r = random.random()
    acum = 0.0
    for causa, prob, h_min, h_max in causas:
        acum += prob
        if r < acum:
            return causa, h_min, h_max
    return causas[-1][0], causas[-1][2], causas[-1][3]

TECNICOS = ["T.Hernández", "T.González", "T.López", "T.Martínez",
            "T.Ramírez",   "T.Sánchez",  "T.Torres", "T.Flores"]

# ── Preparar índice de paros de mantenimiento skipped por planta/fecha ─
print("\n⚙️   Calculando cumplimiento de mantenimiento (75 %)...")
random.seed(SEED_PAROS)

cumplimiento_docs = []
# skip_fechas[planta_id] = lista de fechas en que se omitió mantenimiento
skip_fechas = defaultdict(list)

for ev in prog_mant:
    ejecutado = random.random() < CUMPLIMIENTO_PCT
    pid       = ev.get("planta_id")
    fecha_ev  = ev.get("fecha")
    version   = ev.get("version_forecast", "")
    horas_plan= ev.get("horas_paro_plan", 8.0)
    tipo_mant = ev.get("tipo_mantenimiento", "preventivo")

    if ejecutado:
        # Variación en la ejecución ±20 % de duración
        dur_real = round(horas_plan * random.uniform(0.80, 1.30), 1)
        hallazgos_opts = [
            "Sin hallazgos relevantes.",
            "Desgaste normal de empaque — reemplazado.",
            "Vibración fuera de rango — ajustado.",
            "Lubricación insuficiente — aplicada.",
            "Corrosión superficial — tratada.",
            "Calibración de sensor necesaria — realizada.",
        ]
        cumplimiento_docs.append({
            "_id":                    ObjectId(),
            "programa_mantenimiento_id": ev["_id"],
            "fecha_programada":       fecha_ev,
            "fecha_ejecucion":        fecha_ev,   # mismo día (simplificado)
            "anio":                   ev.get("anio"),
            "mes":                    ev.get("mes"),
            "version_forecast":       version,
            "planta_id":              pid,
            "planta_clave":           ev.get("planta_clave"),
            "planta_nombre":          ev.get("planta_nombre"),
            "tipo_mantenimiento":     tipo_mant,
            "horas_paro_plan":        horas_plan,
            "horas_paro_real":        dur_real,
            "variacion_duracion_pct": round((dur_real / horas_plan - 1) * 100, 1),
            "ejecutado":              True,
            "motivo_no_ejecucion":    None,
            "hallazgos":              random.choice(hallazgos_opts),
            "costo_real_mxn":         round(random.uniform(3000, 25000), 2),
            "genera_paro_no_prog":    False,
            "activo":                 True,
            "created_at":             fecha_ev,
        })
    else:
        motivos = [
            "Personal no disponible",
            "Refacciones no entregadas",
            "Prioridad de producción",
            "Presupuesto no autorizado",
            "Reprogramado — sin ejecutar",
        ]
        cumplimiento_docs.append({
            "_id":                    ObjectId(),
            "programa_mantenimiento_id": ev["_id"],
            "fecha_programada":       fecha_ev,
            "fecha_ejecucion":        None,
            "anio":                   ev.get("anio"),
            "mes":                    ev.get("mes"),
            "version_forecast":       version,
            "planta_id":              pid,
            "planta_clave":           ev.get("planta_clave"),
            "planta_nombre":          ev.get("planta_nombre"),
            "tipo_mantenimiento":     tipo_mant,
            "horas_paro_plan":        horas_plan,
            "horas_paro_real":        0,
            "variacion_duracion_pct": -100.0,
            "ejecutado":              False,
            "motivo_no_ejecucion":    random.choice(motivos),
            "hallazgos":              None,
            "costo_real_mxn":         0,
            "genera_paro_no_prog":    True,
            "activo":                 True,
            "created_at":             fecha_ev,
        })
        # Registrar que esta planta tuvo mantenimiento omitido en esta fecha
        if pid and fecha_ev:
            skip_fechas[str(pid)].append(fecha_ev.date() if hasattr(fecha_ev,"date") else fecha_ev)

n_ejecutados = sum(1 for d in cumplimiento_docs if d["ejecutado"])
n_omitidos   = len(cumplimiento_docs) - n_ejecutados
pct_real     = round(n_ejecutados / max(1, len(cumplimiento_docs)) * 100, 1)
print(f"   Ejecutados  : {n_ejecutados:,}  ({pct_real:.1f} %)")
print(f"   Omitidos    : {n_omitidos:,}   (→ elevan riesgo de paro no programado)")

# ── Función: ¿hubo mantenimiento omitido en <30 días antes? ──────────
def extra_prob_por_skip(activo_id_str, fecha_d):
    skips = skip_fechas.get(activo_id_str, [])
    for sd in skips:
        delta = (fecha_d - sd).days if hasattr(sd, "year") else 999
        if 0 < delta <= 30:
            return PROB_EXTRA_SKIP
    return 0.0

# ── Generar paros no programados ──────────────────────────────────────
print("\n🔴  Generando paros no programados (plantas, tanques, logística)...")

paro_docs = []

fecha_ini = datetime(2020, 1, 1, tzinfo=timezone.utc)
fecha_fin = datetime(2025, 12, 31, tzinfo=timezone.utc)
total_dias = (fecha_fin - fecha_ini).days + 1

# Acumuladores para el reporte final
total_paros_planta  = 0
total_paros_tanque  = 0
total_paros_logis   = 0
prod_perdida_total  = 0.0   # kg estimados

# impacto_dia[fecha_date][planta_id] = impacto_produccion acumulado (0-1)
impacto_dia = defaultdict(lambda: defaultdict(float))

for di in range(total_dias):
    fecha   = fecha_ini + timedelta(days=di)
    fecha_d = fecha.date()
    anio    = fecha.year
    mes     = fecha.month
    dia     = fecha.day
    semana  = fecha.isocalendar()[1]
    trim    = (mes - 1) // 3 + 1
    sem_s   = 1 if mes <= 6 else 2
    es_dom  = fecha.weekday() == 6

    if di % 365 == 0:
        print(f"   {fecha_d}  ▸  {total_paros_planta + total_paros_tanque + total_paros_logis} paros acumulados")

    # ── Paros en plantas ──────────────────────────────────────────────
    for planta in plantas:
        pid      = planta["_id"]
        pk       = planta.get("planta_clave") or planta.get("clave", "PLT")
        pnom     = planta.get("nombre", "Planta")
        cap_n    = float(planta.get("kpis_operacion", {}).get(
                   "produccion_nominal_kg_dia", 1200.0) or 1200.0)

        prob = (PROB_BASE_PLANTA * (0.4 if es_dom else 1.0)
                + extra_prob_por_skip(str(pid), fecha_d))

        if random.random() >= prob:
            continue   # no hay paro hoy

        causa, h_min, h_max = elegir_causa(CAUSAS_PLANTA)
        dur_h    = round(random.uniform(h_min, h_max), 1)
        hora_ini = random.randint(0, max(0, 23 - int(dur_h)))
        hora_fin_h = min(24.0, hora_ini + dur_h)
        imp_prod = round(min(0.95, dur_h / 24.0), 4)   # nunca 100 % pérdida

        # Reducción de ventas: paros >6 h afectan un 40 % de ventas del día
        imp_vta  = round(imp_prod * 0.40, 4) if dur_h > 6 else 0.0
        costo_p  = round(random.uniform(2000, 50000)
                         + dur_h * random.uniform(500, 3000), 2)
        requiere_ref = random.random() < 0.55
        ref_disp     = (random.random() < 0.70) if requiere_ref else False
        resuelto     = random.random() < 0.95

        # Buscar si fue consecuencia de mantenimiento omitido
        es_consec = extra_prob_por_skip(str(pid), fecha_d) > 0

        paro_docs.append({
            "_id":                        ObjectId(),
            "fecha":                      fecha,
            "anio":                       anio,
            "mes":                        mes,
            "dia":                        dia,
            "semana":                     semana,
            "trimestre":                  trim,
            "semestre":                   sem_s,
            "tipo_activo":                "planta",
            "activo_id":                  pid,
            "activo_codigo":              pk,
            "activo_nombre":              pnom,
            "planta_id":                  pid,
            "planta_clave":               pk,
            "planta_nombre":              pnom,
            "causa":                      causa,
            "hora_inicio":                hora_ini,
            "duracion_horas":             dur_h,
            "hora_fin":                   round(hora_fin_h, 1),
            "impacto_produccion_pct":     imp_prod,
            "impacto_ventas_pct":         imp_vta,
            "impacto_logistica_pct":      0.0,
            "produccion_perdida_kg":      round(cap_n * imp_prod, 2),
            "costo_paro_mxn":             costo_p,
            "tecnico_responsable":        random.choice(TECNICOS),
            "requiere_refaccion":         requiere_ref,
            "refaccion_disponible":       ref_disp,
            "paro_resuelto":              resuelto,
            "relacionado_mant_omitido":   es_consec,
            "programa_mantenimiento_id":  None,
            "company_id":                 company_id,
            "site_id":                    site_id,
            "activo":                     True,
            "created_at":                 fecha,
        })

        # Acumular impacto del día para esta planta (combinación)
        imp_prev = impacto_dia[fecha_d][pid]
        imp_nuevo = 1.0 - (1.0 - imp_prev) * (1.0 - imp_prod)
        impacto_dia[fecha_d][pid] = min(0.90, imp_nuevo)   # máx 90 %

        prod_perdida_total += cap_n * imp_prod
        total_paros_planta += 1

    # ── Paros en tanques ──────────────────────────────────────────────
    for tanque in tanques_cat:
        tq_id  = tanque["_id"]
        tq_cod = tanque.get("codigo", "TQ-000")
        tq_nom = tanque.get("nombre", "Tanque")
        tpl_id = tanque.get("planta_id")   # planta a la que pertenece

        prob_t = PROB_BASE_TANQUE * (0.3 if es_dom else 1.0)
        if random.random() >= prob_t:
            continue

        causa, h_min, h_max = elegir_causa(CAUSAS_TANQUE)
        dur_h    = round(random.uniform(h_min, h_max), 1)
        hora_ini = random.randint(0, max(0, 23 - int(dur_h)))
        imp_alma = round(min(0.85, dur_h / 24.0), 4)   # impacto en almacenamiento
        # Tanque afecta producción de su planta en ~50 % del impacto almacén
        imp_prod_t = round(imp_alma * 0.50, 4)
        costo_t  = round(random.uniform(1500, 30000), 2)

        paro_docs.append({
            "_id":                        ObjectId(),
            "fecha":                      fecha,
            "anio":                       anio,
            "mes":                        mes,
            "dia":                        dia,
            "semana":                     semana,
            "trimestre":                  trim,
            "semestre":                   sem_s,
            "tipo_activo":                "tanque",
            "activo_id":                  tq_id,
            "activo_codigo":              tq_cod,
            "activo_nombre":              tq_nom,
            "planta_id":                  tpl_id,
            "planta_clave":               None,
            "planta_nombre":              None,
            "causa":                      causa,
            "hora_inicio":                hora_ini,
            "duracion_horas":             dur_h,
            "hora_fin":                   round(min(24.0, hora_ini + dur_h), 1),
            "impacto_produccion_pct":     imp_prod_t,
            "impacto_ventas_pct":         round(imp_prod_t * 0.30, 4),
            "impacto_logistica_pct":      round(imp_alma * 0.60, 4),
            "produccion_perdida_kg":      0.0,   # indirecto
            "costo_paro_mxn":             costo_t,
            "tecnico_responsable":        random.choice(TECNICOS),
            "requiere_refaccion":         random.random() < 0.45,
            "refaccion_disponible":       random.random() < 0.75,
            "paro_resuelto":              random.random() < 0.93,
            "relacionado_mant_omitido":   False,
            "programa_mantenimiento_id":  None,
            "company_id":                 company_id,
            "site_id":                    site_id,
            "activo":                     True,
            "created_at":                 fecha,
        })

        # Si el tanque tiene planta asignada, propaga impacto
        if tpl_id:
            imp_prev = impacto_dia[fecha_d][tpl_id]
            imp_nuevo = 1.0 - (1.0 - imp_prev) * (1.0 - imp_prod_t)
            impacto_dia[fecha_d][tpl_id] = min(0.90, imp_nuevo)

        total_paros_tanque += 1

    # ── Paros en sistemas logísticos ──────────────────────────────────
    for sl in bombas_cat:
        sl_id  = sl["_id"]
        sl_cod = sl.get("codigo", "SL-000")
        sl_nom = sl.get("nombre", "Sistema Logístico")
        sl_pid = sl.get("planta_id")

        if random.random() >= PROB_BASE_LOGIS:
            continue

        causa, h_min, h_max = elegir_causa(CAUSAS_LOGIS)
        dur_h    = round(random.uniform(h_min, h_max), 1)
        hora_ini = random.randint(0, max(0, 23 - int(dur_h)))
        imp_log  = round(min(0.80, dur_h / 24.0), 4)
        costo_l  = round(random.uniform(500, 15000), 2)

        paro_docs.append({
            "_id":                        ObjectId(),
            "fecha":                      fecha,
            "anio":                       anio,
            "mes":                        mes,
            "dia":                        dia,
            "semana":                     semana,
            "trimestre":                  trim,
            "semestre":                   sem_s,
            "tipo_activo":                "sistema_logistico",
            "activo_id":                  sl_id,
            "activo_codigo":              sl_cod,
            "activo_nombre":              sl_nom,
            "planta_id":                  sl_pid,
            "planta_clave":               None,
            "planta_nombre":              None,
            "causa":                      causa,
            "hora_inicio":                hora_ini,
            "duracion_horas":             dur_h,
            "hora_fin":                   round(min(24.0, hora_ini + dur_h), 1),
            "impacto_produccion_pct":     0.0,
            "impacto_ventas_pct":         round(imp_log * 0.50, 4),
            "impacto_logistica_pct":      imp_log,
            "produccion_perdida_kg":      0.0,
            "costo_paro_mxn":             costo_l,
            "tecnico_responsable":        random.choice(TECNICOS),
            "requiere_refaccion":         random.random() < 0.60,
            "refaccion_disponible":       random.random() < 0.80,
            "paro_resuelto":              random.random() < 0.97,
            "relacionado_mant_omitido":   False,
            "programa_mantenimiento_id":  None,
            "company_id":                 company_id,
            "site_id":                    site_id,
            "activo":                     True,
            "created_at":                 fecha,
        })
        total_paros_logis += 1

print(f"\n   Paros planta     : {total_paros_planta:,}")
print(f"   Paros tanque     : {total_paros_tanque:,}")
print(f"   Paros logística  : {total_paros_logis:,}")
print(f"   TOTAL paros      : {len(paro_docs):,}")
print(f"   Producción perdida estimada: {prod_perdida_total:,.0f} kg")

# ── Limpiar e insertar colecciones nuevas ─────────────────────────────
print("\n🗑️   Limpiando e insertando colecciones nuevas...")

db.paros_no_programados.delete_many({})
db.cumplimiento_mantenimiento.delete_many({})

CHUNK = 500
def bulk_ins(col_name, docs):
    for i in range(0, len(docs), CHUNK):
        db[col_name].insert_many(docs[i:i+CHUNK], ordered=False)
    n = db[col_name].count_documents({})
    print(f"   ✅ {col_name:35s}: {n:>8,} docs")

bulk_ins("paros_no_programados",      paro_docs)
bulk_ins("cumplimiento_mantenimiento", cumplimiento_docs)

# ── Índices ───────────────────────────────────────────────────────────
print("\n🔑  Creando índices...")
db.paros_no_programados.drop_indexes()
db.paros_no_programados.create_index([("fecha",1),("planta_id",1)],         name="idx_fecha_planta")
db.paros_no_programados.create_index([("tipo_activo",1),("anio",1)],        name="idx_tipo_anio")
db.paros_no_programados.create_index([("causa",1),("anio",1)],              name="idx_causa_anio")
db.paros_no_programados.create_index([("anio",1),("mes",1)],                name="idx_anio_mes")
db.paros_no_programados.create_index([("relacionado_mant_omitido",1)],      name="idx_rel_mant")

db.cumplimiento_mantenimiento.drop_indexes()
db.cumplimiento_mantenimiento.create_index([("planta_id",1),("anio",1)],    name="idx_planta_anio")
db.cumplimiento_mantenimiento.create_index([("ejecutado",1),("anio",1)],    name="idx_exec_anio")
db.cumplimiento_mantenimiento.create_index("programa_mantenimiento_id",     name="idx_prog_id")
print("   Índices creados.")

# ════════════════════════════════════════════════════════════════════════
#  FASE 2 – Aplicar impacto en colecciones de resumen REALES
# ════════════════════════════════════════════════════════════════════════
print("\n🔄  Aplicando impacto cascada en colecciones de resumen reales...")
print("    (esto puede tardar 2-4 minutos según el volumen de datos)\n")

# impacto_dia[fecha_date][planta_id] → factor reducción 0-0.90
# factor_multiplicador = 1 - impacto
dias_con_paro = sorted(impacto_dia.keys())

ops_prod   = []   # UpdateOne para resumen_produccion_diaria_planta
ops_bma    = []   # UpdateOne para balance_materia_almacen
ops_inv    = []   # UpdateOne para inventario
ops_alma   = []   # UpdateOne para resumen_operaciones_almacen
ops_cierre = []   # UpdateOne para cierres_diarios
ops_ords   = []   # UpdateOne para resumen_diario_ordenes

# Impacto logístico diario (máximo del día, independiente de planta)
imp_logis_dia = defaultdict(float)
for doc in paro_docs:
    if doc["tipo_activo"] == "sistema_logistico":
        fd = doc["fecha"].date()
        imp_logis_dia[fd] = max(imp_logis_dia[fd], doc["impacto_logistica_pct"])

total_actualizaciones = 0

for fecha_d in dias_con_paro:
    fecha_dt = datetime(fecha_d.year, fecha_d.month, fecha_d.day, tzinfo=timezone.utc)

    # Impacto logístico del día
    imp_log = imp_logis_dia.get(fecha_d, 0.0)

    # Impacto de producción total del día (media ponderada de todas las plantas)
    impactos_plantas = impacto_dia[fecha_d]   # dict planta_id → imp
    n_plantas = max(1, len(plantas))
    imp_prod_dia_avg = sum(impactos_plantas.values()) / n_plantas

    # ── 1. resumen_produccion_diaria_planta ──────────────────────────
    for pid, imp in impactos_plantas.items():
        factor = round(1.0 - imp, 6)
        ops_prod.append(UpdateOne(
            {"fecha_dia": fecha_dt, "planta_id": pid, "es_producto_final": True},
            {"$mul": {"cantidad": factor,
                      "costo_total_mxn": factor,
                      "cantidad_disponible": factor},
             "$set": {"paro_no_programado": True,
                      "impacto_paro_pct": round(imp, 4)}},
            upsert=False
        ))
        # También los registros de MP consumida (se consume menos si hay paro)
        ops_prod.append(UpdateOne(
            {"fecha_dia": fecha_dt, "planta_id": pid, "es_producto_final": False},
            {"$mul": {"cantidad": factor, "costo_total_mxn": factor},
             "$set": {"paro_no_programado": True,
                      "impacto_paro_pct": round(imp, 4)}},
            upsert=False
        ))

    # ── 2. balance_materia_almacen ───────────────────────────────────
    if imp_prod_dia_avg > 0:
        factor_bma = round(1.0 - imp_prod_dia_avg, 6)
        ops_bma.append(UpdateOne(
            {"fecha_dia": fecha_dt},
            {"$mul": {"mp_consumida_kg": factor_bma,
                      "pf_producido_kg": factor_bma},
             "$set": {"paro_no_programado": True,
                      "impacto_paro_pct": round(imp_prod_dia_avg, 4),
                      "balance_ok": True}},
            upsert=False
        ))

    # ── 3. inventario ────────────────────────────────────────────────
    for pid, imp in impactos_plantas.items():
        factor = round(1.0 - imp, 6)
        ops_inv.append(UpdateOne(
            {"fecha": fecha_dt, "planta_id": pid},
            {"$mul": {"produccion_kg": factor,
                      "stock_final_kg": factor},
             "$set": {"paro_no_programado": True,
                      "impacto_paro_pct": round(imp, 4)}},
            upsert=False
        ))

    # ── 4. resumen_operaciones_almacen ───────────────────────────────
    factor_alma = round(1.0 - imp_prod_dia_avg, 6)
    factor_desp = round(1.0 - (imp_prod_dia_avg * 0.5 + imp_log * 0.5), 6)
    factor_desp = max(0.1, factor_desp)
    ops_alma.append(UpdateOne(
        {"fecha_dia": fecha_dt},
        {"$mul": {"produccion_pf_ton": factor_alma,
                  "despachos_pf_ton":  factor_desp},
         "$set": {"paro_no_programado": True,
                  "impacto_paro_pct":   round(imp_prod_dia_avg, 4)}},
        upsert=False
    ))

    # ── 5. cierres_diarios ───────────────────────────────────────────
    # Ingresos y margen se reducen ~50 % del impacto producción
    # (no todas las ventas perdidas ese día, parte se recupera)
    factor_ing = round(1.0 - imp_prod_dia_avg * 0.50, 6)
    factor_ing = max(0.10, factor_ing)
    ops_cierre.append(UpdateOne(
        {"fecha": fecha_dt},
        {"$mul": {"produccion_kg": factor_alma,
                  "ingresos_mxn":  factor_ing,
                  "margen_mxn":    factor_ing},
         "$set": {"paro_no_programado": True,
                  "impacto_paro_pct":   round(imp_prod_dia_avg, 4)}},
        upsert=False
    ))

    # ── 6. resumen_diario_ordenes ────────────────────────────────────
    factor_vta = round(1.0 - imp_prod_dia_avg * 0.40 - imp_log * 0.25, 6)
    factor_vta = max(0.10, factor_vta)
    ops_ords.append(UpdateOne(
        {"fecha_dia": fecha_dt},
        {"$mul": {"ventas_ton":   factor_vta,
                  "ingresos_mxn": factor_vta,
                  "margen_mxn":   factor_vta},
         "$set": {"paro_no_programado": True,
                  "impacto_paro_pct":   round(imp_prod_dia_avg, 4)}},
        upsert=False
    ))

# ── Ejecutar bulk_write ───────────────────────────────────────────────
def bulk_exec(col_name, ops):
    if not ops:
        print(f"   {col_name:45s}: sin cambios")
        return 0
    result = db[col_name].bulk_write(ops, ordered=False)
    n_mod  = result.modified_count
    print(f"   {col_name:45s}: {n_mod:>7,} docs actualizados")
    return n_mod

print("   Actualizando colecciones...")
total_actualizaciones += bulk_exec("resumen_produccion_diaria_planta", ops_prod)
total_actualizaciones += bulk_exec("balance_materia_almacen",          ops_bma)
total_actualizaciones += bulk_exec("inventario",                       ops_inv)
total_actualizaciones += bulk_exec("resumen_operaciones_almacen",      ops_alma)
total_actualizaciones += bulk_exec("cierres_diarios",                  ops_cierre)
total_actualizaciones += bulk_exec("resumen_diario_ordenes",           ops_ords)

# ── Reporte final ─────────────────────────────────────────────────────
print("\n" + "="*72)
print("  RESUMEN DE PAROS NO PROGRAMADOS 2020-2025")
print("="*72)

# Por tipo de activo
for tipo in ["planta", "tanque", "sistema_logistico"]:
    n = db.paros_no_programados.count_documents({"tipo_activo": tipo})
    print(f"  Paros {tipo:20s}: {n:>6,}")

print()

# Por causa (top 5)
pipe_causa = [
    {"$group": {"_id": "$causa", "total": {"$sum": 1},
                "dur_avg": {"$avg": "$duracion_horas"}}},
    {"$sort": {"total": -1}}, {"$limit": 6}
]
print(f"  {'CAUSA':28s} {'TOTAL':>7s} {'H/PARO':>8s}")
print(f"  {'-'*46}")
for r in db.paros_no_programados.aggregate(pipe_causa):
    print(f"  {r['_id']:28s} {r['total']:>7,}  {r['dur_avg']:>6.1f} h")

print()

# Cumplimiento
n_ej = db.cumplimiento_mantenimiento.count_documents({"ejecutado": True})
n_om = db.cumplimiento_mantenimiento.count_documents({"ejecutado": False})
n_tot = n_ej + n_om
pct_c = round(n_ej / max(1, n_tot) * 100, 1)
n_rel = db.paros_no_programados.count_documents({"relacionado_mant_omitido": True})
print(f"  CUMPLIMIENTO MANTENIMIENTO PREVENTIVO")
print(f"  {'Ejecutados':40s}: {n_ej:>6,}  ({pct_c:.1f} %)")
print(f"  {'Omitidos':40s}: {n_om:>6,}  ({100-pct_c:.1f} %)")
print(f"  {'Paros causados por mant. omitido':40s}: {n_rel:>6,}")
print()

# Impacto producción
pipe_imp = [
    {"$match": {"tipo_activo": "planta"}},
    {"$group": {"_id": None,
                "prod_perdida": {"$sum": "$produccion_perdida_kg"},
                "costo_total":  {"$sum": "$costo_paro_mxn"},
                "dur_avg":      {"$avg": "$duracion_horas"}}}
]
r_imp = list(db.paros_no_programados.aggregate(pipe_imp))
if r_imp:
    ri = r_imp[0]
    print(f"  {'Producción perdida estimada (plantas)':40s}: {ri['prod_perdida']:>14,.0f} kg")
    print(f"  {'Costo total paros (plantas)':40s}: MXN {ri['costo_total']:>12,.0f}")
    print(f"  {'Duración promedio por paro':40s}: {ri['dur_avg']:>13.1f} h")

print(f"\n  Docs de resumen reales actualizados   : {total_actualizaciones:>8,}")
print("="*72)
print(f"\n🎉  Paros no programados generados y propagados exitosamente.")
print(f"   Colecciones nuevas : paros_no_programados, cumplimiento_mantenimiento")
print(f"   Colecciones reales : 6 colecciones de resumen actualizadas con impacto real.")
print(f"   Para ML: campo 'paro_no_programado=True' marca los registros afectados.")
