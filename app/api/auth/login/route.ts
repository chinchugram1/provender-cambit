import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateCredentials, createJWTToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Validar credenciales contra Supabase
    const user = await validateCredentials(email, password)

    if (!user) {
      return NextResponse.json({ success: false, message: "Credenciales inválidas" }, { status: 401 })
    }

    // Crear JWT token
    const token = await createJWTToken(user)

    // Configurar cookie HttpOnly
    const cookieStore = cookies()
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 1 día
    })

    // Determinar URL de redirección según el rol
    let redirectUrl = "/proveedor/dashboard"
    if (user.rol === "cliente") {
      redirectUrl = "/cliente/dashboard"
    } else if (user.rol === "transportista") {
      redirectUrl = "/transportista/ruta"
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        empresa_id: user.empresa_id,
        empresa_nombre: user.empresa_nombre,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
