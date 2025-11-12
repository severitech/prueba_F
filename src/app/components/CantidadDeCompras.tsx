import StatsCount from "@/components/ui/statscount";
const estadisticas = [
  { value: 500, suffix: "+", label: "Productos disponibles en la tienda"},
  { value: 1.2, suffix: "K+", label: "Clientes satisfechos"},
  { value: 99, suffix: "%", label: "Pedidos entregados satifactoriamente"},
];

export default function CantidadDeCompras() {
  return (
    <StatsCount
      stats={estadisticas}
      title="DESCUBRE UNA NUEVA EXPERIENCIA DE COMPRA CON NUESTRA TIENDA ONLINE"
      showDividers={true}
      className=""
    />
  );
}
