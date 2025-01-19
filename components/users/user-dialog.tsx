import {
  Departments,
  UserRole,
  type User,
  type UserGroups
} from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState, useEffect } from 'react'
import { createUser, updateUser } from '@/actions/users'
import { useToast } from '../ui/use-toast'
import { getUserGroups } from '@/actions/user-groups'
import { UserForm, type UserFormData } from './user-form'

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: (User & { userGroups: UserGroups[] }) | null
}

export const UserDialog = ({
  isOpen,
  onClose,
  onSuccess,
  user
}: UserDialogProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userGroups, setUserGroups] = useState<UserGroups[]>([])
  const isEdit = !!user

  useEffect(() => {
    const loadUserGroups = async () => {
      try {
        const groups = await getUserGroups()
        setUserGroups(groups)
      } catch (error) {
        console.error('Error loading user groups:', error)
      }
    }
    loadUserGroups()
  }, [])

  const onSubmit = async (data: UserFormData) => {
    // Only validate required fields for new users
    if (!isEdit) {
      if (!data.email) {
        toast({
          title: 'Email gerekli',
          description: 'Lütfen geçerli bir email adresi giriniz',
          variant: 'destructive'
        })
        return
      }

      if (!data.password) {
        toast({
          title: 'Şifre gerekli',
          description: 'Lütfen bir şifre giriniz',
          variant: 'destructive'
        })
        return
      }
    }

    // Only validate password match if a password is provided
    if (data.password && data.password !== data.confirmPassword) {
      toast({
        title: 'Şifreler eşleşmiyor',
        description: 'Lütfen şifreleri kontrol ediniz',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const { confirmPassword, ...userData } = data
      const userGroupsData = userData.userGroups
        ? userData.userGroups
            .map((groupId) => userGroups.find((g) => g.id === groupId))
            .filter((g): g is UserGroups => g !== undefined)
        : []

      if (isEdit && user) {
        await updateUser({
          ...userData,
          id: user.id,
          email: userData.email || null,
          password: data.password || undefined,
          emailVerified: userData.emailVerified || null,
          userGroups: userGroupsData,
          role: userData.role || user.role,
          dept: userData.dept || user.dept
        })
        toast({
          title: 'Kullanıcı başarıyla güncellendi',
          description: 'Kullanıcı bilgileri güncellendi',
          variant: 'default'
        })
      } else {
        await createUser({
          ...userData,
          email: data.email!,
          password: data.password!,
          userGroups: userGroupsData,
          role: userData.role || UserRole.VIEWER,
          dept: userData.dept || Departments.PK
        })
        toast({
          title: 'Kullanıcı başarıyla oluşturuldu',
          description: 'Kullanıcı başarıyla oluşturuldu',
          variant: 'default'
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: isEdit
          ? 'Kullanıcı güncellenirken bir hata oluştu'
          : 'Kullanıcı oluşturulurken bir hata oluştu',
        description: isEdit
          ? 'Kullanıcı güncellenirken bir hata oluştu'
          : 'Kullanıcı oluşturulurken bir hata oluştu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultValues = user
    ? {
        id: user.id,
        name: user.name || '',
        email: user.email,
        role: user.role,
        dept: user.dept,
        emailVerified: user.emailVerified,
        password: '',
        confirmPassword: '',
        userGroups: user.userGroups || []
      }
    : {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: undefined,
        dept: undefined,
        userGroups: []
      }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          userGroups={userGroups}
          isEdit={isEdit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
