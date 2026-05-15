import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          // --- HERO & NAVBAR ---
          "hero_title": "Recorré Mendoza con Mauricio",
          "hero_subtitle": "Alquiler de autos directo, sin vueltas y con la mejor atención personalizada.",
          "nav_reserva": "Reservas",
          "nav_flota": "Flota",
          "nav_rutas": "Rutas",

          // --- FORMULARIO DE BÚSQUEDA (BookingForm) ---
          "label_retiro": "Fecha de Retiro",
          "label_devolucion": "Fecha de Entrega",
          "lugar_retiro": "Lugar Retiro",
          "lugar_entrega": "Lugar Devolución",
          "loc_ciudad": "Ciudad (Gratis)",
          "loc_aeropuerto": "Aeropuerto",
          "silla_bebe_q": "Silla Bebé?",
          "btn_cotizar": "COTIZAR",
          "error_calc": "Error al calcular. Revisá las fechas.",

          // --- RESULTADO DE COTIZACIÓN (QuoteResult) ---
          "resumen_titulo": "Resumen del Alquiler",
          "resumen_dias": "Presupuesto por {{count}} días",
          "label_garantia": "Garantía Reembolsable",
          "garantia_desc": "Efectivo o Tarjeta",
          "btn_reservar": "RESERVAR AHORA",
          "sin_tarjeta": "Sin tarjeta de crédito",
          "total_entrega": "VALOR TOTAL A ENTREGAR AL RECIBIR",
          "pet_friendly_tag": "Pet Friendly",

          // --- SECCIÓN DE RUTAS ---
          "routes_title": "Destinos",
          "routes_subtitle": "Imperdibles",
          "routes_tag": "Explorá Mendoza con la mejor flota",
          "routes_btn_gps": "Iniciar Nave接地 GPS",
          "routes_empty": "Próximamente nuevas rutas...",
          "routes_error_map": "Esta ruta aún no tiene un mapa configurado.",

          // --- WIDGET DEL CLIMA ---
          "weather_title": "Pronóstico",
          "weather_subtitle": "Semanal",
          "weather_sync": "Sincronizando Clima...",
          "weather_today": "Hoy",

          // --- RESEÑAS (GoogleReviews) ---
          "reviews_section_title": "Nuestra",
          "reviews_section_subtitle": "Reputación",
          "reviews_badge_tag": "Reseñas reales de viajeros en Mendoza",
          "reviews_cert_text": "Excelencia Certificada",
          "reviews_btn_google": "Google Maps",
          "reviews_btn_insta": "Síguenos en Instagram",
          "rev_1_text": "Excelente servicio, contacto directo con los dueños que son muy amables. Nos asesoraron sobre lugares para visitar.",
          "rev_1_date": "Hace 3 meses",
          "rev_2_text": "¡Excelente servicio! Mauricio fue muy amable y atento a todo. El auto era más de lo que esperábamos.",
          "rev_2_date": "Hace 2 meses",
          "rev_3_text": "¡Todo excelente! La mejor experiencia de alquiler en Mendoza. El auto funcionó perfecto.",
          "rev_3_date": "Hace 4 meses",

          // --- MODAL DE ÉXITO & CAPTURA ---
          "modal_titulo": "¡SOLICITUD ENVIADA!",
          "modal_sub": "Mauricio se pondrá en contacto con vos por WhatsApp para confirmar los detalles.",
          "placeholder_nombre": "Nombre completo",
          "placeholder_wa": "WhatsApp (Ej: 2612764618)",
          "btn_confirmar": "CONFIRMAR Y CHATEAR",

          // --- CHAT IA ---
          "chat_welcome": "¡Hola! Soy el asistente de Mauricio. ¿En qué puedo ayudarte?",
          "chat_followup": "¡Perfecto {{name}}! Ya tengo tus datos. Si estás de acuerdo con el presupuesto, solo confirmame por acá.",
          "chat_error": "Tuve un problema. ¿Me consultás por WhatsApp?",
          "online_status": "En línea",
          "ai_typing": "Mauricio está escribiendo...",
          "chat_placeholder": "Escribí aquí...",

          "footer_rights": "© 2026 - Mendoza Rent-a-Car | Solución Automática por Puma Code"
        }
      },
      en: {
        translation: {
          "hero_title": "Explore Mendoza with Mauricio",
          "hero_subtitle": "Direct car rental, no hassle, and the best personalized service.",
          "nav_reserva": "Bookings",
          "nav_flota": "Fleet",
          "nav_rutas": "Routes",

          "label_retiro": "Pick-up Date",
          "label_devolucion": "Return Date",
          "lugar_retiro": "Pick-up Location",
          "lugar_entrega": "Return Location",
          "loc_ciudad": "Downtown (Free)",
          "loc_aeropuerto": "Airport",
          "silla_bebe_q": "Baby Seat?",
          "btn_cotizar": "GET QUOTE",
          "error_calc": "Calculation error. Please check dates.",

          "resumen_titulo": "Booking Summary",
          "resumen_dias": "Quote for {{count}} days",
          "label_garantia": "Refundable Deposit",
          "garantia_desc": "Cash or Card",
          "btn_reservar": "BOOK NOW",
          "sin_tarjeta": "No credit card required",
          "total_entrega": "TOTAL AMOUNT TO PAY ON ARRIVAL",
          "pet_friendly_tag": "Pet Friendly",

          "routes_title": "Must-See",
          "routes_subtitle": "Destinations",
          "routes_tag": "Explore Mendoza with the best fleet",
          "routes_btn_gps": "Start GPS Navigation",
          "routes_empty": "New routes coming soon...",
          "routes_error_map": "This route doesn't have a map configured yet.",

          "weather_title": "Weekly",
          "weather_subtitle": "Forecast",
          "weather_sync": "Syncing Weather...",
          "weather_today": "Today",

          "reviews_section_title": "Our",
          "reviews_section_subtitle": "Reputation",
          "reviews_badge_tag": "Real traveler reviews in Mendoza",
          "reviews_cert_text": "Certified Excellence",
          "reviews_btn_google": "Google Maps",
          "reviews_btn_insta": "Follow us on Instagram",
          "rev_1_text": "Excellent service, direct contact with the owners who are very friendly. They advised us on places to visit.",
          "rev_1_date": "3 months ago",
          "rev_2_text": "Excellent service! Mauricio was very kind and attentive. The car was more than we expected.",
          "rev_2_date": "2 months ago",
          "rev_3_text": "Everything excellent! The best rental experience in Mendoza. The car worked perfectly.",
          "rev_3_date": "4 months ago",

          "modal_titulo": "REQUEST SENT!",
          "modal_sub": "Mauricio will contact you via WhatsApp to confirm the details.",
          "placeholder_nombre": "Full name",
          "placeholder_wa": "WhatsApp (e.g., +54 9 261...)",
          "btn_confirmar": "CONFIRM & CHAT",

          "chat_welcome": "Hi! I'm Mauricio's assistant. How can I help you?",
          "chat_followup": "Perfect {{name}}! I have your details. If you agree with the quote, just confirm here.",
          "chat_error": "I had a problem. Can you contact me via WhatsApp?",
          "online_status": "Online",
          "ai_typing": "Mauricio is typing...",
          "chat_placeholder": "Type here...",

          "footer_rights": "© 2026 - Mendoza Rent-a-Car | Automatic Solution by Puma Code"
        }
      },
      pt: {
        translation: {
          "hero_title": "Explore Mendoza com Mauricio",
          "hero_subtitle": "Aluguel de carros direto, sem complicações e com o melhor atendimento personalizado.",
          "nav_reserva": "Reservas",
          "nav_flota": "Frota",
          "nav_rutas": "Rotas",

          "label_retiro": "Data de Retirada",
          "label_devolucion": "Data de Devolução",
          "lugar_retiro": "Local de Retirada",
          "lugar_entrega": "Local de Devolução",
          "loc_ciudad": "Centro (Grátis)",
          "loc_aeropuerto": "Aeroporto",
          "silla_bebe_q": "Cadeira de Bebê?",
          "btn_cotizar": "ORÇAMENTO",
          "error_calc": "Erro no cálculo. Verifique as datas.",

          "resumen_titulo": "Resumo da Reserva",
          "resumen_dias": "Orçamento para {{count}} dias",
          "label_garantia": "Garantia Reembolsável",
          "garantia_desc": "Dinheiro o Cartão",
          "btn_reservar": "RESERVAR AGORA",
          "sin_tarjeta": "Sem cartão de crédito",
          "total_entrega": "VALOR TOTAL A PAGAR NA CHEGADA",
          "pet_friendly_tag": "Pet Friendly",

          "routes_title": "Destinos",
          "routes_subtitle": "Imperdíveis",
          "routes_tag": "Explore Mendoza com a melhor frota",
          "routes_btn_gps": "Iniciar Navegação GPS",
          "routes_empty": "Novas rotas em breve...",
          "routes_error_map": "Esta rota ainda não tem um mapa configurado.",

          "weather_title": "Previsão",
          "weather_subtitle": "Semanal",
          "weather_sync": "Sincronizando Clima...",
          "weather_today": "Hoje",

          "reviews_section_title": "Nossa",
          "reviews_section_subtitle": "Reputação",
          "reviews_badge_tag": "Avaliações reais de viajantes em Mendoza",
          "reviews_cert_text": "Excelência Certificada",
          "reviews_btn_google": "Google Maps",
          "reviews_btn_insta": "Siga-nos no Instagram",
          "rev_1_text": "Excelente serviço, contacto directo com os proprietários que son muito amigáveis. Eles nos aconselharam sobre lugares para visitar.",
          "rev_1_date": "3 meses atrás",
          "rev_2_text": "Excelente serviço! Mauricio foi muito gentil e atencioso. O carro era mais do que esperávamos.",
          "rev_2_date": "2 meses atrás",
          "rev_3_text": "Tudo excelente! A melhor experiência de aluguel em Mendoza. O carro funcionou perfeitamente.",
          "rev_3_date": "4 meses atrás",

          "modal_titulo": "SOLICITAÇÃO ENVIADA!",
          "modal_sub": "Mauricio entrará em contato com você pelo WhatsApp para confirmar os detalhes.",
          "placeholder_nombre": "Nome completo",
          "placeholder_wa": "WhatsApp (Ex: +54 9 261...)",
          "btn_confirmar": "CONFIRMAR E CHAT",

          "chat_welcome": "Olá! Sou o assistente do Mauricio. Como posso te ajudar?",
          "chat_followup": "Perfeito {{name}}! Já tengo seus dados. Se você concorda com o orçamento, confirme por aqui.",
          "chat_error": "Tive um problema. Você puede me consultar pelo WhatsApp?",
          "online_status": "Online",
          "ai_typing": "Mauricio está escrevendo...",
          "chat_placeholder": "Escreva aqui...",

          "footer_rights": "© 2026 - Mendoza Rent-a-Car | Solução Automática por Puma Code"
        }
      }
    },
    lng: "es", 
    fallbackLng: "es",
    interpolation: { escapeValue: false }
  });

export default i18n;