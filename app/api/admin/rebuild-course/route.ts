import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const maxDuration = 60

const COURSE_TITLE = "Reclutamiento Digital y Social Recruiting"

// ─── Complete expert-level course data ──────────────────────────────────────
const MODULES = [
  {
    title: "Social Recruiting y Employer Branding",
    lessons: [
      {
        title: "Fundamentos del Social Recruiting",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `El Social Recruiting es la integración estratégica de las redes sociales en el ciclo completo de atracción de talento. A diferencia del reclutamiento tradicional —reactivo y transaccional—, el Social Recruiting construye presencia y reputación de forma continua, logrando que el talento llegue a la empresa en lugar de que la empresa lo persiga.

La marca empleadora (Employer Branding) es el activo central del Social Recruiting. Representa la percepción que tienen los candidatos actuales y potenciales sobre la organización como lugar de trabajo. Una marca empleadora sólida reduce el costo por contratación hasta un 50% y aumenta la retención en un 28% (LinkedIn Global Talent Trends). Se construye con tres pilares: autenticidad (mostrar la cultura real, no la idealizada), consistencia (mismo mensaje en todos los canales) y relevancia (contenido alineado con los valores de los candidatos objetivo).

El Inbound Recruiting es la metodología que transforma el proceso: en lugar de buscar candidatos, se crean las condiciones para que ellos lleguen. El funnel de Inbound contempla cuatro etapas: Atracción (contenido de valor que genera visibilidad), Conversión (el candidato deja sus datos o aplica), Cierre (proceso de selección ágil y positivo) y Fidelización (experiencia del candidato que genera embajadores). Esta metodología exige publicar contenido educativo, testimonios auténticos de empleados, cultura organizacional y proyectos de impacto.

El análisis del comportamiento digital de los candidatos permite una segmentación precisa. Herramientas como LinkedIn Analytics, Meta Ads Manager y Google Analytics revelan en qué plataformas consumen contenido los perfiles objetivo, qué formatos prefieren (video corto, carrusel, artículo), en qué horarios son más activos y qué mensajes generan mayor engagement. Esta inteligencia permite optimizar presupuesto y esfuerzo con precisión quirúrgica.

La Propuesta de Valor al Candidato (EVP: Employee Value Proposition) es el mensaje que resume por qué vale la pena trabajar en la organización. Un EVP poderoso articula beneficios tangibles (salario, flexibilidad, prestaciones), oportunidades de crecimiento, cultura y propósito. Debe diferenciarse de la competencia y resonar emocionalmente con el candidato objetivo. La Candidate Experience —medida con NPS del candidato— garantiza que incluso quien no es contratado se convierta en embajador de la marca.`,
      },
      {
        title: "Estrategias Avanzadas de Inbound Recruiting y Employer Branding",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `Implementar una estrategia de Inbound Recruiting exitosa requiere integrar múltiples palancas de atracción de forma coordinada. El primer paso es realizar un diagnóstico de marca empleadora: auditar las reseñas en Glassdoor y LinkedIn, analizar el NPS interno, identificar los atributos diferenciadores reales versus los percibidos, y mapear la competencia en términos de propuesta de valor.

La arquitectura de contenido para Social Recruiting debe planificarse con propósito. El contenido se divide en tres categorías según su función: contenido de atracción (cultura, behind-the-scenes, días típicos en la empresa), contenido de conversión (vacantes bien elaboradas, testimonios de empleados, procesos de selección transparentes) y contenido de fidelización (logros del equipo, crecimiento interno, impacto organizacional). La regla de oro es el balance 70-20-10: 70% contenido de valor, 20% cultura y marca empleadora, 10% vacantes directas.

Los Employee Generated Content (EGC) representan la herramienta más poderosa y menos costosa del Employer Branding. Los candidatos confían 3 veces más en contenido generado por empleados que en mensajes corporativos oficiales. Un programa de embajadores bien estructurado incluye: capacitación en personal branding para empleados, guías de contenido que preserven la autenticidad, mecanismos de reconocimiento interno y métricas de impacto compartidas con los participantes.

La segmentación de audiencias en Social Recruiting permite personalizar mensajes para diferentes perfiles. Una campaña dirigida a ingenieros senior tendrá tonalidad, plataforma y argumentos distintos a una campaña para perfiles comerciales junior. LinkedIn es ideal para perfiles técnicos y gerenciales; Instagram y TikTok para perfiles creativos y generación Z; Facebook para perfiles operativos y de experiencia mixta. Cada canal requiere adaptación de formato, tono y llamadas a la acción.

La medición continua es indispensable. Los KPIs esenciales del Social Recruiting incluyen: alcance orgánico de publicaciones de employer branding, tasa de conversión de visitante a candidato en la página de careers, calidad de los candidatos por fuente (porcentaje que pasan a entrevista), costo por candidato calificado por canal, NPS del candidato al final del proceso y tasa de aceptación de ofertas. Sin datos no hay optimización posible.`,
        quiz: [
          {
            question: "Una empresa tiene alta visibilidad en redes sociales pero muy baja tasa de conversión de candidatos. ¿Cuál es la causa más probable y la solución estratégica correcta?",
            options: [
              "El presupuesto en paid media es insuficiente; la solución es duplicar la inversión publicitaria en LinkedIn",
              "El EVP no está claramente diferenciado ni articulado en los puntos de contacto clave; la solución es rediseñar la propuesta de valor y optimizar la experiencia en la página de careers",
              "Las vacantes están mal redactadas; la solución es contratar un copywriter especializado en job descriptions",
              "La empresa no tiene presencia en suficientes plataformas; la solución es abrir perfiles en todas las redes disponibles"
            ],
            correctIndex: 1,
            explanation: "Alta visibilidad + baja conversión indica que los candidatos llegan pero no encuentran razón suficiente para dar el siguiente paso. El problema es de propuesta de valor (EVP) y experiencia de candidato, no de alcance. Más inversión sin optimizar el mensaje y la página de careers solo amplifica el problema."
          },
          {
            question: "¿Cuál de las siguientes métricas es más relevante para evaluar el ROI del Employer Branding a largo plazo?",
            options: [
              "Número de seguidores en la página corporativa de LinkedIn",
              "Costo por candidato calificado por canal combinado con NPS del candidato y tasa de retención a 12 meses",
              "Cantidad de vacantes publicadas por mes en cada plataforma",
              "Número de aplicaciones recibidas por vacante publicada"
            ],
            correctIndex: 1,
            explanation: "El ROI del Employer Branding se mide combinando eficiencia (costo por candidato calificado), experiencia (NPS del candidato) y resultado (retención). Métricas vanidosas como seguidores o aplicaciones brutas no reflejan calidad ni impacto financiero real."
          },
          {
            question: "En el modelo de Inbound Recruiting, un candidato lee un artículo sobre la cultura de la empresa pero no aplica ni deja sus datos. ¿En qué etapa del funnel se encuentra y qué acción debe tomar la empresa?",
            options: [
              "Está en la etapa de Cierre; la empresa debe hacer seguimiento directo por LinkedIn",
              "Está en la etapa de Atracción; la empresa debe incluir CTAs estratégicos y contenido de conversión para guiarlo al siguiente paso",
              "Está en la etapa de Fidelización; la empresa debe enviarle contenido de onboarding",
              "Está en la etapa de Conversión; la empresa debe publicar más vacantes"
            ],
            correctIndex: 1,
            explanation: "El candidato está en Atracción: consume contenido pero no da el siguiente paso. La empresa debe incluir CTAs claros ('Ver oportunidades', 'Únete al talentpool'), ofrecer contenido de conversión (webinars, descargables sobre la empresa) y optimizar el journey desde el contenido hacia la página de careers."
          },
          {
            question: "¿Por qué el Employee Generated Content (EGC) supera en efectividad a la comunicación corporativa oficial en Employer Branding?",
            options: [
              "Porque es gratuito y no requiere presupuesto de producción",
              "Porque los candidatos perciben el contenido de empleados como auténtico y creíble, generando 3 veces más confianza que mensajes corporativos",
              "Porque tiene mayor alcance orgánico en los algoritmos de LinkedIn y Meta",
              "Porque cumple requisitos legales de transparencia en comunicación organizacional"
            ],
            correctIndex: 1,
            explanation: "La efectividad del EGC radica en la credibilidad: los candidatos saben que un empleado real comparte su experiencia sin obligación corporativa. Esta autenticidad genera confianza y reduce la percepción de 'marketing disfrazado'. El alcance y el costo son beneficios secundarios."
          },
          {
            question: "Una empresa quiere implementar un programa de empleados embajadores. ¿Cuál es el error más común que debe evitar para garantizar el éxito del programa?",
            options: [
              "Seleccionar empleados de múltiples áreas y niveles jerárquicos",
              "Capacitar a los empleados en personal branding antes de iniciar",
              "Proporcionar guías de contenido que eliminen la espontaneidad y conviertan las publicaciones en mensajes corporativos disfrazados",
              "Medir el impacto del programa con métricas de alcance y engagement"
            ],
            correctIndex: 2,
            explanation: "El error crítico es destruir la autenticidad que hace valioso al programa. Las guías deben inspirar y facilitar, no dictar. Si los empleados sienten que están publicando mensajes de la empresa, el contenido pierde credibilidad. Las guías deben cubrir valores, temas relevantes y formato, dejando la voz personal intacta."
          }
        ]
      }
    ]
  },
  {
    title: "Multiposting y Fuentes Digitales",
    lessons: [
      {
        title: "Estrategia de Multiposting y Clasificación de Fuentes",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `El Multiposting es la práctica de publicar vacantes simultáneamente en múltiples canales digitales con mensajes adaptados a cada plataforma. Su objetivo no es simplemente multiplicar el alcance, sino posicionar la vacante donde se encuentran los candidatos correctos con el mensaje adecuado para cada contexto.

Las fuentes digitales de reclutamiento se clasifican en cuatro categorías según su naturaleza y comportamiento: Bolsas de trabajo generalistas (OCC, Computrabajo, Indeed), que ofrecen volumen masivo pero menor segmentación; Redes profesionales (LinkedIn, Xing), que permiten targeting preciso por experiencia, industria y habilidades; Comunidades especializadas (GitHub para tecnología, Behance para creativos, Dribbble para diseñadores), donde se encuentran perfiles activos en su disciplina; y Referidos digitales, que aprovechan las redes de los empleados actuales para acceder a candidatos pasivos de alta calidad.

La adaptación del mensaje por canal es un principio fundamental del Multiposting efectivo. Una vacante no puede publicarse idéntica en LinkedIn y en TikTok. LinkedIn demanda tono profesional, descripción detallada de responsabilidades y requisitos, y énfasis en crecimiento y beneficios. Instagram requiere formato visual, tono aspiracional y mensaje conciso. TikTok premia la autenticidad, el humor contextual y el video corto de menos de 60 segundos. Cada plataforma tiene su propio lenguaje y expectativas de audiencia.

El enfoque omnicanal va más allá del multiposting: busca que la experiencia del candidato sea coherente e integrada sin importar por qué canal llegó. Esto implica que el tracking de origen esté implementado (UTMs en URLs), que la landing page de aplicación sea consistente con el mensaje del canal de origen, y que el proceso posterior (respuesta, entrevistas, comunicación) sea igualmente ágil y positivo.

La clasificación de fuentes por efectividad debe hacerse con datos propios, no con supuestos del mercado. Los indicadores clave son: costo por aplicación por fuente, porcentaje de candidatos de cada fuente que avanzan a entrevista, tiempo promedio hasta contratación por fuente, y calidad post-contratación (retención a 90 días, desempeño en evaluaciones). Esta información permite invertir más en las fuentes de mayor retorno y eliminar las que generan volumen pero no calidad.`,
      },
      {
        title: "Optimización Avanzada del Multiposting y Fuentes Digitales",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `Optimizar el Multiposting requiere un sistema de medición robusto y un proceso iterativo de prueba y aprendizaje. El primer paso es implementar parámetros UTM en todos los enlaces de vacantes publicados en canales digitales: esto permite identificar exactamente qué fuente, medio y campaña generó cada aplicación y cada contratación, conectando el esfuerzo de reclutamiento con resultados concretos.

La estrategia de publicación debe considerar el timing por plataforma. En LinkedIn, los martes y miércoles entre 8-10am tienen mayor visibilidad orgánica. En Instagram, los domingos por la tarde registran mayor engagement. En bolsas de trabajo, renovar la publicación cada 7 días mantiene el posicionamiento en los resultados de búsqueda. Este conocimiento táctico, combinado con los datos propios, permite maximizar el alcance sin incrementar el presupuesto.

La diferenciación de la vacante es crítica en un entorno saturado. Estudios muestran que los candidatos deciden si leer o ignorar una vacante en menos de 8 segundos. Los elementos que generan mayor atención son: título del puesto claro y específico (sin jerga interna), rango salarial visible (las vacantes con salario publicado reciben 30% más aplicaciones), lista de beneficios concretos en los primeros párrafos, y descripción del impacto real del puesto en lugar de listados genéricos de responsabilidades.

El pipeline de multiposting debe integrarse con el ATS (Applicant Tracking System) para centralizar todos los candidatos independientemente de su origen. Sin esta integración, la gestión de múltiples canales genera ineficiencias operativas, duplicados y pérdida de candidatos calificados. Las integraciones nativas con plataformas como LinkedIn, Indeed y OCC son estándar en la mayoría de los ATS modernos.

La revisión mensual del mix de fuentes es una práctica esencial. El mercado laboral digital cambia: plataformas emergentes (como TikTok Jobs) pueden ofrecer ventajas competitivas antes de que todos los reclutadores las adopten. Los early adopters de nuevas fuentes digitales de reclutamiento acceden a candidatos con menor competencia y costos más bajos, generando ventaja estratégica temporal.`,
        quiz: [
          {
            question: "Una empresa publica la misma descripción de vacante sin modificaciones en LinkedIn, OCC e Instagram. ¿Cuál es el impacto más significativo de esta práctica?",
            options: [
              "Reduce el tiempo de publicación pero no afecta la calidad de candidatos",
              "Genera inconsistencia de marca pero aumenta el alcance total",
              "Produce mensajes que no resuenan con la audiencia de cada plataforma, reduciendo la tasa de conversión y la calidad de candidatos",
              "Es la práctica estándar de la industria y no representa un problema"
            ],
            correctIndex: 2,
            explanation: "Cada plataforma tiene una audiencia con expectativas, formato y tono distintos. Un mensaje genérico no habla el lenguaje de ninguna comunidad específica. El resultado es menor engagement, menor tasa de aplicación y candidatos de menor alineación con el perfil buscado."
          },
          {
            question: "¿Cuál es el indicador más valioso para evaluar la efectividad real de una fuente digital de reclutamiento?",
            options: [
              "Número total de aplicaciones recibidas por esa fuente",
              "Costo por aplicación de esa fuente",
              "Porcentaje de candidatos de esa fuente que son contratados y su retención a 90 días",
              "Alcance y visibilidad de las publicaciones en esa plataforma"
            ],
            correctIndex: 2,
            explanation: "La efectividad real de una fuente se mide en calidad, no en cantidad. Una fuente que genera 100 aplicaciones pero 0 contrataciones tiene efectividad cero. La retención a 90 días agrega la dimensión de calidad post-contratación, que es el indicador de alineación real entre el perfil de la fuente y las necesidades de la empresa."
          },
          {
            question: "¿Para qué sirven los parámetros UTM en una estrategia de multiposting?",
            options: [
              "Para mejorar el posicionamiento SEO de las vacantes en buscadores",
              "Para rastrear exactamente qué canal, campaña y publicación originó cada aplicación y contratación",
              "Para cumplir con regulaciones de privacidad en el tratamiento de datos de candidatos",
              "Para automatizar la publicación de vacantes en múltiples plataformas simultáneamente"
            ],
            correctIndex: 1,
            explanation: "Los UTMs son parámetros añadidos a las URLs que permiten a Google Analytics y al ATS identificar el origen exacto de cada candidato. Sin UTMs, todos los candidatos que llegan por diferentes canales digitales aparecen como 'Direct' o 'Organic', haciendo imposible medir el ROI de cada fuente."
          },
          {
            question: "Una empresa observa que LinkedIn genera candidatos de alta calidad pero con un costo por contratación 4 veces mayor que OCC. ¿Qué decisión estratégica es la más correcta?",
            options: [
              "Abandonar LinkedIn y concentrar todo el presupuesto en OCC para maximizar el volumen de candidatos",
              "Mantener LinkedIn para puestos de alta especialización donde la calidad justifica el costo y OCC para perfiles de mayor volumen",
              "Publicar en ambas plataformas exactamente el mismo presupuesto independientemente de los resultados",
              "Eliminar ambas plataformas y apostar únicamente por referidos internos"
            ],
            correctIndex: 1,
            explanation: "La decisión estratégica correcta es la segmentación por perfil y por costo-beneficio. LinkedIn tiene mayor costo pero accede a candidatos pasivos altamente calificados, ideal para puestos especializados. OCC ofrece mayor volumen a menor costo, ideal para perfiles de alta demanda. Optimizar el mix según el perfil buscado maximiza el ROI global."
          },
          {
            question: "¿Por qué publicar el rango salarial en una vacante aumenta significativamente la tasa de aplicaciones?",
            options: [
              "Porque obliga legalmente a las empresas a respetar el rango publicado",
              "Porque elimina la ambigüedad y permite al candidato autofiltrase, generando aplicaciones de mayor alineación económica y reduciendo el tiempo del proceso",
              "Porque mejora el posicionamiento de la vacante en los algoritmos de las bolsas de trabajo",
              "Porque demuestra que la empresa tiene recursos financieros sólidos"
            ],
            correctIndex: 1,
            explanation: "La transparencia salarial genera dos beneficios: atrae candidatos con expectativas alineadas (eliminando fricciones tardías en el proceso) y aumenta la confianza en la marca empleadora. El 30% de incremento en aplicaciones se debe a que candidatos calificados que normalmente no aplicarían por incertidumbre económica se animan al ver un rango claro."
          }
        ]
      }
    ]
  },
  {
    title: "Candidato Persona",
    lessons: [
      {
        title: "Construcción del Candidato Persona",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `El Candidato Persona es un perfil semi-ficticio del candidato ideal construido a partir de datos reales: análisis de los mejores empleados actuales, investigación de mercado laboral, entrevistas con hiring managers y datos de comportamiento digital. No es una lista de requisitos de un job description; es una representación humana y tridimensional que guía cada decisión de comunicación y atracción.

El proceso de construcción del Candidato Persona comienza con el análisis interno: ¿Quiénes son los mejores performers en ese rol? ¿Qué tienen en común en términos de trayectoria, motivaciones, forma de trabajar y valores? Las entrevistas con empleados exitosos revelan insights cualitativos invaluables: dónde buscan información, qué los hizo cambiar de trabajo, qué valoran de su empleador actual, qué los frustraría.

La estructura de un Candidato Persona completo incluye: perfil demográfico y profesional (edad aproximada, experiencia, formación, industrias previas), motivaciones (qué lo mueve a cambiar de trabajo: crecimiento, propósito, compensación, balance), barreras (qué lo haría rechazar una oferta o no aplicar), canales de información (dónde se informa sobre oportunidades laborales), y lenguaje (qué palabras usa para describir su trabajo y sus aspiraciones).

El Candidato Persona permite tomar decisiones estratégicas de canal: si el perfil objetivo no está activamente buscando trabajo (candidato pasivo), LinkedIn Recruiter y programas de referidos son más efectivos que bolsas de trabajo. Si el perfil es recién egresado, Instagram, TikTok y ferias universitarias son más relevantes que LinkedIn. La alineación entre perfil y canal determina la eficiencia de la inversión en atracción.

La comunicación personalizada basada en el Candidato Persona genera mayor conversión. El tono, los argumentos, los beneficios destacados y el formato del mensaje deben resonar con las motivaciones y el lenguaje específico del perfil objetivo. Un mensaje genérico que habla a todos no persuade a nadie; un mensaje que parece escrito directamente para el candidato ideal genera identificación y acción.`,
      },
      {
        title: "Aplicación Estratégica del Candidato Persona",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `La validación del Candidato Persona es un proceso continuo que requiere actualización periódica. El mercado laboral evoluciona: las expectativas de la generación Z son distintas a las de los millennials, las condiciones post-pandemia transformaron las prioridades (flexibilidad, trabajo remoto, bienestar mental), y la competencia por ciertos perfiles cambia constantemente. Un Candidato Persona construido hace dos años puede estar desactualizado.

La segmentación avanzada permite crear múltiples Candidatos Persona para el mismo rol cuando hay variantes significativas. Por ejemplo, para una posición de Desarrollador Full Stack pueden existir dos perfiles: el Senior con 5+ años que valora autonomía y proyectos de impacto, y el Mid-level con 2-3 años que prioriza aprendizaje y mentoría. Cada uno requiere mensajes, canales y propuestas de valor distintos.

Los datos cuantitativos del Candidato Persona provienen de múltiples fuentes: analítica del sitio web (qué secciones visitan más los candidatos antes de aplicar), datos del ATS (qué perfiles de candidatos tienen mayor tasa de conversión y retención), encuestas de exit interview (por qué los empleados se van, qué los atrajo originalmente) y benchmarking de mercado (estudios salariales, preferencias de la industria). La combinación de datos cualitativos y cuantitativos produce el Candidato Persona más preciso.

La aplicación del Candidato Persona en el copywriting de vacantes transforma los resultados. En lugar de describir lo que la empresa necesita (perspectiva interna), se escribe desde lo que el candidato gana y experimenta (perspectiva del candidato). Frases como "Buscamos candidato con 5 años de experiencia" se convierten en "Si llevas 5 años liderando proyectos y quieres impacto real, esto es para ti." Este cambio de perspectiva puede duplicar la tasa de aplicaciones en el mismo perfil.

El Candidato Persona también orienta la estrategia de contenido de largo plazo. Conocer dónde el candidato se informa, qué preguntas tiene sobre la industria y qué formato consume permite crear contenido que lo atraiga orgánicamente antes de que exista una vacante. Esta estrategia de 'talent pool warming' construye una base de candidatos interesados que puede activarse cuando surge una necesidad, reduciendo dramáticamente el tiempo de cobertura.`,
        quiz: [
          {
            question: "¿Cuál es la diferencia fundamental entre un Candidato Persona y un perfil de puesto (job description)?",
            options: [
              "El Candidato Persona incluye el rango salarial mientras el job description no",
              "El Candidato Persona es una representación humana tridimensional con motivaciones, barreras y comportamientos; el job description es una lista de requisitos técnicos desde la perspectiva de la empresa",
              "El Candidato Persona se usa solo para reclutamiento digital; el job description para reclutamiento presencial",
              "El Candidato Persona lo elabora Recursos Humanos; el job description lo elabora el área solicitante"
            ],
            correctIndex: 1,
            explanation: "El Candidato Persona va más allá de 'qué necesita la empresa' para profundizar en 'quién es la persona y qué la mueve'. Incluye psicografía (motivaciones, miedos, aspiraciones), comportamiento digital y lenguaje propio, lo que permite diseñar comunicaciones que resuenen emocionalmente, algo que ningún job description tradicional logra."
          },
          {
            question: "Una empresa recluta Diseñadores UX y descubre que sus mejores empleados en ese rol no publican en LinkedIn pero son muy activos en Behance y Dribbble. ¿Qué implica esto para la estrategia de atracción?",
            options: [
              "Que debe crear vacantes en LinkedIn de todas formas porque es la plataforma profesional más reconocida",
              "Que el Candidato Persona de Diseñador UX tiene canales de referencia específicos y la estrategia debe priorizar las plataformas donde ese perfil está activo, no donde la empresa está cómoda",
              "Que los diseñadores UX no buscan trabajo activamente y deben ser contactados por headhunters",
              "Que debe aumentar el salario ofrecido para competir en un mercado difícil"
            ],
            correctIndex: 1,
            explanation: "El Candidato Persona determina la estrategia de canal, no las preferencias internas del equipo de reclutamiento. Si el perfil objetivo vive en Behance y Dribbble, ahí debe estar la empresa. Publicar solo en LinkedIn porque 'es lo que se hace' ignora el comportamiento real del candidato y desperdicia inversión."
          },
          {
            question: "¿Por qué es crítico actualizar el Candidato Persona periódicamente y qué evento es señal de que requiere revisión urgente?",
            options: [
              "Debe actualizarse solo cuando cambia el organigrama de la empresa",
              "Las expectativas del mercado laboral evolucionan; una señal de revisión urgente es cuando la tasa de conversión de candidatos que parecen ideales cae significativamente sin cambio en el proceso",
              "Debe actualizarse cada 5 años siguiendo el ciclo de planeación estratégica",
              "Solo requiere revisión cuando se abren nuevas posiciones no existentes antes"
            ],
            correctIndex: 1,
            explanation: "El mercado laboral cambia: post-pandemia la demanda de flexibilidad se disparó, la generación Z tiene expectativas distintas de propósito y balance. Cuando el perfil que antes atraía candidatos ideales deja de funcionar, es señal de que el Candidato Persona ha quedado desactualizado respecto a las motivaciones reales del mercado actual."
          },
          {
            question: "Al escribir una vacante basada en el Candidato Persona, ¿cuál de los siguientes enfoques generará mayor tasa de aplicación?",
            options: [
              "'Requerimos profesional con maestría, 7 años de experiencia comprobable y disponibilidad inmediata'",
              "'Si llevas años resolviendo problemas complejos y quieres que tu trabajo tenga impacto real en millones de personas, esta es tu oportunidad'",
              "Listar todas las responsabilidades del puesto en orden de importancia con verbos en infinitivo",
              "Incluir el mayor número posible de requisitos para asegurar que solo apliquen los más calificados"
            ],
            correctIndex: 1,
            explanation: "El segundo enfoque habla directamente a las motivaciones del Candidato Persona (impacto, reto, propósito) y usa su propio lenguaje. Genera identificación emocional inmediata. Los requisitos excesivos inhiben a candidatos calificados que no cumplen el 100%, mientras que los mensajes aspiracionales filtran por motivación, que es un predictor de desempeño más poderoso."
          },
          {
            question: "Una empresa tiene alta tasa de aceptación de ofertas pero baja retención a 6 meses. Desde la perspectiva del Candidato Persona, ¿cuál es el diagnóstico más probable?",
            options: [
              "El proceso de onboarding necesita mejoras operativas",
              "El Candidato Persona utilizado para atracción no refleja fielmente los valores y expectativas que la empresa puede satisfacer; hay una brecha entre lo prometido en atracción y la realidad de trabajar en la empresa",
              "Los salarios ofrecidos están por debajo del mercado",
              "Los managers directos no tienen suficiente experiencia en gestión de equipos"
            ],
            correctIndex: 1,
            explanation: "Alta aceptación + baja retención indica que el candidato acepta por las razones equivocadas. El Candidato Persona que se usó para atraer y el EVP comunicado prometen una experiencia que no coincide con la realidad. La solución no es solo mejorar el onboarding, sino reconstruir el Candidato Persona desde los mejores performers reales y alinear el mensaje de atracción con la propuesta de valor auténtica."
          }
        ]
      }
    ]
  },
  {
    title: "Estrategia de Contenido y Parrilla Editorial",
    lessons: [
      {
        title: "Tipos de Contenido y Planificación Editorial",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `La estrategia de contenido en reclutamiento digital es el conjunto planificado de publicaciones que construye presencia de marca empleadora, atrae candidatos y los convierte en aplicantes. No se trata de publicar vacantes; se trata de generar un ecosistema de contenido que posicione a la empresa como un empleador deseable antes de que exista una necesidad de contratación.

Los cuatro tipos de contenido en Social Recruiting tienen funciones distintas. Contenido educativo: comparte conocimiento valioso para el candidato objetivo (tendencias de la industria, consejos de carrera, habilidades del futuro). Genera autoridad y atrae candidatos pasivos que no están buscando activamente. Contenido de cultura organizacional: muestra la realidad del trabajo en la empresa (dinámicas de equipo, proyectos, espacios, celebraciones, valores en acción). Genera autenticidad y confianza. Contenido de entretenimiento: contenido ligero, humor contextual, formatos trending adaptados a la empresa. Genera engagement y alcance orgánico. Contenido de vacantes: publicaciones directas de oportunidades disponibles. Genera conversión.

La regla del 80/20 establece que el 80% del contenido debe ser de valor (educativo, cultural, entretenimiento) y solo el 20% directamente transaccional (vacantes). Esta proporción responde al comportamiento del algoritmo (que penaliza el contenido exclusivamente publicitario) y a la psicología del candidato (que sigue cuentas que le aportan, no que solo le venden).

La parrilla de contenido o calendario editorial es la herramienta de planificación que organiza qué publicar, en qué canal, con qué formato, en qué fecha y con qué objetivo. Una parrilla efectiva contempla: frecuencia óptima por plataforma (LinkedIn: 3-5 veces por semana; Instagram: 5-7 veces por semana; TikTok: 1-3 veces por día), variedad de formatos (video, carrusel, imagen estática, texto, stories), balance entre tipos de contenido y sincronización con el calendario de necesidades de contratación.

Los pilares de contenido simplifican la planificación. Son 3-5 categorías temáticas que definen el universo de lo que la empresa publica. Ejemplos: Cultura y Equipo, Conocimiento del Sector, Oportunidades de Carrera, Impacto y Proyectos, Beneficios y Vida Laboral. Cada publicación pertenece a un pilar, garantizando variedad y coherencia al mismo tiempo.`,
      },
      {
        title: "Diseño Avanzado de Estrategia de Contenido para Atracción de Talento",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `El contenido de alto rendimiento en reclutamiento digital comparte características específicas que lo distinguen del contenido promedio. En LinkedIn, los posts de texto largo (1,300-1,500 caracteres) con gancho poderoso en la primera línea superan en alcance a los posts cortos. En Instagram, los carruseles con valor educativo generan 3 veces más guardados que las imágenes simples. En TikTok, los videos con los primeros 3 segundos de alto impacto visual o emocional tienen 70% más de probabilidades de ser vistos hasta el final.

La estrategia de contenido basada en datos requiere establecer métricas claras por tipo de contenido: alcance orgánico promedio, tasa de engagement (likes + comentarios + compartidos / alcance), tasa de clics a la página de careers o vacante, y conversión de visita a aplicación. Estos datos permiten identificar qué formatos, qué temas y qué tonos resuenan mejor con la audiencia objetivo, orientando la inversión de tiempo y recursos hacia el contenido de mayor retorno.

El contenido de empleados como protagonistas es la táctica de más alto impacto. Un video de 60 segundos donde un empleado describe su día típico genera más engagement y confianza que cualquier campaña de employer branding producida profesionalmente. Las series de contenido (ej: "Un día en [empresa]", "De donde vengo a donde estoy", "Mi equipo me sorprende porque...") crean expectativa y fidelización en la audiencia.

La reutilización estratégica de contenido (content repurposing) multiplica el alcance sin multiplicar el esfuerzo. Un artículo largo sobre cultura de la empresa puede generar: 5 posts de LinkedIn con diferentes ángulos del mismo tema, 1 carrusel de Instagram con los puntos clave, 3 stories con preguntas de reflexión, 1 video corto con el CEO respondiendo la pregunta central. El mismo contenido, adaptado a cada formato y plataforma, llega a diferentes audiencias y refuerza el mensaje.

La sincronización de la parrilla con el ciclo de contratación es un factor de eficiencia crítico. En los meses de alta demanda de contratación, incrementar el contenido de conversión (vacantes, testimonios de proceso de selección, beneficios concretos) y reducir el de awareness. En períodos de baja contratación, invertir en contenido de cultura y educativo que construya el pipeline para cuando llegue la demanda.`,
        quiz: [
          {
            question: "Una empresa publica principalmente vacantes en sus redes sociales (90% del contenido). ¿Cuál es el impacto más significativo de esta práctica?",
            options: [
              "Maximiza las aplicaciones porque mantiene las oportunidades siempre visibles",
              "El algoritmo penaliza el contenido exclusivamente transaccional reduciendo el alcance orgánico, y los candidatos dejan de seguir la cuenta porque no reciben valor",
              "Es la práctica correcta porque las redes sociales son para comunicar oportunidades laborales",
              "Genera mayor volumen de aplicaciones de candidatos pasivos que de otra forma no aplicarían"
            ],
            correctIndex: 1,
            explanation: "El 90% de vacantes destruye la estrategia por dos razones: el algoritmo de Meta, LinkedIn y TikTok reduce el alcance del contenido percibido como publicidad pura, y los candidatos dejan de seguir cuentas que solo 'les venden'. La regla 80/20 existe precisamente para generar un ecosistema donde el candidato viene por el valor y se convierte en aplicante de forma natural."
          },
          {
            question: "¿Cuál de los siguientes formatos de contenido genera mayor engagement sostenido en LinkedIn para Employer Branding?",
            options: [
              "Imágenes corporativas de alta producción con el logo de la empresa prominente",
              "Posts de texto largo (1,300+ caracteres) con gancho poderoso en la primera línea, perspectiva personal y llamada a comentar",
              "Infografías con estadísticas de la industria compartidas sin contexto adicional",
              "Publicaciones automáticas de vacantes desde el ATS con descripción completa del puesto"
            ],
            correctIndex: 1,
            explanation: "LinkedIn es una red de conversaciones profesionales. Los posts de texto largo que abren con una pregunta provocadora, una historia o un dato sorprendente, y que invitan a la conversación, generan mayor alcance orgánico porque los comentarios amplifican la distribución. Las imágenes corporativas perfectas generan poco engagement porque parecen publicidad."
          },
          {
            question: "¿Qué es el content repurposing y por qué es estratégicamente valioso en una estrategia de reclutamiento con recursos limitados?",
            options: [
              "Reutilizar el mismo post copiándolo en múltiples plataformas sin cambios, ahorrando tiempo de producción",
              "Transformar un contenido en múltiples formatos y perspectivas adaptados a cada plataforma, multiplicando el alcance sin multiplicar el esfuerzo de creación",
              "Comprar contenido de terceros y publicarlo con la marca de la empresa",
              "Programar el mismo contenido para publicarse automáticamente a diferentes horas del día"
            ],
            correctIndex: 1,
            explanation: "El repurposing inteligente reconoce que diferentes audiencias en diferentes plataformas consumen formatos distintos. Un testimonio de empleado puede ser video en TikTok, cita textual en LinkedIn, historia visual en Instagram y fragmento de podcast en Spotify. Adaptar el formato (no copiar y pegar) multiplica el alcance sin reinventar el contenido."
          },
          {
            question: "Una empresa tiene 3 reclutadores con capacidad de producir 5 piezas de contenido por semana en total. ¿Cuál es la estrategia de distribución más efectiva?",
            options: [
              "Distribuir las 5 piezas equitativamente entre las 5 plataformas donde tiene presencia (1 por plataforma)",
              "Concentrar las 5 piezas en LinkedIn porque es la plataforma profesional más relevante",
              "Identificar las 2 plataformas donde está el Candidato Persona objetivo, producir contenido de alta calidad adaptado a cada una, y descartar las demás hasta tener más capacidad",
              "Publicar las mismas 5 piezas en todas las plataformas simultáneamente para maximizar el alcance"
            ],
            correctIndex: 2,
            explanation: "Con recursos limitados, la concentración de esfuerzo supera a la dispersión. 5 piezas de alta calidad en 2 plataformas clave generan más impacto que 1 pieza mediocre en 5 plataformas. La calidad y la consistencia en los canales correctos construyen audiencia fiel; la dispersión genera presencia superficial en todas partes sin profundidad en ninguna."
          },
          {
            question: "¿Cómo debe ajustarse la parrilla de contenido durante un período de alta demanda de contratación versus un período sin vacantes activas?",
            options: [
              "En ambos períodos debe mantenerse exactamente el mismo mix de contenido para garantizar consistencia de marca",
              "En alta demanda: incrementar contenido de conversión (vacantes, proceso de selección, beneficios concretos); en período sin vacantes: invertir en contenido educativo y de cultura que construya pipeline y audiencia para el siguiente pico",
              "En alta demanda: pausar toda la producción de contenido para enfocarse en la operación de selección; en período sin vacantes: publicar solo cuando hay algo importante que comunicar",
              "En alta demanda: publicar únicamente vacantes; en período sin vacantes: publicar únicamente contenido de cultura"
            ],
            correctIndex: 1,
            explanation: "La parrilla debe ser dinámica y alineada con los objetivos de negocio. En picos de contratación, la conversión es prioritaria: más vacantes bien elaboradas, testimonios de candidatos contratados, contenido que responda las preguntas del proceso. En períodos tranquilos, se construye el activo más valioso: una audiencia de candidatos calificados que ya conoce y valora la marca empleadora."
          }
        ]
      }
    ]
  },
  {
    title: "Storytelling y Creación de Contenido con IA",
    lessons: [
      {
        title: "Storytelling para Reclutamiento, Copy e Imágenes con IA",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `El Storytelling es la técnica de comunicación más poderosa disponible para el reclutador digital. El cerebro humano procesa las historias de forma fundamentalmente distinta a los datos: una historia activa múltiples regiones cerebrales simultáneamente (incluidas las emocionales), genera oxitocina —la hormona de la empatía y la confianza— y tiene una tasa de retención 22 veces superior a los hechos presentados sin narrativa.

La estructura narrativa clásica aplicada al reclutamiento sigue el esquema Problema-Desarrollo-Solución. En términos de employer branding: el Problema es el reto profesional que enfrenta el candidato (trabajo sin propósito, sin crecimiento, sin impacto real); el Desarrollo es el journey de superación (la empresa, el equipo, los proyectos que cambian las reglas); la Solución es el estado deseable al que el candidato puede llegar. Esta estructura convierte un mensaje de vacante en una propuesta de transformación personal.

Los formatos de storytelling más efectivos en reclutamiento digital son: historias de trayectoria de empleados ("De practicante a líder de producto en 3 años"), desafíos superados por equipos ("Cómo nuestro equipo de ingeniería resolvió el problema que nadie más pudo"), momentos de impacto real ("El día que nuestro producto ayudó a 10,000 personas"), y el contrast story ("Antes vs. después de unirme a esta empresa"). Cada uno activa emociones distintas y atrae diferentes tipos de candidatos.

El Copy con IA ha transformado la productividad del reclutador. Herramientas como ChatGPT, Claude, Gemini y Jasper permiten generar descripciones de vacantes, posts de employer branding, correos de outreach a candidatos pasivos y textos de job offers en minutos. La clave está en el prompt engineering: un prompt bien construido especifica el tono (profesional pero cercano), la audiencia (Candidato Persona), el objetivo (que el candidato aplique o responda) y el formato (longitud, estructura, llamada a la acción).

El Arte con IA —generación de imágenes con herramientas como Midjourney, DALL-E y Adobe Firefly— permite crear visuales atractivos para las publicaciones de reclutamiento sin necesidad de diseñador gráfico ni banco de imágenes. Las mejores prácticas incluyen: usar prompts que describan el mood y el estilo visual de la marca (no solo el contenido), mantener consistencia visual entre piezas del mismo canal, y combinar imágenes generadas por IA con fotografías reales del equipo para mantener la autenticidad.`,
      },
      {
        title: "Aplicación Avanzada de Storytelling y IA en Reclutamiento",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `La ingeniería de prompts (prompt engineering) es la habilidad diferenciadora del reclutador que usa IA de forma efectiva. Un prompt genérico produce resultados genéricos; un prompt bien construido produce contenido de alta calidad y alineado con la marca empleadora. Los elementos de un prompt efectivo para reclutamiento son: rol de la IA ("Actúa como especialista en employer branding"), contexto de la empresa (cultura, valores, tamaño), perfil del candidato objetivo (Candidato Persona), objetivo del contenido (qué acción queremos que tome el candidato), tono y restricciones, y formato deseado.

El storytelling auténtico requiere materia prima real. El error más común es construir historias ficticias que no reflejan la realidad organizacional. El proceso correcto es: entrevistar a empleados con narrativas poderosas (cambio de carrera, proyecto de impacto, crecimiento acelerado), extraer los momentos emocionales clave, construir la historia respetando la voz del protagonista, y validar con el empleado antes de publicar. La autenticidad se siente y los candidatos la distinguen del storytelling fabricado.

La consistencia visual de la marca empleadora requiere un sistema de diseño básico: paleta de colores, tipografías, estilo fotográfico y tratamiento de imágenes consistente. Con herramientas de IA como Canva con Magic AI o Adobe Express, es posible crear templates que mantengan esta consistencia y que el equipo de reclutamiento pueda usar sin conocimientos técnicos de diseño. La consistencia visual hace reconocible la marca empleadora a simple vista en el feed del candidato.

El A/B testing de copies y visuales permite optimizar el rendimiento del contenido de forma sistemática. Publicar dos versiones de la misma vacante con títulos diferentes, o probar dos estilos visuales distintos en Instagram, revela qué mensaje resuena más con la audiencia. LinkedIn Campaign Manager y Meta Ads permiten A/B testing formal con grupos de audiencia separados. Para contenido orgánico, publicar en diferentes horarios y analizar el alcance de las primeras 2 horas es un proxy efectivo de rendimiento.

La integración de IA en el flujo de trabajo de reclutamiento debe ser estratégica, no indiscriminada. Las tareas donde la IA genera mayor ROI son: generación de primeros borradores de job descriptions (el reclutador ajusta y personaliza), personalización masiva de mensajes de outreach (la IA genera variaciones del mensaje base para diferentes segmentos), análisis de CVs para pre-clasificación, y transcripción y resumen de entrevistas. Las tareas que requieren juicio humano —decisión de avanzar candidatos, diseño de la propuesta de valor, construcción de relaciones— no deben delegarse a la IA.`,
        quiz: [
          {
            question: "¿Por qué el storytelling es más efectivo que presentar datos y hechos para atraer candidatos?",
            options: [
              "Porque las historias son más cortas y fáciles de leer en dispositivos móviles",
              "Porque las historias activan múltiples regiones cerebrales incluidas las emocionales, generan oxitocina y tienen 22 veces mayor tasa de retención que los datos sin narrativa",
              "Porque los datos son difíciles de verificar y los candidatos no confían en ellos",
              "Porque el storytelling requiere menos presupuesto de producción que los formatos basados en datos"
            ],
            correctIndex: 1,
            explanation: "La neurociencia del storytelling explica su efectividad: las historias generan 'acoplamiento neuronal' entre el narrador y el oyente, activan la amígdala (emoción) junto con el córtex prefrontal (razonamiento) y generan oxitocina que favorece la confianza y la acción. Los datos solos activan principalmente el procesamiento racional, sin el componente emocional que impulsa las decisiones."
          },
          {
            question: "Un reclutador quiere usar ChatGPT para generar una descripción de vacante. ¿Cuál de los siguientes prompts producirá el resultado más efectivo?",
            options: [
              "'Escribe una descripción de vacante para un puesto de ventas'",
              "'Actúa como especialista en employer branding. Escribe una descripción de vacante para Ejecutivo de Ventas B2B dirigida a profesionales de 3-5 años de experiencia que valoran el impacto y el crecimiento. Tono: profesional pero directo. Incluye primero los beneficios y el impacto del rol, luego los requisitos. 300 palabras máximo. Empresa de SaaS en expansión con cultura de alto desempeño.'",
              "'Haz una vacante de ventas que sea atractiva para millennials y que no sea aburrida'",
              "'Mejora esta descripción de vacante para que sea más profesional: [texto existente]'"
            ],
            correctIndex: 1,
            explanation: "El segundo prompt es efectivo porque especifica: rol de la IA (especialista en EB), contexto (tipo de empresa, cultura), Candidato Persona (3-5 años, valores de impacto y crecimiento), estructura (beneficios primero), tono, extensión y objetivo. Esta especificidad produce contenido directamente utilizable con ajustes mínimos, en lugar de un borrador genérico que requiere reescritura total."
          },
          {
            question: "¿Cuál es el riesgo principal de utilizar storytelling fabricado (historias no basadas en experiencias reales) en Employer Branding?",
            options: [
              "Viola regulaciones de publicidad engañosa en la mayoría de los países",
              "Genera expectativas que no se cumplen, resultando en baja retención y daño reputacional cuando los empleados comparten su experiencia real en Glassdoor y redes sociales",
              "Es más costoso de producir que el contenido basado en datos reales",
              "Tiene menor alcance orgánico porque los algoritmos detectan contenido artificial"
            ],
            correctIndex: 1,
            explanation: "El storytelling fabricado crea una trampa de expectativas: atrae candidatos que esperan la empresa prometida y se encuentran con una realidad diferente. En la era de Glassdoor, LinkedIn y redes sociales, la disonancia entre la narrativa de atracción y la realidad se vuelve pública rápidamente, dañando tanto la retención como la atracción futura."
          },
          {
            question: "¿En qué tareas específicas de reclutamiento genera mayor ROI la integración de herramientas de IA?",
            options: [
              "En la toma de decisión final de contratación, donde la IA elimina el sesgo humano",
              "En la generación de primeros borradores de job descriptions, personalización de mensajes de outreach y pre-clasificación de CVs, liberando tiempo del reclutador para tareas de alto valor humano",
              "En el diseño completo de la estrategia de reclutamiento, donde la IA puede procesar más datos que un humano",
              "En las entrevistas iniciales de candidatos, donde la IA es más objetiva que un entrevistador humano"
            ],
            correctIndex: 1,
            explanation: "La IA genera mayor ROI en tareas repetitivas y de alta producción de texto o datos. La generación de borradores (que el humano ajusta), la personalización masiva de mensajes y el pre-screening de CVs pueden reducirse de horas a minutos. Las tareas que requieren juicio, empatía y construcción de relaciones —entrevistas, decisión de contratación, diseño de cultura— requieren la irreemplazable inteligencia humana."
          },
          {
            question: "¿Cómo se aplica correctamente el A/B testing en una estrategia de contenido orgánico de reclutamiento?",
            options: [
              "Publicando el mismo contenido exacto en dos días diferentes para ver cuál tiene más alcance",
              "Probando una única variable (título, visual o CTA) entre dos versiones del mismo contenido, midiendo el alcance en las primeras 2 horas como proxy de rendimiento, y aplicando el aprendizaje a futuras publicaciones",
              "Creando dos cuentas de empresa distintas y comparando cuál genera más seguidores",
              "Publicando contenido A en LinkedIn y contenido B en Instagram para comparar cuál plataforma funciona mejor"
            ],
            correctIndex: 1,
            explanation: "El A/B testing válido prueba UNA variable a la vez en condiciones equivalentes. Para contenido orgánico (sin presupuesto de pauta), el alcance en las primeras 2 horas es un indicador confiable del rendimiento total porque refleja la respuesta inicial del algoritmo al engagement temprano. Cambiar múltiples variables simultáneamente hace imposible identificar qué generó la diferencia."
          }
        ]
      }
    ]
  },
  {
    title: "Planificación Financiera del Reclutamiento Digital",
    lessons: [
      {
        title: "Proyección de Ingresos, Presupuesto y Calendario de Reclutamiento",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `La planificación financiera del reclutamiento digital transforma el área de Recursos Humanos de un centro de costos a un generador de valor estratégico. Este cambio de perspectiva es fundamental: el reclutamiento no es un gasto, es una inversión con retorno medible que debe justificarse con datos ante la dirección.

La proyección de ingresos del reclutamiento se basa en dos variables principales: la tasa de rotación y el plan de crecimiento de plantilla. Si una empresa tiene 200 empleados y una rotación anual del 15%, proyectará 30 reemplazos al año. Si además planea crecer un 10%, agregará 20 posiciones nuevas. El total de 50 contrataciones proyectadas permite calcular el presupuesto necesario (costo por contratación × número de posiciones) y el impacto en productividad de las vacantes abiertas (costo diario de posición vacante × días promedio de cobertura).

La construcción del presupuesto de reclutamiento digital contempla cinco categorías: herramientas tecnológicas (ATS, LinkedIn Recruiter, plataformas de videoentrevista), publicidad en bolsas de trabajo y redes sociales, producción de contenido de employer branding, compensación de headhunters o agencias para posiciones especializadas, y overhead del equipo interno. Un benchmark de industria sitúa el costo promedio por contratación entre $50,000 y $150,000 MXN para posiciones gerenciales y entre $15,000 y $40,000 MXN para posiciones operativas.

El calendario de uso de fuentes digitales es la herramienta táctica que organiza cuándo y cómo se activan cada uno de los canales de reclutamiento a lo largo del año. Factores que determinan el calendario: picos de contratación (inicio de año, post-verano), ciclos de presupuesto de la empresa, temporadas de graduación universitaria (Mayo-Julio y Diciembre-Enero para perfiles junior), y comportamiento del mercado laboral (enero y septiembre son los meses con mayor actividad de candidatos activos).

La planificación anticipada de presupuesto permite negociar mejores tarifas con plataformas (los contratos anuales de LinkedIn Recruiter tienen descuentos del 20-30% respecto a mensual), asegurar disponibilidad de recursos en los picos de demanda y evitar decisiones reactivas que suelen ser más costosas y menos efectivas.`,
      },
      {
        title: "Gestión Financiera Avanzada del Reclutamiento Digital",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `La justificación del presupuesto de reclutamiento ante la dirección general requiere traducir métricas de RR.HH. al lenguaje financiero. El argumento más poderoso no es "necesitamos más herramientas", sino "el costo de la posición vacante es $X por día, cada día que tardamos en contratar cuesta $Y en productividad perdida, y con esta inversión reduciremos el tiempo de cobertura en Z días, generando un ahorro de $W". Este enfoque conecta el gasto en reclutamiento con el impacto financiero directo.

El cálculo del costo real por contratación debe incluir todos los costos directos e indirectos: tiempo del equipo de RR.HH. (horas invertidas × costo por hora), publicidad y herramientas, entrevistas de managers (su tiempo tiene costo), onboarding y capacitación inicial, y la curva de aprendizaje del nuevo empleado (generalmente se considera que un empleado alcanza productividad plena a los 3-6 meses). Este cálculo completo suele revelar que el costo real de contratación es 3-4 veces mayor que el costo directo visible.

El presupuesto de reclutamiento debe distribuirse siguiendo la efectividad de cada fuente medida con datos propios. Un modelo de distribución inicial común es: 40% en herramientas de búsqueda activa (LinkedIn Recruiter, headhunting para perfiles especializados), 30% en publicidad digital (bolsas de trabajo, social ads), 20% en producción de contenido de employer branding, 10% en programas de referidos (bonificaciones para empleados que recomiendan candidatos exitosos). Este mix debe revisarse trimestralmente con datos de ROI por fuente.

Los programas de referidos son consistentemente la fuente de mayor calidad y menor costo en el reclutamiento. Los candidatos referidos por empleados tienen en promedio: 55% mayor tasa de retención a 2 años, 45% menor tiempo de cobertura, 25% menor costo de contratación, y mayor alineación cultural desde el inicio. Diseñar un programa de referidos efectivo requiere: proceso simple (el empleado puede recomendar en menos de 5 minutos), bonificación competitiva (pagada en dos momentos: contratación y retención a 3 meses), comunicación interna constante de las vacantes activas, y reconocimiento público del empleado que refirió.

La revisión financiera mensual del reclutamiento debe incluir: costo real por contratación por fuente vs. presupuesto, tiempo de cobertura por tipo de posición vs. objetivo, ROI por canal de atracción, variación respecto al período anterior, y proyección para el siguiente mes con base en el pipeline actual.`,
        quiz: [
          {
            question: "Una empresa tiene 300 empleados y una rotación del 20% anual, con un plan de crecimiento del 15%. ¿Cuántas contrataciones debe proyectar para el siguiente año?",
            options: [
              "60 (solo rotación: 300 × 20%)",
              "45 (solo crecimiento: 300 × 15%)",
              "105 (rotación: 60 + crecimiento: 45)",
              "90 (promedio de rotación y crecimiento)"
            ],
            correctIndex: 2,
            explanation: "La proyección correcta suma ambas necesidades: reemplazos por rotación (300 × 20% = 60 personas) más nuevas posiciones por crecimiento (300 × 15% = 45 personas), totalizando 105 contrataciones. Subestimar la proyección resulta en falta de capacidad de reclutamiento en los momentos críticos."
          },
          {
            question: "¿Por qué el costo real por contratación es generalmente 3-4 veces mayor que el costo directo visible?",
            options: [
              "Porque las plataformas de reclutamiento cobran impuestos ocultos que no aparecen en la factura",
              "Porque el costo real incluye tiempo de managers, onboarding, curva de aprendizaje y productividad perdida durante la vacante, costos que no aparecen en el presupuesto de RR.HH.",
              "Porque las agencias de headhunting cobran comisiones que se pagan en diferido",
              "Porque el costo de herramientas tecnológicas aumenta cuando se contratan más personas"
            ],
            correctIndex: 1,
            explanation: "El iceberg del costo de contratación: la parte visible (publicidad, agencias, herramientas) es solo la punta. Bajo el agua están: las horas de RR.HH. y managers en entrevistas (costo de oportunidad), el onboarding formal, los primeros 3-6 meses de curva de aprendizaje donde el empleado produce al 50-70% de su capacidad, y el costo diario de la posición vacante. Ignorar estos costos subestima el ROI real de invertir en procesos de reclutamiento más efectivos."
          },
          {
            question: "¿Cuál es el argumento más efectivo para justificar un mayor presupuesto de reclutamiento ante la dirección general?",
            options: [
              "'Necesitamos las mejores herramientas del mercado para ser competitivos en atracción de talento'",
              "'El mercado laboral está muy competido y sin más presupuesto no podremos contratar'",
              "'El costo diario de mantener esta posición vacante es de $X, el proceso actual tarda Y días, reducirlo a Z días con esta inversión genera un ahorro de $W que supera el costo de la herramienta'",
              "'Nuestros competidores ya están usando estas plataformas y no podemos quedarnos atrás'"
            ],
            correctIndex: 2,
            explanation: "La dirección toma decisiones con base en impacto financiero. El argumento ganador conecta el gasto propuesto con un retorno medible y específico, expresado en la misma moneda que habla la dirección: dinero. Los argumentos de 'necesidad', 'competencia' o 'mercado difícil' son percibidos como justificaciones subjetivas sin datos que los respalden."
          },
          {
            question: "¿Por qué los candidatos referidos por empleados actuales tienen métricas de calidad superiores a los de otras fuentes?",
            options: [
              "Porque los empleados solo refieren a amigos que ya conocen la empresa y no generan sorpresas",
              "Porque el empleado que refiere actúa como filtro cultural y de competencia, pre-seleccionando candidatos que conoce personalmente y cuyo perfil considera apropiado, además de facilitar la integración inicial",
              "Porque las personas referidas aceptan salarios más bajos al no tener que pasar por una agencia",
              "Porque el proceso de selección es más corto y genera menos fricción"
            ],
            correctIndex: 1,
            explanation: "El mecanismo detrás de la calidad de los referidos es la pre-validación: el empleado pone su reputación en juego al recomendar a alguien. Esto genera un filtro natural de alineación cultural y competencia. Adicionalmente, el referido llega con contexto real sobre la empresa (ventajas e inconvenientes), lo que reduce la brecha de expectativas y acelera la integración."
          },
          {
            question: "Una empresa destina el 80% de su presupuesto de reclutamiento a publicar en bolsas de trabajo generalistas y obtiene alta cantidad de aplicaciones pero baja calidad. ¿Qué ajuste estratégico en la distribución presupuestaria generaría mejor ROI?",
            options: [
              "Reducir el presupuesto total de reclutamiento ya que el volumen de aplicaciones demuestra que no se necesita más inversión",
              "Redirigir presupuesto de bolsas generalistas hacia: fuentes especializadas por perfil, programa de referidos internos, LinkedIn Recruiter para búsqueda activa, y contenido de employer branding que atraiga candidatos mejor alineados",
              "Aumentar el salario ofrecido en las vacantes para atraer candidatos de mayor nivel",
              "Contratar una agencia de headhunting para todas las posiciones"
            ],
            correctIndex: 1,
            explanation: "Alta cantidad + baja calidad en bolsas generalistas indica que se llega al público incorrecto. La redistribución hacia fuentes especializadas (donde está el perfil buscado), referidos (pre-filtrados por empleados) y LinkedIn Recruiter (búsqueda proactiva del perfil exacto) invierte el ratio: menos volumen pero mayor alineación, reduciendo el tiempo del equipo en screening y aumentando la tasa de conversión a contratación."
          }
        ]
      }
    ]
  },
  {
    title: "Embudo de Conversión y Efectividad",
    lessons: [
      {
        title: "Funnel de Reclutamiento y Métricas de Efectividad",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `El embudo de conversión del reclutamiento digital modela el recorrido completo del candidato desde el primer contacto con la marca hasta la incorporación en la empresa. Visualizar y medir este funnel es la base de cualquier estrategia de optimización: si no sabemos dónde se pierden los candidatos, no podemos mejorar.

Las etapas estándar del funnel de reclutamiento son: Alcance (número de personas que ven la vacante o el contenido de marca empleadora), Visita (número de personas que entran a la página de careers o al detalle de la vacante), Aplicación (candidatos que completan el proceso de postulación), Preselección (candidatos que pasan el filtro inicial del CV y perfil), Entrevistas (candidatos que avanzan al proceso de entrevistas), Oferta (candidatos a quienes se extiende una propuesta), Aceptación (candidatos que aceptan la oferta), e Incorporación (candidatos que efectivamente se unen a la empresa y superan el período de prueba).

Las tasas de conversión entre etapas revelan cuellos de botella críticos. Tasas de referencia del mercado: de Visita a Aplicación: 5-15% (si es menor, el problema está en la descripción de la vacante o el proceso de aplicación); de Aplicación a Preselección: 20-40% (si es mayor, el perfil no está bien definido y se atrae demasiado volumen no calificado); de Preselección a Entrevista: 30-50%; de Entrevista a Oferta: 25-40%; de Oferta a Aceptación: 70-90% (si es menor, hay un problema de propuesta de valor o proceso de competidores).

La medición de efectividad de fuentes requiere rastrear el origen de cada candidato hasta la etapa final de contratación. Una fuente con alta tasa de aplicación pero baja tasa de llegada a entrevista indica que atrae perfiles desalineados. Una fuente con pocas aplicaciones pero alta tasa de avance es una fuente de calidad que merece más inversión. Este análisis solo es posible con un ATS correctamente configurado que mantenga el campo de "fuente de candidato" a lo largo de todo el proceso.

Los KPIs de efectividad del reclutamiento digital que toda organización debe monitorear mensualmente son: tiempo promedio de cobertura por tipo de posición, costo por contratación por fuente, calidad de contratación (evaluación de desempeño a 90 días), tasa de retención a 12 meses por fuente, NPS del candidato (probabilidad de recomendar el proceso), y ratio de oferta/aceptación. Estos seis indicadores dan una visión completa de eficiencia, calidad y experiencia.`,
      },
      {
        title: "Optimización Avanzada del Embudo y Análisis de Efectividad",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `La optimización del funnel de reclutamiento debe ser sistemática y basada en datos. El primer paso es identificar la etapa de mayor pérdida (drop-off): si el 60% de los candidatos abandona el proceso de aplicación a la mitad, el problema es técnico (formulario demasiado largo, mal diseño móvil) o de expectativas (la descripción no coincide con el formulario). Si el 50% de los candidatos que llegan a oferta la rechaza, el problema es de compensación o de propuesta de valor.

Las pruebas de experiencia del candidato (candidate experience testing) son el equivalente al UX testing en producto. Involucra que personas del equipo completen el proceso de aplicación como si fueran candidatos externos, identificando fricciones en cada paso: formularios que no funcionan en móvil, tiempos de respuesta excesivos, comunicación confusa sobre los siguientes pasos, y procesos de múltiples rondas sin justificación clara para el candidato.

La velocidad del proceso de reclutamiento es una ventaja competitiva subestimada. En mercados de alta demanda de talento, el candidato ideal recibe múltiples ofertas simultáneamente. Las empresas que reducen su tiempo de cobertura de 45 días a 21 días acceden a un pool de candidatos completamente diferente: los mejores perfiles no esperan 45 días, aceptan antes. Esto requiere: acuerdos de servicio (SLAs) internos con los hiring managers (compromiso de respuesta en 48 horas), paneles de entrevistas coordinados, y autorización previa de rangos salariales para agilizar decisiones.

El análisis de candidatos rechazados (lost candidates analysis) es una práctica avanzada que pocas empresas implementan pero que genera insights críticos. Encuestar a candidatos que rechazaron una oferta o abandonaron el proceso revela: si la compensación es el factor principal de rechazo o si hay factores de cultura y propuesta de valor; si la experiencia del proceso influyó negativamente; y qué empresa ganó al candidato (benchmarking competitivo de propuesta de valor).

La tasa de retención post-contratación por fuente es el indicador definitivo de calidad. Si los candidatos contratados de una fuente específica tienen consistentemente mayor retención a 12 meses, mayor desempeño en evaluaciones y mayor promoción interna, esa fuente merece una mayor asignación presupuestaria. Este análisis cierra el ciclo del ROI del reclutamiento: conecta la inversión inicial en atracción con el valor generado a largo plazo.`,
        quiz: [
          {
            question: "En el funnel de reclutamiento, una tasa de conversión de Aplicación a Preselección del 60% (60 de cada 100 aplicantes pasan el filtro inicial) ¿qué indica?",
            options: [
              "Que el proceso de preselección es muy efectivo y el reclutador es muy preciso",
              "Que el perfil buscado no está bien definido o la vacante no está atrayendo al candidato correcto, generando un volumen masivo de aplicaciones no calificadas que consume tiempo innecesario del equipo",
              "Que la empresa tiene una propuesta de valor muy atractiva que atrae a los mejores candidatos del mercado",
              "Que el proceso de aplicación es demasiado sencillo y cualquiera puede completarlo"
            ],
            correctIndex: 1,
            explanation: "Una tasa de preselección del 60% significa que solo 4 de cada 10 aplicantes están calificados. Esta ineficiencia tiene un costo real: el tiempo del reclutador revisando CVs no calificados es tiempo que no dedica a actividades de mayor valor. El problema está upstream: el targeting de la vacante no está llegando al perfil correcto, o los requisitos no están suficientemente claros para filtrar aplicantes desde el inicio."
          },
          {
            question: "Una empresa tiene una tasa de aceptación de ofertas del 50% (la mitad de los candidatos a quienes se extiende oferta la rechaza). ¿Cuál es el diagnóstico y la solución correcta?",
            options: [
              "El proceso de entrevistas es demasiado largo; la solución es reducir el número de rondas",
              "La compensación y/o la propuesta de valor no son competitivas; la solución es realizar benchmarking salarial y revisar el EVP comunicado durante el proceso",
              "El reclutador no está negociando correctamente; la solución es capacitar al equipo en técnicas de cierre de ofertas",
              "Los candidatos están recibiendo demasiadas opciones; la solución es acelerar más el proceso"
            ],
            correctIndex: 1,
            explanation: "Una tasa de aceptación del 50% (el benchmark sano es 70-90%) indica que la oferta no cumple las expectativas del candidato formadas durante el proceso. Las causas más comunes son: compensación por debajo del mercado o de las expectativas generadas, brechas entre lo prometido en las entrevistas y la oferta formal, o que el candidato recibió una oferta mejor de un competidor. El benchmarking salarial y la alineación temprana de expectativas económicas son las soluciones estructurales."
          },
          {
            question: "¿Por qué la velocidad del proceso de reclutamiento es una ventaja competitiva en mercados de alta demanda de talento?",
            options: [
              "Porque los candidatos perciben que una empresa que contrata rápido tiene menos burocracia interna",
              "Porque los mejores candidatos del mercado reciben múltiples ofertas simultáneamente y no esperan procesos de 45+ días; una empresa que contrata en 15-21 días accede a candidatos que la de 45 días ya perdió",
              "Porque los procesos rápidos son más económicos y reducen el costo por contratación",
              "Porque la legislación laboral en México penaliza los procesos de selección que superan los 30 días"
            ],
            correctIndex: 1,
            explanation: "El candidato de alta demanda opera en un mercado donde tiempo es competitividad. Un proceso de 45 días para un perfil tech senior o comercial de alto desempeño garantiza que la empresa competidora que tarda 21 días se lo lleve. La velocidad del proceso no es solo eficiencia operativa; es una decisión estratégica que determina a qué nivel del pool de talento puede acceder la empresa."
          },
          {
            question: "¿Qué información valiosa puede obtenerse del análisis de candidatos que rechazaron una oferta de trabajo?",
            options: [
              "Datos para evaluar el desempeño del reclutador responsable del proceso",
              "Benchmarking competitivo de propuestas de valor, identificación de brechas en compensación y cultura, y comprensión de los criterios reales de decisión del candidato objetivo",
              "Información legal necesaria para documentar por qué el candidato no fue seleccionado",
              "Datos para ajustar los criterios de preselección y evitar candidatos que rechacen ofertas en el futuro"
            ],
            correctIndex: 1,
            explanation: "Los candidatos que rechazan ofertas son una fuente de inteligencia competitiva invaluable y gratuita. Revelan: si la compensación está fuera de mercado, si hay atributos culturales que generan fricción, qué empresa ganó la competencia y por qué, y qué información adicional habría cambiado su decisión. Esta retroalimentación directamente informa la mejora del EVP, la estrategia salarial y el proceso de selección."
          },
          {
            question: "¿Por qué la tasa de retención a 12 meses por fuente de reclutamiento es el KPI más poderoso para evaluar la calidad de una fuente?",
            options: [
              "Porque es el indicador que más fácilmente puede presentarse a la dirección general",
              "Porque conecta la inversión inicial en atracción con el valor generado a largo plazo: una fuente que produce candidatos que se quedan y son promovidos tiene un ROI real que supera ampliamente a una fuente de bajo costo pero alta rotación",
              "Porque es el único indicador que no puede ser manipulado por el equipo de reclutamiento",
              "Porque la legislación laboral mexicana lo exige como métrica de cumplimiento"
            ],
            correctIndex: 1,
            explanation: "El costo de contratación incluye el tiempo de onboarding y la curva de aprendizaje. Si un empleado rota a los 6 meses, ese costo se pierde y se duplica. Una fuente que genera candidatos con 80% de retención a 12 meses puede tener un costo por contratación 3 veces mayor que una fuente con 40% de retención, y aún así tener mejor ROI porque elimina el costo recurrente de reemplazar al mismo puesto."
          }
        ]
      }
    ]
  },
  {
    title: "ROI del Reclutamiento Digital",
    lessons: [
      {
        title: "Cálculo y Análisis del Retorno de Inversión en Reclutamiento",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `El Retorno de Inversión (ROI) del reclutamiento digital es la métrica que cuantifica el valor económico generado por cada peso invertido en el proceso de atracción y selección de talento. Calcular y comunicar el ROI transforma la percepción del área de Recursos Humanos: de departamento administrativo de soporte a función estratégica con impacto financiero demostrable.

La fórmula básica del ROI de reclutamiento es: ROI = [(Valor generado - Costo de inversión) / Costo de inversión] × 100. El desafío está en cuantificar el "valor generado", que incluye múltiples componentes: ahorro por reducción del tiempo de cobertura (cada día menos de vacante = costo de oportunidad recuperado), reducción del costo por contratación respecto al período anterior o a agencias externas, valor de productividad del candidato contratado (su contribución al negocio), y reducción de costos por menor rotación temprana.

El costo por contratación (Cost-per-Hire, CPH) es el punto de partida del análisis de ROI. Se calcula sumando todos los costos directos e indirectos del proceso y dividiéndolos entre el número de contrataciones en el período. Benchmark de la industria: Society for Human Resource Management (SHRM) reporta un CPH promedio de $4,700 USD para posiciones no gerenciales y $14,000+ USD para gerenciales en mercados desarrollados. En México, los rangos típicos van de $15,000 a $50,000 MXN para operativos y de $80,000 a $200,000 MXN para directivos.

El Tiempo hasta la Productividad (Time to Productivity, TTP) es el período desde la incorporación hasta que el empleado genera valor pleno para la organización. Varía por posición y complejidad: roles operativos simples: 30-60 días; roles técnicos medios: 60-90 días; roles gerenciales: 90-180 días; roles directivos: 180-360 días. Reducir el TTP mediante onboarding estructurado tiene un impacto financiero directo equivalente al salario del empleado multiplicado por los días de productividad ganados.

La comparación de ROI entre canales de reclutamiento permite tomar decisiones de inversión basadas en evidencia. Un canal que cuesta 3 veces más pero genera candidatos con 60% mayor retención a 2 años y 40% mayor desempeño en evaluaciones tiene, en la práctica, un ROI superior al canal "económico" que genera alta rotación. Esta perspectiva de ciclo de vida del empleado (lifetime value) es la que separa la gestión estratégica de talento de la administración táctica de vacantes.`,
      },
      {
        title: "ROI Avanzado y Toma de Decisiones Basadas en Datos",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `El análisis avanzado de ROI en reclutamiento incorpora el concepto de Calidad de Contratación (Quality of Hire, QoH), que es la métrica más compleja y valiosa del área. La QoH integra múltiples indicadores del desempeño post-contratación: evaluación de desempeño en el primer año (qué percentil ocupa respecto a sus pares), velocidad de promoción o expansión de responsabilidades, retención (si el empleado permanece en la empresa), contribución a proyectos estratégicos, y NPS del manager directo sobre el candidato. La QoH permite comparar no solo el costo, sino el valor real generado por cada fuente de reclutamiento.

La analítica predictiva del reclutamiento es la frontera actual de la inteligencia en talent acquisition. Utilizando datos históricos de contrataciones (qué atributos de CV, qué fuente, qué tipo de proceso) correlacionados con datos de desempeño y retención, es posible construir modelos que predigan la probabilidad de éxito de un candidato antes de contratarlo. Empresas como Google, Amazon y Unilever llevan años usando estos modelos para reducir el sesgo humano y mejorar la precisión de las contrataciones.

La presentación del ROI de reclutamiento a la alta dirección requiere un lenguaje específico: no métricas de RR.HH. (tasa de llenado, tiempo de cobertura), sino métricas financieras (ahorro generado vs. período anterior, proyección de impacto en productividad, comparación de costo interno vs. agencias externas). Un reporte ejecutivo efectivo incluye: inversión total del período, contrataciones realizadas, CPH vs. benchmark y vs. período anterior, valor estimado de productividad generada, ROI calculado en porcentaje, y proyección para el siguiente período.

La construcción del Business Case para inversión en tecnología de reclutamiento (ATS, LinkedIn Recruiter, plataformas de videoentrevista) debe seguir la misma lógica de ROI: cuantificar el costo actual del proceso manual, estimar el ahorro de tiempo con la herramienta, calcular el costo de oportunidad de ese tiempo liberado (el reclutador puede manejar más posiciones o dedicarse a actividades de mayor valor), y comparar con el costo de la herramienta. Si el payback period es menor a 6 meses, la inversión es difícilmente cuestionable.

La democratización del análisis de ROI en RR.HH. es una tendencia creciente: los HR Business Partners que dominan los datos y pueden construir y comunicar el ROI de sus iniciativas tienen mayor influencia estratégica, mayor presupuesto y mayor visibilidad en la dirección. Invertir en capacitación en analítica de personas (People Analytics) es hoy tan crítico como invertir en herramientas de reclutamiento.`,
        quiz: [
          {
            question: "¿Cuál de los siguientes componentes NO debe incluirse en el cálculo del costo real por contratación (Cost-per-Hire)?",
            options: [
              "Tiempo del equipo de RR.HH. invertido en el proceso (horas × costo por hora)",
              "Costo de las entrevistas realizadas por managers del área solicitante",
              "El salario que recibirá el nuevo empleado durante los primeros 12 meses",
              "Costo de las herramientas y publicidad utilizadas en el proceso de atracción"
            ],
            correctIndex: 2,
            explanation: "El salario del nuevo empleado NO forma parte del costo por contratación; es el costo de operación del rol, que existiría independientemente de cómo se contrató. El CPH mide el costo del proceso de atracción y selección, no el costo de mantener al empleado. Incluirlo distorsionaría el análisis y haría incomparable el CPH entre posiciones de diferente nivel salarial."
          },
          {
            question: "Una empresa invierte $50,000 MXN en LinkedIn Recruiter y contrata a 5 personas que generan un ahorro de $200,000 MXN en costos de agencia. ¿Cuál es el ROI de esta inversión?",
            options: [
              "250%",
              "300%",
              "400%",
              "150%"
            ],
            correctIndex: 1,
            explanation: "ROI = [(Valor generado - Inversión) / Inversión] × 100 = [($200,000 - $50,000) / $50,000] × 100 = [$150,000 / $50,000] × 100 = 300%. Este es un ejemplo simplificado; en la práctica, el 'valor generado' incluiría también el ahorro en tiempo del equipo y el valor de productividad, haciendo el ROI aún mayor."
          },
          {
            question: "¿Qué es la Calidad de Contratación (Quality of Hire) y por qué es la métrica más valiosa del reclutamiento?",
            options: [
              "Es la proporción de candidatos que pasan la entrevista respecto a los que aplican, indicando la precisión del proceso de selección",
              "Es un índice compuesto que mide el desempeño, retención y aportación estratégica del candidato contratado, permitiendo evaluar el valor real generado por cada fuente de reclutamiento más allá del costo",
              "Es la calificación que el candidato da al proceso de selección en la encuesta de Candidate Experience",
              "Es el porcentaje de contrataciones que superan el período de prueba de 3 meses"
            ],
            correctIndex: 1,
            explanation: "La QoH es el 'santo grial' del reclutamiento porque conecta el proceso de selección con el impacto organizacional a largo plazo. Ninguna otra métrica captura si las decisiones de contratación fueron correctas: el CPH mide la eficiencia, el tiempo de cobertura mide la velocidad, pero solo la QoH mide si se contrató a la persona correcta. Es compleja de calcular porque requiere datos de RRHH, desempeño y compensación integrados."
          },
          {
            question: "Al construir un Business Case para invertir en un ATS (Applicant Tracking System) de $120,000 MXN anuales, ¿cuál es el argumento financiero más sólido?",
            options: [
              "'La herramienta es usada por las mejores empresas del mercado y mejoraría nuestra imagen como empleador'",
              "'El equipo de reclutamiento actualmente dedica 40 horas por semana a tareas administrativas que el ATS automatizaría; a un costo promedio de $300/hora, esto representa $624,000 MXN anuales en tiempo liberado, generando un ROI del 420% solo en productividad recuperada'",
              "'El ATS mejoraría la experiencia del candidato y nos ayudaría a atraer mejores perfiles'",
              "'Sin ATS es imposible competir con empresas que ya lo tienen implementado'"
            ],
            correctIndex: 1,
            explanation: "El argumento ganador cuantifica el impacto financiero con especificidad: horas actuales × costo/hora = valor del tiempo que se liberará, comparado directamente con el costo de la herramienta. Este enfoque hace irrefutable la inversión porque habla en el mismo idioma que la dirección financiera. Los argumentos de 'imagen', 'experiencia' o 'competencia' son válidos pero no son suficientes para justificar inversiones en organizaciones orientadas a datos."
          },
          {
            question: "¿Por qué la comparación de ROI entre fuentes de reclutamiento debe basarse en el ciclo de vida completo del empleado y no solo en el costo de contratación inicial?",
            options: [
              "Porque los reguladores laborales exigen esta perspectiva en los reportes de RR.HH.",
              "Porque un canal de bajo costo inicial que genera alta rotación a 12 meses puede tener un ROI negativo cuando se considera el costo de recontratación, mientras que un canal de mayor costo inicial con alta retención puede tener el mejor ROI del portafolio",
              "Porque es la única manera de comparar fuentes de reclutamiento con diferente alcance geográfico",
              "Porque el ciclo de vida del empleado es el único indicador que los CEOs comprenden y valoran"
            ],
            correctIndex: 1,
            explanation: "El error de optimizar solo por CPH inicial es equiparable a comprar el auto más barato sin considerar el costo de mantenimiento. Una fuente que genera candidatos con 30% de rotación a 12 meses duplica el costo de contratación en el período (se paga dos veces el CPH). Una fuente con CPH 2 veces mayor pero retención del 90% tiene un costo total a 2 años significativamente inferior y genera mayor estabilidad operativa."
          }
        ]
      }
    ]
  },
  {
    title: "Difusión, Algoritmos y Amplificación Digital",
    lessons: [
      {
        title: "Difusión Orgánica e Inorgánica en Reclutamiento",
        contentType: "TEXT" as const,
        xpReward: 15,
        content: `La difusión del contenido de reclutamiento y employer branding se divide en dos grandes estrategias que deben complementarse: la difusión orgánica, que no requiere inversión directa en publicidad, y la difusión inorgánica o pagada, que amplifica el alcance mediante presupuesto publicitario. Entender cómo funcionan ambas y cómo integrarlas es fundamental para maximizar el impacto con los recursos disponibles.

La difusión orgánica se basa en generar contenido de suficiente valor para que el algoritmo lo distribuya ampliamente sin pago y para que la audiencia lo comparta voluntariamente. Las palancas de la difusión orgánica son: el engagement temprano (los primeros 60 minutos después de publicar son críticos: más likes, comentarios y compartidos = mayor distribución del algoritmo), la relevancia del contenido para la audiencia del perfil (posts que generan respuestas y conversación son favorecidos), la frecuencia de publicación consistente (los algoritmos premian a los creadores regulares), y las redes de empleados (si 50 empleados comentan en la primera hora, el alcance se multiplica exponencialmente).

La difusión inorgánica o publicidad pagada permite segmentar con precisión quirúrgica y llegar a candidatos que no siguen la empresa pero tienen el perfil exacto buscado. En LinkedIn Ads, es posible segmentar por: cargo actual, industria, empresa actual o anterior, habilidades específicas, nivel de experiencia, zona geográfica y nivel educativo. En Meta Ads (Facebook e Instagram), la segmentación demográfica y psicográfica es más potente: intereses, comportamientos, datos de lookalike audiences basados en los mejores empleados actuales.

El presupuesto de publicidad pagada en reclutamiento debe distribuirse estratégicamente. Para employer branding (video de cultura, testimonios, serie de contenido): objetivos de alcance y vista de video, con CPM (costo por mil impresiones) como métrica principal. Para vacantes específicas: objetivos de conversión con CPC (costo por clic) o CPL (costo por lead/aplicación) como métricas principales. El retargeting —mostrar anuncios a personas que visitaron la página de careers pero no aplicaron— puede incrementar la tasa de conversión en un 30-40%.

La sinergia entre orgánico y pagado es el modelo más efectivo: el contenido orgánico que genera alto engagement (porque es auténtico y valioso) es amplificado con presupuesto pagado para multiplicar su alcance sin perder la naturalidad. Poner presupuesto detrás de contenido que ya funciona orgánicamente es siempre más efectivo que pagar para distribuir contenido que no genera engagement de forma natural.`,
      },
      {
        title: "Algoritmos y Estrategias Avanzadas de Amplificación Digital",
        contentType: "TEXT_AND_QUIZ" as const,
        xpReward: 30,
        content: `Los algoritmos de las redes sociales son sistemas de inteligencia artificial que determinan qué contenido muestra a qué personas y en qué momento. Comprender cómo funcionan permite diseñar contenido que los algoritmos favorezcan, multiplicando el alcance sin incrementar el presupuesto. Cada plataforma tiene sus propias señales de ranking, pero comparten principios fundamentales.

El algoritmo de LinkedIn prioriza: la relevancia del contenido para la red del autor (conexiones de primer y segundo grado que interactúan), el engagement de las primeras horas (comentarios tienen mayor peso que likes; compartidos tienen menor peso que comentarios), la participación en la conversación (el autor que responde comentarios recibe mayor distribución), y la consistencia de publicación. Un estudio de LinkedIn reveló que los posts que reciben al menos 5 comentarios en la primera hora tienen 5 veces más alcance que los que no lo hacen.

El algoritmo de Instagram y Facebook (Meta) ha evolucionado hacia la distribución basada en señales de interés, no solo en la red de seguidores. El contenido de Reels tiene distribución prioritaria en 2024 para cuentas que no son seguidas (alcance de no seguidores), mientras que los posts de feed llegan principalmente a seguidores existentes. Para employer branding, esto implica: usar Reels para atracción de nuevas audiencias y posts de carrusel y texto para profundizar con la audiencia existente.

El algoritmo de TikTok es el más democrático: no penaliza a cuentas con pocos seguidores. Cada video se prueba primero con un grupo pequeño de usuarios (1,000-5,000 vistas); si genera alto completion rate (porcentaje que lo ve hasta el final), se distribuye a grupos progresivamente más grandes. Para reclutamiento en TikTok, los primeros 3 segundos son determinantes: deben capturar la atención con algo visual, emocional o sorprendente. Videos con hook fuerte ("¿Quieres ganar $X haciendo Y?") tienen tasas de retención significativamente mayores.

Las estrategias de amplificación que potencian el alcance orgánico incluyen: pods de engagement (grupos de personas que se comprometen a comentar publicaciones de reclutamiento mutuamente en las primeras horas), programas de social selling de empleados (capacitar al equipo para compartir contenido con sus redes personales con un toque de personalización), cross-posting entre plataformas adaptando el formato (no copiando), y colaboraciones con influencers de nicho del sector (líderes de opinión de la industria que amplifican el mensaje a audiencias altamente segmentadas y de confianza).

La medición del algoritmo requiere analizar: la tasa de alcance orgánico (publicaciones vistas / seguidores totales — en LinkedIn el promedio es 10-15%; superar el 20% indica contenido de alto rendimiento), el tiempo de vida del contenido (cuántos días sigue recibiendo impresiones), la ratio de engagement (interacciones / alcance), y el análisis de las horas de mayor actividad de la audiencia específica (disponible en los analytics de cada plataforma).`,
        quiz: [
          {
            question: "¿Por qué los comentarios tienen mayor peso que los 'me gusta' en el algoritmo de LinkedIn para determinar el alcance de una publicación?",
            options: [
              "Porque LinkedIn cobra más por publicaciones con comentarios en su modelo de publicidad",
              "Porque los comentarios requieren mayor esfuerzo e intención del usuario, lo que el algoritmo interpreta como señal más fuerte de que el contenido es valioso y relevante para mostrar a más personas",
              "Porque los comentarios son visibles públicamente y generan más visitas al perfil del autor",
              "Porque LinkedIn prioriza el contenido conversacional para competir con Twitter/X"
            ],
            correctIndex: 1,
            explanation: "El algoritmo mide la 'profundidad' del engagement como proxy de relevancia. Un 'me gusta' toma 1 segundo; un comentario requiere reflexión y escritura, lo que el algoritmo interpreta como que el contenido generó suficiente impacto para motivar una respuesta. Esta señal más fuerte dispara mayor distribución. Por eso, los posts que formulan preguntas o invitan explícitamente a comentar tienen mayor alcance."
          },
          {
            question: "Para atraer candidatos que no siguen la empresa en Instagram, ¿qué tipo de contenido y formato tiene mayor probabilidad de alcanzarlos orgánicamente?",
            options: [
              "Posts de imagen estática en el feed con descripción larga y hashtags relevantes",
              "Stories exclusivas para seguidores actuales con stickers de encuesta",
              "Reels (videos cortos) con hooks visuales fuertes en los primeros 3 segundos y contenido que genere alto completion rate",
              "Carruseles de texto con información detallada sobre las vacantes disponibles"
            ],
            correctIndex: 2,
            explanation: "El algoritmo de Meta prioriza los Reels para distribución fuera de la red de seguidores. A diferencia de los posts de feed (que llegan principalmente a seguidores), los Reels son mostrados activamente a usuarios que no siguen la cuenta pero tienen intereses relacionados. Un Reels con alto completion rate (el usuario lo ve completo) se distribuye progresivamente a audiencias más grandes, funcionando como herramienta de alcance de nuevas audiencias sin costo adicional."
          },
          {
            question: "Una empresa publica contenido de employer branding que orgánicamente tiene alto engagement. ¿Cuál es la estrategia más inteligente para amplificar su impacto?",
            options: [
              "Publicar más contenido similar para mantener el momentum orgánico",
              "Poner presupuesto de publicidad pagada detrás de ese contenido específico de alto rendimiento para amplificar un mensaje que ya ha demostrado resonar con la audiencia",
              "Compartir el contenido en todas las plataformas posibles simultáneamente",
              "Crear una versión mejorada del contenido con mayor producción y publicarla como anuncio pagado"
            ],
            correctIndex: 1,
            explanation: "El contenido que genera alto engagement orgánico ha pasado una prueba de relevancia con la audiencia real. Amplificarlo con presupuesto pagado es la inversión de menor riesgo en publicidad: en lugar de pagar para distribuir contenido de efectividad incierta, se multiplica el alcance de algo que ya demostró funcionar. Esta estrategia 'boost' de contenido orgánico tiene consistentemente mejor CPC y mayor tasa de conversión que anuncios creados exclusivamente para paid media."
          },
          {
            question: "¿Qué es el 'completion rate' en TikTok y por qué es el indicador más importante para entender el rendimiento del contenido?",
            options: [
              "Es el porcentaje de usuarios que completan el formulario de aplicación a una vacante después de ver un video",
              "Es el porcentaje de usuarios que ven el video hasta el final; el algoritmo lo usa como señal principal de calidad para decidir si distribuir el contenido a audiencias más grandes",
              "Es la tasa de usuarios que completan su perfil en la plataforma después de ver contenido de reclutamiento",
              "Es el número de veces que un video se ha reproducido en su totalidad dividido entre el número de seguidores"
            ],
            correctIndex: 1,
            explanation: "TikTok es una plataforma de consumo de video, y el completion rate mide directamente si el contenido es suficientemente bueno para que el usuario no lo abandone. Un completion rate alto (>70%) es la señal más fuerte que el algoritmo recibe de que el contenido merece ser distribuido a grupos más grandes. Por esto, un video de 15 segundos que todos ven completo supera en distribución a un video de 60 segundos que el 80% abandona a los 10 segundos."
          },
          {
            question: "Una estrategia de reclutamiento tiene alto presupuesto en publicidad pagada pero ningún esfuerzo en contenido orgánico. ¿Cuál es el riesgo estratégico más significativo?",
            options: [
              "Violar los términos de servicio de las plataformas publicitarias al publicar demasiados anuncios",
              "Dependencia total del presupuesto para cualquier alcance: al reducir el gasto, la visibilidad cae a cero; sin activo orgánico construido, no hay audiencia ni comunidad que amplifique el mensaje de forma sostenible",
              "Mayor costo por aplicación comparado con estrategias mixtas",
              "Dificultad para medir el ROI de las campañas pagadas sin datos orgánicos de referencia"
            ],
            correctIndex: 1,
            explanation: "La publicidad pagada genera visibilidad mientras hay presupuesto; el contenido orgánico construye un activo permanente: audiencia, comunidad y reputación de marca. Una empresa que solo usa paid media construye sobre arena: el día que el presupuesto se reduce o se elimina, la visibilidad desaparece. El activo orgánico —seguidores comprometidos, contenido que sigue circulando, empleados embajadores— es un multiplicador de cualquier inversión pagada y una protección ante recortes presupuestarios."
          }
        ]
      }
    ]
  }
]

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== "admin2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find or create the course
    let courseId: string
    const existing = await prisma.course.findFirst({ orderBy: { createdAt: "asc" } })

    if (existing) {
      courseId = existing.id
      // Clear completions and enrollments before deleting lessons/modules
      const lessonIds = await prisma.lesson.findMany({ where: { module: { courseId } }, select: { id: true } })
      await prisma.lessonCompletion.deleteMany({ where: { lessonId: { in: lessonIds.map(l => l.id) } } })
      await prisma.enrollment.updateMany({ where: { courseId }, data: { progressPct: 0, lastActivityAt: null } })
      await prisma.module.deleteMany({ where: { courseId } })
      await prisma.course.update({
        where: { id: courseId },
        data: { title: COURSE_TITLE, description: "Curso completo de Reclutamiento Digital y Social Recruiting.", isPublished: true },
      })
    } else {
      const course = await prisma.course.create({
        data: { title: COURSE_TITLE, description: "Curso completo de Reclutamiento Digital y Social Recruiting.", isPublished: true },
      })
      courseId = course.id
    }

    // Create modules one by one to avoid payload limits
    for (let modIdx = 0; modIdx < MODULES.length; modIdx++) {
      const mod = MODULES[modIdx]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await (prisma.module as any).create({
        data: {
          title: mod.title,
          order: modIdx + 1,
          courseId,
        },
      })

      for (let lessonIdx = 0; lessonIdx < mod.lessons.length; lessonIdx++) {
        const lesson = mod.lessons[lessonIdx]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma.lesson as any).create({
          data: {
            title: lesson.title,
            order: lessonIdx + 1,
            contentType: lesson.contentType,
            xpReward: lesson.xpReward,
            moduleId: created.id,
            contentJson: {
              blocks: [{ type: "paragraph", text: lesson.content }],
              ...("quiz" in lesson && lesson.quiz ? { quiz: lesson.quiz } : {}),
            },
          },
        })
      }
    }

    return NextResponse.json({ ok: true, courseId, modules: MODULES.length, lessons: MODULES.reduce((a, m) => a + m.lessons.length, 0) })
  } catch (err) {
    console.error("rebuild-course error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
