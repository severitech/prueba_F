"use client";

import { usarCarrito } from '@/context/CarritoContexto';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAutenticacion } from '@/hooks/useAuth'; // Importa tu hook de autenticación
import { servicioPagos } from '@/api/carrito.service';

export default function Page() {
  const { 
    carrito, 
    eliminarDelCarrito, 
    actualizarCantidad, 
    vaciarCarrito, 
    calcularTotal,
    contadorCarrito 
  } = usarCarrito();

  // ✅ Obtener el usuario autenticado
  const { usuario, autenticado } = useAutenticacion();
  const [procesandoPago, setProcesandoPago] = useState(false);

  const ProcederPago = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // ✅ Verificar que el usuario esté autenticado
    if (!autenticado || !usuario) {
      alert('Por favor inicia sesión para proceder al pago');
      // Opcional: redirigir al login
      // window.location.href = '/auth/login';
      return;
    }

    setProcesandoPago(true);

    try {
      // 1. Preparar los datos del pago
      const datosPago = {
        descripcion: `Compra de ${contadorCarrito} artículo${contadorCarrito > 1 ? 's' : ''}`,
        items: carrito.map(item => ({
          producto_id: item.id,
          nombre: item.descripcion,
          precio: item.precio,
          cantidad: item.cantidad
        }))
      };

      console.log('Usuario ID:', usuario.id); // Debug
      console.log('Datos de pago:', datosPago); // Debug

      // 2. ✅ Pasar el ID del usuario al servicio
      const resultado = await servicioPagos.crearCheckoutSession(
        datosPago, 
        usuario.id // ✅ Pasar el ID del usuario aquí
      );

      // 3. Redirigir a Stripe Checkout
      window.location.href = resultado.checkout_url;

    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Error al procesar el pago: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setProcesandoPago(false);
    }
  };


  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Tu Carrito</h1>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-8 text-center transition-colors duration-300">
            <div className="text-gray-400 dark:text-zinc-600 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5.5M7 13l2.5 5.5m0 0L17 13m-7.5 5.5V21" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Agrega algunos productos increíbles para comenzar
            </p>
            <Link 
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tu Carrito
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Revisa y gestiona tus productos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg text-gray-600 dark:text-gray-300 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full">
              {contadorCarrito} {contadorCarrito === 1 ? 'artículo' : 'artículos'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Lista de productos - Ocupa 3 columnas en pantallas grandes */}
          <div className="xl:col-span-3 space-y-6">
            {/* Encabezado de la lista */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4 transition-colors duration-300">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                <div className="col-span-5">Producto</div>
                <div className="col-span-3 text-center">Cantidad</div>
                <div className="col-span-2 text-center">Precio</div>
                <div className="col-span-2 text-center">Subtotal</div>
              </div>
            </div>

            {/* Lista de productos */}
            <div className="space-y-4">
              {carrito.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4 transition-all duration-300 hover:shadow-md dark:hover:shadow-zinc-700"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Información del producto */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-4">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                          {item.imagenes && item.imagenes[0] ? (
                            <img
                              src={item.imagenes[0]}
                              alt={item.descripcion || 'Producto'}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 dark:text-gray-500 text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>

                        {/* Detalles del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                            {item.descripcion}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Código: {item.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="col-span-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="w-8 h-8 bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.cantidad <= 1}
                        >
                          <span className="text-gray-600 dark:text-gray-300 font-medium">-</span>
                        </button>
                        
                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                          {item.cantidad}
                        </span>
                        
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="w-8 h-8 bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-200"
                        >
                          <span className="text-gray-600 dark:text-gray-300 font-medium">+</span>
                        </button>
                      </div>
                    </div>

                    {/* Precio unitario */}
                    <div className="col-span-2 text-center">
                      <p className="text-gray-900 dark:text-white font-medium">
                        Bs. {item.precio || '0.00'}
                      </p>
                    </div>

                    {/* Subtotal y acciones */}
                    <div className="col-span-2 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          Bs. {((item.precio || 0) * item.cantidad).toFixed(2)}
                        </p>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors duration-200 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones del carrito */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continuar Comprando
              </Link>
              
              <button
                onClick={vaciarCarrito}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Vaciar Carrito Completo
              </button>
            </div>
          </div>

          {/* Resumen del pedido - Ocupa 1 columna en pantallas grandes */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6 sticky top-8 transition-colors duration-300">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Resumen del Pedido
              </h2>
              
              {/* Detalles del resumen */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({contadorCarrito} items):</span>
                  <span className="font-medium">Bs. {calcularTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Envío:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Gratis</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Impuestos:</span>
                  <span className="font-medium">Bs. 0.00</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-zinc-600 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">Bs. {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <Button onClick={ProcederPago} className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold">
                  Proceder al Pago
                </Button>
                
                <button className="w-full border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-200">
                  Guardar para después
                </button>
              </div>

              {/* Información adicional */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                  🚚 Envío gratis en pedidos superiores a Bs. 100
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}