/**
 * seguimientoService.js
 * Servicio de datos para el Seguimiento Operativo (Process Historian).
 * Actualmente genera datos mock realistas por tipo de instrumento.
 * Reemplazar fetchTagHistory() con llamadas reales a la API del historian.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Árbol de proceso (Sitio → Planta → Área → Tag)
// ─────────────────────────────────────────────────────────────────────────────

export const PROCESS_TREE = [
    {
        key: 'sitio-norte',
        label: 'Sitio Norte',
        icon: 'pi pi-map-marker',
        type: 'sitio',
        children: [
            {
                key: 'planta-a',
                label: 'Planta Petroquímica A',
                icon: 'pi pi-building',
                type: 'planta',
                children: [
                    {
                        key: 'area-reaccion',
                        label: 'Área Reacción',
                        icon: 'pi pi-sitemap',
                        type: 'area',
                        children: [
                            { key: 'TI-101', label: 'TI-101  Temp. Reactor R-101',     type: 'tag', data: { tag: 'TI-101', desc: 'Temperatura Reactor R-101',     unidad: '°C',    min: 240, max: 380, tipo: 'T', alarmaHi: 370, alarmaLo: 250 } },
                            { key: 'PI-101', label: 'PI-101  Presión Reactor R-101',    type: 'tag', data: { tag: 'PI-101', desc: 'Presión Reactor R-101',          unidad: 'kPa',   min: 520, max: 840, tipo: 'P', alarmaHi: 820, alarmaLo: 540 } },
                            { key: 'FI-101', label: 'FI-101  Flujo Alimentación',       type: 'tag', data: { tag: 'FI-101', desc: 'Flujo Alimentación R-101',       unidad: 'Ton/h', min: 6,   max: 18,  tipo: 'F', alarmaHi: 17,  alarmaLo: 7   } },
                            { key: 'LI-101', label: 'LI-101  Nivel Drum D-101',         type: 'tag', data: { tag: 'LI-101', desc: 'Nivel Drum D-101',               unidad: '%',     min: 15,  max: 85,  tipo: 'L', alarmaHi: 80,  alarmaLo: 20  } },
                            { key: 'AI-101', label: 'AI-101  Composición H₂ Salida',    type: 'tag', data: { tag: 'AI-101', desc: 'Composición H₂ Salida R-101',    unidad: '%mol',  min: 55,  max: 90,  tipo: 'A', alarmaHi: 88,  alarmaLo: 58  } },
                        ]
                    },
                    {
                        key: 'area-separacion',
                        label: 'Área Separación',
                        icon: 'pi pi-sitemap',
                        type: 'area',
                        children: [
                            { key: 'TI-201', label: 'TI-201  Temp. Cabeza C-201',       type: 'tag', data: { tag: 'TI-201', desc: 'Temperatura Cabeza Columna C-201',   unidad: '°C',    min: 60,  max: 140, tipo: 'T', alarmaHi: 135, alarmaLo: 65  } },
                            { key: 'TI-202', label: 'TI-202  Temp. Fondo C-201',        type: 'tag', data: { tag: 'TI-202', desc: 'Temperatura Fondo Columna C-201',    unidad: '°C',    min: 160, max: 260, tipo: 'T', alarmaHi: 250, alarmaLo: 165 } },
                            { key: 'PI-201', label: 'PI-201  Presión Columna C-201',    type: 'tag', data: { tag: 'PI-201', desc: 'Presión Columna C-201',              unidad: 'kPa',   min: 180, max: 420, tipo: 'P', alarmaHi: 410, alarmaLo: 190 } },
                            { key: 'FI-201', label: 'FI-201  Flujo Destilado',          type: 'tag', data: { tag: 'FI-201', desc: 'Flujo Destilado C-201',              unidad: 'Ton/h', min: 2,   max: 10,  tipo: 'F', alarmaHi: 9.5, alarmaLo: 2.5 } },
                            { key: 'LI-201', label: 'LI-201  Nivel Fondo C-201',        type: 'tag', data: { tag: 'LI-201', desc: 'Nivel Fondo Columna C-201',          unidad: '%',     min: 20,  max: 80,  tipo: 'L', alarmaHi: 75,  alarmaLo: 25  } },
                        ]
                    },
                    {
                        key: 'area-servicios-a',
                        label: 'Área Servicios',
                        icon: 'pi pi-sitemap',
                        type: 'area',
                        children: [
                            { key: 'TI-301', label: 'TI-301  Temp. Vapor HP',           type: 'tag', data: { tag: 'TI-301', desc: 'Temperatura Vapor Alta Presión',   unidad: '°C',    min: 280, max: 360, tipo: 'T', alarmaHi: 355, alarmaLo: 285 } },
                            { key: 'PI-301', label: 'PI-301  Presión Red Vapor',        type: 'tag', data: { tag: 'PI-301', desc: 'Presión Red Vapor HP',             unidad: 'kPa',   min: 3200,max: 4200,tipo: 'P', alarmaHi: 4100,alarmaLo: 3300} },
                            { key: 'FI-301', label: 'FI-301  Flujo Vapor Total',        type: 'tag', data: { tag: 'FI-301', desc: 'Flujo Vapor Total Red HP',         unidad: 'Ton/h', min: 15,  max: 45,  tipo: 'F', alarmaHi: 43,  alarmaLo: 17  } },
                        ]
                    },
                ]
            },
        ]
    },
    {
        key: 'sitio-sur',
        label: 'Sitio Sur',
        icon: 'pi pi-map-marker',
        type: 'sitio',
        children: [
            {
                key: 'planta-b',
                label: 'Planta Mezclado B',
                icon: 'pi pi-building',
                type: 'planta',
                children: [
                    {
                        key: 'area-mezclado',
                        label: 'Área Mezclado',
                        icon: 'pi pi-sitemap',
                        type: 'area',
                        children: [
                            { key: 'TI-401', label: 'TI-401  Temp. Mezclador MX-401',  type: 'tag', data: { tag: 'TI-401', desc: 'Temperatura Mezclador MX-401',  unidad: '°C',    min: 55,  max: 110, tipo: 'T', alarmaHi: 105, alarmaLo: 60  } },
                            { key: 'FI-401', label: 'FI-401  Flujo Componente A',       type: 'tag', data: { tag: 'FI-401', desc: 'Flujo Componente A MX-401',     unidad: 'Ton/h', min: 3,   max: 12,  tipo: 'F', alarmaHi: 11,  alarmaLo: 3.5 } },
                            { key: 'FI-402', label: 'FI-402  Flujo Componente B',       type: 'tag', data: { tag: 'FI-402', desc: 'Flujo Componente B MX-401',     unidad: 'Ton/h', min: 1,   max: 6,   tipo: 'F', alarmaHi: 5.8, alarmaLo: 1.2 } },
                            { key: 'DI-401', label: 'DI-401  Densidad Mezcla',          type: 'tag', data: { tag: 'DI-401', desc: 'Densidad Mezcla MX-401',        unidad: 'kg/m³', min: 820, max: 950, tipo: 'A', alarmaHi: 940, alarmaLo: 830 } },
                        ]
                    },
                    {
                        key: 'area-almacenamiento',
                        label: 'Área Almacenamiento',
                        icon: 'pi pi-sitemap',
                        type: 'area',
                        children: [
                            { key: 'LI-501', label: 'LI-501  Nivel Tanque TK-501',      type: 'tag', data: { tag: 'LI-501', desc: 'Nivel Tanque TK-501',          unidad: '%',     min: 5,   max: 95,  tipo: 'L', alarmaHi: 90,  alarmaLo: 10  } },
                            { key: 'LI-502', label: 'LI-502  Nivel Tanque TK-502',      type: 'tag', data: { tag: 'LI-502', desc: 'Nivel Tanque TK-502',          unidad: '%',     min: 5,   max: 95,  tipo: 'L', alarmaHi: 90,  alarmaLo: 10  } },
                            { key: 'TI-501', label: 'TI-501  Temp. Tanque TK-501',      type: 'tag', data: { tag: 'TI-501', desc: 'Temperatura Tanque TK-501',    unidad: '°C',    min: 20,  max: 65,  tipo: 'T', alarmaHi: 60,  alarmaLo: 22  } },
                            { key: 'PI-501', label: 'PI-501  Presión Tanque TK-501',    type: 'tag', data: { tag: 'PI-501', desc: 'Presión Tanque TK-501',        unidad: 'kPa',   min: 100, max: 250, tipo: 'P', alarmaHi: 240, alarmaLo: 110 } },
                        ]
                    },
                ]
            },
            {
                key: 'planta-c',
                label: 'Planta Utilitarios C',
                icon: 'pi pi-building',
                type: 'planta',
                children: [
                    {
                        key: 'area-agua',
                        label: 'Agua de Proceso',
                        icon: 'pi pi-sitemap',
                        type: 'area',
                        children: [
                            { key: 'FI-601', label: 'FI-601  Flujo Agua Desmineralizada', type: 'tag', data: { tag: 'FI-601', desc: 'Flujo Agua Desmineralizada',     unidad: 'm³/h',  min: 20,  max: 120, tipo: 'F', alarmaHi: 115, alarmaLo: 25  } },
                            { key: 'AI-601', label: 'AI-601  Conductividad Agua',         type: 'tag', data: { tag: 'AI-601', desc: 'Conductividad Agua Desmineralizada', unidad: 'µS/cm', min: 0.1, max: 1.5, tipo: 'A', alarmaHi: 1.2, alarmaLo: 0.1 } },
                            { key: 'LI-601', label: 'LI-601  Nivel Tanque TK-601',        type: 'tag', data: { tag: 'LI-601', desc: 'Nivel Tanque Agua TK-601',        unidad: '%',     min: 10,  max: 90,  tipo: 'L', alarmaHi: 85,  alarmaLo: 15  } },
                        ]
                    },
                ]
            },
        ]
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Generador de series de tiempo mock
// ─────────────────────────────────────────────────────────────────────────────

const RANGE_CONFIG = {
    '1h':  { points: 60,  intervalMs: 60_000,         fmt: 'HH:mm' },
    '4h':  { points: 120, intervalMs: 120_000,        fmt: 'HH:mm' },
    '8h':  { points: 96,  intervalMs: 300_000,        fmt: 'HH:mm' },
    '24h': { points: 96,  intervalMs: 900_000,        fmt: 'HH:mm' },
    '3d':  { points: 144, intervalMs: 1_800_000,      fmt: 'ddd HH:mm' },
    '7d':  { points: 168, intervalMs: 3_600_000,      fmt: 'ddd HH' },
};

function padZ(n) { return String(n).padStart(2, '0'); }

function fmtTime(date) {
    return `${padZ(date.getHours())}:${padZ(date.getMinutes())}`;
}

function fmtDateTime(date) {
    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    return `${dias[date.getDay()]} ${padZ(date.getHours())}:${padZ(date.getMinutes())}`;
}

function seededRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

/**
 * Genera valores de proceso realistas según tipo de instrumento.
 * tipo: T=temperatura, P=presión, F=flujo, L=nivel, A=analítico
 */
function generateValues(tagKey, tipo, min, max, points) {
    const rand = seededRandom(tagKey.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    const range = max - min;
    const mid = min + range * 0.5;
    const values = [];

    let current = mid + (rand() - 0.5) * range * 0.3;

    for (let i = 0; i < points; i++) {
        let noise, drift;
        switch (tipo) {
            case 'T': // temperatura: cambios lentos, sinusoidal suave
                drift = Math.sin((i / points) * Math.PI * 2) * range * 0.15
                      + Math.sin((i / points) * Math.PI * 5) * range * 0.05;
                noise = (rand() - 0.5) * range * 0.02;
                current = mid + drift + noise;
                break;
            case 'P': // presión: correlacionada con temperatura, más ruidosa
                drift = Math.sin((i / points) * Math.PI * 2) * range * 0.12
                      + Math.sin((i / points) * Math.PI * 7) * range * 0.04;
                noise = (rand() - 0.5) * range * 0.04;
                current = mid + drift + noise;
                break;
            case 'F': // flujo: cambios escalonados con ruido
                if (i % Math.floor(points / 6) === 0) {
                    current = min + rand() * range * 0.8 + range * 0.1;
                }
                noise = (rand() - 0.5) * range * 0.08;
                current = Math.max(min, Math.min(max, current + noise));
                break;
            case 'L': // nivel: integración (sube y baja gradualmente)
                drift = Math.sin((i / points) * Math.PI * 1.5) * range * 0.25;
                noise = (rand() - 0.5) * range * 0.015;
                current = mid + drift + noise;
                break;
            case 'A': // analítico: más lento, poca variación
                drift = Math.sin((i / points) * Math.PI * 1.2) * range * 0.18;
                noise = (rand() - 0.5) * range * 0.015;
                current = mid + drift + noise;
                break;
            default:
                noise = (rand() - 0.5) * range * 0.05;
                current += noise;
        }
        values.push(parseFloat(Math.max(min, Math.min(max, current)).toFixed(2)));
    }
    return values;
}

/**
 * Retorna datos de historian para una tag en un rango temporal.
 * @param {object} tagData  - { tag, tipo, min, max, unidad, alarmaHi, alarmaLo }
 * @param {string} range    - '1h' | '4h' | '8h' | '24h' | '3d' | '7d'
 */
export function fetchTagHistory(tagData, range = '8h') {
    const cfg = RANGE_CONFIG[range] || RANGE_CONFIG['8h'];
    const now = new Date();
    const labels = [];
    const startMs = now.getTime() - cfg.intervalMs * cfg.points;

    for (let i = 0; i < cfg.points; i++) {
        const ts = new Date(startMs + i * cfg.intervalMs);
        labels.push(range === '3d' || range === '7d' ? fmtDateTime(ts) : fmtTime(ts));
    }

    const values = generateValues(tagData.tag, tagData.tipo, tagData.min, tagData.max, cfg.points);
    const lastVal = values[values.length - 1];

    return {
        labels,
        values,
        lastValue: lastVal,
        min: tagData.min,
        max: tagData.max,
        alarmaHi: tagData.alarmaHi,
        alarmaLo: tagData.alarmaLo,
        calidad: 'Buena',
        timestamp: fmtTime(now),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// buildColumnarData — formato requerido por DxChart (array de objetos)
// Cada fila = un punto temporal; cada columna = un tag
// ─────────────────────────────────────────────────────────────────────────────
export function buildColumnarData(tags, range = '8h') {
    if (!tags || !tags.length) return [];
    const first = fetchTagHistory(tags[0], range);
    return first.labels.map((label, i) => {
        const row = { time: label };
        tags.forEach(tag => {
            const h = fetchTagHistory(tag, range);
            row[tag.key] = h.values[i];
        });
        return row;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Convierte PROCESS_TREE al formato requerido por DxTreeView
// ─────────────────────────────────────────────────────────────────────────────
function convertNodeDx(node) {
    const item = {
        id:       node.key,
        text:     node.label,
        type:     node.type,
        expanded: node.type === 'sitio' || node.type === 'planta',
        tagData:  node.data || null,
    };
    if (node.children?.length) {
        item.items = node.children.map(convertNodeDx);
        item.hasItems = true;
    }
    return item;
}

export const PROCESS_TREE_DX = PROCESS_TREE.map(convertNodeDx);

// ─────────────────────────────────────────────────────────────────────────────
// Evaluador de fórmulas calculadas: [TAG-KEY] como referencia
// ─────────────────────────────────────────────────────────────────────────────
export function evalFormula(formula, values) {
    try {
        let expr = formula;
        Object.entries(values).forEach(([k, v]) => {
            expr = expr.replace(new RegExp(`\\[${k}\\]`, 'g'), v);
        });
        // eslint-disable-next-line no-new-func
        return new Function(`return (${expr})`)();
    } catch {
        return NaN;
    }
}

// Colores por posición de tag en el panel
export const TAG_COLORS = [
    { border: '#3B82F6', bg: 'rgba(59,130,246,0.08)'  },
    { border: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
    { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
    { border: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
    { border: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
    { border: '#06B6D4', bg: 'rgba(6,182,212,0.08)'   },
    { border: '#F97316', bg: 'rgba(249,115,22,0.08)'  },
    { border: '#84CC16', bg: 'rgba(132,204,22,0.08)'  },
];
