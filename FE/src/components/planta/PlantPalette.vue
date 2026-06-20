<script setup>
const emit = defineEmits(['drag-start']);

const CATEGORIES = [
    {
        label: 'Equipos',
        items: [
            { id: 'tank-v',      label: 'Tanque Vertical',    w: 60, h: 80,  svg: tankV()      },
            { id: 'tank-h',      label: 'Tanque Horizontal',  w: 80, h: 50,  svg: tankH()      },
            { id: 'reactor',     label: 'Reactor',            w: 60, h: 80,  svg: reactor()    },
            { id: 'column',      label: 'Columna',            w: 50, h: 100, svg: column()     },
            { id: 'hx',          label: 'Intercambiador',     w: 80, h: 50,  svg: hx()         },
            { id: 'furnace',     label: 'Horno',              w: 70, h: 60,  svg: furnace()    },
        ]
    },
    {
        label: 'Máquinas',
        items: [
            { id: 'pump-c',      label: 'Bomba Centrif.',     w: 50, h: 50,  svg: pumpC()      },
            { id: 'pump-p',      label: 'Bomba Despl. Pos.',  w: 50, h: 50,  svg: pumpP()      },
            { id: 'compressor',  label: 'Compresor',          w: 55, h: 55,  svg: compressor() },
            { id: 'fan',         label: 'Ventilador',         w: 55, h: 55,  svg: fan()        },
            { id: 'turbine',     label: 'Turbina',            w: 55, h: 55,  svg: turbine()    },
        ]
    },
    {
        label: 'Válvulas',
        items: [
            { id: 'valve-gate',    label: 'Compuerta',  w: 40, h: 30, svg: valveGate()    },
            { id: 'valve-globe',   label: 'Globo',      w: 40, h: 30, svg: valveGlobe()   },
            { id: 'valve-ball',    label: 'Bola',       w: 30, h: 30, svg: valveBall()    },
            { id: 'valve-check',   label: 'Retención',  w: 40, h: 30, svg: valveCheck()   },
            { id: 'valve-control', label: 'Control',    w: 40, h: 40, svg: valveControl() },
            { id: 'valve-safety',  label: 'Seguridad',  w: 40, h: 40, svg: valveSafety()  },
        ]
    },
    {
        label: 'Instrumentos',
        items: [
            { id: 'inst-circle', label: 'Instrumento',   w: 36, h: 36, svg: instCircle()  },
            { id: 'inst-local',  label: 'Local',         w: 36, h: 36, svg: instLocal()   },
            { id: 'inst-dcs',    label: 'DCS',           w: 36, h: 36, svg: instDCS()     },
            { id: 'sensor-t',    label: 'Temperatura',   w: 36, h: 36, svg: sensorT()     },
            { id: 'sensor-p',    label: 'Presión',       w: 36, h: 36, svg: sensorP()     },
            { id: 'sensor-f',    label: 'Flujo',         w: 36, h: 36, svg: sensorF()     },
            { id: 'sensor-l',    label: 'Nivel',         w: 36, h: 36, svg: sensorL()     },
        ]
    },
    {
        label: 'Líneas',
        items: [
            { id: 'line-process', label: 'Proceso',     w: 60, h: 4,  svg: lineSvg('#334155', 3)  },
            { id: 'line-utility', label: 'Utilidad',    w: 60, h: 4,  svg: lineSvg('#64748b', 2)  },
            { id: 'line-signal',  label: 'Señal',       w: 60, h: 4,  svg: lineSvg('#3b82f6', 1, '6,3') },
            { id: 'line-elec',    label: 'Eléctrica',   w: 60, h: 4,  svg: lineSvg('#f59e0b', 1, '2,2') },
        ]
    }
];

// ── SVG shape builders ────────────────────────────────────────────────────────
function tankV() {
    return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="10" width="44" height="60" rx="3" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <ellipse cx="30" cy="10" rx="22" ry="6" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
        <ellipse cx="30" cy="70" rx="22" ry="6" fill="#93c5fd" stroke="#3b82f6" stroke-width="2"/>
        <line x1="30" y1="4" x2="30" y2="0" stroke="#64748b" stroke-width="2"/>
        <line x1="30" y1="76" x2="30" y2="80" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function tankH() {
    return `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="8" width="60" height="34" rx="3" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <ellipse cx="10" cy="25" rx="6" ry="17" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
        <ellipse cx="70" cy="25" rx="6" ry="17" fill="#93c5fd" stroke="#3b82f6" stroke-width="2"/>
        <line x1="0" y1="25" x2="4" y2="25" stroke="#64748b" stroke-width="2"/>
        <line x1="76" y1="25" x2="80" y2="25" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function reactor() {
    return `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="10" width="44" height="55" rx="3" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
        <ellipse cx="30" cy="10" rx="22" ry="6" fill="#a7f3d0" stroke="#10b981" stroke-width="2"/>
        <ellipse cx="30" cy="65" rx="22" ry="8" fill="#6ee7b7" stroke="#10b981" stroke-width="2"/>
        <line x1="22" y1="30" x2="38" y2="38" stroke="#10b981" stroke-width="2"/>
        <line x1="38" y1="30" x2="22" y2="38" stroke="#10b981" stroke-width="2"/>
        <line x1="22" y1="42" x2="38" y2="50" stroke="#10b981" stroke-width="2"/>
        <line x1="38" y1="42" x2="22" y2="50" stroke="#10b981" stroke-width="2"/>
        <line x1="30" y1="4" x2="30" y2="0" stroke="#64748b" stroke-width="2"/>
        <line x1="30" y1="73" x2="30" y2="80" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function column() {
    return `<svg viewBox="0 0 50 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="8" width="30" height="80" rx="3" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
        <ellipse cx="25" cy="8" rx="15" ry="5" fill="#ddd6fe" stroke="#8b5cf6" stroke-width="2"/>
        <ellipse cx="25" cy="88" rx="15" ry="5" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="2"/>
        <line x1="12" y1="30" x2="38" y2="30" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="3,2"/>
        <line x1="12" y1="50" x2="38" y2="50" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="3,2"/>
        <line x1="12" y1="70" x2="38" y2="70" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="3,2"/>
        <line x1="25" y1="3" x2="25" y2="0" stroke="#64748b" stroke-width="2"/>
        <line x1="25" y1="93" x2="25" y2="100" stroke="#64748b" stroke-width="2"/>
        <line x1="40" y1="40" x2="50" y2="40" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function hx() {
    return `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="60" height="30" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
        <circle cx="25" cy="25" r="8" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/>
        <circle cx="40" cy="25" r="8" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/>
        <circle cx="55" cy="25" r="8" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/>
        <line x1="0" y1="18" x2="10" y2="18" stroke="#64748b" stroke-width="2"/>
        <line x1="70" y1="18" x2="80" y2="18" stroke="#64748b" stroke-width="2"/>
        <line x1="0" y1="32" x2="10" y2="32" stroke="#ef4444" stroke-width="2"/>
        <line x1="70" y1="32" x2="80" y2="32" stroke="#ef4444" stroke-width="2"/>
    </svg>`;
}
function furnace() {
    return `<svg viewBox="0 0 70 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="60" height="45" rx="3" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
        <path d="M 20 40 Q 25 25 30 35 Q 35 20 40 32 Q 45 18 50 30" fill="none" stroke="#f97316" stroke-width="2"/>
        <line x1="20" y1="10" x2="20" y2="5" stroke="#64748b" stroke-width="3"/>
        <line x1="35" y1="10" x2="35" y2="5" stroke="#64748b" stroke-width="3"/>
        <line x1="50" y1="10" x2="50" y2="5" stroke="#64748b" stroke-width="3"/>
        <line x1="0" y1="40" x2="5" y2="40" stroke="#64748b" stroke-width="2"/>
        <line x1="65" y1="40" x2="70" y2="40" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function pumpC() {
    return `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="28" r="16" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <polygon points="25,28 16,18 34,18" fill="#3b82f6"/>
        <rect x="22" y="5" width="6" height="10" rx="2" fill="#64748b"/>
        <line x1="0" y1="35" x2="9" y2="35" stroke="#64748b" stroke-width="2"/>
        <line x1="25" y1="12" x2="25" y2="18" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function pumpP() {
    return `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="15" width="34" height="22" rx="3" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <rect x="16" y="20" width="18" height="12" rx="2" fill="#93c5fd"/>
        <line x1="0" y1="26" x2="8" y2="26" stroke="#64748b" stroke-width="2"/>
        <line x1="42" y1="26" x2="50" y2="26" stroke="#64748b" stroke-width="2"/>
        <rect x="22" y="5" width="6" height="10" rx="2" fill="#64748b"/>
    </svg>`;
}
function compressor() {
    return `<svg viewBox="0 0 55 55" xmlns="http://www.w3.org/2000/svg">
        <circle cx="27" cy="30" r="18" fill="#f0fdf4" stroke="#10b981" stroke-width="2"/>
        <path d="M 20 22 L 27 38 L 34 22 Z" fill="#10b981"/>
        <path d="M 20 38 L 27 22 L 34 38 Z" fill="#a7f3d0" stroke="#10b981" stroke-width="1"/>
        <line x1="0" y1="30" x2="9" y2="30" stroke="#64748b" stroke-width="2"/>
        <line x1="46" y1="30" x2="55" y2="30" stroke="#64748b" stroke-width="2"/>
        <rect x="24" y="4" width="6" height="8" rx="2" fill="#64748b"/>
    </svg>`;
}
function fan() {
    return `<svg viewBox="0 0 55 55" xmlns="http://www.w3.org/2000/svg">
        <circle cx="27" cy="27" r="20" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
        <ellipse cx="27" cy="14" rx="5" ry="9" fill="#fde047" stroke="#eab308" stroke-width="1.5" transform="rotate(0 27 27)"/>
        <ellipse cx="27" cy="14" rx="5" ry="9" fill="#fde047" stroke="#eab308" stroke-width="1.5" transform="rotate(120 27 27)"/>
        <ellipse cx="27" cy="14" rx="5" ry="9" fill="#fde047" stroke="#eab308" stroke-width="1.5" transform="rotate(240 27 27)"/>
        <circle cx="27" cy="27" r="4" fill="#64748b"/>
    </svg>`;
}
function turbine() {
    return `<svg viewBox="0 0 55 55" xmlns="http://www.w3.org/2000/svg">
        <circle cx="27" cy="27" r="20" fill="#fdf4ff" stroke="#a855f7" stroke-width="2"/>
        <path d="M27 7 Q37 17 27 27 Q37 37 27 47" fill="none" stroke="#a855f7" stroke-width="2"/>
        <path d="M7 27 Q17 17 27 27 Q17 37 7 27" fill="none" stroke="#a855f7" stroke-width="2"/>
        <path d="M47 27 Q37 17 27 27 Q37 37 47 27" fill="none" stroke="#a855f7" stroke-width="2"/>
        <circle cx="27" cy="27" r="4" fill="#a855f7"/>
        <line x1="0" y1="27" x2="7" y2="27" stroke="#64748b" stroke-width="2"/>
        <line x1="48" y1="27" x2="55" y2="27" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function valveGate() {
    return `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,5 20,15 4,25" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <polygon points="36,5 20,15 36,25" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <line x1="0" y1="15" x2="4" y2="15" stroke="#64748b" stroke-width="2"/>
        <line x1="36" y1="15" x2="40" y2="15" stroke="#64748b" stroke-width="2"/>
        <line x1="20" y1="15" x2="20" y2="0" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function valveGlobe() {
    return `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,5 20,15 4,25" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
        <polygon points="36,5 20,15 36,25" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
        <circle cx="20" cy="15" r="5" fill="#6ee7b7" stroke="#10b981" stroke-width="2"/>
        <line x1="0" y1="15" x2="4" y2="15" stroke="#64748b" stroke-width="2"/>
        <line x1="36" y1="15" x2="40" y2="15" stroke="#64748b" stroke-width="2"/>
        <line x1="20" y1="10" x2="20" y2="0" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function valveBall() {
    return `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
        <line x1="0" y1="15" x2="5" y2="15" stroke="#64748b" stroke-width="2"/>
        <line x1="25" y1="15" x2="30" y2="15" stroke="#64748b" stroke-width="2"/>
        <line x1="15" y1="15" x2="15" y2="4" stroke="#64748b" stroke-width="2"/>
        <line x1="10" y1="4" x2="20" y2="4" stroke="#64748b" stroke-width="3"/>
    </svg>`;
}
function valveCheck() {
    return `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,5 20,15 4,25" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
        <line x1="20" y1="5" x2="20" y2="25" stroke="#ef4444" stroke-width="2"/>
        <line x1="0" y1="15" x2="4" y2="15" stroke="#64748b" stroke-width="2"/>
        <line x1="20" y1="15" x2="40" y2="15" stroke="#64748b" stroke-width="2"/>
    </svg>`;
}
function valveControl() {
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,15 20,22 4,30" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
        <polygon points="36,15 20,22 36,30" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
        <line x1="0" y1="22" x2="4" y2="22" stroke="#64748b" stroke-width="2"/>
        <line x1="36" y1="22" x2="40" y2="22" stroke="#64748b" stroke-width="2"/>
        <line x1="20" y1="22" x2="20" y2="10" stroke="#64748b" stroke-width="1.5"/>
        <circle cx="20" cy="6" r="5" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="1.5"/>
    </svg>`;
}
function valveSafety() {
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <polygon points="4,15 20,22 4,30" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
        <polygon points="36,15 20,22 36,30" fill="#fee2e2" stroke="#ef4444" stroke-width="2"/>
        <line x1="0" y1="22" x2="4" y2="22" stroke="#64748b" stroke-width="2"/>
        <line x1="36" y1="22" x2="40" y2="22" stroke="#64748b" stroke-width="2"/>
        <line x1="20" y1="22" x2="20" y2="10" stroke="#64748b" stroke-width="1.5"/>
        <path d="M 14 10 L 26 10 L 24 4 L 16 4 Z" fill="#fca5a5" stroke="#ef4444" stroke-width="1.5"/>
    </svg>`;
}
function instCircle() {
    return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="white" stroke="#334155" stroke-width="2"/>
        <text x="18" y="23" text-anchor="middle" font-size="10" font-family="monospace" fill="#334155">FIC</text>
    </svg>`;
}
function instLocal() {
    return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="white" stroke="#334155" stroke-width="2"/>
        <line x1="8" y1="18" x2="28" y2="18" stroke="#334155" stroke-width="1.5"/>
        <text x="18" y="15" text-anchor="middle" font-size="8" font-family="monospace" fill="#334155">TI</text>
    </svg>`;
}
function instDCS() {
    return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <circle cx="18" cy="18" r="9" fill="white" stroke="#3b82f6" stroke-width="1"/>
        <text x="18" y="22" text-anchor="middle" font-size="8" font-family="monospace" fill="#334155">DCS</text>
    </svg>`;
}
function sensorT() {
    return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
        <text x="18" y="23" text-anchor="middle" font-size="14" font-weight="bold" font-family="monospace" fill="#92400e">T</text>
    </svg>`;
}
function sensorP() {
    return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <text x="18" y="23" text-anchor="middle" font-size="14" font-weight="bold" font-family="monospace" fill="#1e40af">P</text>
    </svg>`;
}
function sensorF() {
    return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
        <text x="18" y="23" text-anchor="middle" font-size="14" font-weight="bold" font-family="monospace" fill="#065f46">F</text>
    </svg>`;
}
function sensorL() {
    return `<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="18" r="14" fill="#ede9fe" stroke="#8b5cf6" stroke-width="2"/>
        <text x="18" y="23" text-anchor="middle" font-size="14" font-weight="bold" font-family="monospace" fill="#4c1d95">L</text>
    </svg>`;
}
function lineSvg(color, width, dash = '') {
    const da = dash ? `stroke-dasharray="${dash}"` : '';
    return `<svg viewBox="0 0 60 8" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="4" x2="60" y2="4" stroke="${color}" stroke-width="${width}" ${da}/>
        <polygon points="52,0 60,4 52,8" fill="${color}"/>
    </svg>`;
}

function onDragStart(e, item) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/planta-shape', JSON.stringify(item));
}
</script>

<template>
    <div class="palette">
        <div class="palette-title">Paleta P&amp;ID</div>
        <div v-for="cat in CATEGORIES" :key="cat.label" class="palette-cat">
            <div class="palette-cat-label">{{ cat.label }}</div>
            <div class="palette-grid">
                <div
                    v-for="item in cat.items"
                    :key="item.id"
                    class="palette-item"
                    draggable="true"
                    :title="item.label"
                    @dragstart="onDragStart($event, item)"
                    v-html="item.svg"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.palette {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    background: var(--p-surface-50);
    border-right: 1px solid var(--p-surface-200);
    font-family: 'Segoe UI', system-ui, sans-serif;
    user-select: none;
}
.palette-title {
    padding: 8px 10px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--p-text-muted-color);
    border-bottom: 1px solid var(--p-surface-200);
    flex-shrink: 0;
}
.palette-cat { padding: 6px 8px 4px; }
.palette-cat-label {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--p-primary-color);
    margin-bottom: 4px;
}
.palette-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
}
.palette-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 5px;
    border: 1px solid transparent;
    cursor: grab;
    background: var(--p-surface-0);
    transition: border-color 0.15s, background 0.15s;
    min-height: 44px;
}
.palette-item:hover {
    border-color: var(--p-primary-color);
    background: var(--p-primary-50, #eff6ff);
}
.palette-item:active { cursor: grabbing; }
.palette-item :deep(svg) { width: 100%; height: auto; max-height: 40px; }
</style>
