import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateJWTToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("session_token")?.value

    if (!token) {
      return NextResponse.json({ loggedIn: false })
    }

    const payload = await validateJWTToken(token)

    if (!payload) {
      return NextResponse.json({ loggedIn: false })
    }

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: payload.id_usuario,
        email: payload.email,
        rol: payload.rol,
        empresa_id: payload.empresa_id,
      },
    })
  } catch (error) {
    console.error("Error validando sesión:", error)
    return NextResponse.json({ loggedIn: false })
  }
}
