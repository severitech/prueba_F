// components/login-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { DatosLogin } from "@/interface/auth"
import { useAutenticacion } from "@/hooks/useAuth"

export function LoginForm() {
  const [formData, setFormData] = useState<DatosLogin>({
    email: "admin@example.com", 
    password: "password123"
  })
  const [error, setError] = useState("")
  const { iniciarSesion, cargando } = useAutenticacion()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    const result = await iniciarSesion(formData)
    
    if (result.exito) {
      router.push("/dashboard")
    } else {
      console.log('❌ Error en login:', result.mensaje)
      setError(result.mensaje)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={cargando}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="password123"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={cargando}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        {/* Datos de prueba para desarrollo */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Datos de prueba:</p>
          <p className="text-xs">Email: admin@example.com</p>
          <p className="text-xs">Password: password123</p>
        </div>
      </CardContent>
    </Card>
  )
}