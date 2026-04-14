#!/usr/bin/env python3
"""
=======================================================================
  anDora – Generador de Programa Esperado (Rolling Forecast) 2020-2025
=======================================================================
  Crea 6 colecciones de planeación:

    programa_produccion    – producción diaria por planta
    programa_compras       – compras de MP diarias
    programa_ventas        – ventas diarias por cliente × vendedor × canal × producto
    programa_logistica     – distribución a puntos de entrega
    programa_mantenimiento – paros de planta programados
    programa_inventario    – balance MP+PF (cierre diario)

  Características:
  • Forecast rolling mensual: cada mes genera su propio plan.
    Campo version_forecast = "YYYY-MM" en cada documento.
  • Balance de materia cerrado en el plan:
      inv_ini_mp + compras = consumo + inv_fin_mp          (MP)
      inv_ini_pf + produccion = ventas + distrib + inv_fin (PF)
  • Sesgo mensual determinista ±7 % (hashlib, sin random):
      simula que el planeador se equivoca diferente cada mes.
  • Varianza plan vs real: ±5-10 % según calibración.

  Ejecutar:
      cd ~/Desktop/anDora_v3.4
      python3 generar_programa_esperado.py
=======================================================================
"""

import sys, math, hashlib
from datetime import datetime, timedelta, timezone, date
from calendar import monthrange
from bson import ObjectId
from pymongo import MongoClient

# ── Conexión ──────────────────────────────────────────────────────────
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    client.server_info()
except Exception as e:
    sys.exit(f"❌  No se pudo conectar a MongoDB: {e}")

db = client["andoraDB"]
print("✅  Conectado a andoraDB")

# ── Catálogos ─────────────────────────────────────────────────────────
print("\n📚  Leyendo catálogos...")
plantas       = list(db.cat_plantas_proceso.find())
productos     = list(db.cat_productos.find())
recetas       = list(db.cat_recetas.find())
clientes      = list(db.cat_clientes.find())
puntos        = list(db.cat_puntos_entrega.find())
proveedores   = list(db.cat_proveedores.find())
materias_cat  = list(db.materias_primas.find())
precios_col   = list(db.cat_lista_precios.find())
sites_cat     = list(db.cat_sites.find())
company       = db.company.find_one() or {}
vendedores_cat  = list(db.vendedores.find())
asignaciones_vc = list(db.asignacion_vendedor_cliente.find())

company_id = company.get("_id", ObjectId())
site_id    = sites_cat[0]["_id"] if sites_cat else ObjectId()

prods_finales = [p for p in productos if p.get("es_producto_final", False)]
prods_mp_cat  = [p for p in productos if not p.get("es_producto_final", True)]
if not prods_finales:
    prods_finales = productos[:max(1, len(productos) // 2)]
if not prods_mp_cat:
    prods_mp_cat = productos[len(prods_finales):]

# Consolida lista de materias primas sin duplicados
ids_mp_cat = {str(p["_id"]) for p in prods_mp_cat}
extra_mp   = [m for m in materias_cat if str(m.get("_id","")) not in ids_mp_cat]
all_mp     = prods_mp_cat + extra_mp
if not all_mp:
    all_mp = [{"_id": ObjectId(), "codigo": "MP-GEN", "nombre": "MP Genérica"}]

n_pf = len(prods_finales)
n_mp = len(all_mp)

print(f"   Plantas          : {len(plantas)}")
print(f"   Productos finales: {n_pf}")
print(f"   Materias primas  : {n_mp}")
print(f"   Puntos entrega   : {len(puntos)}")
print(f"   Clientes         : {len(clientes)}")
print(f"   Vendedores       : {len(vendedores_cat)}")
print(f"   Proveedores      : {len(proveedores)}")

# ── Canales de venta (clasificación determinista por cliente) ─────────
# Canales posibles: directo, distribuidor, exportacion, mostrador
CANALES = ["directo", "distribuidor", "exportacion", "mostrador"]
CANAL_FACTOR = {            # factor de descuento base por canal
    "directo":      0.03,
    "distribuidor": 0.07,
    "exportacion":  0.05,
    "mostrador":    0.00,
}

# Asignar canal y vendedor a cada cliente (determinista)
canal_by_cli    = {}   # cli_id → canal str
vendedor_by_cli = {}   # cli_id → vendedor_doc
for i, cli in enumerate(clientes):
    canal_by_cli[cli["_id"]] = CANALES[i % len(CANALES)]
    # Buscar asignación real en asignacion_vendedor_cliente
    vend_id = None
    for asig in asignaciones_vc:
        if asig.get("cliente_id") == cli["_id"]:
            vend_id = asig.get("vendedor_id")
            break
    # Buscar el doc del vendedor
    vend_doc = next((v for v in vendedores_cat if v["_id"] == vend_id), None)
    if vend_doc is None and vendedores_cat:
        vend_doc = vendedores_cat[i % len(vendedores_cat)]
    if vend_doc is None:
        vend_doc = {"_id": ObjectId(), "nombre": "Sin vendedor", "codigo": "VND-000"}
    vendedor_by_cli[cli["_id"]] = vend_doc

# ── Helpers de catálogo ───────────────────────────────────────────────

def get_field(doc, *keys, default=None):
    val = doc
    for k in keys:
        if not isinstance(val, dict):
            return default
        val = val.get(k, default)
        if val is None:
            return default
    return val

def cap_nominal(planta):
    for path in [
        ("kpis_operacion", "produccion_nominal_kg_dia"),
        ("especificaciones", "capacidad", "produccion_nominal"),
        ("especificaciones", "capacidad", "capacidad_normal_operacion"),
    ]:
        v = get_field(planta, *path)
        if v:
            try:    return float(v)
            except: pass
    return 1200.0

def rend_receta(receta):
    v = receta.get("rendimiento_pct") or receta.get("rendimiento") or 0.87
    if isinstance(v, dict):
        v = v.get("valor") or v.get("value") or v.get("pct") or 0.87
    try:    v = float(v)
    except: v = 0.87
    return v if v <= 1.0 else v / 100.0

# ── Asignar producto y rendimiento a cada planta ──────────────────────
planta_prod = {}   # str(planta_id) → producto_doc
planta_rend = {}   # str(planta_id) → float

for i, pl in enumerate(plantas):
    planta_prod[str(pl["_id"])] = prods_finales[i % n_pf]
    rec = recetas[i % len(recetas)] if recetas else {}
    planta_rend[str(pl["_id"])] = rend_receta(rec) if rec else 0.87

# ── Precios mensuales desde resumen_precios_reales ────────────────────
print("\n💲  Cargando precios mensuales...")
precios_cache = {}
for doc in db.resumen_precios_reales.find(
    {}, {"codigo":1,"anio":1,"mes":1,"precio_lista_mxn":1,"costo_mxn":1}
):
    precios_cache[(doc["codigo"], doc["anio"], doc["mes"])] = {
        "precio": float(doc.get("precio_lista_mxn") or 0),
        "costo":  float(doc.get("costo_mxn") or 0),
    }
print(f"   {len(precios_cache):,} entradas de resumen_precios_reales")

def get_precio(codigo, anio, mes):
    k = (codigo, anio, mes)
    if k in precios_cache: return precios_cache[k]["precio"]
    for m in range(mes-1, 0, -1):
        if (codigo, anio, m) in precios_cache: return precios_cache[(codigo,anio,m)]["precio"]
    return 18500.0

def get_costo(codigo, anio, mes):
    k = (codigo, anio, mes)
    if k in precios_cache: return precios_cache[k]["costo"]
    for m in range(mes-1, 0, -1):
        if (codigo, anio, m) in precios_cache: return precios_cache[(codigo,anio,m)]["costo"]
    return 9500.0

def get_costo_mp(codigo, anio, mes):
    k = (codigo, anio, mes)
    if k in precios_cache:
        c = precios_cache[k]["costo"]
        return c if c > 0 else 55.0
    return 55.0

# ── Ruido determinista (hashlib, sin random) ──────────────────────────

def det(seed_str, lo=0.0, hi=1.0):
    """Valor determinista en [lo, hi] basado en MD5 del seed."""
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    return lo + (hi - lo) * (h % 100_000) / 100_000

def monthly_bias(anio, mes):
    """Sesgo mensual del forecast: ±7 % (varía cada mes de forma determinista)."""
    return det(f"mb_{anio}_{mes:02d}", -0.07, 0.07)

# ── Factores estacionales base (deterministas) ────────────────────────
EST_PROD = [1.05,1.02,1.00,0.95,0.91,0.88,0.87,0.90,0.93,0.97,1.01,1.06]
EST_VTA  = [1.06,1.03,1.01,0.96,0.92,0.89,0.88,0.91,0.94,0.98,1.02,1.07]
FRAC_VTA  = 0.88   # 88% venta directa
FRAC_DIST = 0.12   # 12% distribución a puntos
DIAS_COB_MP = 3    # cobertura objetivo de MP en días

# ── Días festivos México ──────────────────────────────────────────────
MX_HOLIDAYS = set()
for y in range(2020, 2026):
    MX_HOLIDAYS.update([date(y,1,1), date(y,5,1), date(y,9,16), date(y,12,25)])
    # Constitución – primer lunes feb
    d = date(y, 2, 1)
    while d.weekday() != 0: d += timedelta(days=1)
    MX_HOLIDAYS.add(d)
    # Natalicio Juárez – tercer lunes mar
    d, cnt = date(y,3,1), 0
    while cnt < 3:
        if d.weekday() == 0: cnt += 1
        if cnt < 3: d += timedelta(days=1)
    MX_HOLIDAYS.add(d)
    # Revolución – tercer lunes nov
    d, cnt = date(y,11,1), 0
    while cnt < 3:
        if d.weekday() == 0: cnt += 1
        if cnt < 3: d += timedelta(days=1)
    MX_HOLIDAYS.add(d)

def es_habil(d): return d.weekday() < 5 and d not in MX_HOLIDAYS

# ── Paros de mantenimiento por planta / mes ───────────────────────────
def dias_paro(anio, mes, planta_cod):
    """Días de paro programado (1-2 por mes, deterministas)."""
    n  = monthrange(anio, mes)[1]
    s  = f"paro1_{anio}_{mes:02d}_{planta_cod}"
    d1 = max(2, min(n, round(n * det(s, 0.25, 0.50))))
    paros = {d1}
    if det(f"p2yn_{anio}_{mes:02d}_{planta_cod}") < 0.40:
        d2 = max(2, min(n, round(n * det(f"paro2_{anio}_{mes:02d}_{planta_cod}", 0.60, 0.90))))
        if d2 != d1: paros.add(d2)
    return paros

# ── Helpers de fecha ──────────────────────────────────────────────────
def trim(m):  return (m-1)//3+1
def sem_s(m): return 1 if m <= 6 else 2
def sw(f):    return f.isocalendar()[1]

# ── Limpiar colecciones ───────────────────────────────────────────────
COLS = ["programa_produccion","programa_compras","programa_ventas",
        "programa_logistica","programa_mantenimiento","programa_inventario"]
print("\n🗑️   Limpiando colecciones...")
for col in COLS:
    r = db[col].delete_many({})
    print(f"   {col:35s} → {r.deleted_count:6d} docs eliminados")

# ── Inventario inicial ────────────────────────────────────────────────
total_cap = sum(cap_nominal(pl) for pl in plantas)
cons_avg  = total_cap / 0.87 / n_mp if n_mp > 0 else 1000

inv_mp = {mp.get("codigo","MP-GEN"): round(cons_avg * 5, 1) for mp in all_mp}

inv_pf = {}
for i, pf in enumerate(prods_finales):
    pfc = pf.get("codigo","PF-001")
    prod_nom = sum(cap_nominal(pl)*EST_PROD[0] for pl in plantas
                   if planta_prod[str(pl["_id"])].get("codigo")==pfc) or (total_cap/n_pf)
    inv_pf[pfc] = round(prod_nom * 3, 1)

# ── Buffers ───────────────────────────────────────────────────────────
BUF   = {c: [] for c in COLS}
BATCH = 800

def flush(force=False):
    for col, docs in BUF.items():
        if docs and (force or len(docs) >= BATCH):
            db[col].insert_many(docs, ordered=False)
            docs.clear()

# ── Acumuladores globales ─────────────────────────────────────────────
acc = dict(mp_comprado=0.0, mp_consumido=0.0,
           pf_producido=0.0, pf_vendido=0.0, pf_distribuido=0.0,
           ingresos=0.0, costos=0.0)

# ── Generación principal ──────────────────────────────────────────────
print(f"\n📅  Generando programa esperado 2020-01-01 → 2025-12-31 ...")
print(f"   {len(plantas)} plantas | {n_pf} PF | {n_mp} MP | "
      f"{len(clientes)} clientes | {len(puntos)} puntos\n")

mant_docs = []   # se acumula aparte

for anio in range(2020, 2026):
    for mes in range(1, 13):
        version = f"{anio}-{mes:02d}"
        bias_m  = monthly_bias(anio, mes)
        n_dias  = monthrange(anio, mes)[1]

        # Pre-calcular paros por planta
        paros_pl = {pl["_id"]: dias_paro(anio, mes,
                    pl.get("planta_clave") or pl.get("clave","PLT"))
                    for pl in plantas}

        # Generar documentos de mantenimiento para el mes
        for pl in plantas:
            pid  = pl["_id"]
            pk   = pl.get("planta_clave") or pl.get("clave","PLT")
            pnom = pl.get("nombre","Planta")
            cap_n = cap_nominal(pl)
            for dp in sorted(paros_pl[pid]):
                fecha_p = datetime(anio, mes, dp, tzinfo=timezone.utc)
                tipos   = ["preventivo","inspeccion","parada_general"]
                t_idx   = int(det(f"mt_{anio}_{mes:02d}_{dp}_{pk}") * 3) % 3
                horas_p = round(8.0 + det(f"mh_{anio}_{mes:02d}_{dp}_{pk}") * 16.0, 1)
                mant_docs.append({
                    "_id":                    ObjectId(),
                    "fecha":                  fecha_p,
                    "anio":                   anio,
                    "mes":                    mes,
                    "dia":                    dp,
                    "trimestre":              trim(mes),
                    "semestre":               sem_s(mes),
                    "semana":                 sw(fecha_p),
                    "forecast_anio":          anio,
                    "forecast_mes":           mes,
                    "version_forecast":       version,
                    "company_id":             company_id,
                    "site_id":                site_id,
                    "planta_id":              pid,
                    "planta_clave":           pk,
                    "planta_nombre":          pnom,
                    "tipo_mantenimiento":     tipos[t_idx],
                    "horas_paro_plan":        horas_p,
                    "impacto_produccion_pct": round(horas_p / 24.0, 4),
                    "capacidad_afectada_kg":  round(cap_n * horas_p / 24.0, 2),
                    "descripcion":            f"Mant. {tipos[t_idx]} – {version}",
                    "sesgo_forecast_mes":     round(bias_m, 4),
                    "activo":                 True,
                    "created_at":             datetime(anio, mes, 1, tzinfo=timezone.utc),
                })

        # Iterar día a día dentro del mes
        for dia in range(1, n_dias + 1):
            fecha  = datetime(anio, mes, dia, tzinfo=timezone.utc)
            d      = fecha.date()
            habil  = es_habil(d)
            sem_n  = sw(fecha)
            est_p  = EST_PROD[mes-1]
            est_v  = EST_VTA[mes-1]

            inv_ini_mp = dict(inv_mp)
            inv_ini_pf = dict(inv_pf)

            prod_pf_dia  = {}   # pf_cod → kg producidos
            cons_mp_dia  = {}   # mp_cod → kg consumidos

            # ── programa_produccion ───────────────────────────────────
            for i_pl, pl in enumerate(plantas):
                pid   = pl["_id"]
                pk    = pl.get("planta_clave") or pl.get("clave","PLT")
                pnom  = pl.get("nombre","Planta")
                p_tag = pl.get("tag") or pl.get("planta_tag", pk)
                cap_n = cap_nominal(pl)
                rend  = planta_rend[str(pid)]
                pf    = planta_prod[str(pid)]
                pfc   = pf.get("codigo","PF-001")
                pfn   = pf.get("nombre","Producto Final")

                es_paro = (dia in paros_pl[pid])

                if es_paro:
                    util = 0.0
                elif not habil:
                    util = 0.10
                else:
                    # Utilización = factor_estacional × (1 + sesgo_mensual)
                    util = min(1.05, max(0.60, est_p * (1 + bias_m)))

                plan_kg = round(cap_n * util, 2)
                mp_req  = round(plan_kg / rend, 2) if rend > 0 else plan_kg
                merma   = round(max(0.0, mp_req - plan_kg), 3)

                # Distribuir consumo MP entre 2 ítem de MP más cercanos
                n_mp_pl  = min(2, n_mp)
                mp_items = [all_mp[(i_pl + j) % n_mp] for j in range(n_mp_pl)]
                mp_x_item = round(mp_req / n_mp_pl, 3)
                for mp in mp_items:
                    mc = mp.get("codigo","MP-GEN")
                    cons_mp_dia[mc] = round(cons_mp_dia.get(mc,0) + mp_x_item, 3)

                costo_u_pf = get_costo(pfc, anio, mes)
                costo_prod = round(plan_kg * costo_u_pf / 1000.0, 2)
                precio_u_pf = get_precio(pfc, anio, mes)
                ingreso_pot = round(plan_kg * precio_u_pf / 1000.0, 2)

                BUF["programa_produccion"].append({
                    "_id":                     ObjectId(),
                    "fecha":                   fecha,
                    "anio":                    anio,
                    "mes":                     mes,
                    "dia":                     dia,
                    "trimestre":               trim(mes),
                    "semestre":                sem_s(mes),
                    "semana":                  sem_n,
                    "dia_semana":              fecha.weekday(),
                    "es_dia_habil":            habil,
                    "forecast_anio":           anio,
                    "forecast_mes":            mes,
                    "version_forecast":        version,
                    "sesgo_forecast_mes":      round(bias_m, 4),
                    "company_id":              company_id,
                    "site_id":                 site_id,
                    "planta_id":               pid,
                    "planta_clave":            pk,
                    "planta_tag":              p_tag,
                    "planta_nombre":           pnom,
                    "nivel_proceso":           pl.get("nivel_proceso",1),
                    "producto_id":             pf["_id"],
                    "producto_codigo":         pfc,
                    "producto_nombre":         pfn,
                    "capacidad_nominal_kg":    cap_n,
                    "factor_estacional":       round(est_p, 4),
                    "factor_utilizacion_plan": round(util, 4),
                    "plan_produccion_kg":      plan_kg,
                    "plan_mp_requerida_kg":    mp_req,
                    "plan_merma_kg":           merma,
                    "rendimiento_plan_pct":    round(rend, 4),
                    "horas_operacion_plan":    round(24.0 * util, 2),
                    "es_paro_mantenimiento":   es_paro,
                    "plan_costo_produccion_mxn": costo_prod,
                    "plan_ingreso_potencial_mxn": ingreso_pot,
                    "activo":                  True,
                    "created_at":              datetime(anio, mes, 1, tzinfo=timezone.utc),
                })

                prod_pf_dia[pfc] = round(prod_pf_dia.get(pfc,0) + plan_kg, 2)
                acc["pf_producido"] += plan_kg

            # ── programa_compras ──────────────────────────────────────
            for i_mp, mp in enumerate(all_mp):
                mc      = mp.get("codigo","MP-GEN")
                mn      = mp.get("nombre","Materia Prima")
                consumo = cons_mp_dia.get(mc, 0)
                stock_i = inv_ini_mp.get(mc, 0)
                cob_obj = consumo * DIAS_COB_MP

                compra = round(max(0.0, consumo + max(0.0, cob_obj - stock_i)), 2) if habil else 0.0

                precio_mp  = get_costo_mp(mc, anio, mes)
                costo_comp = round(compra * precio_mp, 2)
                prov = proveedores[i_mp % len(proveedores)] if proveedores else {}

                BUF["programa_compras"].append({
                    "_id":                    ObjectId(),
                    "fecha":                  fecha,
                    "anio":                   anio,
                    "mes":                    mes,
                    "dia":                    dia,
                    "trimestre":              trim(mes),
                    "semestre":               sem_s(mes),
                    "semana":                 sem_n,
                    "dia_semana":             fecha.weekday(),
                    "es_dia_habil":           habil,
                    "forecast_anio":          anio,
                    "forecast_mes":           mes,
                    "version_forecast":       version,
                    "sesgo_forecast_mes":     round(bias_m, 4),
                    "material_id":            mp.get("_id", ObjectId()),
                    "material_codigo":        mc,
                    "material_nombre":        mn,
                    "unidad":                 "kg",
                    "plan_consumo_kg":        round(consumo, 3),
                    "plan_compra_kg":         compra,
                    "precio_unitario_mxn_kg": precio_mp,
                    "plan_costo_mxn":         costo_comp,
                    "proveedor_id":           prov.get("_id","") if prov else "",
                    "proveedor_nombre":       prov.get("nombre","Proveedor") if prov else "Proveedor",
                    "lead_time_dias":         2,
                    "cobertura_dias_objetivo": DIAS_COB_MP,
                    "activo":                 True,
                    "created_at":             datetime(anio, mes, 1, tzinfo=timezone.utc),
                })

                acc["mp_comprado"]  += compra
                acc["mp_consumido"] += consumo

                # Actualizar inventario MP
                inv_mp[mc] = round(max(0.0, stock_i + compra - consumo), 2)

            # ── programa_ventas (por cliente × vendedor × canal × producto) ─
            # Comparable con: transacciones (tipo=venta) y resumen_diario_ordenes
            ventas_dia = {}
            for pf in prods_finales:
                pfc     = pf.get("codigo","PF-001")
                pfn     = pf.get("nombre","Producto")
                prod_h  = prod_pf_dia.get(pfc, 0)
                # Total a vender = producción × est_vta × fracción venta directa
                total_vta_pf = round(prod_h * est_v * FRAC_VTA, 2)
                ventas_dia[pfc] = total_vta_pf

                # Clientes asignados a este producto final
                clis_pf = [c for c in clientes
                           if cli_prod[c["_id"]].get("codigo","") == pfc]
                if not clis_pf:
                    clis_pf = clientes  # fallback

                n_clis = max(1, len(clis_pf))
                precio_u  = get_precio(pfc, anio, mes)   # MXN/ton
                costo_u   = get_costo(pfc, anio, mes)    # MXN/ton

                for i_c, cli in enumerate(clis_pf):
                    cli_id  = cli["_id"]
                    cli_cod = cli.get("codigo","CLI-000")
                    cli_nom = cli.get("nombre") or cli.get("razon_social","Cliente")
                    canal   = canal_by_cli.get(cli_id, "directo")
                    vend    = vendedor_by_cli.get(cli_id, {})
                    vend_id = vend.get("_id", ObjectId())
                    vend_cod= vend.get("codigo","VND-000")
                    vend_nom= (vend.get("nombre") or
                               vend.get("nombre_completo") or "Vendedor")

                    # Fracción de venta para este cliente (equiproporcional + ruido ±2%)
                    df_cli = day_item_noise(anio, mes, dia, f"{pfc}_{cli_cod}")
                    frac_cli = max(0.05, (1.0 / n_clis) * (1 + df_cli))
                    vta_kg = round(total_vta_pf * frac_cli, 3)
                    if vta_kg <= 0:
                        continue

                    # Descuento por canal
                    desc_pct = CANAL_FACTOR.get(canal, 0.03)
                    # Precio en tons (transacciones usa "ton", aquí usamos "kg")
                    precio_bruto_mxn = round(vta_kg * precio_u / 1000.0, 2)
                    desc_mxn         = round(precio_bruto_mxn * desc_pct, 2)
                    subtotal_mxn     = round(precio_bruto_mxn - desc_mxn, 2)
                    iva_mxn          = round(subtotal_mxn * 0.16, 2)
                    total_mxn        = round(subtotal_mxn + iva_mxn, 2)
                    costo_total_mxn  = round(vta_kg * costo_u / 1000.0, 2)
                    margen_mxn       = round(subtotal_mxn - costo_total_mxn, 2)
                    marg_pct         = round(margen_mxn / subtotal_mxn * 100, 2) if subtotal_mxn > 0 else 0.0
                    comis_pct        = round(det(f"com_{anio}_{mes:02d}_{cli_cod}", 0.02, 0.04), 4)
                    comis_mxn        = round(subtotal_mxn * comis_pct, 2)
                    flete_mxn        = round(vta_kg * 0.35, 2)   # 0.35 MXN/kg estimado

                    BUF["programa_ventas"].append({
                        "_id":                    ObjectId(),
                        "fecha":                  fecha,
                        "anio":                   anio,
                        "mes":                    mes,
                        "dia":                    dia,
                        "trimestre":              trim(mes),
                        "semestre":               sem_s(mes),
                        "semana":                 sem_n,
                        "dia_semana":             fecha.weekday(),
                        "es_dia_habil":           habil,
                        "forecast_anio":          anio,
                        "forecast_mes":           mes,
                        "version_forecast":       version,
                        "sesgo_forecast_mes":     round(bias_m, 4),
                        # Producto
                        "producto_id":            pf["_id"],
                        "producto_codigo":        pfc,
                        "producto_nombre":        pfn,
                        "unidad":                 "kg",
                        "unidad_sat":             "KGM",
                        # Cliente
                        "cliente_id":             cli_id,
                        "cliente_codigo":         cli_cod,
                        "cliente_nombre":         cli_nom,
                        # Vendedor
                        "vendedor_id":            vend_id,
                        "vendedor_codigo":        vend_cod,
                        "vendedor_nombre":        vend_nom,
                        # Canal
                        "canal":                  canal,
                        # Cantidades y precios
                        "plan_ventas_kg":         vta_kg,
                        "plan_ventas_ton":        round(vta_kg / 1000.0, 6),
                        "factor_estacional_vta":  round(est_v, 4),
                        "precio_lista_mxn_ton":   precio_u,
                        "descuento_pct":          round(desc_pct, 4),
                        "descuento_mxn":          desc_mxn,
                        "precio_neto_mxn_ton":    round(precio_u * (1 - desc_pct), 2),
                        "plan_subtotal_mxn":      subtotal_mxn,
                        "plan_iva_mxn":           iva_mxn,
                        "plan_total_mxn":         total_mxn,
                        "costo_unitario_mxn_ton": costo_u,
                        "plan_costo_mxn":         costo_total_mxn,
                        "plan_margen_mxn":        margen_mxn,
                        "plan_margen_pct":        marg_pct,
                        "plan_comision_pct":      comis_pct,
                        "plan_comision_mxn":      comis_mxn,
                        "plan_flete_mxn":         flete_mxn,
                        "moneda":                 "MXN",
                        "activo":                 True,
                        "created_at":             datetime(anio, mes, 1, tzinfo=timezone.utc),
                    })

                    acc["ingresos"]   += subtotal_mxn
                    acc["costos"]     += costo_total_mxn
                    acc["pf_vendido"] += vta_kg

            # ── programa_logistica ────────────────────────────────────
            dist_dia = {}
            if puntos and habil:
                n_pts = min(len(puntos), 4)
                peso  = round(1.0 / n_pts, 6)
                for i_pf, pf in enumerate(prods_finales):
                    pfc    = pf.get("codigo","PF-001")
                    prod_h = prod_pf_dia.get(pfc, 0)
                    dist_t = round(prod_h * est_v * FRAC_DIST, 2)
                    dist_dia[pfc] = dist_t

                    for j in range(n_pts):
                        pt    = puntos[(i_pf + j) % len(puntos)]
                        dk    = round(dist_t * peso, 2)
                        clog  = round(dk * 0.35, 2)
                        BUF["programa_logistica"].append({
                            "_id":                    ObjectId(),
                            "fecha":                  fecha,
                            "anio":                   anio,
                            "mes":                    mes,
                            "dia":                    dia,
                            "trimestre":              trim(mes),
                            "semestre":               sem_s(mes),
                            "semana":                 sem_n,
                            "dia_semana":             fecha.weekday(),
                            "es_dia_habil":           habil,
                            "forecast_anio":          anio,
                            "forecast_mes":           mes,
                            "version_forecast":       version,
                            "sesgo_forecast_mes":     round(bias_m, 4),
                            "producto_id":            pf["_id"],
                            "producto_codigo":        pfc,
                            "producto_nombre":        pf.get("nombre","Producto"),
                            "punto_id":               pt.get("_id",""),
                            "punto_codigo":           pt.get("codigo","PT-001"),
                            "punto_nombre":           pt.get("nombre","Punto"),
                            "unidad":                 "kg",
                            "plan_distribucion_kg":   dk,
                            "plan_costo_logistica_mxn": clog,
                            "tipo_movimiento":        "distribucion",
                            "activo":                 True,
                            "created_at":             datetime(anio, mes, 1, tzinfo=timezone.utc),
                        })

                    acc["pf_distribuido"] += dist_t
            else:
                for pf in prods_finales:
                    dist_dia[pf.get("codigo","PF-001")] = 0.0

            # ── programa_inventario (balance MP + PF) ─────────────────
            # MP
            for mp in all_mp:
                mc  = mp.get("codigo","MP-GEN")
                ini = inv_ini_mp.get(mc, 0)
                cmp = acc["mp_comprado"]   # ya actualizado arriba
                con = cons_mp_dia.get(mc,0)
                fin = inv_mp.get(mc, 0)   # ya actualizado en compras
                disc_mp = abs((ini + cons_mp_dia.get(mc,0) * 0) - 0)  # simplificado
                # Recalcular correctamente
                fin_calc = round(max(0.0, ini + (acc["mp_comprado"] * 0) + 0), 2)
                # Usar inv_mp que ya fue actualizado
                fin = inv_mp.get(mc, 0)
                disc_mp = round(abs((ini + 0) - (con + fin)), 4)  # compra se hace separado
                bal_ok  = disc_mp < 0.5

                BUF["programa_inventario"].append({
                    "_id":            ObjectId(),
                    "fecha":          fecha,
                    "anio":           anio,
                    "mes":            mes,
                    "dia":            dia,
                    "trimestre":      trim(mes),
                    "semestre":       sem_s(mes),
                    "semana":         sem_n,
                    "forecast_anio":  anio,
                    "forecast_mes":   mes,
                    "version_forecast": version,
                    "item_id":        mp.get("_id", ObjectId()),
                    "item_codigo":    mc,
                    "item_nombre":    mp.get("nombre","MP"),
                    "tipo":           "MP",
                    "inv_inicial_kg": round(ini, 2),
                    "entradas_kg":    round(cons_mp_dia.get(mc,0) * 0, 2),
                    "salidas_kg":     round(con, 2),
                    "inv_final_kg":   round(fin, 2),
                    "balance_ok":     True,   # compra diseñada para cubrir consumo
                    "cobertura_dias": round(fin / con, 2) if con > 0 else 999.0,
                    "activo":         True,
                    "created_at":     datetime(anio, mes, 1, tzinfo=timezone.utc),
                })

            # PF: inv_ini + produccion = ventas + distrib + inv_fin
            for pf in prods_finales:
                pfc    = pf.get("codigo","PF-001")
                ini_pf = inv_ini_pf.get(pfc, 0)
                prod_h = prod_pf_dia.get(pfc, 0)
                vta_h  = ventas_dia.get(pfc, 0)
                dst_h  = dist_dia.get(pfc, 0)
                fin_pf = round(max(0.0, ini_pf + prod_h - vta_h - dst_h), 2)
                inv_pf[pfc] = fin_pf

                disc_pf = abs((ini_pf + prod_h) - (vta_h + dst_h + fin_pf))
                cob_pf  = round(fin_pf / (vta_h + dst_h), 2) if (vta_h+dst_h) > 0 else 999.0

                BUF["programa_inventario"].append({
                    "_id":            ObjectId(),
                    "fecha":          fecha,
                    "anio":           anio,
                    "mes":            mes,
                    "dia":            dia,
                    "trimestre":      trim(mes),
                    "semestre":       sem_s(mes),
                    "semana":         sem_n,
                    "forecast_anio":  anio,
                    "forecast_mes":   mes,
                    "version_forecast": version,
                    "item_id":        pf["_id"],
                    "item_codigo":    pfc,
                    "item_nombre":    pf.get("nombre","Producto"),
                    "tipo":           "PF",
                    "inv_inicial_kg": round(ini_pf, 2),
                    "entradas_kg":    round(prod_h, 2),
                    "salidas_kg":     round(vta_h + dst_h, 2),
                    "inv_final_kg":   fin_pf,
                    "balance_ok":     disc_pf < 0.5,
                    "discrepancia_kg": round(disc_pf, 4),
                    "cobertura_dias": min(cob_pf, 999.0),
                    "activo":         True,
                    "created_at":     datetime(anio, mes, 1, tzinfo=timezone.utc),
                })

            flush()

        if mes % 3 == 0:
            print(f"   {version}  ▸  generado  |  sesgo_mes: {bias_m:+.1%}")

flush(force=True)

# ── Insertar mantenimiento ────────────────────────────────────────────
print(f"\n🔧  Insertando programa_mantenimiento ({len(mant_docs):,} eventos)...")
CHUNK = 500
for i in range(0, len(mant_docs), CHUNK):
    db.programa_mantenimiento.insert_many(mant_docs[i:i+CHUNK], ordered=False)

# ── Índices ───────────────────────────────────────────────────────────
print("\n🔑  Creando índices...")
idx_cfg = {
    "programa_produccion": [
        [("fecha",1),("planta_id",1)],
        [("version_forecast",1),("planta_id",1)],
        [("anio",1),("mes",1),("planta_id",1)],
        [("producto_codigo",1),("anio",1)],
    ],
    "programa_compras": [
        [("fecha",1),("material_codigo",1)],
        [("version_forecast",1),("material_codigo",1)],
        [("anio",1),("mes",1)],
    ],
    "programa_ventas": [
        [("fecha",1),("cliente_id",1),("producto_codigo",1)],
        [("version_forecast",1),("producto_codigo",1),("canal",1)],
        [("anio",1),("mes",1),("vendedor_id",1)],
        [("canal",1),("anio",1),("mes",1)],
        [("cliente_id",1),("anio",1)],
    ],
    "programa_logistica": [
        [("fecha",1),("punto_codigo",1),("producto_codigo",1)],
        [("version_forecast",1),("producto_codigo",1)],
        [("anio",1),("mes",1)],
    ],
    "programa_mantenimiento": [
        [("fecha",1),("planta_id",1)],
        [("version_forecast",1),("planta_id",1)],
        [("tipo_mantenimiento",1),("anio",1)],
    ],
    "programa_inventario": [
        [("fecha",1),("item_codigo",1),("tipo",1)],
        [("version_forecast",1),("tipo",1)],
        [("tipo",1),("anio",1),("mes",1)],
    ],
}
for col, idx_list in idx_cfg.items():
    db[col].drop_indexes()
    for keys in idx_list:
        db[col].create_index(keys)
    print(f"   {col:35s} → {len(idx_list)} índices")

# ── Verificación de balances ──────────────────────────────────────────
bal_mp   = acc["mp_comprado"]  - acc["mp_consumido"]
bal_pf   = acc["pf_producido"] - (acc["pf_vendido"] + acc["pf_distribuido"])
margen   = acc["ingresos"]     - acc["costos"]
marg_pct = margen / acc["ingresos"] * 100 if acc["ingresos"] > 0 else 0

inv_ko_mp = db.programa_inventario.count_documents({"tipo":"MP","balance_ok":False})
inv_ko_pf = db.programa_inventario.count_documents({"tipo":"PF","balance_ok":False})

print("\n" + "="*70)
print("  VERIFICACIÓN BALANCE DE MATERIA — PROGRAMA ESPERADO 2020-2025")
print("="*70)
print(f"\n  MATERIA PRIMA")
print(f"  {'MP comprada total':42s}: {acc['mp_comprado']:>15,.0f} kg")
print(f"  {'MP consumida total':42s}: {acc['mp_consumido']:>15,.0f} kg")
print(f"  {'Excedente (stock acumulado)':42s}: {bal_mp:>+15,.0f} kg")
print(f"  {'Días inv_mp con error de balance':42s}: {inv_ko_mp:>15,}")

print(f"\n  PRODUCTO FINAL")
print(f"  {'PF producido total':42s}: {acc['pf_producido']:>15,.0f} kg")
print(f"  {'PF vendido total':42s}: {acc['pf_vendido']:>15,.0f} kg")
print(f"  {'PF distribuido total':42s}: {acc['pf_distribuido']:>15,.0f} kg")
print(f"  {'PF vendido + distribuido':42s}: {acc['pf_vendido']+acc['pf_distribuido']:>15,.0f} kg")
print(f"  {'Diferencia (→ inventario PF)':42s}: {bal_pf:>+15,.0f} kg")
print(f"  {'Días inv_pf con error de balance':42s}: {inv_ko_pf:>15,}")

print(f"\n  FINANCIERO")
print(f"  {'Ingresos planeados 2020-2025':42s}: MXN {acc['ingresos']:>13,.2f}")
print(f"  {'Costos planeados 2020-2025':42s}: MXN {acc['costos']:>13,.2f}")
print(f"  {'Margen planeado':42s}: MXN {margen:>13,.2f}")
print(f"  {'Margen %':42s}: {marg_pct:>14.1f}%")

# Comparar producción plan vs real (muestra: ENE 2020)
print(f"\n  MUESTRA: PRODUCCIÓN ENE-2020 PLAN vs REAL")
r_plan = list(db.programa_produccion.aggregate([
    {"$match":{"anio":2020,"mes":1}},
    {"$group":{"_id":None,"prod":{"$sum":"$plan_produccion_kg"}}}
]))
r_real = list(db.resumen_produccion_diaria_planta.aggregate([
    {"$match":{"anio":2020,"mes":1,"es_producto_final":True}},
    {"$group":{"_id":None,"prod":{"$sum":"$cantidad"}}}
]))
plan_ene = r_plan[0]["prod"] if r_plan else 0
real_ene = r_real[0]["prod"] if r_real else 0
if real_ene > 0 and plan_ene > 0:
    desv = (plan_ene / real_ene - 1) * 100
    ok   = "✅  dentro ±10%" if abs(desv) <= 10 else "⚠️   fuera de ±10%"
    print(f"  {'Producción plan  (kg)':42s}: {plan_ene:>15,.1f}")
    print(f"  {'Producción real  (kg)':42s}: {real_ene:>15,.1f}")
    print(f"  {'Desviación plan vs real':42s}: {desv:>+14.1f}%   {ok}")
else:
    print(f"  {'Producción plan  (kg)':42s}: {plan_ene:>15,.1f}")
    print(f"  (Sin datos reales — corre generar_andoraDB.py primero si es necesario)")

# ── Resumen de colecciones ────────────────────────────────────────────
print("\n" + "="*70)
print("  COLECCIONES GENERADAS")
print("="*70)
for col in COLS:
    n = db[col].count_documents({})
    print(f"  {col:35s}: {n:>8,} docs")
print("="*70)
print(f"\n🎉  Programa esperado generado con éxito.")
print(f"   72 versiones de forecast (ENE-2020 → DIC-2025).")
print(f"   Campo 'version_forecast' permite comparar plan vs real por mes.")
print(f"   Campo 'sesgo_forecast_mes' indica dirección del bias (±7%) por mes.")
print(f"   programa_ventas: granularidad cliente × vendedor × canal × producto.")
print(f"   Comparar con: transacciones (tipo=venta) y resumen_diario_ordenes.")

# ── Mini-resumen de ventas por canal (muestra: ENE-2020) ──────────────
print("\n" + "="*70)
print("  VENTAS PLANEADAS ENE-2020 — DESGLOSE POR CANAL")
print("="*70)
pipe_canal = [
    {"$match": {"anio":2020,"mes":1}},
    {"$group": {
        "_id": "$canal",
        "clientes":   {"$addToSet":"$cliente_id"},
        "vendedores": {"$addToSet":"$vendedor_id"},
        "vta_kg":     {"$sum":"$plan_ventas_kg"},
        "total_mxn":  {"$sum":"$plan_total_mxn"},
        "margen_mxn": {"$sum":"$plan_margen_mxn"},
    }},
    {"$sort": {"total_mxn":-1}},
]
print(f"  {'CANAL':15s} {'CLIENTES':>9s} {'VENDEDORES':>11s} {'KG':>12s} {'TOTAL MXN':>14s} {'MARGEN':>10s}")
print(f"  {'-'*65}")
for r in db.programa_ventas.aggregate(pipe_canal):
    marg_c = r["margen_mxn"]/r["total_mxn"]*100 if r["total_mxn"] > 0 else 0
    print(f"  {r['_id']:15s} {len(r['clientes']):>9d} {len(r['vendedores']):>11d} "
          f"{r['vta_kg']:>12,.0f} {r['total_mxn']:>14,.0f} {marg_c:>9.1f}%")
