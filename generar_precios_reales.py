#!/usr/bin/env python3
"""
=======================================================================
  anDora – resumen_precios_reales  (Ene 2020 – Dic 2025)
=======================================================================
  Un registro MENSUAL por item, precio limpio sin ruido diario.
  El precio evoluciona mes a mes por inflación + estacionalidad
  + eventos históricos reales.

  Ejecutar:
      cd ~/Desktop/anDora_v3.4
      python3 generar_precios_reales.py
=======================================================================
"""

import math, random, sys
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import MongoClient

try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    client.server_info()
except Exception as e:
    sys.exit(f"❌  No se pudo conectar a MongoDB: {e}")

db = client["andoraDB"]
print("✅  Conectado a andoraDB\n")
random.seed(2020)

# ── Catálogos ────────────────────────────────────────────────────────
productos     = list(db.cat_productos.find())
corrientes    = list(db.cat_corrientes.find())
servicios     = list(db.cat_servicios.find())
materias_raw  = list(db.materias_primas.find())
lista_precios = list(db.cat_lista_precios.find())

print("📚  Catálogos leídos:")
print(f"   cat_productos    : {len(productos)}")
print(f"   cat_corrientes   : {len(corrientes)}")
print(f"   cat_servicios    : {len(servicios)}")
print(f"   materias_primas  : {len(materias_raw)}")

# ── Helpers ──────────────────────────────────────────────────────────
def safe_float(val, default=0.0):
    if val is None: return default
    if isinstance(val, dict):
        for k in ("valor","value","mxn","precio","costo","precio_mxn"):
            try:
                v = float(val[k])
                if v > 0: return v
            except (KeyError, TypeError, ValueError): pass
        return default
    try:
        v = float(val); return v if v > 0 else default
    except (TypeError, ValueError): return default

def precio_de_lista(obj_id, fb_min, fb_max):
    for lp in lista_precios:
        if lp.get("producto_id") == obj_id or lp.get("corriente_id") == obj_id:
            v = safe_float(lp.get("precio_mxn") or lp.get("precio") or lp.get("costo_unitario_mxn"))
            if v > 0: return v
    return round(random.uniform(fb_min, fb_max), 2)

# ── Construir items ──────────────────────────────────────────────────
items = []

# 1. PRODUCTOS
for p in productos:
    es_final = p.get("es_producto_final", False)
    pb = safe_float(p.get("precio_lista_mxn")) or safe_float(p.get("precio_venta")) or precio_de_lista(p["_id"], 13000, 28000)
    cb = safe_float(p.get("costo_produccion_mxn")) or safe_float(p.get("costo_compra_mxn")) or safe_float(p.get("costo")) or round(pb * (0.60 if es_final else 1.0), 2)
    items.append({
        "ref_id": p["_id"], "codigo": p.get("codigo","PF-???"),
        "nombre": p.get("nombre","Producto"),
        "categoria": "Producto Final" if es_final else "Materia Prima",
        "tipo_doc": "cat_productos",
        "familia": p.get("familia","producto"),
        "unidad": p.get("unidad_medida") or p.get("unidad") or ("ton" if es_final else "kg"),
        "pb": pb, "cb": cb,
        "inf_a": 0.055 + random.uniform(0, 0.028),
        "est": [0.98,0.97,1.00,1.01,1.02,1.01,1.00,0.99,1.01,1.02,1.03,1.04],
        "desc_max": round(random.uniform(0.03, 0.10), 4),
    })

# 2. MATERIAS PRIMAS (catálogo materias_primas)
ids_vistos = {p["_id"] for p in productos}
for mp in materias_raw:
    if mp["_id"] in ids_vistos: continue
    ids_vistos.add(mp["_id"])
    pb = safe_float(mp.get("costo_unitario_mxn")) or safe_float(mp.get("precio_compra")) or safe_float(mp.get("precio")) or precio_de_lista(mp["_id"], 28, 95)
    items.append({
        "ref_id": mp["_id"], "codigo": mp.get("codigo") or mp.get("clave","MP-???"),
        "nombre": mp.get("nombre","Materia Prima"),
        "categoria": "Materia Prima", "tipo_doc": "materias_primas",
        "familia": mp.get("familia") or mp.get("tipo","materia_prima"),
        "unidad": mp.get("unidad") or mp.get("unidad_medida","kg"),
        "pb": pb, "cb": pb,
        "inf_a": 0.058 + random.uniform(0, 0.038),
        "est": [1.02,1.01,1.00,0.99,0.98,0.97,0.97,0.98,1.00,1.01,1.02,1.03],
        "desc_max": round(random.uniform(0.01, 0.04), 4),
    })

# 3. SERVICIOS
for sv in servicios:
    pb = safe_float(sv.get("precio_unitario_mxn")) or safe_float(sv.get("costo_unitario")) or safe_float(sv.get("tarifa")) or precio_de_lista(sv["_id"], 500, 15000)
    items.append({
        "ref_id": sv["_id"], "codigo": sv.get("codigo") or sv.get("clave","SV-???"),
        "nombre": sv.get("nombre","Servicio"),
        "categoria": "Servicio", "tipo_doc": "cat_servicios",
        "familia": sv.get("tipo") or sv.get("familia","servicio"),
        "unidad": sv.get("unidad") or sv.get("unidad_medida","servicio"),
        "pb": pb, "cb": round(pb * random.uniform(0.60, 0.80), 2),
        "inf_a": 0.048 + random.uniform(0, 0.020),
        "est": [1.0]*12,
        "desc_max": round(random.uniform(0.02, 0.08), 4),
    })

# 4. CORRIENTES INTERNAS
corr_ids = set()
for c in corrientes:
    if c["_id"] in corr_ids: continue
    corr_ids.add(c["_id"])
    tipo_c = c.get("tipo","")
    if tipo_c in ("materia_prima","insumo"):
        cat="Materia Prima";    fb=(28,95);      ia=0.058; est=[1.02,1.01,1.00,0.99,0.98,0.97,0.97,0.98,1.00,1.01,1.02,1.03]
    elif tipo_c == "producto_final":
        cat="Producto Final";   fb=(12000,28000); ia=0.055; est=[0.98,0.97,1.00,1.01,1.02,1.01,1.00,0.99,1.01,1.02,1.03,1.04]
    else:
        cat="Corriente Interna"; fb=(80,3500);   ia=0.052; est=[1.0]*12
    pb = safe_float(c.get("costo_unitario_mxn")) or safe_float(c.get("precio")) or precio_de_lista(c["_id"], *fb)
    items.append({
        "ref_id": c["_id"], "codigo": c.get("codigo") or c.get("clave","COR-???"),
        "nombre": c.get("nombre","Corriente"),
        "categoria": cat, "tipo_doc": "cat_corrientes",
        "familia": tipo_c or "corriente",
        "unidad": c.get("unidad","kg"),
        "pb": pb, "cb": pb,
        "inf_a": ia + random.uniform(0, 0.025),
        "est": est,
        "desc_max": round(random.uniform(0.00, 0.03), 4),
    })

# Deduplicar
seen = set(); items_u = []
for it in items:
    k = (it["codigo"], it["categoria"])
    if k not in seen:
        seen.add(k); items_u.append(it)
items = items_u

cat_cnt = {}
for it in items: cat_cnt[it["categoria"]] = cat_cnt.get(it["categoria"],0)+1
print(f"\n   Items únicos:")
for k,v in sorted(cat_cnt.items()): print(f"      {k:25s}: {v:3d}")
print(f"      {'TOTAL':25s}: {len(items):3d}")
print(f"\n   Total documentos a generar: {len(items) * 72:,}  ({len(items)} items × 72 meses)")

# ── Limpiar ──────────────────────────────────────────────────────────
r = db.resumen_precios_reales.delete_many({})
print(f"\n🗑️   Limpieza: {r.deleted_count} docs eliminados")

# ── Generar ──────────────────────────────────────────────────────────
print(f"\n💰  Generando precios mensuales limpios (sin ruido)...\n")

docs = []

for item in items:
    inf_m = (1 + item["inf_a"]) ** (1/12) - 1   # inflación mensual exacta

    # precio/costo acumulados mes a mes (sin ruido)
    precio = item["pb"]
    costo  = item["cb"]

    for anio in range(2020, 2026):
        for mes in range(1, 13):

            # Inflación mensual compuesta
            precio = precio * (1 + inf_m)
            costo  = costo  * (1 + inf_m * 0.95)

            # ── Eventos históricos (ajuste puntual, sin aleatoriedad) ──
            if anio == 2020 and mes == 3:    # inicio COVID
                precio *= 0.95
                costo  *= 1.04
            if anio == 2020 and mes == 4:    # pico COVID
                precio *= 0.93
                costo  *= 1.06
            if anio == 2020 and mes == 5:    # fin confinamiento
                precio *= 0.96
            if anio == 2021 and mes == 5:    # recuperación
                precio *= 1.02
            if anio == 2022 and mes == 3:    # inflación global / guerra
                precio *= 1.03
                costo  *= 1.04
            if anio == 2022 and mes == 6:    # pico inflación
                precio *= 1.02
                costo  *= 1.03
            if anio == 2023 and mes == 9:    # estabilización Banxico
                precio *= 0.995

            # Estacionalidad (factor fijo por mes)
            p_mes = round(precio * item["est"][mes - 1], 2)
            c_mes = round(costo, 2)

            # Precio neto con descuento máximo típico del item
            desc   = round(item["desc_max"] * 0.5, 4)   # descuento promedio = mitad del máximo
            p_neto = round(p_mes * (1 - desc), 2)

            # Margen solo para productos finales
            if item["categoria"] == "Producto Final":
                margen_mxn = round(p_neto - c_mes, 2)
                margen_pct = round(margen_mxn / p_neto * 100, 2) if p_neto > 0 else 0
            else:
                margen_mxn = 0.0
                margen_pct = 0.0

            docs.append({
                "_id":              ObjectId(),
                "fecha":            datetime(anio, mes, 1, tzinfo=timezone.utc),
                "anio":             anio,
                "mes":              mes,
                "trimestre":        math.ceil(mes / 3),
                "semestre":         1 if mes <= 6 else 2,
                # Referencia catálogo
                "ref_id":           item["ref_id"],
                "ref_coleccion":    item["tipo_doc"],
                "codigo":           item["codigo"],
                "nombre":           item["nombre"],
                "categoria":        item["categoria"],
                "familia":          item["familia"],
                "unidad":           item["unidad"],
                "moneda":           "MXN",
                # Precios
                "precio_lista_mxn": p_mes,
                "precio_neto_mxn":  p_neto,
                "descuento_pct":    desc,
                "descuento_max_pct": item["desc_max"],
                # Costo
                "costo_mxn":        c_mes,
                # Margen
                "margen_mxn":       margen_mxn,
                "margen_pct":       margen_pct,
                # Indicadores
                "indice_base100":   round(p_mes / item["pb"] * 100, 2),
                "inflacion_anual_pct": round(item["inf_a"] * 100, 2),
                # Meta
                "fuente":  "mercado"        if item["categoria"] == "Materia Prima"  else
                           "tarifa"         if item["categoria"] == "Servicio"       else
                           "lista_interna"  if item["categoria"] == "Producto Final" else
                           "interno",
                "activo":  True,
                "created_at": datetime(anio, mes, 1, tzinfo=timezone.utc),
            })

# ── Insertar ─────────────────────────────────────────────────────────
CHUNK = 1000
for i in range(0, len(docs), CHUNK):
    db.resumen_precios_reales.insert_many(docs[i:i+CHUNK], ordered=False)

total = db.resumen_precios_reales.count_documents({})
print(f"✅  Insertados: {total:,} documentos")

# ── Índices ──────────────────────────────────────────────────────────
print("\n🔑  Creando índices...")
db.resumen_precios_reales.drop_indexes()
db.resumen_precios_reales.create_index([("fecha",1),("codigo",1)], unique=True, name="idx_fecha_codigo")
db.resumen_precios_reales.create_index([("codigo",1),("anio",1),("mes",1)],    name="idx_codigo_periodo")
db.resumen_precios_reales.create_index([("categoria",1),("anio",1)],           name="idx_categoria_anio")
db.resumen_precios_reales.create_index("ref_id",                               name="idx_ref_id")
print("   4 índices creados.")

# ── Tabla resumen ────────────────────────────────────────────────────
print("\n" + "="*84)
print(f"  {'CÓDIGO':12s} {'CATEGORÍA':18s} {'NOMBRE':28s} {'ENE-2020':>12s} {'DIC-2025':>12s} {'UNIDAD':>7s} {'INFLAC.':>8s}")
print("="*84)
for it in sorted(items, key=lambda x: (x["categoria"], x["codigo"])):
    p0 = db.resumen_precios_reales.find_one({"codigo": it["codigo"], "anio": 2020, "mes": 1})
    p1 = db.resumen_precios_reales.find_one({"codigo": it["codigo"], "anio": 2025, "mes": 12})
    if p0 and p1 and p0["precio_lista_mxn"] > 0:
        inf_t = (p1["precio_lista_mxn"] / p0["precio_lista_mxn"] - 1) * 100
        print(f"  {it['codigo']:12s} {it['categoria']:18s} {it['nombre'][:28]:28s} "
              f"${p0['precio_lista_mxn']:>10,.2f} "
              f"${p1['precio_lista_mxn']:>10,.2f} "
              f"  {it['unidad']:>5s}  +{inf_t:>5.1f}%")
print("="*84)
print(f"\n🎉  resumen_precios_reales: {total:,} registros | 1 por mes por item | sin ruido")
client.close()
