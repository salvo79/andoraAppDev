namespace anDora.Api.Models.Operations
{
    public class KpiItem
    {
        public string Key { get; set; } = default!;
        public string Label { get; set; } = default!;
        public string Value { get; set; } = default!;
        public double Delta { get; set; }
        public string Sub { get; set; } = default!;
        public bool HasData { get; set; }
    }

    public class OperationsKpiDto
    {
        public List<KpiItem> Kpis { get; set; } = new();
        public DateTime PeriodoDesde { get; set; }
        public DateTime PeriodoHasta { get; set; }
    }
}
