import api from './api';

const BASE = '/catalog';

const catalogService = {
    // ── Genérico ───────────────────────────────────────────────
    getAll:    (entity)     => api.get(`${BASE}/${entity}`).then(r => r.data),
    create:    (entity, d)  => api.post(`${BASE}/${entity}`, d).then(r => r.data),
    update:    (entity, id, d) => api.put(`${BASE}/${entity}/${id}`, d).then(r => r.data),
    remove:    (entity, id) => api.delete(`${BASE}/${entity}/${id}`).then(r => r.data),

    // ── Atajos por entidad ─────────────────────────────────────
    getSitios:       () => catalogService.getAll('sitios'),
    getPlantas:      () => catalogService.getAll('plantas'),
    getTrabajadores: () => catalogService.getAll('trabajadores'),
    getProveedores:  () => catalogService.getAll('proveedores'),
    getTanques:      () => catalogService.getAll('tanques'),
    getRutas:        () => catalogService.getAll('rutas'),
    getProductos:    () => catalogService.getAll('productos'),
    getCorrientes:   () => catalogService.getAll('corrientes'),
    getPrecios:      () => catalogService.getAll('precios'),
};

export default catalogService;
