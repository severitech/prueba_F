// app/garantias/components/ModalGarantia.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Garantia } from '@/interface/garantia';
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

interface ModalGarantiaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garantia: Garantia | null;
  onGuardar: (datos: any) => void;
}

export default function ModalGarantia({ open, onOpenChange, garantia, onGuardar }: ModalGarantiaProps) {
  const [formData, setFormData] = useState({
    descripcion: '',
    tiempo: '',
    producto_id: ''
  });

  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    if (garantia) {
      setFormData({
        descripcion: garantia.descripcion,
        tiempo: garantia.tiempo.toString(),
        producto_id: garantia.producto_id.toString()
      });
    } else {
      setFormData({
        descripcion: '',
        tiempo: '',
        producto_id: ''
      });
    }
    setErrores([]);
  }, [garantia, open]);

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevosErrores: string[] = [];
    
    if (!formData.descripcion.trim()) {
      nuevosErrores.push('La descripción es requerida');
    }
    
    if (!formData.tiempo || parseInt(formData.tiempo) <= 0) {
      nuevosErrores.push('El tiempo de garantía debe ser mayor a 0 meses');
    }
    
    if (!formData.producto_id) {
      nuevosErrores.push('El producto es requerido');
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Preparar datos para enviar
    const datosEnvio = {
      descripcion: formData.descripcion.trim(),
      tiempo: parseInt(formData.tiempo),
      producto_id: parseInt(formData.producto_id)
    };

    console.log('Datos a enviar:', datosEnvio);
    onGuardar(datosEnvio);
  };

  const cerrarModal = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {garantia ? 'Editar Garantía' : 'Nueva Garantía'}
          </DialogTitle>
          <DialogDescription>
            {garantia 
              ? 'Modifica la información de la garantía existente.' 
              : 'Agrega una nueva garantía para un producto.'
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

          <div className="grid grid-cols-1 gap-4">
            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Detalles de la garantía..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tiempo */}
              <div>
                <Label htmlFor="tiempo">Tiempo (meses) *</Label>
                <Input
                  id="tiempo"
                  type="number"
                  value={formData.tiempo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiempo: e.target.value }))}
                  placeholder="12"
                />
              </div>

              {/* Producto ID */}
              <div>
                <Label htmlFor="producto_id">ID del Producto *</Label>
                <Input
                  id="producto_id"
                  type="number"
                  value={formData.producto_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, producto_id: e.target.value }))}
                  placeholder="ID del producto"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Nota: Implementa un selector de productos
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {garantia ? 'Actualizar' : 'Crear'} Garantía
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}