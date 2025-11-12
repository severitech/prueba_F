
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ItemCarrito, ContextoCarrito } from '@/interface/carrito';
import { Producto } from '@/interface/productos';

const CarritoContexto = createContext<ContextoCarrito | undefined>(undefined);

interface ProveedorCarritoProps {
  children: ReactNode;
}

export function ProveedorCarrito({ children }: ProveedorCarritoProps) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [contadorCarrito, setContadorCarrito] = useState<number>(0);

  // Actualizar contador del carrito - DEFINIR PRIMERO
  const actualizarContadorCarrito = (itemsCarrito: ItemCarrito[]): void => {
    const contador = itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
    setContadorCarrito(contador);
  };

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        const carritoParseado: ItemCarrito[] = JSON.parse(carritoGuardado);
        setCarrito(carritoParseado);
        actualizarContadorCarrito(carritoParseado);
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        localStorage.removeItem('carrito');
      }
    }
  }, []);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: Producto): void => {
    const nuevoCarrito = [...carrito];
    const indiceItemExistente = nuevoCarrito.findIndex(item => item.id === producto.id);

    if (indiceItemExistente >= 0) {
      nuevoCarrito[indiceItemExistente].cantidad += 1;
    } else {
      nuevoCarrito.push({ ...producto, cantidad: 1 });
    }

    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    actualizarContadorCarrito(nuevoCarrito);
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (idProducto: number): void => {
    const nuevoCarrito = carrito.filter(item => item.id !== idProducto);
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    actualizarContadorCarrito(nuevoCarrito);
  };

  // Actualizar cantidad de un producto
  const actualizarCantidad = (idProducto: number, nuevaCantidad: number): void => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(idProducto);
      return;
    }

    const nuevoCarrito = carrito.map(item =>
      item.id === idProducto ? { ...item, cantidad: nuevaCantidad } : item
    );

    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    actualizarContadorCarrito(nuevoCarrito);
  };

  // Vaciar carrito completamente
  const vaciarCarrito = (): void => {
    setCarrito([]);
    localStorage.removeItem('carrito');
    setContadorCarrito(0);
  };

  // Calcular total del carrito
  const calcularTotal = (): number => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const valor: ContextoCarrito = {
    carrito,
    contadorCarrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    calcularTotal
  };

  return (
    <CarritoContexto.Provider value={valor}>
      {children}
    </CarritoContexto.Provider>
  );
}

export const usarCarrito = (): ContextoCarrito => {
  const contexto = useContext(CarritoContexto);
  if (!contexto) {
    throw new Error('usarCarrito debe ser usado dentro de un ProveedorCarrito');
  }
  return contexto;
};