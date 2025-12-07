# LinkLock - Monetización

## Modelo Freemium

### Free Tier
- Hasta 500 links
- Sin límite de carpetas
- Búsqueda básica
- Extensión Chrome

### Pro Tier ($3.99/mes)
- Links ilimitados
- Búsqueda avanzada (OCR en screenshots)
- Carpetas privadas
- Exportar a CSV/PDF
- Sincronización en tiempo real
- Sin anuncios

## Pasos para lanzar

### 1. Autenticación (1-2 días)
- [ ] Implementar auth con email/contraseña o Google OAuth
- [ ] JWT tokens
- [ ] Verificación de email

### 2. Pagos (2-3 días)
- [ ] Integrar Stripe/Paddle
- [ ] Dashboard de suscripción
- [ ] Webhooks para cambios de plan

### 3. Limitadores (1 día)
- [ ] Contar links del usuario
- [ ] Bloquear si alcanza límite free
- [ ] Mostrar CTA "Upgrade to Pro"

### 4. Landing Page (2 días)
- [ ] Crear sitio de marketing
- [ ] Pricing explícito
- [ ] Testimonios (buscar primeros usuarios)

### 5. Deployar (1-2 días)
- [ ] API en Heroku/Railway/Fly.io
- [ ] Web app en Vercel
- [ ] Chrome Web Store
- [ ] Dominio propio

### 6. Marketing (Ongoing)
- [ ] TikTok videos (tu contenido)
- [ ] ProductHunt
- [ ] Reddit (r/productivity, r/webdev)
- [ ] Influencers de productivity

## Stack Recomendado para Producción

- API: Railway/Fly.io ($5-20/mes)
- DB: PostgreSQL (mejor que SQLite)
- Web: Vercel (free)
- Pagos: Stripe
- Email: Resend/SendGrid

## Quick Wins de Monetización

1. **Antes de Pro**: Ofrecer "Beta Pro" gratis a primeros 100 usuarios
2. **Límite visual**: En free tier, mostrar progreso "450/500 links"
3. **One-click upgrade**: Botón visible cuando alcanza 90% del límite
4. **Trial**: 14 días de Pro gratis al conectar Google

## Links Útiles

- https://stripe.com/pricing
- https://vercel.com/pricing
- https://railway.app/pricing
- https://resend.com/pricing
