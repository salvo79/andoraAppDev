#!/usr/bin/env python3
"""
=======================================================================
  anDora – Generador de datos históricos coherentes 2020-2025
=======================================================================
  Ejecutar en Terminal:
      pip3 install pymongo --break-system-packages
      python3 generar_andoraDB.py

  ¿Qué hace?
  - Lee todos los catálogos existentes (plantas, productos, recetas,
    clientes, proveedores, corrientes, etc.)
  - Limpia las colecciones operativas y de resumen
  - Genera 6 años de datos diarios coherentes (2020-01-01 → 2025-12-31)
  - Mantiene balance de materia, calidad por receta, logística y ventas
=======================================================================
"""

import math, random, sys
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from pymongo import MongoClient, InsertOne, UpdateOne
from pymongo.errors import BulkWriteError

# ── Conexión ────────────────────────────────────────────────────────
try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    client.server_info()
except Exception as e:
    sys.exit(f"❌  No se pudo conectar a MongoDB: {e}")

db = client["andoraDB"]
print("✅  Conectado a andoraDB")

# ── Semilla para reproducibilidad ────────────────────────────────────
random.seed(42)

# ────────────────────────────────────────────────────────────────────
#  PASO 1 ▸  Leer catálogos
# ────────────────────────────────────────────────────────────────────
print("\n📚  Leyendo catálogos...")

plantas        = list(db.cat_plantas_proceso.find())
productos      = list(db.cat_productos.find())
corrientes     = list(db.cat_corrientes.find())
recetas        = list(db.cat_recetas.find())
clientes       = list(db.cat_clientes.find())
puntos         = list(db.cat_puntos_entrega.find())
proveedores    = list(db.cat_proveedores.find())
vendedores_cat = list(db.vendedores.find())
sites_cat      = list(db.cat_sites.find())
materias_cat   = list(db.materias_primas.find())
servicios_cat  = list(db.cat_servicios.find())
tanques_cat    = list(db.tanques.find())
presentaciones = list(db.cat_presentaciones.find())
unidades       = list(db.cat_unidades_medida.find())
lista_precios  = list(db.cat_lista_precios.find())
company        = db.company.find_one() or {}
corrientes_all = list(db.cat_corrientes.find())

print(f"   Plantas      : {len(plantas)}")
print(f"   Productos     : {len(productos)}")
print(f"   Corrientes    : {len(corrientes_all)}")
print(f"   Recetas       : {len(recetas)}")
print(f"   Clientes      : {len(clientes)}")
print(f"   Puntos entrega: {len(puntos)}")
print(f"   Proveedores   : {len(proveedores)}")
print(f"   Vendedores    : {len(vendedores_cat)}")

# IDs de referencia global
company_id = company.get("_id", ObjectId())
site_id    = sites_cat[0]["_id"] if sites_cat else ObjectId()
site_code  = sites_cat[0].get("codigo", "SITE-001") if sites_cat else "SITE-001"

# ────────────────────────────────────────────────────────────────────
#  Helpers de clasificación
# ────────────────────────────────────────────────────────────────────

def get_field(doc, *keys, default=None):
    """Acceso seguro a campos anidados."""
    val = doc
    for k in keys:
        if not isinstance(val, dict):
            return default
        val = val.get(k, default)
        if val is None:
            return default
    return val

# Separar productos finales de materias primas
prods_finales = [p for p in productos if p.get("es_producto_final", False)]
prods_mp      = [p for p in productos if not p.get("es_producto_final", True)]
if not prods_finales:
    prods_finales = productos[:max(1, len(productos)//2)]
if not prods_mp:
    prods_mp = productos[len(prods_finales):]
    if not prods_mp:
        prods_mp = productos[:1]          # fallback

# Separar corrientes
corr_entrada = [c for c in corrientes_all if c.get("tipo") in
                ("materia_prima", "insumo", "corriente_entrada", "entrada")]
corr_salida  = [c for c in corrientes_all if c.get("tipo") in
                ("producto_final", "producto_intermedio", "corriente_salida", "salida")]
if not corr_entrada:
    corr_entrada = corrientes_all[:max(1, len(corrientes_all)//2)]
if not corr_salida:
    corr_salida  = corrientes_all[len(corr_entrada):]
    if not corr_salida:
        corr_salida = corrientes_all[-1:]

# Precio de lista y costo por producto
def precio_producto(prod):
    for lp in lista_precios:
        if lp.get("producto_id") == prod["_id"]:
            return float(lp.get("precio_mxn", 18500))
    return round(random.uniform(12000, 25000), 2)

def costo_producto(prod):
    return round(precio_producto(prod) * random.uniform(0.55, 0.72), 2)

precio_by_prod = {p["_id"]: precio_producto(p) for p in productos}
costo_by_prod  = {p["_id"]: costo_producto(p)  for p in productos}
costo_mp_by_prod = {p["_id"]: round(random.uniform(30, 85), 2) for p in prods_mp}

# Capacidad nominal por planta
def cap_nominal(planta):
    """Devuelve producción nominal en kg/día."""
    v = get_field(planta, "kpis_operacion", "produccion_nominal_kg_dia")
    if v:
        return float(v)
    v = get_field(planta, "especificaciones", "capacidad", "produccion_nominal")
    if v:
        return float(v)
    v = get_field(planta, "especificaciones", "capacidad", "capacidad_normal_operacion")
    if v:
        return float(v)
    return 1200.0      # default razonable

cap_by_planta = {p["_id"]: cap_nominal(p) for p in plantas}

# Rendimiento (%) de cada receta
def rend_receta(receta):
    v = receta.get("rendimiento_pct") or receta.get("rendimiento") or 0.87
    # Si es un dict (p.ej. {"valor": 0.87, "unidad": "%"}), extraer el valor numérico
    if isinstance(v, dict):
        v = v.get("valor") or v.get("value") or v.get("pct") or 0.87
    try:
        v = float(v)
    except (TypeError, ValueError):
        v = 0.87
    return v if v <= 1.0 else v / 100.0

# Precio de materia prima por corriente/producto
def costo_mp(corriente):
    return round(random.uniform(28, 95), 2)   # MXN/kg

# Nombre de vendedor
def vendedor_nombre(v):
    return v.get("nombre") or v.get("name") or "Vendedor Genérico"

# ────────────────────────────────────────────────────────────────────
#  PASO 2 ▸  Limpiar colecciones operativas
# ────────────────────────────────────────────────────────────────────
COLS_CLEAR = [
    "resumen_produccion_diaria_planta",
    "resumen_diario_producto",
    "resumen_mezclado_diario",
    "resumen_movimientos_logisticos",
    "resumen_operaciones_almacen",
    "resumen_diario_ordenes",
    "transacciones",
    "inventario",
    "lotes_produccion",
    "cierres_diarios",
    "balance_materia_almacen",
    "ordenes_compra_venta",
    "movimientos_logisticos",
    "islas_despacho",
    "facturacion",
    "trazabilidad_produccion",
    "asignacion_vendedor_cliente",
    "bombas_despachadoras",
]
print("\n🗑️   Limpiando colecciones operativas...")
for col in COLS_CLEAR:
    r = db[col].delete_many({})
    print(f"   {col:45s} → {r.deleted_count:6d} docs eliminados")

# ────────────────────────────────────────────────────────────────────
#  PASO 3 ▸  Helpers de variación realista
# ────────────────────────────────────────────────────────────────────

def factor_dia(fecha):
    """Factor de operación 0.70-1.05 con variación estacional y aleatoria."""
    mes = fecha.month
    # temporada alta: oct-mar  (factor ligeramente mayor)
    base = 0.90 + 0.05 * math.sin(math.pi * (mes - 1) / 6)
    variacion = random.gauss(0, 0.04)
    # paros programados ~5% del tiempo → factor muy bajo
    if random.random() < 0.03:
        return round(max(0.0, random.uniform(0.0, 0.35)), 4)
    return round(min(1.05, max(0.60, base + variacion)), 4)

def factor_calidad(receta=None):
    """95% pasa calidad; distribución normal de parámetros."""
    return random.random() < 0.955

def ruido(val, pct=0.04):
    """Agrega ±pct% de ruido a un valor."""
    return round(val * (1 + random.gauss(0, pct)), 6)

def semana_iso(fecha):
    return fecha.isocalendar()[1]

def anio_iso(fecha):
    return fecha.isocalendar()[0]

# ────────────────────────────────────────────────────────────────────
#  PASO 4 ▸  Asignación vendedor-cliente
# ────────────────────────────────────────────────────────────────────

vendedor_ids = [v["_id"] for v in vendedores_cat] if vendedores_cat else [ObjectId()]
cliente_ids  = [c["_id"] for c in clientes]        if clientes         else [ObjectId()]
punto_ids    = [p["_id"] for p in puntos]           if puntos           else [ObjectId()]

# Crear asignaciones vendedor-cliente (relación fija durante todo el período)
asignaciones = []
for i, cid in enumerate(cliente_ids):
    vid = vendedor_ids[i % len(vendedor_ids)]
    asignaciones.append({
        "_id":        ObjectId(),
        "vendedor_id": vid,
        "cliente_id":  cid,
        "activo":      True,
        "created_at":  datetime(2020, 1, 1, tzinfo=timezone.utc),
    })
if asignaciones:
    db.asignacion_vendedor_cliente.insert_many(asignaciones)
print(f"\n👥  Asignaciones vendedor-cliente: {len(asignaciones)}")

def vendedor_for_cliente(cid):
    for a in asignaciones:
        if a["cliente_id"] == cid:
            return a["vendedor_id"]
    return vendedor_ids[0]

# ────────────────────────────────────────────────────────────────────
#  PASO 5 ▸  Generación principal – día a día
# ────────────────────────────────────────────────────────────────────

fecha_inicio = datetime(2020, 1, 1, tzinfo=timezone.utc)
fecha_fin    = datetime(2025, 12, 31, tzinfo=timezone.utc)
total_dias   = (fecha_fin - fecha_inicio).days + 1

print(f"\n🏭  Generando {total_dias} días de datos ({fecha_inicio.date()} → {fecha_fin.date()})...")
print(f"   Plantas: {len(plantas)} | Prod. finales: {len(prods_finales)} | Materias primas: {len(prods_mp)}")

# Inventario inicial por producto final (kg)
inv_inicial = {p["_id"]: round(cap_by_planta[plantas[0]["_id"]] * 5, 2)
               if plantas else 5000.0
               for p in prods_finales}
inventario_actual = dict(inv_inicial)

# Acumuladores por lote mensual
lote_num = 0

# Buffers de inserción
BUF = {
    "resumen_produccion_diaria_planta": [],
    "resumen_diario_producto":          [],
    "resumen_mezclado_diario":          [],
    "resumen_movimientos_logisticos":   [],
    "resumen_operaciones_almacen":      [],
    "resumen_diario_ordenes":           [],
    "transacciones":                    [],
    "inventario":                       [],
    "lotes_produccion":                 [],
    "cierres_diarios":                  [],
    "balance_materia_almacen":          [],
    "ordenes_compra_venta":             [],
    "movimientos_logisticos":           [],
    "facturacion":                      [],
    "trazabilidad_produccion":          [],
}

BATCH = 500     # insertar cada N días

def flush(force=False):
    for col, docs in BUF.items():
        if docs and (force or len(docs) >= BATCH):
            db[col].insert_many(docs, ordered=False)
            docs.clear()

# ────── recetas mapeadas ──────────────────────────────────────────
# Map planta_clave → receta
receta_by_planta = {}
for rec in recetas:
    pk = rec.get("planta_clave")
    if pk:
        receta_by_planta[pk] = rec

def receta_for_planta(planta):
    pk = planta.get("planta_clave") or planta.get("clave") or ""
    return receta_by_planta.get(pk) or (recetas[0] if recetas else None)

# ────── materias primas por planta (corrientes de entrada) ──────────
def corrientes_entrada_planta(planta):
    ids = planta.get("corrientes_entrada_ids", [])
    if ids:
        return [c for c in corrientes_all if c["_id"] in ids]
    # fallback: las primeras corrientes de tipo entrada
    return corr_entrada[:min(3, len(corr_entrada))]

def corrientes_salida_planta(planta):
    ids = planta.get("corrientes_salida_ids", [])
    if ids:
        return [c for c in corrientes_all if c["_id"] in ids]
    return corr_salida[:min(2, len(corr_salida))]

# ────── Proveedores para compras ─────────────────────────────────────
prov_ids = [p["_id"] for p in proveedores] if proveedores else [ObjectId()]

# ─────────────────────────────────────────────────────────────────────
#  Iteración diaria
# ─────────────────────────────────────────────────────────────────────

for dia_idx in range(total_dias):
    fecha = fecha_inicio + timedelta(days=dia_idx)
    anio  = anio_iso(fecha)
    mes   = fecha.month
    sem   = semana_iso(fecha)
    es_domingo = fecha.weekday() == 6   # Domingo = menor actividad

    if dia_idx % 180 == 0:
        pct = round(100 * dia_idx / total_dias, 1)
        print(f"   {pct:5.1f}%  →  {fecha.date()}")

    # ── Acumuladores del día ──────────────────────────────────────
    prod_dia_total   = {}   # prod_id → kg producidos (finales)
    mp_dia_total     = {}   # prod_id → kg consumidos (MP)
    ingresos_dia     = 0.0
    costo_dia        = 0.0
    ventas_dia       = 0
    compras_dia      = 0

    # ── Por cada planta ──────────────────────────────────────────
    for planta in plantas:
        pid_planta  = planta["_id"]
        p_clave     = planta.get("planta_clave") or planta.get("clave", "PLT-000")
        p_tag       = planta.get("tag") or planta.get("planta_tag", p_clave)
        p_nombre    = planta.get("nombre", "Planta")
        nivel_proc  = planta.get("nivel_proceso", 1)
        cap_nom     = cap_by_planta[pid_planta]

        factor = 0.3 if es_domingo else factor_dia(fecha)
        prod_kg = round(cap_nom * factor, 3)

        receta = receta_for_planta(planta)
        rend   = rend_receta(receta) if receta else 0.88
        rec_id = receta["_id"] if receta else None
        rec_clave = receta.get("clave", "") if receta else ""

        corr_ent = corrientes_entrada_planta(planta)
        corr_sal = corrientes_salida_planta(planta)

        # ── Producto final asociado ────────────────────────────
        # Asignar producto final según index de planta
        prod_final = prods_finales[plantas.index(planta) % len(prods_finales)]
        pf_id      = prod_final["_id"]
        pf_codigo  = prod_final.get("codigo", "PF-001")
        pf_nombre  = prod_final.get("nombre", "Producto Final")
        pf_familia = prod_final.get("familia", "producto_final")
        pf_precio  = precio_by_prod[pf_id]
        pf_costo   = costo_by_prod[pf_id]

        # ── Consumo de materias primas (en función del rendimiento) ──
        mp_total_kg = round(prod_kg / rend, 3) if rend > 0 else prod_kg
        calidad_ok  = factor_calidad(receta)

        # Distribuir consumo entre corrientes de entrada
        n_ent = max(1, len(corr_ent))
        for i_c, corr in enumerate(corr_ent):
            frac = (1.0 / n_ent) if i_c < n_ent - 1 else None
            mp_kg_corr = round(mp_total_kg * (frac if frac else 1 - (i_c / n_ent * (n_ent-1)/n_ent)), 3)
            if mp_kg_corr <= 0:
                continue

            # producto MP asociado
            prod_mp = prods_mp[i_c % max(1, len(prods_mp))]
            mp_id   = prod_mp["_id"]
            mp_cod  = prod_mp.get("codigo", f"MP-{i_c+1:03d}")
            mp_nom  = prod_mp.get("nombre", corr.get("nombre", "Materia Prima"))
            mp_cost = costo_mp_by_prod.get(mp_id, 42.5)
            mp_costo_total = round(mp_kg_corr * mp_cost, 2)

            # Acumular consumo
            mp_dia_total[mp_id] = mp_dia_total.get(mp_id, 0) + mp_kg_corr

            lote_num += 1
            lote_clave = f"L{fecha.year}-{mes:02d}-{lote_num:04d}"

            # Registro resumen_produccion (entrada / consumo de MP)
            BUF["resumen_produccion_diaria_planta"].append({
                "_id":              ObjectId(),
                "fecha_dia":        fecha,
                "anio":             anio,
                "mes":              mes,
                "semana":           sem,
                "company_id":       company_id,
                "site_id":          site_id,
                "planta_id":        pid_planta,
                "planta_clave":     p_clave,
                "planta_tag":       p_tag,
                "planta_nombre":    p_nombre,
                "nivel_proceso":    nivel_proc,
                "producto_id":      mp_id,
                "producto_codigo":  mp_cod,
                "producto_nombre":  mp_nom,
                "sku":              prod_mp.get("sku"),
                "familia":          prod_mp.get("familia", "materia_prima"),
                "es_producto_final": False,
                "tipo_flujo":       1,
                "tipo_corriente":   "materia_prima",
                "unidad":           "kg",
                "cantidad":         mp_kg_corr,
                "costo_unitario_mxn": mp_cost,
                "costo_total_mxn":  mp_costo_total,
                "cantidad_disponible": None,
                "cantidad_merma":   round(mp_kg_corr * random.uniform(0.005, 0.025), 3),
                "merma_pct":        round(random.uniform(0.005, 0.025), 4),
                "estado_fisico":    prod_mp.get("estado_fisico", "solido"),
                "planta_destino":   None,
                "numero_lote":      lote_clave,
                "lote_id":          ObjectId(),
                "receta_id":        rec_id,
                "receta_clave":     rec_clave,
                "sku_producto_final": prod_final.get("sku"),
                "nombre_producto_final": pf_nombre,
                "calidad_aprobado": calidad_ok,
                "created_at":       fecha,
                "updated_at":       fecha,
            })

        # ── Producción (corrientes de salida / producto final) ───────
        prod_dia_total[pf_id] = prod_dia_total.get(pf_id, 0) + prod_kg

        # Calidad del lote según receta
        # Parámetros de laboratorio
        params_lab = {}
        if receta:
            for param in receta.get("parametros_calidad", []):
                nom   = param.get("nombre_corto", param.get("nombre", "param"))
                valor = param.get("valor_nominal") or param.get("objetivo")
                tol   = param.get("tolerancia") or param.get("max", 0.05)
                if valor is not None:
                    params_lab[nom] = ruido(float(valor), float(tol) / float(valor) if float(valor) else 0.04)

        merma_prod   = round(prod_kg * random.uniform(0.005, 0.02), 3)
        prod_neta_kg = round(prod_kg - merma_prod, 3)

        BUF["resumen_produccion_diaria_planta"].append({
            "_id":              ObjectId(),
            "fecha_dia":        fecha,
            "anio":             anio,
            "mes":              mes,
            "semana":           sem,
            "company_id":       company_id,
            "site_id":          site_id,
            "planta_id":        pid_planta,
            "planta_clave":     p_clave,
            "planta_tag":       p_tag,
            "planta_nombre":    p_nombre,
            "nivel_proceso":    nivel_proc,
            "producto_id":      pf_id,
            "producto_codigo":  pf_codigo,
            "producto_nombre":  pf_nombre,
            "sku":              prod_final.get("sku"),
            "familia":          pf_familia,
            "es_producto_final": True,
            "tipo_flujo":       -1,
            "tipo_corriente":   "producto_final",
            "unidad":           "kg",
            "cantidad":         prod_neta_kg,
            "costo_unitario_mxn": pf_costo,
            "costo_total_mxn":  round(prod_neta_kg * pf_costo, 2),
            "cantidad_disponible": round(prod_neta_kg * 0.98, 3),
            "cantidad_merma":   merma_prod,
            "merma_pct":        round(merma_prod / max(prod_kg, 1), 4),
            "estado_fisico":    prod_final.get("estado_fisico", "solido"),
            "planta_destino":   puntos[0]["_id"] if puntos else None,
            "numero_lote":      lote_clave,
            "lote_id":          ObjectId(),
            "receta_id":        rec_id,
            "receta_clave":     rec_clave,
            "sku_producto_final": prod_final.get("sku"),
            "nombre_producto_final": pf_nombre,
            "calidad_aprobado": calidad_ok,
            "parametros_laboratorio": params_lab,
            "created_at":       fecha,
            "updated_at":       fecha,
        })

        # ── Balance de materia por corriente de salida ───────────────
        for i_s, corr_s in enumerate(corr_sal):
            frac_s   = (1.0 / max(1, len(corr_sal)))
            sal_kg   = round(prod_neta_kg * frac_s, 3)
            BUF["resumen_mezclado_diario"].append({
                "_id":            ObjectId(),
                "fecha_dia":      fecha,
                "anio":           anio,
                "mes":            mes,
                "semana":         sem,
                "planta_id":      pid_planta,
                "planta_clave":   p_clave,
                "corriente_id":   corr_s["_id"],
                "corriente_nombre": corr_s.get("nombre", "Corriente Salida"),
                "tipo_corriente": corr_s.get("tipo", "producto_final"),
                "cantidad_kg":    sal_kg,
                "densidad_kg_m3": ruido(corr_s.get("propiedades_fisicas", {}).get("densidad_kg_m3", 900), 0.01),
                "temperatura_c":  ruido(25.0, 0.03),
                "calidad_ok":     calidad_ok,
                "receta_id":      rec_id,
                "created_at":     fecha,
            })

        # ── Inventario (snapshot diario) ─────────────────────────────
        inv_ant = inventario_actual.get(pf_id, 0)
        inv_nue = round(inv_ant + prod_neta_kg, 3)
        inventario_actual[pf_id] = inv_nue

        BUF["inventario"].append({
            "_id":           ObjectId(),
            "fecha":         fecha,
            "planta_id":     pid_planta,
            "planta_clave":  p_clave,
            "producto_id":   pf_id,
            "producto_codigo": pf_codigo,
            "producto_nombre": pf_nombre,
            "stock_inicial_kg": round(inv_ant, 3),
            "produccion_kg":    prod_neta_kg,
            "despacho_kg":      0,    # se actualiza en ventas
            "stock_final_kg":   inv_nue,
            "unidad":          "kg",
            "created_at":      fecha,
        })

        # ── Trazabilidad (un registro por lote) ──────────────────────
        BUF["trazabilidad_produccion"].append({
            "_id":           ObjectId(),
            "numero_lote":   lote_clave,
            "fecha_dia":     fecha,
            "planta_id":     pid_planta,
            "planta_clave":  p_clave,
            "producto_id":   pf_id,
            "producto_codigo": pf_codigo,
            "cantidad_kg":   prod_neta_kg,
            "receta_id":     rec_id,
            "receta_clave":  rec_clave,
            "calidad_ok":    calidad_ok,
            "parametros_laboratorio": params_lab,
            "created_at":    fecha,
        })

        # ── Compras de materia prima (orden mensual, día 1) ──────────
        if fecha.day == 1:
            for i_mp, prod_mp_c in enumerate(prods_mp):
                prov_id = prov_ids[i_mp % len(prov_ids)]
                mp_cod_c = prod_mp_c.get("codigo", f"MP-{i_mp+1:03d}")
                mp_nom_c = prod_mp_c.get("nombre", "Materia Prima")
                mp_cost_c = costo_mp_by_prod.get(prod_mp_c["_id"], 42.5)
                qty_compra = round(cap_nom * 0.9 * random.uniform(25, 32), 2)
                total_c    = round(qty_compra * mp_cost_c, 2)
                compras_dia += 1
                BUF["ordenes_compra_venta"].append({
                    "_id":              ObjectId(),
                    "tipo":             "compra",
                    "fecha":            fecha,
                    "proveedor_id":     prov_id,
                    "planta_id":        pid_planta,
                    "planta_clave":     p_clave,
                    "producto_id":      prod_mp_c["_id"],
                    "producto_codigo":  mp_cod_c,
                    "producto_nombre":  mp_nom_c,
                    "cantidad":         qty_compra,
                    "unidad":           "kg",
                    "precio_unitario":  mp_cost_c,
                    "subtotal":         total_c,
                    "iva_mxn":          round(total_c * 0.16, 2),
                    "total":            round(total_c * 1.16, 2),
                    "estatus":          "recibida",
                    "created_at":       fecha,
                })

    # ──────────────────────────────────────────────────────────────
    #  VENTAS – generar transacciones diarias (2-5 ventas/día)
    # ──────────────────────────────────────────────────────────────
    n_ventas = random.randint(0, 2) if es_domingo else random.randint(2, 5)

    for _ in range(n_ventas):
        prod_v    = random.choice(prods_finales)
        pv_id     = prod_v["_id"]
        pv_cod    = prod_v.get("codigo", "PF-001")
        pv_nom    = prod_v.get("nombre", "Producto Final")
        pv_precio = precio_by_prod[pv_id]
        pv_costo  = costo_by_prod[pv_id]

        cantidad_ton = round(random.uniform(1, 10), 3)   # toneladas
        desc_pct     = round(random.uniform(0.01, 0.08), 4)
        subtotal     = round(cantidad_ton * pv_precio, 2)
        desc_mxn     = round(subtotal * desc_pct, 2)
        precio_neto  = round(pv_precio * (1 - desc_pct), 2)
        iva_mxn      = round((subtotal - desc_mxn) * 0.16, 2)
        total_mxn    = round(subtotal - desc_mxn + iva_mxn, 2)
        costo_total  = round(cantidad_ton * pv_costo, 2)
        margen_mxn   = round(total_mxn - costo_total, 2)
        margen_pct   = round(margen_mxn / total_mxn * 100, 4) if total_mxn > 0 else 0

        cliente_v    = random.choice(clientes) if clientes else {"_id": ObjectId(), "codigo": "CLI-001", "nombre": "Cliente Genérico"}
        cid_v        = cliente_v["_id"]
        punto_v      = random.choice(puntos) if puntos else {"_id": ObjectId(), "codigo": "PE-001", "nombre": "Punto Entrega"}
        vendedor_v   = vendedor_for_cliente(cid_v)

        coms_pct  = round(random.uniform(0.02, 0.04), 4)
        coms_mxn  = round((subtotal - desc_mxn) * coms_pct, 2)
        lote_v    = f"L{fecha.year}-{mes:02d}-{lote_num:04d}"

        ventas_dia  += 1
        ingresos_dia += total_mxn
        costo_dia    += costo_total

        # Actualizar stock
        kg_desp = round(cantidad_ton * 1000, 3)
        inventario_actual[pv_id] = max(0, inventario_actual.get(pv_id, 0) - kg_desp)

        tx_id = ObjectId()
        BUF["transacciones"].append({
            "_id":              tx_id,
            "tipo":             "venta",
            "fecha":            fecha,
            "anio":             anio,
            "mes":              mes,
            "semana":           sem,
            "company_id":       company_id,
            "site_id":          site_id,
            "cliente_id":       cid_v,
            "cliente_codigo":   cliente_v.get("codigo", "CLI-001"),
            "cliente_nombre":   cliente_v.get("nombre", "Cliente"),
            "punto_entrega_id": punto_v["_id"],
            "punto_entrega":    punto_v.get("nombre", "Almacén"),
            "producto_id":      pv_id,
            "producto_codigo":  pv_cod,
            "producto_nombre":  pv_nom,
            "tipo_presentacion":"granel",
            "unidad_id":        None,
            "unidad":           "ton",
            "unidad_sat":       "TNE",
            "cantidad":         cantidad_ton,
            "precio_lista":     pv_precio,
            "descuento_pct":    desc_pct,
            "descuento_mxn":    desc_mxn,
            "precio_neto":      precio_neto,
            "precio_envase":    0,
            "subtotal":         subtotal,
            "iva_pct":          0.16,
            "iva_mxn":          iva_mxn,
            "total_linea":      total_mxn,
            "moneda":           "MXN",
            "costo_unitario":   pv_costo,
            "costo_total":      costo_total,
            "margen_mxn":       margen_mxn,
            "margen_pct":       margen_pct,
            "lote_id":          ObjectId(),
            "numero_lote":      lote_v,
            "inventario_id":    None,
            "comision_pct":     coms_pct,
            "comision_mxn":     coms_mxn,
            "activo":           True,
            "subtotal_mxn":     subtotal,
            "descuento_mxn":    desc_mxn,
            "flete_mxn":        round(cantidad_ton * random.uniform(0, 200), 2),
            "envases_mxn":      0,
            "iva_mxn":          iva_mxn,
            "total_mxn":        total_mxn,
            "costo_total_mxn":  costo_total,
            "margen_total_mxn": margen_mxn,
            "margen_total_pct": margen_pct,
            "comision": {
                "vendedor_id":   vendedor_v,
                "base_calculo":  subtotal - desc_mxn,
                "porcentaje":    coms_pct,
                "monto_mxn":     coms_mxn,
                "estatus":       "pendiente",
                "fecha_pago":    None,
            },
            "estatus":          random.choice(["entregada","facturada","facturada","facturada"]),
            "observaciones":    f"Venta {pv_nom} {cantidad_ton} ton cliente",
            "created_at":       fecha,
            "updated_at":       fecha,
        })

        # Movimiento logístico
        BUF["movimientos_logisticos"].append({
            "_id":              ObjectId(),
            "transaccion_id":   tx_id,
            "fecha":            fecha,
            "tipo":             "salida",
            "producto_id":      pv_id,
            "producto_codigo":  pv_cod,
            "producto_nombre":  pv_nom,
            "cantidad_ton":     cantidad_ton,
            "cantidad_kg":      kg_desp,
            "punto_origen_id":  puntos[0]["_id"] if puntos else None,
            "punto_destino_id": punto_v["_id"],
            "cliente_id":       cid_v,
            "estatus":          "entregado",
            "created_at":       fecha,
        })

    # ──────────────────────────────────────────────────────────────
    #  RESÚMENES DIARIOS
    # ──────────────────────────────────────────────────────────────

    # Resumen por producto
    for pf in prods_finales:
        pf_id2  = pf["_id"]
        pf_cod2 = pf.get("codigo", "PF-001")
        pf_nom2 = pf.get("nombre", "Producto")
        prod_q  = prod_dia_total.get(pf_id2, 0)
        BUF["resumen_diario_producto"].append({
            "_id":            ObjectId(),
            "fecha_dia":      fecha,
            "anio":           anio,
            "mes":            mes,
            "semana":         sem,
            "company_id":     company_id,
            "site_id":        site_id,
            "producto_id":    pf_id2,
            "producto_codigo": pf_cod2,
            "producto_nombre": pf_nom2,
            "produccion_kg":  round(prod_q, 3),
            "merma_kg":       round(prod_q * random.uniform(0.008, 0.02), 3),
            "calidad_ok_kg":  round(prod_q * 0.955, 3),
            "calidad_nok_kg": round(prod_q * 0.045, 3),
            "ventas_ton":     round(ventas_dia * random.uniform(1, 4), 3),
            "ingresos_mxn":   round(ingresos_dia / max(1, len(prods_finales)), 2),
            "costo_mxn":      round(costo_dia    / max(1, len(prods_finales)), 2),
            "margen_mxn":     round((ingresos_dia - costo_dia) / max(1, len(prods_finales)), 2),
            "created_at":     fecha,
        })

    # Resumen movimientos logísticos diario
    BUF["resumen_movimientos_logisticos"].append({
        "_id":          ObjectId(),
        "fecha_dia":    fecha,
        "anio":         anio,
        "mes":          mes,
        "semana":       sem,
        "company_id":   company_id,
        "site_id":      site_id,
        "total_viajes": ventas_dia,
        "total_ton":    round(ventas_dia * random.uniform(2, 8), 3),
        "total_km":     round(ventas_dia * random.uniform(50, 300), 1),
        "costo_flete_mxn": round(ventas_dia * random.uniform(500, 3000), 2),
        "entregas_ok":  max(0, ventas_dia - random.randint(0, 1)),
        "entregas_nok": random.randint(0, 1),
        "created_at":   fecha,
    })

    # Resumen operaciones almacén
    total_prod_dia = sum(prod_dia_total.values())
    BUF["resumen_operaciones_almacen"].append({
        "_id":                ObjectId(),
        "fecha_dia":          fecha,
        "anio":               anio,
        "mes":                mes,
        "semana":             sem,
        "company_id":         company_id,
        "site_id":            site_id,
        "recepciones_mp_ton": round(compras_dia * cap_by_planta.get(plantas[0]["_id"] if plantas else ObjectId(), 1200) * 0.001 * 28, 2),
        "despachos_pf_ton":   round(ventas_dia * random.uniform(2, 8), 3),
        "produccion_pf_ton":  round(total_prod_dia / 1000, 3),
        "inventario_pf_ton":  round(sum(inventario_actual.values()) / 1000, 3),
        "ocupacion_pct":      round(random.uniform(0.55, 0.92), 4),
        "created_at":         fecha,
    })

    # Resumen órdenes diario
    BUF["resumen_diario_ordenes"].append({
        "_id":              ObjectId(),
        "fecha_dia":        fecha,
        "anio":             anio,
        "mes":              mes,
        "semana":           sem,
        "company_id":       company_id,
        "site_id":          site_id,
        "ordenes_venta":    ventas_dia,
        "ordenes_compra":   compras_dia,
        "ventas_ton":       round(ventas_dia * random.uniform(2, 8), 3),
        "ingresos_mxn":     round(ingresos_dia, 2),
        "costo_mp_mxn":     round(costo_dia * 0.65, 2),
        "margen_mxn":       round(ingresos_dia - costo_dia, 2),
        "created_at":       fecha,
    })

    # Balance de materia diario
    total_mp_consumido = sum(mp_dia_total.values())
    BUF["balance_materia_almacen"].append({
        "_id":               ObjectId(),
        "fecha_dia":         fecha,
        "anio":              anio,
        "mes":               mes,
        "semana":            sem,
        "company_id":        company_id,
        "site_id":           site_id,
        "mp_consumida_kg":   round(total_mp_consumido, 3),
        "pf_producido_kg":   round(total_prod_dia, 3),
        "merma_total_kg":    round(max(0, total_mp_consumido - total_prod_dia), 3),
        "rendimiento_real":  round(total_prod_dia / max(1, total_mp_consumido), 6),
        "balance_ok":        total_prod_dia <= total_mp_consumido * 1.02,
        "created_at":        fecha,
    })

    # Cierre diario
    BUF["cierres_diarios"].append({
        "_id":              ObjectId(),
        "fecha":            fecha,
        "anio":             anio,
        "mes":              mes,
        "company_id":       company_id,
        "site_id":          site_id,
        "produccion_kg":    round(total_prod_dia, 3),
        "ventas_ton":       round(ventas_dia * random.uniform(2, 8), 3),
        "ingresos_mxn":     round(ingresos_dia, 2),
        "costo_mxn":        round(costo_dia, 2),
        "margen_mxn":       round(ingresos_dia - costo_dia, 2),
        "compras_mxn":      round(compras_dia * cap_by_planta.get(plantas[0]["_id"] if plantas else ObjectId(), 1200) * 28 * 1.16, 2),
        "cerrado_por":      "sistema",
        "observaciones":    "",
        "created_at":       fecha,
        "updated_at":       fecha,
    })

    # Flush cada BATCH días
    flush()

# Flush final
flush(force=True)
print("\n✅  Generación completa.")

# ────────────────────────────────────────────────────────────────────
#  PASO 6 ▸  Resumen final de conteos
# ────────────────────────────────────────────────────────────────────
print("\n📊  Conteo final de documentos generados:")
cols_check = [
    "resumen_produccion_diaria_planta",
    "resumen_diario_producto",
    "resumen_mezclado_diario",
    "resumen_movimientos_logisticos",
    "resumen_operaciones_almacen",
    "resumen_diario_ordenes",
    "transacciones",
    "inventario",
    "lotes_produccion",
    "cierres_diarios",
    "balance_materia_almacen",
    "ordenes_compra_venta",
    "movimientos_logisticos",
    "trazabilidad_produccion",
]
total_docs = 0
for col in cols_check:
    n = db[col].count_documents({})
    total_docs += n
    print(f"   {col:45s}: {n:>8,}")
print(f"\n   {'TOTAL':45s}: {total_docs:>8,}")
print("\n🎉  andoraDB poblada con datos coherentes 2020-2025.")
client.close()
