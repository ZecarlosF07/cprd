import { expect, test } from '@playwright/test'

const trackingResult = {
    codigo: '2026-0000001',
    estado: 'recibida',
    fechaIngreso: '2026-07-15T12:00:00-05:00',
    observaciones: [],
    seccion: 'arbitraje',
    tramite: 'Solicitud de Arbitraje Institucional',
}

test.beforeEach(async ({ page }) => {
    await page.route('http://127.0.0.1:54321/**', async (route) => {
        const url = route.request().url()
        if (url.includes('/functions/v1/public-tracking')) {
            await route.fulfill({ json: trackingResult })
            return
        }
        await route.fulfill({ json: { user: null } })
    })
})

test('permite acceder a la mesa pública y navegar a trazabilidad', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Mesa de partes virtual' })).toBeVisible()
    await expect(page.getByTestId('turnstile-e2e')).toBeVisible()

    await page.getByRole('link', { name: 'Trazabilidad' }).click()
    await expect(page).toHaveURL(/\/trazabilidad$/)
    await expect(page.getByRole('heading', { name: 'Trazabilidad' })).toBeVisible()
})

test('redirige el login heredado hacia la mesa pública', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/mesa-de-partes$/)
})

test('muestra las validaciones principales antes de enviar', async ({ page }) => {
    await page.goto('/mesa-de-partes')
    await page.getByRole('button', { name: 'Enviar documento' }).click()

    await expect(page.getByText('Ingrese el documento')).toBeVisible()
    await expect(page.getByText('Ingrese nombres y apellidos')).toBeVisible()
    await expect(page.getByText('Ingrese un correo válido')).toBeVisible()
    await expect(page.getByText('Ingrese domicilio')).toBeVisible()
    await expect(page.getByText('Debe aceptar las notificaciones electrónicas')).toBeVisible()
    await expect(page.getByText('Debe aceptar el tratamiento de datos personales')).toBeVisible()
})

test('consulta trazabilidad mediante una respuesta controlada', async ({ page }) => {
    await page.goto('/trazabilidad')
    await page.getByPlaceholder('2026-0000001').fill('2026-0000001')
    await page.getByRole('button', { name: 'Consultar' }).click()

    await expect(page.getByText('Solicitud de Arbitraje Institucional')).toBeVisible()
    await expect(page.getByText('recibida')).toBeVisible()
})

test('protege el panel administrador para visitantes', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/acceso-cprd-e2e$/)
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible()
})
