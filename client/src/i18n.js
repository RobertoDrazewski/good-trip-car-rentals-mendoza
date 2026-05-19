import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: {
          // --- HERO & NAVBAR ---
          "hero_title": "Recorré Mendoza con Good Trip",
          "hero_subtitle": "Nacimos como una familia con dos autos y un sueño: ofrecer el trato humano que Mendoza merece.",
          "nav_reserva": "Reservas",
          "nav_flota": "Flota",
          "nav_rutas": "Rutas",

          // --- FORMULARIO DE BÚSQUEDA (BookingForm) ---
          "vip_badge": "Solicitar Presupuesto VIP",
          "select_car_label": "Seleccionar Auto",
          "label_retiro": "Fecha de Retiro",
          "label_devolucion": "Fecha de Entrega",
          "lugar_retiro": "Lugar Retiro",
          "lugar_entrega": "Lugar Devolución",
          "loc_ciudad": "Ciudad (Gratis)",
          "loc_aeropuerto": "Aeropuerto",
          "silla_bebe_q": "¿Necesitás Sillita?",
          "btn_cotizar": "COTIZAR",
          "error_calc": "Por favor completá todos los campos obligatorios.",

          // --- RESULTADO DE COTIZACIÓN (QuoteResult Resumen) ---
          "resumen_badge": "Presupuesto Listo",
          "resumen_titulo_1": "Resumen de",
          "resumen_titulo_2": "Viaje",
          "quote_item_car": "Vehículo",
          "quote_day": "Día",
          "quote_days": "Días",
          "quote_item_baby_seat": "Sillita de Bebé",
          "quote_item_wash": "Servicio de Lavado Obligatorio",
          "quote_not_requested": "No Solicitada",
          "quote_pet_title": "Pet Friendly Activo",
          "resumen_dias": "Alquiler por",
          "label_garantia": "Garantía Reembolsable",
          "btn_reservar": "RESERVAR AHORA VIA WHATSAPP",
          "total_entrega": "VALOR TOTAL NETO A ENTREGAR",
          "pet_friendly_tag": "¡Tu mascota viaja con vos sin costos extras!",

          // --- SECCIÓN DE FLOTA ---
          "flota_title": "Nuestra",

          // --- SECCIÓN DE REQUISITOS (Requirements) ---
          "req_section_title": "Requisitos de",
          "req_section_subtitle": "Alquiler",
          "req_age_title": "Edad Mínima",
          "req_age_text": "Para conducir nuestras unidades es necesario ser mayor de 23 años.",
          "req_doc_title": "Documentación",
          "req_doc_text": "Licencia de conducir física, vigente y habilitante para vehículos particulares.",
          "req_km_title": "Kilometraje Libre",
          "req_km_text": "Kilómetros ilimitados en todas las unidades y sin cargo por conductor adicional.",
          "req_card_title": "Sin Tarjeta",
          "req_card_text": "No solicitamos garantía de tarjeta de crédito para concretar el alquiler.",
          "req_warranty_title": "Garantía",
          "req_warranty_text": "Depósito de $450.000 ARS o USD 300 (Reembolsable íntegramente al finalizar el contrato).",
          "req_guide_title": "Guía Turística",
          "req_guide_text": "Le obsequiamos una guía exclusiva para aprovechar sus rutas en Mendoza.",

          // --- SECCIÓN DE RUTAS & TRAZADOR MAPA ---
          "routes_title": "Trazador",
          "routes_subtitle": "Mendocinas",
          "routes_tag": "Explorá Mendoza con la mejor flota",
          "routes_btn_gps": "Iniciar Navegación GPS",
          "routes_empty": "Próximamente nuevas rutas...",
          "routes_error_map": "Seleccioná un destino mendocino para trazar el mapa",

          // --- WIDGET DEL CLIMA (WeatherWidget Avanzado) ---
          "weather_title": "Pronóstico",
          "weather_subtitle": "Semanal",
          "weather_sync": "Sincronizando Clima...",
          "weather_today": "Hoy",
          "weather_sunrise": "Salida del Sol",
          "weather_sunset": "Puesta del Sol",
          "weather_rain_chance": "Prob. Lluvia",
          "weather_wind_speed": "Viento Actual",
          "weather_humidity": "Humedad",
          "weather_planning_text": "Planificá tus rutas turísticas con datos en tiempo real.",
          "season_summer": "Verano",
          "season_autumn": "Otoño",
          "season_winter": "Invierno",
          "season_spring": "Primavera",

          // --- RESEÑAS (GoogleReviews) ---
          "reviews_section_title": "Nuestra",
          "reviews_section_subtitle": "Reputación",
          "reviews_badge_tag": "Reseñas reales de viajeros en Mendoza",
          "reviews_cert_text": "Excelencia Certificada",
          "reviews_btn_google": "Google Maps",
          "reviews_btn_insta": "Síguenos en Instagram",
          "rev_1_text": "Excelente servicio, contacto directo con los dueños que son muy amables. Nos asesoraron sobre lugares para visitar.",
          "rev_1_date": "Hace 3 meses",
          "rev_2_text": "¡Excelente servicio! Todo fue muy amable y atento a todo. El auto era más de lo que esperábamos.",
          "rev_2_date": "Hace 2 meses",
          "rev_3_text": "¡Todo excelente! La mejor experiencia de alquiler en Mendoza. El auto funcionó perfecto.",
          "rev_3_date": "Hace 4 meses",

          // --- MODAL DE ÉXITO & CAPTURA ---
          "modal_titulo": "¡SOLICITUD ENVIADA!",
          "modal_sub": "Nos pondremos en contacto con vos por WhatsApp para confirmar los detalles.",
          "placeholder_nombre": "Nombre completo",
          "placeholder_wa": "WhatsApp (Ej: 2612764618)",
          "btn_confirmar": "CONFIRMAR Y CHATEAR",

          // --- CHAT IA ---
          "chat_welcome": "¡Hola! Soy el asistente virtual de Good Trip. ¿En qué puedo ayudarte?",
          "chat_followup": "¡Perfecto {{name}}! Ya tengo tus datos. Si estás de acuerdo con el presupuesto, solo confirmame por acá.",
          "chat_error": "Fallo estructural al activar:",
          "online_status": "En línea",
          "ai_typing": "Good Trip está escribiendo...",
          "chat_placeholder": "Escribí aquí...",

          // --- FOOTER ---
          "footer_desc": "Alquiler de vehículos sin franquicias ocultas ni sorpresas. Tu mejor experiencia recorriendo las rutas mendocinas.",
          "footer_nav_title": "Navegación",
          "footer_contact_title": "Atención Directa",
          "nav_staff": "Staff",
          "footer_rights": "Todos los derechos reservados."
        }
      },
      en: {
        translation: {
          // --- HERO & NAVBAR ---
          "hero_title": "Explore Mendoza with Good Trip",
          "hero_subtitle": "We were born as a family with two cars and a dream: to offer the humane treatment that Mendoza deserves.",
          "nav_reserva": "Bookings",
          "nav_flota": "Fleet",
          "nav_rutas": "Routes",

          // --- FORMULARIO DE BÚSQUEDA ---
          "vip_badge": "Request VIP Quote",
          "select_car_label": "Select Car",
          "label_retiro": "Pick-up Date",
          "label_devolucion": "Return Date",
          "lugar_retiro": "Pick-up Location",
          "lugar_entrega": "Return Location",
          "loc_ciudad": "City (Free)",
          "loc_aeropuerto": "Airport",
          "silla_bebe_q": "Baby Seat?",
          "btn_cotizar": "GET QUOTE",
          "error_calc": "Please fill in all mandatory fields.",

          // --- RESULTADO DE COTIZACIÓN (QuoteResult Resumen) ---
          "resumen_badge": "Quote Ready",
          "resumen_titulo_1": "Trip",
          "resumen_titulo_2": "Summary",
          "quote_item_car": "Vehicle",
          "quote_day": "Day",
          "quote_days": "Days",
          "quote_item_baby_seat": "Baby Seat",
          "quote_item_wash": "Mandatory Car Wash Fee",
          "quote_not_requested": "Not Requested",
          "quote_pet_title": "Pet Friendly Active",
          "resumen_dias": "Rental for",
          "label_garantia": "Refundable Deposit",
          "btn_reservar": "BOOK NOW VIA WHATSAPP",
          "total_entrega": "TOTAL NET AMOUNT TO PAY ON ARRIVAL",
          "pet_friendly_tag": "Your pet travels with you at no extra cost!",

          // --- SECCIÓN DE FLOTA ---
          "flota_title": "Our",

          // --- SECCIÓN DE REQUISITOS (Requirements) ---
          "req_section_title": "Rental",
          "req_section_subtitle": "Requirements",
          "req_age_title": "Minimum Age",
          "req_age_text": "To drive our units it is required to be over 23 years old.",
          "req_doc_title": "Documentation",
          "req_doc_text": "Physical, valid driver's license authorized for passenger cars.",
          "req_km_title": "Free Mileage",
          "req_km_text": "Unlimited kilometers on all units and no charge for additional driver.",
          "req_card_title": "No Card Required",
          "req_card_text": "We do not request a credit card guarantee to complete the rental.",
          "req_warranty_title": "Security Deposit",
          "req_warranty_text": "Deposit of $450,000 ARS or USD 300 (Fully refundable at the end of the contract).",
          "req_guide_title": "Tourist Guide",
          "req_guide_text": "We provide a complimentary exclusive guide to enjoy your routes in Mendoza.",

          // --- SECCIÓN DE RUTAS & TRAZADOR MAPA ---
          "routes_title": "Mendoza",
          "routes_subtitle": "Tracker",
          "routes_tag": "Explore Mendoza with the best fleet",
          "routes_btn_gps": "Start GPS Navigation",
          "routes_empty": "New routes coming soon...",
          "routes_error_map": "Select a destination to trace the map route",

          // --- WIDGET DEL CLIMA (WeatherWidget Avanzado) ---
          "weather_title": "Weekly",
          "weather_subtitle": "Forecast",
          "weather_sync": "Syncing Weather...",
          "weather_today": "Today",
          "weather_sunrise": "Sunrise",
          "weather_sunset": "Sunset",
          "weather_rain_chance": "Rain Chance",
          "weather_wind_speed": "Current Wind",
          "weather_humidity": "Humidity",
          "weather_planning_text": "Plan your tourist routes with real-time data.",
          "season_summer": "Summer",
          "season_autumn": "Autumn",
          "season_winter": "Winter",
          "season_spring": "Spring",

          // --- RESEÑAS ---
          "reviews_section_title": "Our",
          "reviews_section_subtitle": "Reputation",
          "reviews_badge_tag": "Real traveler reviews in Mendoza",
          "reviews_cert_text": "Certified Excellence",
          "reviews_btn_google": "Google Maps",
          "reviews_btn_insta": "Follow us on Instagram",
          "rev_1_text": "Excellent service, direct contact with the owners who are very friendly. They advised us on places to visit.",
          "rev_1_date": "3 months ago",
          "rev_2_text": "Excellent service! Everything was very kind and attentive. The car was more than we expected.",
          "rev_2_date": "2 months ago",
          "rev_3_text": "Everything excellent! The best rental experience in Mendoza. The car worked perfectly.",
          "rev_3_date": "4 months ago",

          // --- MODAL ---
          "modal_titulo": "REQUEST SENT!",
          "modal_sub": "We will contact you via WhatsApp to confirm the details.",
          "placeholder_nombre": "Full name",
          "placeholder_wa": "WhatsApp (e.g., 2612764618)",
          "btn_confirmar": "CONFIRM & CHAT",

          // --- CHAT IA ---
          "chat_welcome": "Hi! I'm Good Trip's virtual assistant. How can I help you?",
          "chat_followup": "Perfect {{name}}! I have your details. If you agree with the quote, just confirm here.",
          "chat_error": "Activation failure:",
          "online_status": "Online",
          "ai_typing": "Good Trip is typing...",
          "chat_placeholder": "Type here...",

          // --- FOOTER ---
          "footer_desc": "Car rental with no hidden fees or surprises. Your best experience traveling the roads of Mendoza.",
          "footer_nav_title": "Navigation",
          "footer_contact_title": "Direct Support",
          "nav_staff": "Staff",
          "footer_rights": "All rights reserved."
        }
      },
      pt: {
        translation: {
          // --- HERO & NAVBAR ---
          "hero_title": "Explore Mendoza com Good Trip",
          "hero_subtitle": "Nascemos como uma família com dois carros e um sonho: oferecer o tratamento humano que Mendoza merece.",
          "nav_reserva": "Reservas",
          "nav_flota": "Frota",
          "nav_rutas": "Rotas",

          // --- FORMULARIO DE BÚSQUEDA ---
          "vip_badge": "Solicitar Orçamento VIP",
          "select_car_label": "Selecionar Carro",
          "label_retiro": "Data de Retirada",
          "label_devolucion": "Data de Devolução",
          "lugar_retiro": "Local de Retirada",
          "lugar_entrega": "Local de Devolução",
          "loc_ciudad": "Cidade (Grátis)",
          "loc_aeropuerto": "Aeroporto",
          "silla_bebe_q": "Cadeira de Bebê?",
          "btn_cotizar": "ORÇAMENTO",
          "error_calc": "Por favor, preencha todos os campos obrigatórios.",

          // --- RESULTADO DE COTIZACIÓN (QuoteResult Resumen) ---
          "resumen_badge": "Orçamento Pronto",
          "resumen_titulo_1": "Resumo de",
          "resumen_titulo_2": "Viagem",
          "quote_item_car": "Veículo",
          "quote_day": "Dia",
          "quote_days": "Dias",
          "quote_item_baby_seat": "Cadeira de Bebê",
          "quote_item_wash": "Taxa de Lavagem Obrigatória",
          "quote_not_requested": "Não Solicitada",
          "quote_pet_title": "Pet Friendly Ativo",
          "resumen_dias": "Aluguel por",
          "label_garantia": "Garantia Reembolsável",
          "btn_reservar": "RESERVAR AGORA VIA WHATSAPP",
          "total_entrega": "VALOR TOTAL LÍQUIDO A PAGAR NA CHEGADA",
          "pet_friendly_tag": "Seu animal de estimação viaja com você sem custos extras!",

          // --- SECCIÓN DE FLOTA ---
          "flota_title": "Nossa",

          // --- SECCIÓN DE REQUISITOS (Requirements) ---
          "req_section_title": "Requisitos de",
          "req_section_subtitle": "Aluguel",
          "req_age_title": "Idade Mínima",
          "req_age_text": "Para dirigir nossas unidades é necessário ter mais de 23 anos.",
          "req_doc_title": "Documentación",
          "req_doc_text": "Carteira de habilitação física, válida e autorizada para veículos de passeio.",
          "req_km_title": "Quilometragem Livre",
          "req_km_text": "Quilômetros ilimitados em todas as unidades e sem taxa para motorista adicional.",
          "req_card_title": "Sem Cartão",
          "req_card_text": "Não solicitamos garantia de cartão de crédito para fechar o aluguel.",
          "req_warranty_title": "Caução / Garantia",
          "req_warranty_text": "Depósito de $450.000 ARS ou USD 300 (Totalmente reembolsável ao final do contrato).",
          "req_guide_title": "Guia Turístico",
          "req_guide_text": "Oferecemos um guia exclusivo gratuito para aproveitar suas rotas em Mendoza.",

          // --- SECCIÓN DE ROTAS & TRAZADOR MAPA ---
          "routes_title": "Traçador",
          "routes_subtitle": "Mendocinas",
          "routes_tag": "Explore Mendoza com a melhor frota",
          "routes_btn_gps": "Iniciar Navegação GPS",
          "routes_empty": "Novas rotas em breve...",
          "routes_error_map": "Selecione um destino para traçar a rota no mapa",

          // --- WIDGET DEL CLIMA (WeatherWidget Avanzado) ---
          "weather_title": "Previsão",
          "weather_subtitle": "Semanal",
          "weather_sync": "Sincronizando Clima...",
          "weather_today": "Hoje",
          "weather_sunrise": "Nascer do Sol",
          "weather_sunset": "Pôr do Sol",
          "weather_rain_chance": "Chuva Prob.",
          "weather_wind_speed": "Vento Actual",
          "weather_humidity": "Umidade",
          "weather_planning_text": "Planeje suas rotas turísticas com dados em tempo real.",
          "season_summer": "Verão",
          "season_autumn": "Outono",
          "season_winter": "Inverno",
          "season_spring": "Primavera",

          // --- RESEÑAS ---
          "reviews_section_title": "Nossa",
          "reviews_section_subtitle": "Reputação",
          "reviews_badge_tag": "Avaliações reais de viajantes em Mendoza",
          "reviews_cert_text": "Excelência Certificada",
          "reviews_btn_google": "Google Maps",
          "reviews_btn_insta": "Siga-nos no Instagram",
          "rev_1_text": "Excelente serviço, contacto directo com os proprietários que são muito amigáveis. Eles nos aconselharam sobre lugares para visitar.",
          "rev_1_date": "3 meses atrás",
          "rev_2_text": "Excelente serviço! Tudo foi muito gentil e atencioso. O carro era mais do que esperávamos.",
          "rev_2_date": "2 meses atrás",
          "rev_3_text": "Tudo excelente! A melhor experiência de aluguel em Mendoza. O carro funcionou perfeitamente.",
          "rev_3_date": "4 meses atrás",

          // --- MODAL ---
          "modal_titulo": "SOLICITAÇÃO ENVIADA!",
          "modal_sub": "Entraremos em contato com você pelo WhatsApp para confirmar os detalhes.",
          "placeholder_nombre": "Nome completo",
          "placeholder_wa": "WhatsApp (Ex: 2612764618)",
          "btn_confirmar": "CONFIRMAR E CHAT",

          // --- CHAT IA ---
          "chat_welcome": "Olá! Sou o assistente virtual da Good Trip. Como posso te ajudar?",
          "chat_followup": "Perfeito {{name}}! Já tenho seus dados. Se você concorda com o orçamento, confirme por aqui.",
          "chat_error": "Falha estrutural ao ativar:",
          "online_status": "Online",
          "ai_typing": "Good Trip está escrevendo...",
          "chat_placeholder": "Escreva aqui...",

          // --- FOOTER ---
          "footer_desc": "Aluguel de veículos sem taxas ocultas ou surpresas. Sua melhor experiência percorrendo as estradas de Mendoza.",
          "footer_nav_title": "Navegação",
          "footer_contact_title": "Atendimento Directo",
          "nav_staff": "Staff",
          "footer_rights": "Todos os direitos reservados."
        }
      }
    },
    lng: "es", 
    fallbackLng: "es",
    interpolation: { escapeValue: false }
  });

export default i18n;