// app/pago-exitoso/page.tsx
"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { servicioPagos } from '@/api/carrito.service';

interface DatosPagoExitoso {
  pago_exitoso: boolean;
  venta_id?: number;
  pago_id?: number;
  total?: number;
  cliente_email?: string;
  cliente_nombre?: string;
  fecha?: string;
  mensaje?: string;
}

export default function PagoExitoso() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ContenidoPagoExitoso />
    </Suspense>
  );
}

function ContenidoPagoExitoso() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  
  const [datosPago, setDatosPago] = useState<DatosPagoExitoso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verificarPago = async () => {
      if (!sessionId) {
        setError('No se encontró información de la sesión de pago');
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        const resultado = await servicioPagos.verificarPago(sessionId);
        setDatosPago(resultado);

        // Si el pago fue exitoso, puedes limpiar el carrito
        if (resultado.pago_exitoso) {
          // Opcional: Limpiar carrito localStorage
          localStorage.removeItem('carrito_mi_tienda');
          
          // Opcional: Enviar evento para limpiar contexto del carrito
          window.dispatchEvent(new Event('carritoLimpiado'));
        }

      } catch (err) {
        console.error('Error verificando pago:', err);
        setError(err instanceof Error ? err.message : 'Error al verificar el pago');
      } finally {
        setCargando(false);
      }
    };

    verificarPago();
  }, [sessionId]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Verificando tu pago...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos confirmando el estado de tu transacción
          </p>
        </div>
      </div>
    );
  }

  if (error || !datosPago?.pago_exitoso) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Ups! Algo salió mal
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'No pudimos confirmar tu pago. Por favor, intenta nuevamente.'}
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/carrito')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Volver al Carrito
            </Button>
            
            <a href={"/"} className="block w-full">
              <Button variant="outline" className="w-full">
                Continuar Comprando
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Icono de éxito */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            Tu pedido ha sido procesado correctamente
          </p>
        </div>

        {/* Detalles del pedido */}
        <div className="bg-gray-50 dark:bg-zinc-700/30 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Resumen de tu compra
          </h3>
          
          <div className="space-y-2 text-sm">
            {datosPago.venta_id && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">N° de Pedido:</span>
                <span className="font-medium text-gray-900 dark:text-white">#{datosPago.venta_id}</span>
              </div>
            )}
            
            {datosPago.pago_id && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">N° de Pago:</span>
                <span className="font-medium text-gray-900 dark:text-white">#{datosPago.pago_id}</span>
              </div>
            )}
            
            {datosPago.total && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total pagado:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  Bs. {datosPago.total.toFixed(2)}
                </span>
              </div>
            )}
            
            {datosPago.fecha && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(datosPago.fecha).toLocaleDateString('es-BO')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Información del cliente */}
        {(datosPago.cliente_email || datosPago.cliente_nombre) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Información de contacto
            </h3>
            
            <div className="space-y-1 text-sm">
              {datosPago.cliente_nombre && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Nombre:</span> {datosPago.cliente_nombre}
                </p>
              )}
              
              {datosPago.cliente_email && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Email:</span> {datosPago.cliente_email}
                </p>
              )}
            </div>
            
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
              📧 Te enviaremos un correo con los detalles de tu pedido
            </p>
          </div>
        )}

        {/* Próximos pasos */}
        <div className="border-t border-gray-200 dark:border-zinc-600 pt-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            ¿Qué sigue?
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5 shrink-0">
                1
              </span>
              <span>Recibirás un email de confirmación</span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5 shrink-0">
                2
              </span>
              <span>Procesaremos y prepararemos tu pedido</span>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5 shrink-0">
                3
              </span>
              <span>Te notificaremos cuando sea enviado</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <a href={"/mis-pedidos"} className="block w-full">
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
              Ver Mis Pedidos
            </Button>
          </a>
          
          <a href={"/"} className="block w-full">
            <Button variant="outline" className="w-full">
              Seguir Comprando
            </Button>
          </a>
          
          <div className="text-center">
            <a 
              href={"/contacto"} 
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ¿Tienes preguntas? Contáctanos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}