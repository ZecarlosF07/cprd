# Mesa de partes CPRD

Mermaid flujo de navegacion

```
flowchart TD
A[Landing] --> B[Login]
A --> C[Registro]

C --> D[Registro perfil]
D --> B

B --> E{Rol del usuario}

E --> F[Dashboard usuario externo]
E --> G[Dashboard usuario interno]
E --> H[Dashboard administrador]

%% Usuario externo
F --> F1[Mis solicitudes]
F --> F2[Nueva solicitud]
F2 --> F21[Seleccionar tipo de solicitud]

F21 --> F22[Formulario arbitraje]
F21 --> F23[Formulario JPRD]

F22 --> F24[Carga de documentos]
F23 --> F24

F24 --> F25[Carga de comprobante de pago]
F25 --> F26[Resumen de solicitud]
F26 --> F27[Detalle de solicitud]

F1 --> F27
F27 --> F28[Estado de solicitud]
F27 --> F29[Documentos]
F27 --> F30[Subsanar observaciones]

%% Usuario interno
G --> G1[Bandeja de solicitudes]
G1 --> G2[Detalle de solicitud]

G2 --> G3[Revision de documentos]
G2 --> G4[Revision de pago]
G2 --> G5[Observaciones]
G2 --> G6[Historial]

%% Administrador
H --> H1[Gestion de usuarios]
H --> H2[Crear usuario interno]
H --> H3[Configuracion del sistema]

```

Mermaid de diagrama de flujo 

```
flowchart TD
A[Inicio] --> B{Usuario registrado?}

B -- No --> C[Registro de usuario]
C --> D[Creacion de perfil Persona natural o juridica]
D --> E[Inicio de sesion]

B -- Si --> E

E --> F[Dashboard usuario externo]

F --> G[Crear nueva solicitud]
G --> H{Tipo de solicitud}

H --> H1[Arbitraje]
H --> H2[Arbitraje emergencia]
H --> H3[JPRD]

H1 --> I[Formulario arbitraje]
H2 --> I
H3 --> J[Formulario JPRD]

I --> K[Datos del demandante desde perfil]
J --> K1[Datos del contratista desde perfil]

K --> L[Registro del demandado]
K1 --> L1[Registro de la entidad]

L --> M[Adjuntar documentos]
L1 --> M

M --> N[Adjuntar comprobante de pago obligatorio]

N --> O{Formulario completo y valido?}

O -- No --> P[Mostrar errores]
P --> M

O -- Si --> Q[Enviar solicitud]

Q --> R[Generar codigo de expediente]
R --> S[Estado recibida]
S --> T[Registrar trazabilidad]
T --> U[Notificar usuario]

U --> V[Dashboard usuario interno]

V --> W[Revision administrativa]
W --> X{Documentos y pago correctos?}

X -- No --> Y[Registrar observacion]
Y --> Z[Estado observada]
Z --> AA[Notificar usuario externo]

AA --> AB[Usuario externo subsana]
AB --> AC[Adjuntar nuevos documentos]
AC --> AD[Estado subsanada]
AD --> T

X -- Si --> AE[Validar pago y documentos]
AE --> AF[Estado admitida]

AF --> AG{Decision final}

AG --> AH[Estado rechazada]
AG --> AI[Estado archivada]

AH --> AJ[Notificacion final]
AI --> AJ

AJ --> AK[Fin]

```

Mermaid Diagrama E-R

```
erDiagram
USERS {
uuid id PK
text email
timestamptz created_at
}

PROFILES {
    uuid id PK
    uuid user_id FK
    varchar tipo_persona
    varchar tipo_documento
    varchar numero_documento
    varchar nombres_apellidos
    varchar razon_social
    varchar celular
    text domicilio
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
}

SOLICITUDES {
    uuid id PK
    varchar codigo_expediente
    varchar tipo_solicitud
    varchar estado
    uuid user_id FK
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
}

PARTES {
    uuid id PK
    uuid solicitud_id FK
    uuid user_id FK
    varchar rol
    varchar tipo_persona
    varchar tipo_documento
    varchar numero_documento
    varchar nombres_apellidos
    varchar razon_social
    varchar celular
    text domicilio
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
}

CORREOS_PARTE {
    uuid id PK
    uuid parte_id FK
    varchar correo
    boolean es_principal
    timestamptz created_at
    timestamptz deleted_at
}

DOCUMENTOS {
    uuid id PK
    uuid solicitud_id FK
    varchar tipo_documento
    text archivo_url
    text link_externo
    text comentario
    uuid created_by FK
    timestamptz created_at
    timestamptz deleted_at
}

COMPROBANTES_PAGO {
    uuid id PK
    uuid solicitud_id FK
    text archivo_url
    varchar estado
    text observado_motivo
    uuid revisado_por FK
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
}

HISTORIAL_SOLICITUD {
    uuid id PK
    uuid solicitud_id FK
    varchar accion
    text descripcion
    uuid user_id FK
    timestamptz created_at
    timestamptz deleted_at
}

NOTIFICACIONES {
    uuid id PK
    uuid solicitud_id FK
    uuid user_id FK
    varchar tipo
    text mensaje
    boolean leido
    timestamptz created_at
    timestamptz deleted_at
}

USERS ||--|| PROFILES : tiene
USERS ||--o{ SOLICITUDES : crea
SOLICITUDES ||--o{ PARTES : contiene
PARTES ||--o{ CORREOS_PARTE : tiene
SOLICITUDES ||--o{ DOCUMENTOS : adjunta
SOLICITUDES ||--o{ COMPROBANTES_PAGO : requiere
SOLICITUDES ||--o{ HISTORIAL_SOLICITUD : genera
SOLICITUDES ||--o{ NOTIFICACIONES : dispara
USERS ||--o{ HISTORIAL_SOLICITUD : realiza

```