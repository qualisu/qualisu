import * as z from 'zod'

import { type User, type UserGroups } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { MultiSelect } from '../multi-select'
import { Button } from '../ui/button'

const formSchema = z
  .object({
    name: z.string().min(1, 'İsim gereklidir'),
    email: z.string().email('Geçerli bir email adresi giriniz').nullable(),
    password: z
      .string()
      .optional()
      .transform((val) => (val === '' ? undefined : val))
      .pipe(z.string().min(6, 'Şifre en az 6 karakter olmalıdır').optional()),
    confirmPassword: z.string().optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
    dept: z.enum(['ARGE', 'URGE', 'GKK', 'PK', 'FQM', 'SSH']).optional(),
    userGroups: z.array(z.string()).optional(),
    emailVerified: z.date().nullable().optional(),
    id: z.string().optional()
  })
  .refine(
    (data) =>
      !data.password ||
      !data.confirmPassword ||
      data.password === data.confirmPassword,
    {
      message: 'Şifreler eşleşmiyor',
      path: ['confirmPassword']
    }
  )

export type UserFormData = z.infer<typeof formSchema>

interface UserFormProps {
  defaultValues: Partial<{
    name: string
    email: string | null
    password: string
    confirmPassword: string
    role: 'ADMIN' | 'USER'
    dept: 'ARGE' | 'URGE' | 'GKK' | 'PK' | 'FQM' | 'SSH'
    userGroups: UserGroups[]
    emailVerified: Date | null
    id: string
  }>
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
  userGroups?: UserGroups[]
  isEdit?: boolean
  loading?: boolean
}

export function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  userGroups = [],
  isEdit = false,
  loading = false
}: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      password: '',
      confirmPassword: '',
      role: defaultValues.role || undefined,
      dept: defaultValues.dept || undefined,
      userGroups: defaultValues.userGroups?.map((group) => group.id) || []
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">İsim</FormLabel>
              <FormControl>
                <Input {...field} className="col-span-3" />
              </FormControl>
              <FormMessage className="col-span-3 col-start-2" />
            </FormItem>
          )}
        />

        {!isEdit && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    className="col-span-3"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage className="col-span-3 col-start-2" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">
                {isEdit ? 'Yeni Şifre' : 'Şifre'}
              </FormLabel>
              <FormControl>
                <Input {...field} type="password" className="col-span-3" />
              </FormControl>
              <FormMessage className="col-span-3 col-start-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Şifre Tekrar</FormLabel>
              <FormControl>
                <Input {...field} type="password" className="col-span-3" />
              </FormControl>
              <FormMessage className="col-span-3 col-start-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Rol seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="col-span-3 col-start-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dept"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">Departman</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Departman seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ARGE">ARGE</SelectItem>
                  <SelectItem value="URGE">URGE</SelectItem>
                  <SelectItem value="GKK">GKK</SelectItem>
                  <SelectItem value="PK">PK</SelectItem>
                  <SelectItem value="FQM">FQM</SelectItem>
                  <SelectItem value="SSH">SSH</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="col-span-3 col-start-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userGroups"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-right">User Groups</FormLabel>
              <FormControl>
                <MultiSelect
                  className="w-full col-span-3"
                  options={userGroups.map((group) => ({
                    value: group.id,
                    label: group.name
                  }))}
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.setValue('userGroups', value, {
                      shouldValidate: true
                    })
                  }}
                  defaultValue={field.value}
                  placeholder="Select a group"
                  variant={'secondary' as const}
                  maxCount={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEdit && (
          <FormField
            control={form.control}
            name="emailVerified"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-4">
                <FormLabel className="text-right">Email Onayı</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === 'true' ? new Date() : null)
                  }
                  defaultValue={field.value ? 'true' : 'false'}
                >
                  <FormControl>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Onaylandı</SelectItem>
                    <SelectItem value="false">Onaylanmadı</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="col-span-3 col-start-2" />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} type="button">
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEdit
                ? 'Kaydediliyor...'
                : 'Oluşturuluyor...'
              : isEdit
              ? 'Kaydet'
              : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
