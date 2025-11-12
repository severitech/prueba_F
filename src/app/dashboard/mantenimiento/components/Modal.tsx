// app/mantenimientos/components/ModalMantenimiento.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Mantenimiento } from '@/interface/mantenimiento';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModalMantenimientoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mantenimiento: Mantenimiento | null;
  onGuardar: (datos: any) => void;
}

export default function ModalMantenimiento({ open, onOpenChange, mantenimiento, onGuardar }: ModalMantenimientoProps) {
  const [formData, setFormData] = useState({
    detalle_venta: '',
    usuario: '',
    descripcion: '',
    costo: '',
    estado: 'Pendiente'
  });

  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    if (mantenimiento) {
      setFormData({
        detalle_venta: mantenimiento.detalle_venta.toString(),
        usuario: mantenimiento.usuario.toString(),
        descripcion: mantenimiento.descripcion,
        costo: mantenimiento.costo,
        estado: mantenimiento.estado
      });
    } else {
      setFormData({
        detalle_venta: '',
        usuario: '',
        descripcion: '',
        costo: '',
        estado: 'Pendiente'
      });
    }
    setErrores([]);
  }, [mantenimiento, open]);

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevosErrores: string[] = [];
    
    if (!formData.detalle_venta) {
      nuevosErrores.push('El detalle de venta es requerido');
    }
    
    if (!formData.usuario) {
      nuevosErrores.push('El usuario es requerido');
    }
    
    if (!formData.descripcion.trim()) {
      nuevosErrores.push('La descripción es requerida');
    }
    
    if (formData.costo && parseFloat(formData.costo) < 0) {
      nuevosErrores.push('El costo no puede ser negativo');
    }

    if (nuevosErrores.length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Preparar datos para enviar
    const datosEnvio = {
      detalle_venta: parseInt(formData.detalle_venta),
      usuario: parseInt(formData.usuario),
      descripcion: formData.descripcion.trim(),
      costo: formData.costo ? parseFloat(formData.costo) : 0,
      estado: formData.estado as any
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
            {mantenimiento ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
          </DialogTitle>
          <DialogDescription>
            {mantenimiento 
              ? 'Modifica la información del mantenimiento existente.' 
              : 'Agrega un nuevo mantenimiento para un producto vendido.'
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
                placeholder="Describe el problema o mantenimiento requerido..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detalle Venta */}
              <div>
                <Label htmlFor="detalle_venta">ID Detalle Venta *</Label>
                <Input
                  id="detalle_venta"
                  type="number"
                  value={formData.detalle_venta}
                  onChange={(e) => setFormData(prev => ({ ...prev, detalle_venta: e.target.value }))}
                  placeholder="ID del detalle de venta"
                />
              </div>

              {/* Usuario */}
              <div>
                <Label htmlFor="usuario">ID Usuario *</Label>
                <Input
                  id="usuario"
                  type="number"
                  value={formData.usuario}
                  onChange={(e) => setFormData(prev => ({ ...prev, usuario: e.target.value }))}
                  placeholder="ID del usuario"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado */}
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(valor) => setFormData(prev => ({ ...prev, estado: valor }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Costo */}
              <div>
                <Label htmlFor="costo">Costo (BOB)</Label>
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  value={formData.costo}
                  onChange={(e) => setFormData(prev => ({ ...prev, costo: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {mantenimiento ? 'Actualizar' : 'Crear'} Mantenimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}