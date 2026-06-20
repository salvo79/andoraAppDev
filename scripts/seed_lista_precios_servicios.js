// seed_lista_precios_servicios.js
// Agrega lista de precios de compra para servicios industriales en cat_lista_precios
// También agrega las líneas de servicios a la lista LP-MP-2024-001 existente

const COMPANY_ID   = ObjectId("69ba02f885b6736f11c73649");
const SITE_ID      = ObjectId("69ba101b8c34b0b1cceb796a");
const PROVEEDOR_ID = ObjectId("69bb5eebd9455c2943d3a74e"); // MainInd (servicio)

// Obtener los _id de los servicios ya insertados en cat_productos
const srvMap = {};
["SRV-ELEC-001","SRV-GAS-001","SRV-CAT-001","SRV-VAP-001","SRV-AGUA-001"].forEach(codigo => {
  const doc = db.cat_productos.findOne({ sku: codigo });
  if (doc) srvMap[codigo] = doc;
  else print("ADVERTENCIA: no encontrado en cat_productos -> " + codigo);
});

print("Servicios encontrados: " + Object.keys(srvMap).length);

// ─── LÍNEAS DE SERVICIOS ──────────────────────────────────────────────────────
// Estructura basada en las líneas existentes de LP-MP-2024-001
function mkLinea(num, srv, precioBase) {
  const p0  = Math.round(precioBase * 1.08 * 100) / 100;  // precio sin volumen
  const p1  = precioBase;                                   // precio estándar
  const p2  = Math.round(precioBase * 0.95 * 100) / 100;  // precio volumen alto
  const flete = 0;
  const seguro = 0;

  return {
    linea:           num,
    tipo_objeto:     "servicio",
    objeto_id:       srv._id,
    clave:           srv.sku,
    nombre:          srv.nombre,
    descripcion:     srv.descripcion,
    unidad:          srv.unidad_venta,
    estado_fisico:   srv.estado_fisico,
    precio_lista:    p1,
    precios_escala: [
      { cantidad_min: 0,    cantidad_max: 999,  precio: p0, descuento_pct: 0 },
      { cantidad_min: 1000, cantidad_max: 4999, precio: p1, descuento_pct: Math.round((1 - p1/p0)*10000)/100 },
      { cantidad_min: 5000, cantidad_max: null, precio: p2, descuento_pct: Math.round((1 - p2/p0)*10000)/100 }
    ],
    costo_flete_kg:   flete,
    costo_seguro_kg:  seguro,
    precio_total_kg:  p1,
    moneda:           "MXN",
    lead_time_dias:   1,
    minimo_pedido_kg: 100,
    activo:           true
  };
}

const lineasServicios = [
  mkLinea(1, srvMap["SRV-ELEC-001"],   2.85),
  mkLinea(2, srvMap["SRV-GAS-001"],    8.40),
  mkLinea(3, srvMap["SRV-CAT-001"],  320.00),
  mkLinea(4, srvMap["SRV-VAP-001"],  280.00),
  mkLinea(5, srvMap["SRV-AGUA-001"],  18.50)
];

// ─── 1. NUEVA LISTA DE PRECIOS: COMPRA SERVICIOS INDUSTRIALES ────────────────
const YA_EXISTE = db.cat_lista_precios.findOne({ codigo: "LP-SRV-2024-001" });

if (YA_EXISTE) {
  print("AVISO: LP-SRV-2024-001 ya existe. Saltando creación.");
} else {
  db.cat_lista_precios.insertOne({
    codigo:           "LP-SRV-2024-001",
    nombre:           "Lista precios compra servicios industriales 2024",
    descripcion:      "Precios de compra negociados con proveedor MainInd para servicios de proceso: electricidad, gas, catalizador, vapor y agua tratada. Vigente todo 2024.",
    tipo_lista:       "compra",
    tipo_objeto:      "servicio",
    company_id:       COMPANY_ID,
    proveedor_id:     PROVEEDOR_ID,
    proveedor_codigo: "PROV-SRV-001",
    proveedor_nombre: "MainInd",
    cliente_id:       null,
    cliente_codigo:   null,
    cliente_nombre:   null,
    vendedor_id:      null,
    vendedor_nombre:  null,
    site_id:          SITE_ID,
    site_codigo:      "SITE-MTY-CP-01",
    site_nombre:      "Centro Productor Norte",
    fecha_emision:    new Date("2024-01-01"),
    fecha_aprobacion: new Date("2024-01-05"),
    aprobado_por:     "Gerencia Compras",
    vigencia: {
      desde:  new Date("2024-01-01"),
      hasta:  new Date("2024-12-31"),
      activa: true
    },
    moneda:          "MXN",
    incluye_iva:     false,
    condicion_pago:  "30 días",
    incoterm:        "DDP",
    lineas:          lineasServicios,
    observaciones:   "Tarifas de servicios industriales contratados anualmente con MainInd. Electricidad sujeta a tarifas CFE industriales. Gas a precio CENAGAS.",
    estatus:         "vigente",
    lista_sustituida_por: null,
    created_at:      new Date(),
    updated_at:      new Date()
  });
  print("cat_lista_precios: LP-SRV-2024-001 creada con " + lineasServicios.length + " líneas.");
}

// ─── 2. NUEVA LISTA: COMPRA SERVICIOS 2025 (año siguiente) ───────────────────
const YA_EXISTE_25 = db.cat_lista_precios.findOne({ codigo: "LP-SRV-2025-001" });

if (YA_EXISTE_25) {
  print("AVISO: LP-SRV-2025-001 ya existe. Saltando creación.");
} else {
  // 2025: incremento ~6% en servicios energéticos
  function mkLinea25(num, srv, precioBase) {
    const ajuste = ["SRV-ELEC-001","SRV-GAS-001","SRV-VAP-001"].includes(srv.sku) ? 1.06 : 1.03;
    return mkLinea(num, srv, Math.round(precioBase * ajuste * 100) / 100);
  }

  const lineas25 = [
    mkLinea25(1, srvMap["SRV-ELEC-001"],   2.85),
    mkLinea25(2, srvMap["SRV-GAS-001"],    8.40),
    mkLinea25(3, srvMap["SRV-CAT-001"],  320.00),
    mkLinea25(4, srvMap["SRV-VAP-001"],  280.00),
    mkLinea25(5, srvMap["SRV-AGUA-001"],  18.50)
  ];

  db.cat_lista_precios.insertOne({
    codigo:           "LP-SRV-2025-001",
    nombre:           "Lista precios compra servicios industriales 2025",
    descripcion:      "Precios de compra de servicios industriales con ajuste inflacionario 2025. Energéticos +6%, otros insumos +3%.",
    tipo_lista:       "compra",
    tipo_objeto:      "servicio",
    company_id:       COMPANY_ID,
    proveedor_id:     PROVEEDOR_ID,
    proveedor_codigo: "PROV-SRV-001",
    proveedor_nombre: "MainInd",
    cliente_id:       null,
    cliente_codigo:   null,
    cliente_nombre:   null,
    vendedor_id:      null,
    vendedor_nombre:  null,
    site_id:          SITE_ID,
    site_codigo:      "SITE-MTY-CP-01",
    site_nombre:      "Centro Productor Norte",
    fecha_emision:    new Date("2025-01-01"),
    fecha_aprobacion: new Date("2025-01-06"),
    aprobado_por:     "Gerencia Compras",
    vigencia: {
      desde:  new Date("2025-01-01"),
      hasta:  new Date("2025-12-31"),
      activa: true
    },
    moneda:          "MXN",
    incluye_iva:     false,
    condicion_pago:  "30 días",
    incoterm:        "DDP",
    lineas:          lineas25,
    observaciones:   "Ajuste anual 2025: energéticos +6% por inflación tarifaria CFE/CENAGAS. Catalizador y agua +3%.",
    estatus:         "vigente",
    lista_sustituida_por: null,
    lista_sustituye_a:    "LP-SRV-2024-001",
    created_at:      new Date(),
    updated_at:      new Date()
  });
  print("cat_lista_precios: LP-SRV-2025-001 creada con " + lineas25.length + " líneas.");
}

// ─── 3. AGREGAR SERVICIOS A LA LISTA LP-MP-2024-001 (materia prima) ──────────
// Los servicios son insumos de proceso igual que las materias primas.
// Se añaden como líneas adicionales dentro de la lista de compra existente.
const LP_MP = db.cat_lista_precios.findOne({ codigo: "LP-MP-2024-001" });

if (!LP_MP) {
  print("AVISO: LP-MP-2024-001 no encontrada. Saltando adición de líneas.");
} else {
  const lineasActuales = LP_MP.lineas || [];
  const yaHayServicios = lineasActuales.some(l => l.tipo_objeto === "servicio");

  if (yaHayServicios) {
    print("AVISO: LP-MP-2024-001 ya tiene líneas de servicio. Saltando.");
  } else {
    // Agregar servicios a partir de la última línea existente
    const ultimaLinea = lineasActuales.reduce((max, l) => Math.max(max, l.linea || 0), 0);
    const lineasSrvParaMP = lineasServicios.map((l, i) => ({
      ...l,
      linea: ultimaLinea + i + 1
    }));

    db.cat_lista_precios.updateOne(
      { codigo: "LP-MP-2024-001" },
      {
        $push: { lineas: { $each: lineasSrvParaMP } },
        $set:  { updated_at: new Date() }
      }
    );
    print("LP-MP-2024-001: " + lineasSrvParaMP.length + " líneas de servicios añadidas (líneas " + (ultimaLinea+1) + "-" + (ultimaLinea+lineasSrvParaMP.length) + ").");
  }
}

// ─── RESUMEN FINAL ────────────────────────────────────────────────────────────
print("\n=== RESUMEN FINAL ===");
db.cat_lista_precios.find({ $or: [
  { codigo: { $regex: /^LP-SRV-/ } },
  { codigo: "LP-MP-2024-001" }
]}, { codigo: 1, nombre: 1, estatus: 1, "lineas": { $slice: -1 } }).forEach(l => {
  print(l.codigo + " | " + l.nombre + " | lineas totales: " + (l.lineas ? l.lineas.length + " (mostrando última)" : "n/a"));
});
print("Total listas con servicios: " + db.cat_lista_precios.countDocuments({ "lineas.tipo_objeto": "servicio" }));
