
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RegisterForm } from "./components/Formulario_Registrar"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/dist/client/link"
import { LoginForm } from "./components/Formulario_Inicio_Sesion"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute top-6 left-6">
       <Link href={'/'}><Button className="cursor-pointer"><ArrowLeftIcon/> Volver al Inicio</Button></Link>
      </div>
      <div className="w-full max-w-lg">
        <div className="flex mb-6 bg-muted rounded-lg p-1">
          <Button
            variant={isLogin ? "default" : "ghost"}
            className={`flex-1 ${isLogin ? "" : "text-muted-foreground"}`}
            onClick={() => setIsLogin(true)}
          >
            Iniciar Sesión
          </Button>
          <Button
            variant={!isLogin ? "default" : "ghost"}
            className={`flex-1 ${!isLogin ? "" : "text-muted-foreground"}`}
            onClick={() => setIsLogin(false)}
          >
            Registrarse
          </Button>
        </div>
        <div className="relative min-h-[450px]">
          <div className={`absolute inset-0 transition-all duration-300 ${isLogin ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <LoginForm />
          </div>
          <div className={`absolute inset-0 transition-all duration-300 ${!isLogin ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}