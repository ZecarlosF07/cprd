# Estructura Base de Carpetas – Aplicacion React

Esta estructura esta pensada para una aplicacion SaaS institucional desarrollada con React, siguiendo buenas practicas de separacion de responsabilidades, DRY, escalabilidad y mantenibilidad.

---

## Estructura general

```
src/
│
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers.tsx
│   └── routes/
│       ├── external.routes.tsx
│       ├── internal.routes.tsx
│       └── admin.routes.tsx
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   └── Loader.tsx
│   │
│   ├── forms/
│   │   ├── ParteForm/
│   │   │   ├── ParteForm.tsx
│   │   │   ├── ParteForm.schema.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── DocumentUpload/
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── PaymentUpload/
│   │   │   ├── PaymentUpload.tsx
│   │   │   └── index.ts
│   │
│   └── layout/
│       ├── ExternalLayout.tsx
│       ├── InternalLayout.tsx
│       ├── AdminLayout.tsx
│       └── AuthLayout.tsx
│
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── solicitudes/
│   │   ├── pages/
│   │   │   ├── SolicitudesListPage.tsx
│   │   │   ├── SolicitudCreatePage.tsx
│   │   │   ├── SolicitudDetailPage.tsx
│   │   │   └── SolicitudReviewPage.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── SolicitudCard.tsx
│   │   │   ├── SolicitudStatusBadge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSolicitudes.ts
│   │   │   └── useSolicitud.ts
│   │   │
│   │   ├── services/
│   │   │   └── solicitudes.service.ts
│   │   │
│   │   ├── schemas/
│   │   │   ├── arbitraje.schema.ts
│   │   │   ├── jprd.schema.ts
│   │   │   └── common.schema.ts
│   │   │
│   │   └── types.ts
│   │
│   ├── admin/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types.ts
│   │
│   └── internal/
│       ├── pages/
│       ├── services/
│       └── types.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useRole.ts
│   ├── useDebounce.ts
│   └── useModal.ts
│
├── services/
│   ├── supabase.client.ts
│   ├── storage.service.ts
│   └── notification.service.ts
│
├── store/
│   ├── auth.store.ts
│   └── ui.store.ts
│
├── utils/
│   ├── constants.ts
│   ├── formatters.ts
│   ├── validators.ts
│   └── permissions.ts
│
├── types/
│   └── index.ts
│
├── styles/
│   ├── globals.css
│   └── theme.css
│
├── main.tsx
└── vite-env.d.ts
```

---

## Criterios de diseno

- **app/**: configuracion global, ruteo y providers
- **features/**: logica de negocio por dominio funcional
- **components/**: componentes reutilizables sin logica de negocio
- **services/**: comunicacion con Supabase u otros servicios externos
- **hooks/**: logica reutilizable transversal
- **utils/**: helpers puros
- **store/**: estado global

---

## Regla de oro

- Si conoce Supabase, va en `services`
- Si representa negocio, va en `features`
- Si solo renderiza UI, va en `components`

---

Esta estructura permite escalar el sistema sin reescrituras y facilita el trabajo en equipo.