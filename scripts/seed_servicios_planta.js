// seed_servicios_planta.js
// Agrega servicios industriales (electricidad, gas, catalizador, vapor, agua) a:
//   1. cat_productos
//   2. resumen_produccion_diaria_planta (por cada planta y cada día existente)
//   3. ordenes_compra_venta (una OC de servicios por planta-mes)

const COMPANY_ID  = ObjectId("69ba02f885b6736f11c73649");
const SITE_ID     = ObjectId("69ba101b8c34b0b1cceb796a");
const PROVEEDOR_ID = ObjectId("69bb5eebd9455c2943d3a74e"); // MainInd (servicio)

// ─── 1. CATÁLOGO DE SERVICIOS ────────────────────────────────────────────────
// required: sku, nombre, familia, unidad_venta, estatus
// Todos los campos double deben usar Double() para satisfacer bsonType:'double'
function mkSrv(sku, nombre, desc, subfamilia, unidad, codigoSat, costo, estadoFisico) {
  return {
    _id:              ObjectId(),
    sku:              sku,
    codigo:           sku,
    nombre:           nombre,
    descripcion:      desc,
    familia:          "servicios",
    subfamilia:       subfamilia,
    unidad_venta:     unidad,
    unidad_medida:    unidad,
    codigo_sat:       codigoSat,
    costo_actual:     costo,
    costo_produccion: Double(costo),
    precio_lista:     Double(costo),
    margen_pct:       Double(0),
    moneda:           "MXN",
    peso_kg:          Double(0),
    es_producto_final: false,
    es_servicio:      true,
    tipo_corriente:   "servicio",
    estado_fisico:    estadoFisico,
    activo:           true,
    estatus:          "activo",
    sites_habilitados_ids: [ObjectId("69ba101b8c34b0b1cceb796a")],
    regions_activas:  ["nacional"],
    created_at:       new Date(),
    updated_at:       new Date()
  };
}

const servicios = [
  mkSrv("SRV-ELEC-001", "Electricidad",    "Energía eléctrica consumida en proceso industrial",       "energeticos",     "kWh", "81101500",   2.85, "energia"),
  mkSrv("SRV-GAS-001",  "Gas Natural",     "Gas natural para procesos de calentamiento y combustión", "energeticos",     "m3",  "15101500",   8.40, "gas"),
  mkSrv("SRV-CAT-001",  "Catalizador",     "Catalizador químico para reacciones de proceso",          "quimicos_proceso", "kg",  "12161600", 320.00, "solido"),
  mkSrv("SRV-VAP-001",  "Vapor de Proceso","Vapor saturado para intercambiadores y procesos térmicos","energeticos",     "ton", "81101700", 280.00, "gas"),
  mkSrv("SRV-AGUA-001", "Agua de Proceso", "Agua tratada para proceso industrial y enfriamiento",     "utilidades",      "m3",  "15121800",  18.50, "liquido")
];

// Insertar catálogo (si ya existen por código, saltarlos)
let catalogoInsertados = 0;
servicios.forEach(srv => {
  const existe = db.cat_productos.findOne({ codigo: srv.codigo });
  if (!existe) {
    db.cat_productos.insertOne(srv);
    catalogoInsertados++;
    print("cat_productos: insertado " + srv.codigo);
  } else {
    // Actualizar _id en memoria al existente para referencias
    srv._id = existe._id;
    print("cat_productos: ya existe " + srv.codigo + " -> usando _id existente");
  }
});
print("Catálogo: " + catalogoInsertados + " nuevos servicios insertados.\n");

// ─── 2. CONSUMOS POR PLANTA-DÍA EN resumen_produccion_diaria_planta ──────────

// Consumos base por tipo de equipo y servicio (unidades según cat_productos)
const consumosBase = {
  // [tipo_equipo]: { codigo_srv: cantidad_diaria_base, ... }
  mezclador:       { "SRV-ELEC-001": 850,   "SRV-GAS-001": 40,  "SRV-CAT-001": 2.5,  "SRV-VAP-001": 0.8, "SRV-AGUA-001": 12 },
  reactor:         { "SRV-ELEC-001": 1200,  "SRV-GAS-001": 80,  "SRV-CAT-001": 5.0,  "SRV-VAP-001": 1.5, "SRV-AGUA-001": 20 },
  envasadora:      { "SRV-ELEC-001": 600,   "SRV-GAS-001": 0,   "SRV-CAT-001": 0,    "SRV-VAP-001": 0.3, "SRV-AGUA-001": 5  },
  extrusora:       { "SRV-ELEC-001": 1800,  "SRV-GAS-001": 60,  "SRV-CAT-001": 1.5,  "SRV-VAP-001": 1.0, "SRV-AGUA-001": 8  },
  dosificadora:    { "SRV-ELEC-001": 400,   "SRV-GAS-001": 10,  "SRV-CAT-001": 3.0,  "SRV-VAP-001": 0.2, "SRV-AGUA-001": 4  },
  molino:          { "SRV-ELEC-001": 2200,  "SRV-GAS-001": 20,  "SRV-CAT-001": 0,    "SRV-VAP-001": 0,   "SRV-AGUA-001": 6  },
  mezcladora:      { "SRV-ELEC-001": 750,   "SRV-GAS-001": 35,  "SRV-CAT-001": 2.0,  "SRV-VAP-001": 0.6, "SRV-AGUA-001": 10 },
  homogeneizador:  { "SRV-ELEC-001": 950,   "SRV-GAS-001": 25,  "SRV-CAT-001": 1.0,  "SRV-VAP-001": 0.5, "SRV-AGUA-001": 15 },
  empaque:         { "SRV-ELEC-001": 500,   "SRV-GAS-001": 0,   "SRV-CAT-001": 0,    "SRV-VAP-001": 0.2, "SRV-AGUA-001": 3  }
};

// Variación diaria ±15% para realismo
function variar(base) {
  return Math.round(base * (0.85 + Math.random() * 0.30) * 100) / 100;
}

// Construir mapa codigo->objeto servicio
const srvMap = {};
servicios.forEach(s => { srvMap[s.codigo] = s; });

// Obtener todas las plantas
const plantas = db.cat_plantas_proceso.find().toArray();

// Obtener fechas únicas ya existentes en la colección
print("Obteniendo fechas únicas existentes...");
const fechas = db.resumen_produccion_diaria_planta.aggregate([
  { $group: { _id: { fecha: "$fecha_dia", anio: "$anio", mes: "$mes", semana: "$semana" } } },
  { $sort: { "_id.fecha": 1 } }
]).toArray();
print("Fechas a procesar: " + fechas.length + " días x " + plantas.length + " plantas x 5 servicios\n");

// Verificar si ya existen registros de servicios
const yaExiste = db.resumen_produccion_diaria_planta.findOne({ familia: "servicios" });
if (yaExiste) {
  print("AVISO: Ya existen registros de familia='servicios'. Saltando inserción de resumen_produccion_diaria_planta.");
} else {
  let batch = [];
  const BATCH_SIZE = 500;
  let totalInsertados = 0;

  fechas.forEach(f => {
    const fecha    = f._id.fecha;
    const anio     = f._id.anio;
    const mes      = f._id.mes;
    const semana   = f._id.semana;

    plantas.forEach(planta => {
      const tipo = planta.tipo_equipo || "mezcladora";
      const consumos = consumosBase[tipo] || consumosBase["mezcladora"];

      Object.keys(consumos).forEach(codigoSrv => {
        const srv = srvMap[codigoSrv];
        if (!srv) return;
        const cantBase = consumos[codigoSrv];
        if (cantBase === 0) return;

        const cantidad      = variar(cantBase);
        const costoUnitario = srv.costo_actual;
        const costoTotal    = Math.round(cantidad * costoUnitario * 100) / 100;

        batch.push({
          fecha_dia:          fecha,
          anio:               anio,
          mes:                mes,
          semana:             semana,
          company_id:         COMPANY_ID,
          site_id:            SITE_ID,
          planta_id:          planta._id,
          planta_clave:       planta.clave,
          planta_tag:         planta.tag,
          planta_nombre:      planta.nombre,
          nivel_proceso:      0,               // nivel 0 = insumo/servicio
          producto_id:        srv._id,
          producto_codigo:    srv.codigo,
          producto_nombre:    srv.nombre,
          sku:                srv.codigo,
          familia:            "servicios",
          subfamilia:         srv.subfamilia,
          es_producto_final:  false,
          tipo_flujo:         1,               // 1 = entrada/consumo
          tipo_corriente:     "servicio",
          unidad:             srv.unidad_medida,
          cantidad:           cantidad,
          costo_unitario_mxn: costoUnitario,
          costo_total_mxn:    costoTotal,
          cantidad_disponible: null,
          cantidad_merma:     0,
          merma_pct:          0,
          estado_fisico:      srv.estado_fisico,
          planta_destino:     null,
          numero_lote:        null,
          lote_id:            null,
          receta_id:          null,
          receta_clave:       null,
          sku_producto_final: null,
          nombre_producto_final: null,
          calidad_aprobado:   true,
          created_at:         new Date(),
          updated_at:         new Date()
        });

        if (batch.length >= BATCH_SIZE) {
          db.resumen_produccion_diaria_planta.insertMany(batch);
          totalInsertados += batch.length;
          batch = [];
          print("  ... " + totalInsertados + " registros insertados");
        }
      });
    });
  });

  if (batch.length > 0) {
    db.resumen_produccion_diaria_planta.insertMany(batch);
    totalInsertados += batch.length;
  }
  print("resumen_produccion_diaria_planta: " + totalInsertados + " registros de servicios insertados.\n");
}

// ─── 3. ÓRDENES DE COMPRA DE SERVICIOS (1 OC por planta-mes) ─────────────────

const ocYaExiste = db.ordenes_compra_venta.findOne({ folio: { $regex: /^OC-SRV-/ } });
if (ocYaExiste) {
  print("AVISO: Ya existen OC de servicios. Saltando inserción de ordenes_compra_venta.");
} else {
  // Agrupar por planta-mes-servicio: sumar cantidades del resumen insertado
  print("Generando órdenes de compra mensuales por servicio...");

  const resumenMensual = db.resumen_produccion_diaria_planta.aggregate([
    { $match: { familia: "servicios" } },
    { $group: {
        _id: {
          anio:           "$anio",
          mes:            "$mes",
          planta_id:      "$planta_id",
          planta_clave:   "$planta_clave",
          producto_id:    "$producto_id",
          producto_codigo: "$producto_codigo",
          producto_nombre: "$producto_nombre",
          costo_unitario: "$costo_unitario_mxn"
        },
        cantidad_mes:   { $sum: "$cantidad" },
        costo_total:    { $sum: "$costo_total_mxn" },
        min_fecha:      { $min: "$fecha_dia" }
    }}
  ]).toArray();

  print("Grupos mes-planta-servicio a convertir en OC: " + resumenMensual.length);

  let ocBatch = [];
  resumenMensual.forEach((r, i) => {
    const subtotal = Math.round(r.costo_total * 100) / 100;
    const iva      = Math.round(subtotal * 0.16 * 100) / 100;
    const total    = Math.round((subtotal + iva) * 100) / 100;
    const folio    = "OC-SRV-" + r._id.anio + String(r._id.mes).padStart(2,"0") + "-" + r._id.planta_clave + "-" + r._id.producto_codigo;

    ocBatch.push({
      folio:           folio,
      tipo:            "compra",
      tipo_orden:      "compra",
      fecha:           r.min_fecha,
      company_id:      COMPANY_ID,
      proveedor_id:    PROVEEDOR_ID,
      planta_id:       r._id.planta_id,
      planta_clave:    r._id.planta_clave,
      producto_id:     r._id.producto_id,
      producto_codigo: r._id.producto_codigo,
      producto_nombre: r._id.producto_nombre,
      cantidad:        Double(Math.round(r.cantidad_mes * 100) / 100),
      unidad:          srvMap[r._id.producto_codigo] ? srvMap[r._id.producto_codigo].unidad_medida : "unidad",
      precio_unitario: Double(r._id.costo_unitario),
      subtotal:        Double(subtotal),
      iva_mxn:         Double(iva),
      total:           Double(total),
      estatus:         "cerrada",
      created_at:      new Date()
    });

    if (ocBatch.length >= 500) {
      db.ordenes_compra_venta.insertMany(ocBatch);
      print("  OC insertadas: " + (i+1));
      ocBatch = [];
    }
  });

  if (ocBatch.length > 0) {
    db.ordenes_compra_venta.insertMany(ocBatch);
  }
  print("ordenes_compra_venta: " + resumenMensual.length + " OC de servicios insertadas.\n");
}

// ─── RESUMEN FINAL ────────────────────────────────────────────────────────────
print("=== RESUMEN FINAL ===");
print("cat_productos (servicios): " + db.cat_productos.countDocuments({ familia: "servicios" }));
print("resumen_produccion_diaria_planta (servicios): " + db.resumen_produccion_diaria_planta.countDocuments({ familia: "servicios" }));
print("ordenes_compra_venta (servicios): " + db.ordenes_compra_venta.countDocuments({ folio: { $regex: /^OC-SRV-/ } }));
