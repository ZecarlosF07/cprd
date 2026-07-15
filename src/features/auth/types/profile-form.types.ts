import type { SubmitHandler, UseFormReturn } from 'react-hook-form'

import type { ProfileFormDataSchema } from '../schemas/auth.schemas'

export interface ProfileFormProps {
    error: string | null
    form: UseFormReturn<ProfileFormDataSchema>
    isEditing: boolean
    isLoading: boolean
    onCancel: () => void
    onSubmit: SubmitHandler<ProfileFormDataSchema>
}
