// app/promociones/components/ModalPromocion.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Promocion } from '@/interface/promocion';
import { servicioPromociones } from '@/api/promocion.service';
import { servicioProductos } from '@/api/productos.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, X, Plus, Package } from 'lucide-react';
import { Producto } from '@/interface/productos';

interface ModalPromocionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promocion: Promocion | null;
  onGuardar: (datos: any) => void;
}

export default function ModalPromocion({ open, onOpenChange, promocion, onGuardar }: ModalPromocionProps) {
  const [formData, setFormData] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    descripcion: '',
    monto: '',
    estado: true
  });

  const [productosSeleccionados, setProductosSeleccionados] = useState<Producto[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [errores, setErrores] = useState<string[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (promocion) {
      // Modo edición
      setFormData({
        fecha_inicio: promocion.fecha_inicio,
        fecha_fin: promocion.fecha_fin,
        descripcion: promocion.descripcion,
        monto: promocion.monto.toString(),
        estado: promocion.estado
      });

      // Cargar productos de la promoción
      cargarProductosDePromocion(promocion.id);
    } else {
      // Modo creación - valores por defecto
      const hoy = new Date().toISOString().split('T')[0];
      const unaSemanaDespues = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setFormData({
        fecha_inicio: hoy,
        fecha_fin: unaSemanaDespues,
        descripcion: '',
        monto: '',
        estado: true
      });
      setProductosSeleccionados([]);
    }
    
    setErrores([]);
    setBusquedaProducto('');
    setProductoSeleccionado('');
  }, [promocion, open]);

  // Cargar productos disponibles
  useEffect(() => {
    if (open) {
      cargarProductosDisponibles();
    }
  }, [open, busquedaProducto]);

  const cargarProductosDePromocion = async (promocionId: number) => {
    try {
      const respuesta = await servicioPromociones.obtenerProductosPorPromocion(promocionId);
      if (respuesta.exito) {
        const productos = respuesta.datos
          .filter(pp => pp.producto && typeof pp.producto === 'object')
          .map(pp => pp.producto as Producto);
        setProductosSeleccionados(productos);
      }
    } catch (error) {
      console.error('Error cargando productos de promoción:', error);
    }
  };

  const cargarProductosDisponibles = async () => {
    try {
      setCargandoProductos(true);
      const respuesta = await servicioProductos.obtenerProductos({
        buscar: busquedaProducto,
        estado: 'Activo',
        limite: 50,
        pagina: 1 // Valor predeterminado para cumplir con la interfaz
      });
      
      if (respuesta.exito) {
        // Filtrar productos que ya están seleccionados
        const productosFiltrados = respuesta.datos.filter(
          producto => !productosSeleccionados.some(p => p.id === producto.id)
        );
        setProductosDisponibles(productosFiltrados);
      }
    } catch (error) {
      console.error('Error cargando productos disponibles:', error);
    } finally {
      setCargandoProductos(false);
    }
  };

  const agregarProducto = () => {
    if (!productoSeleccionado) return;

    const producto = productosDisponibles.find(p => p.id === parseInt(productoSeleccionado));
    if (producto) {
      setProductosSeleccionados(prev => [...prev, producto]);
      setProductoSeleccionado('');
      // Recargar productos disponibles para actualizar la lista
      setTimeout(() => cargarProductosDisponibles(), 100);
    }
  };

  const eliminarProducto = (productoId: number) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== productoId));
    // Recargar productos disponibles para actualizar la lista
    setTimeout(() => cargarProductosDisponibles(), 100);
  };

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevosErrores: string[] = [];
    
    if (!formData.descripcion.trim()) {
      nuevosErrores.push('La descripción es requerida');
    }
    
    if (!formData.fecha_inicio) {
      nuevosErrores.push('La fecha de inicio es requerida');
    }
    
    if (!formData.fecha_fin) {
      nuevosErrores.push('La fecha de fin es requerida');
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaFin = new Date(formData.fecha_fin);
      if (fechaInicio >= fechaFin) {
        nuevosErrores.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      nuevosErrores.push('El monto debe ser mayor a 0');
    }

    if (productosSeleccionados.length === 0) {
      nuevosErrores.push('Debe seleccionar al menos un producto');
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Preparar datos para enviar
    const datosEnvio = {
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      descripcion: formData.descripcion.trim(),
      monto: parseFloat(formData.monto),
      estado: formData.estado,
      productos_ids: productosSeleccionados.map(p => p.id)
    };

    console.log('Datos a enviar:', datosEnvio);
    onGuardar(datosEnvio);
  };

  const cerrarModal = () => {
    onOpenChange(false);
  };

  const formatearPrecio = (precio: number | string) => {
    return servicioProductos.formatearMoneda(typeof precio === 'string' ? parseFloat(precio) : precio);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promocion ? 'Editar Promoción' : 'Nueva Promoción'}
          </DialogTitle>
          <DialogDescription>
            {promocion 
              ? 'Modifica la información de la promoción existente.' 
              : 'Crea una nueva promoción para productos.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={manejarSubmit} className="space-y-6">
          {/* Errores */}
          {errores.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <ul className="text-red-600 dark:text-red-300 text-sm list-disc list-inside">
                {errores.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <button
                onClick={() => setErrores([])}
                className="text-red-500 hover:text-red-700 text-sm mt-2"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Información Básica */}
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Información de la Promoción
            </h3>
            
            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción de la promoción..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha Inicio */}
              <div>
                <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <Label htmlFor="fecha_fin">Fecha Fin *</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monto */}
              <div>
                <Label htmlFor="monto">Monto/Descuento *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ingrese el monto del descuento o porcentaje
                </p>
              </div>

              {/* Estado */}
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="estado"
                  checked={formData.estado}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, estado: checked }))}
                />
                <Label htmlFor="estado">
                  {formData.estado ? 'Activa' : 'Inactiva'}
                </Label>
              </div>
            </div>
          </div>

          {/* Selección de Productos */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Productos en Promoción *
            </h3>
            
            {/* Buscar y Agregar Producto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Búsqueda */}
              <div>
                <Label htmlFor="buscar-producto">Buscar Producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="buscar-producto"
                    type="text"
                    placeholder="Buscar producto..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Selector de Producto */}
              <div>
                <Label htmlFor="producto">Seleccionar Producto</Label>
                <select
                  id="producto"
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  disabled={cargandoProductos}
                >
                  <option value="">{cargandoProductos ? 'Cargando...' : 'Seleccione un producto'}</option>
                  {productosDisponibles.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.descripcion} - {formatearPrecio(producto.precio)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Agregar */}
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={agregarProducto}
                  disabled={!productoSeleccionado || cargandoProductos}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </div>

            {/* Lista de Productos Seleccionados */}
            <div className="border rounded-lg p-4">
              <Label className="mb-2 block">
                Productos seleccionados ({productosSeleccionados.length})
              </Label>
              
              {productosSeleccionados.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="mx-auto h-8 w-8 mb-2" />
                  <p>No hay productos seleccionados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {productosSeleccionados.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {producto.descripcion}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatearPrecio(producto.precio)} • Stock: {producto.stock}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarProducto(producto.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {promocion ? 'Actualizar' : 'Crear'} Promoción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}