// app/productos/components/ModalProductos.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Producto } from '@/interface/productos';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Link, Plus } from 'lucide-react';

interface ModalProductoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: Producto | null;
  onGuardar: (datos: any) => void;
}

interface ImagenProducto {
  id?: string;
  url: string;
  file?: File;
  isNew?: boolean;
}

export default function ModalProducto({ open, onOpenChange, producto, onGuardar }: ModalProductoProps) {
  const [formData, setFormData] = useState({
    descripcion: '',
    precio: '',
    stock: '',
    estado: 'Activo' as 'Activo' | 'Inactivo',
    subcategoria_id: '',
  });

  const [imagenes, setImagenes] = useState<ImagenProducto[]>([]);
  const [nuevaUrlImagen, setNuevaUrlImagen] = useState('');
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [mostrarInputUrl, setMostrarInputUrl] = useState(false);

  useEffect(() => {
    if (producto) {
      // Para editar, necesitamos extraer el ID de subcategoria del objeto
      const subcategoriaId = producto.subcategoria && typeof producto.subcategoria === 'object' 
        ? producto.subcategoria.id 
        : producto.subcategoria;

      setFormData({
        descripcion: producto.descripcion,
        precio: producto.precio.toString(),
        stock: producto.stock.toString(),
        estado: producto.estado || 'Activo',
        subcategoria_id: subcategoriaId?.toString() || '',
      });
      
      // Cargar imágenes existentes
      if (producto.imagenes && producto.imagenes.length > 0) {
        setImagenes(producto.imagenes.map(url => ({ 
          id: `existente-${url}`,
          url 
        })));
      } else {
        setImagenes([]);
      }
    } else {
      setFormData({
        descripcion: '',
        precio: '',
        stock: '',
        estado: 'Activo',
        subcategoria_id: '',
      });
      setImagenes([]);
    }
    setErrores([]);
    setNuevaUrlImagen('');
    setMostrarInputUrl(false);
  }, [producto, open]);

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevosErrores: string[] = [];
    
    if (!formData.descripcion.trim()) {
      nuevosErrores.push('La descripción es requerida');
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      nuevosErrores.push('El precio debe ser mayor a 0');
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      nuevosErrores.push('El stock no puede ser negativo');
    }
    
    if (!formData.subcategoria_id) {
      nuevosErrores.push('La subcategoría es requerida');
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Preparar datos para enviar - EXACTAMENTE como los espera tu backend
    const datosEnvio = {
      descripcion: formData.descripcion.trim(),
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      estado: formData.estado,
      subcategoria_id: parseInt(formData.subcategoria_id), // subcategoria_id como número
      imagenes: imagenes.map(img => img.url) // array de URLs
    };

    console.log('Datos a enviar al backend:', datosEnvio);
    onGuardar(datosEnvio);
  };

  const manejarSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCargandoImagen(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          setErrores(prev => [...prev, `El archivo ${file.name} no es una imagen válida`]);
          continue;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrores(prev => [...prev, `La imagen ${file.name} es demasiado grande (máx. 5MB)`]);
          continue;
        }

        // Crear URL temporal para previsualización
        const url = URL.createObjectURL(file);
        
        setImagenes(prev => [...prev, {
          id: `nuevo-${Date.now()}-${i}`,
          url,
          file,
          isNew: true
        }]);
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      setErrores(prev => [...prev, 'Error al procesar las imágenes']);
    } finally {
      setCargandoImagen(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  const agregarUrlImagen = () => {
    if (!nuevaUrlImagen.trim()) {
      setErrores(prev => [...prev, 'La URL de la imagen no puede estar vacía']);
      return;
    }

    // Validar que sea una URL válida
    try {
      new URL(nuevaUrlImagen);
    } catch {
      setErrores(prev => [...prev, 'La URL de la imagen no es válida']);
      return;
    }

    // Verificar si la URL ya existe
    if (imagenes.some(img => img.url === nuevaUrlImagen)) {
      setErrores(prev => [...prev, 'Esta URL de imagen ya ha sido agregada']);
      return;
    }

    setImagenes(prev => [...prev, {
      id: `url-${Date.now()}`,
      url: nuevaUrlImagen.trim()
    }]);

    setNuevaUrlImagen('');
    setMostrarInputUrl(false);
  };

  const eliminarImagen = (index: number) => {
    const imagen = imagenes[index];
    // Revocar URL temporal si es una imagen nueva subida como archivo
    if (imagen.isNew && imagen.url.startsWith('blob:')) {
      URL.revokeObjectURL(imagen.url);
    }
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const cerrarModal = () => {
    // Limpiar URLs temporales de imágenes subidas como archivo
    imagenes.forEach(imagen => {
      if (imagen.isNew && imagen.url.startsWith('blob:')) {
        URL.revokeObjectURL(imagen.url);
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {producto 
              ? 'Modifica la información del producto existente.' 
              : 'Agrega un nuevo producto a tu catálogo.'
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descripción */}
            <div className="md:col-span-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Nombre del producto..."
              />
            </div>

            {/* Precio */}
            <div>
              <Label htmlFor="precio">Precio *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: 'Activo' | 'Inactivo') => 
                  setFormData(prev => ({ ...prev, estado: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subcategoría */}
            <div>
              <Label htmlFor="subcategoria_id">Subcategoría ID *</Label>
              <Input
                id="subcategoria_id"
                type="number"
                value={formData.subcategoria_id}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategoria_id: e.target.value }))}
                placeholder="ID de subcategoría"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ingresa el ID numérico de la subcategoría
              </p>
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <Label htmlFor="imagenes">Imágenes del Producto</Label>
            <div className="mt-2 space-y-4">
              {/* Opciones para agregar imágenes */}
              <div className="flex flex-wrap gap-2">
                {/* Subir archivos */}
                <label
                  htmlFor="subir-imagen"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Subir archivos</span>
                  <input
                    id="subir-imagen"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={manejarSubirImagen}
                    className="hidden"
                    disabled={cargandoImagen}
                  />
                </label>

                {/* Agregar URL */}
                {!mostrarInputUrl ? (
                  <button
                    type="button"
                    onClick={() => setMostrarInputUrl(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Link className="w-4 h-4" />
                    <span>Agregar URL</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={nuevaUrlImagen}
                      onChange={(e) => setNuevaUrlImagen(e.target.value)}
                      className="w-64"
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={agregarUrlImagen}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setMostrarInputUrl(false);
                        setNuevaUrlImagen('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Previsualización de imágenes */}
              {imagenes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Imágenes ({imagenes.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagenes.map((imagen, index) => (
                      <div key={imagen.id || index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                          <img
                            src={imagen.url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxNCI+SW1hZ2VuIG5vIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+';
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                        {imagen.isNew && (
                          <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                            Nuevo
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarImagen(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {!imagen.isNew && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <Badge variant="outline" className="w-full justify-center text-xs bg-white/90 dark:bg-gray-900/90">
                              URL
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>• Puedes subir imágenes desde tu dispositivo o agregar URLs de imágenes</p>
                <p>• Formatos soportados: PNG, JPG, JPEG, WEBP</p>
                <p>• Tamaño máximo por archivo: 5MB</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargandoImagen}>
              {cargandoImagen ? 'Subiendo...' : producto ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}