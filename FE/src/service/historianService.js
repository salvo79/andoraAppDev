import api from './api.js';

export default {
    async getAll() {
        const res = await api.get('/historian');
        return res.data;
    },

    async save(analysis) {
        if (analysis.id) {
            const res = await api.put(`/historian/${analysis.id}`, analysis);
            return res.data;
        }
        const res = await api.post('/historian', analysis);
        return res.data;
    },

    async publish(id) {
        const res = await api.patch(`/historian/${id}/publish`);
        return res.data;
    },

    async remove(id) {
        await api.delete(`/historian/${id}`);
    },
};
