import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad — Candidatic Knowledge",
  description: "Política de privacidad de la aplicación Candidatic Knowledge",
}

export default function PrivacyPage() {
  return (
    <main style={{
      maxWidth: 720,
      margin: "0 auto",
      padding: "48px 24px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#1e1b4b",
      lineHeight: 1.7,
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: "#7c3aed" }}>
        Política de Privacidad
      </h1>
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>
        Última actualización: Mayo 2026
      </p>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>1. Información que recopilamos</h2>
        <p>
          <strong>Candidatic Knowledge</strong> (&quot;la App&quot;) recopila la siguiente información cuando
          creas una cuenta y usas nuestros servicios:
        </p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Nombre completo</li>
          <li>Número de teléfono</li>
          <li>Correo electrónico (si se proporciona)</li>
          <li>Foto de perfil (opcional, subida voluntariamente)</li>
          <li>Progreso de aprendizaje: lecciones completadas, XP, rachas y logros</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>2. Cómo usamos tu información</h2>
        <p>Usamos la información recopilada exclusivamente para:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Autenticar tu acceso a la plataforma</li>
          <li>Mostrar tu progreso de aprendizaje y estadísticas</li>
          <li>Generar el ranking de estudiantes dentro de tu organización</li>
          <li>Mejorar la experiencia educativa</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>3. Compartición de datos</h2>
        <p>
          <strong>No vendemos ni compartimos tu información personal con terceros.</strong> Tu
          información solo es accesible por los administradores de tu organización educativa y se
          utiliza únicamente dentro del contexto de la plataforma de aprendizaje.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>4. Almacenamiento y seguridad</h2>
        <p>
          Tus datos se almacenan de forma segura en servidores protegidos (Vercel, Neon Database).
          Las contraseñas se almacenan cifradas con hashing bcrypt. Las sesiones se manejan con
          tokens JWT firmados. Utilizamos HTTPS para todas las comunicaciones.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>5. Fotos y permisos del dispositivo</h2>
        <p>
          La App solicita acceso a tu galería de fotos <strong>únicamente</strong> cuando decides
          cambiar tu foto de perfil. No accedemos a tus fotos sin tu consentimiento explícito.
          No se accede a la cámara, micrófono, ubicación ni contactos.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>6. Derechos del usuario</h2>
        <p>Tienes derecho a:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Solicitar acceso a tus datos personales</li>
          <li>Solicitar la corrección de datos inexactos</li>
          <li>Solicitar la eliminación de tu cuenta y datos asociados</li>
        </ul>
        <p style={{ marginTop: 8 }}>
          Para ejercer estos derechos, contacta a tu administrador o escríbenos directamente.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>7. Menores de edad</h2>
        <p>
          La App está diseñada para usuarios de todas las edades dentro de un entorno educativo
          supervisado. No recopilamos intencionalmente información de menores de 13 años sin el
          consentimiento de un padre, tutor o institución educativa responsable.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>8. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política de privacidad periódicamente. Te notificaremos de
          cualquier cambio significativo a través de la App.
        </p>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>9. Contacto</h2>
        <p>
          Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
        </p>
        <p style={{ marginTop: 8, fontWeight: 600, color: "#7c3aed" }}>
          soporte@candidatic.com
        </p>
      </section>

      <footer style={{
        borderTop: "1px solid #e2e8f0",
        paddingTop: 20,
        marginTop: 40,
        fontSize: 13,
        color: "#94a3b8",
        textAlign: "center",
      }}>
        © {new Date().getFullYear()} Candidatic. Todos los derechos reservados.
      </footer>
    </main>
  )
}
