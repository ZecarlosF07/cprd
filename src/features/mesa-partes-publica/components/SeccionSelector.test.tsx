import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SeccionSelector } from './SeccionSelector'

describe('SeccionSelector', () => {
    it('notifica cuando el visitante elige JPRD', () => {
        const onChange = vi.fn()
        render(<SeccionSelector value="arbitraje" onChange={onChange} />)

        fireEvent.click(screen.getByRole('button', { name: /JPRD/i }))

        expect(onChange).toHaveBeenCalledWith('jprd')
    })
})
